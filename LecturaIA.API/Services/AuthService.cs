using LecturaIA.API.Data;
using LecturaIA.API.Models.DTOs;
using LecturaIA.API.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace LecturaIA.API.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        ApplicationDbContext context, 
        IConfiguration configuration,
        IEmailService emailService,
        ILogger<AuthService> logger)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<bool> RegistrarEstudiante(RegistroEstudianteDto dto)
    {
        try
        {
            // Verificar si el email ya existe
            if (await _context.Usuarios.AnyAsync(u => u.Email == dto.Email))
            {
                _logger.LogWarning("Intento de registro con email duplicado: {Email}", dto.Email);
                return false;
            }

            // Generar token de verificación
            var token = GenerarTokenVerificacion();
            var expiracion = DateTime.UtcNow.AddHours(
                _configuration.GetValue<int>("VerificationSettings:TokenExpirationHours", 24));

            // Crear usuario (inicialmente inactivo hasta verificar email)
            var usuario = new Usuario
            {
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                NombreCompleto = dto.NombreCompleto,
                TipoUsuario = TipoUsuario.Estudiante,
                FechaRegistro = DateTime.UtcNow,
                Activo = false, // Inactivo hasta verificar email
                EmailVerificado = false,
                TokenVerificacion = token,
                FechaExpiracionToken = expiracion
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            // Crear perfil de estudiante
            var estudiante = new Estudiante
            {
                UsuarioId = usuario.Id,
                Grado = dto.Grado,
                Edad = dto.Edad,
                NivelDificultad = NivelDificultad.Facil
            };

            _context.Estudiantes.Add(estudiante);
            await _context.SaveChangesAsync();

            // Enviar email de verificación
            var emailEnviado = await _emailService.EnviarEmailVerificacion(
                usuario.Email, 
                token, 
                usuario.NombreCompleto);

            if (!emailEnviado)
            {
                _logger.LogError("No se pudo enviar el email de verificación a {Email}", usuario.Email);
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al registrar estudiante con email {Email}", dto.Email);
            return false;
        }
    }

    public async Task<bool> RegistrarDocente(RegistroDocenteDto dto)
    {
        try
        {
            // Verificar si el email ya existe
            if (await _context.Usuarios.AnyAsync(u => u.Email == dto.Email))
            {
                _logger.LogWarning("Intento de registro con email duplicado: {Email}", dto.Email);
                return false;
            }

            // Generar token de verificación
            var token = GenerarTokenVerificacion();
            var expiracion = DateTime.UtcNow.AddHours(
                _configuration.GetValue<int>("VerificationSettings:TokenExpirationHours", 24));

            // Crear usuario (inicialmente inactivo hasta verificar email)
            var usuario = new Usuario
            {
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                NombreCompleto = dto.NombreCompleto,
                TipoUsuario = TipoUsuario.Docente,
                FechaRegistro = DateTime.UtcNow,
                Activo = false, // Inactivo hasta verificar email
                EmailVerificado = false,
                TokenVerificacion = token,
                FechaExpiracionToken = expiracion,
                RequiereDobleAutenticacion = true // 2FA activado para docentes
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            // Crear perfil de docente
            var docente = new Docente
            {
                UsuarioId = usuario.Id
            };

            _context.Docentes.Add(docente);
            await _context.SaveChangesAsync();

            // Enviar email de verificación
            var emailEnviado = await _emailService.EnviarEmailVerificacion(
                usuario.Email, 
                token, 
                usuario.NombreCompleto);

            if (!emailEnviado)
            {
                _logger.LogError("No se pudo enviar el email de verificación a {Email}", usuario.Email);
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al registrar docente con email {Email}", dto.Email);
            return false;
        }
    }

    public async Task<object> Login(LoginDto dto)
    {
        // Buscar usuario por email
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (usuario == null)
        {
            _logger.LogWarning("Intento de login con email no registrado: {Email}", dto.Email);
            return null!;
        }

        // Verificar si el email está verificado
        if (!usuario.EmailVerificado)
        {
            _logger.LogWarning("Intento de login con email no verificado: {Email}", dto.Email);
            return null!; // Email no verificado
        }

        // Verificar si el usuario está suspendido
        if (usuario.Suspendido)
        {
            _logger.LogWarning("Intento de login con usuario suspendido: {Email}", dto.Email);
            return new LoginCuentaSuspendidaDto
            {
                CuentaSuspendida = true,
                Mensaje = "Tu cuenta ha sido suspendida. Contacta al administrador para más información."
            };
        }

        // Verificar contraseña
        if (!BCrypt.Net.BCrypt.Verify(dto.Password, usuario.PasswordHash))
        {
            _logger.LogWarning("Intento de login con contraseña incorrecta: {Email}", dto.Email);
            return null!;
        }

        // Verificar si el 2FA está habilitado (solo en producción)
        var require2FAInDevelopment = _configuration.GetValue<bool>("Security:Require2FAInDevelopment", false);
        var isDevelopment = _configuration.GetValue<string>("ASPNETCORE_ENVIRONMENT") == "Development";
        var shouldUse2FA = usuario.RequiereDobleAutenticacion && (!isDevelopment || require2FAInDevelopment);

        // Si requiere doble autenticación (docentes) y está habilitado
        if (shouldUse2FA)
        {
            _logger.LogInformation("2FA requerido para {Email} (Env: {Env})", dto.Email, isDevelopment ? "Development" : "Production");
            
            // Generar y enviar código de verificación
            var codigo = GenerarCodigoVerificacion();
            var fechaGeneracion = DateTime.UtcNow;
            var fechaExpiracion = fechaGeneracion.AddMinutes(10);

            var codigoVerificacion = new CodigoVerificacionLogin
            {
                UsuarioId = usuario.Id,
                Codigo = codigo,
                FechaGeneracion = fechaGeneracion,
                FechaExpiracion = fechaExpiracion,
                Usado = false,
                IntentosRestantes = 3
            };

            _context.CodigosVerificacionLogin.Add(codigoVerificacion);
            await _context.SaveChangesAsync();

            // Enviar código por email
            await _emailService.EnviarCodigoVerificacionLogin(usuario.Email, codigo, usuario.NombreCompleto);

            _logger.LogInformation("Código 2FA enviado a: {Email}", usuario.Email);

            return new LoginRequiere2FADto
            {
                RequiereVerificacion = true,
                Mensaje = "Se ha enviado un código de verificación a tu correo electrónico",
                Email = usuario.Email,
                TiempoExpiracionMinutos = 10
            };
        }

        // Login directo (estudiantes o docentes en desarrollo sin 2FA)
        if (isDevelopment && usuario.RequiereDobleAutenticacion)
        {
            _logger.LogInformation("Login directo en Development (2FA deshabilitado) para: {Email}", usuario.Email);
        }
        
        usuario.UltimoAcceso = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return GenerarToken(usuario);
    }

    public async Task<bool> VerificarEmail(string token)
    {
        try
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.TokenVerificacion == token);

            if (usuario == null)
            {
                _logger.LogWarning("Token de verificación no encontrado: {Token}", token);
                return false;
            }

            // Verificar si el token ha expirado
            if (usuario.FechaExpiracionToken < DateTime.UtcNow)
            {
                _logger.LogWarning("Token de verificación expirado para: {Email}", usuario.Email);
                return false;
            }

            // Activar usuario
            usuario.EmailVerificado = true;
            usuario.Activo = true;
            usuario.TokenVerificacion = null;
            usuario.FechaExpiracionToken = null;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Email verificado exitosamente: {Email}", usuario.Email);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al verificar email con token: {Token}", token);
            return false;
        }
    }

    public async Task<bool> ReenviarVerificacion(string email)
    {
        try
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email == email && !u.EmailVerificado);

            if (usuario == null)
            {
                _logger.LogWarning("Usuario no encontrado o ya verificado: {Email}", email);
                return false;
            }

            // Generar nuevo token
            var token = GenerarTokenVerificacion();
            var expiracion = DateTime.UtcNow.AddHours(
                _configuration.GetValue<int>("VerificationSettings:TokenExpirationHours", 24));

            usuario.TokenVerificacion = token;
            usuario.FechaExpiracionToken = expiracion;

            await _context.SaveChangesAsync();

            // Reenviar email
            var emailEnviado = await _emailService.EnviarEmailVerificacion(
                usuario.Email, 
                token, 
                usuario.NombreCompleto);

            if (!emailEnviado)
            {
                _logger.LogError("No se pudo reenviar el email de verificación a {Email}", usuario.Email);
                return false;
            }

            _logger.LogInformation("Email de verificación reenviado a: {Email}", usuario.Email);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al reenviar verificación a {Email}", email);
            return false;
        }
    }

    private AuthResponseDto GenerarToken(Usuario usuario)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Email, usuario.Email),
            new Claim(ClaimTypes.Name, usuario.NombreCompleto),
            new Claim(ClaimTypes.Role, usuario.TipoUsuario.ToString())
        };

        var secretKey = _configuration["JwtSettings:SecretKey"]
            ?? throw new InvalidOperationException("JwtSettings:SecretKey no está configurada. Use variables de entorno o appsettings.");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiracion = DateTime.UtcNow.AddHours(8);

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"] ?? "LecturaIA",
            audience: _configuration["JwtSettings:Audience"] ?? "LecturaIA",
            claims: claims,
            expires: expiracion,
            signingCredentials: creds
        );

        return new AuthResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Email = usuario.Email,
            NombreCompleto = usuario.NombreCompleto,
            TipoUsuario = usuario.TipoUsuario.ToString(),
            FechaExpiracion = expiracion
        };
    }

    public async Task<bool> SolicitarRecuperacionPassword(string email)
    {
        try
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email == email && u.EmailVerificado);

            if (usuario == null)
            {
                _logger.LogWarning("Solicitud de recuperación para email no registrado o no verificado: {Email}", email);
                // Por seguridad, no revelamos si el email existe o no
                return true;
            }

            // Generar nuevo token de recuperación
            var token = GenerarTokenVerificacion();
            var expiracion = DateTime.UtcNow.AddHours(
                _configuration.GetValue<int>("VerificationSettings:TokenExpirationHours", 24));

            usuario.TokenVerificacion = token;
            usuario.FechaExpiracionToken = expiracion;

            await _context.SaveChangesAsync();

            // Enviar email de recuperación
            var emailEnviado = await _emailService.EnviarEmailRecuperacion(
                usuario.Email,
                token,
                usuario.NombreCompleto);

            if (!emailEnviado)
            {
                _logger.LogError("No se pudo enviar el email de recuperación a {Email}", usuario.Email);
            }

            _logger.LogInformation("Email de recuperación enviado a: {Email}", usuario.Email);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al solicitar recuperación de contraseña para {Email}", email);
            return false;
        }
    }

    public async Task<bool> RestablecerPassword(string token, string nuevaPassword)
    {
        try
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.TokenVerificacion == token);

            if (usuario == null)
            {
                _logger.LogWarning("Token de recuperación no encontrado: {Token}", token);
                return false;
            }

            // Verificar si el token ha expirado
            if (usuario.FechaExpiracionToken < DateTime.UtcNow)
            {
                _logger.LogWarning("Token de recuperación expirado para: {Email}", usuario.Email);
                return false;
            }

            // Actualizar contraseña
            usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(nuevaPassword);
            usuario.TokenVerificacion = null;
            usuario.FechaExpiracionToken = null;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Contraseña restablecida exitosamente para: {Email}", usuario.Email);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al restablecer contraseña con token: {Token}", token);
            return false;
        }
    }

    public async Task<bool> VerificarEmailExiste(string email)
    {
        return await _context.Usuarios.AnyAsync(u => u.Email == email);
    }

    public async Task<AuthResponseDto?> VerificarCodigoLogin(string email, string codigo)
    {
        try
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email == email);

            if (usuario == null)
            {
                _logger.LogWarning("Usuario no encontrado para verificar código: {Email}", email);
                return null;
            }

            // Buscar código más reciente no usado y no expirado
            var codigoVerificacion = await _context.CodigosVerificacionLogin
                .Where(c => c.UsuarioId == usuario.Id && 
                           c.Codigo == codigo && 
                           !c.Usado &&
                           c.FechaExpiracion > DateTime.UtcNow)
                .OrderByDescending(c => c.FechaGeneracion)
                .FirstOrDefaultAsync();

            if (codigoVerificacion == null)
            {
                _logger.LogWarning("Código inválido o expirado para: {Email}", email);
                return null;
            }

            // Verificar intentos restantes
            if (codigoVerificacion.IntentosRestantes <= 0)
            {
                _logger.LogWarning("Código bloqueado por intentos excedidos: {Email}", email);
                return null;
            }

            // Marcar código como usado
            codigoVerificacion.Usado = true;
            
            // Actualizar último acceso del usuario
            usuario.UltimoAcceso = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();

            _logger.LogInformation("Código 2FA verificado correctamente para: {Email}", email);

            // Generar y retornar token JWT
            return GenerarToken(usuario);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al verificar código 2FA para {Email}", email);
            return null;
        }
    }

    public async Task<bool> ReenviarCodigoLogin(string email)
    {
        try
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email == email);

            if (usuario == null)
            {
                _logger.LogWarning("Usuario no encontrado para reenviar código: {Email}", email);
                return false;
            }

            // Invalidar códigos anteriores no usados
            var codigosAntiguos = await _context.CodigosVerificacionLogin
                .Where(c => c.UsuarioId == usuario.Id && !c.Usado)
                .ToListAsync();

            foreach (var codigo in codigosAntiguos)
            {
                codigo.Usado = true;
            }

            // Generar nuevo código
            var nuevoCodigo = GenerarCodigoVerificacion();
            var fechaGeneracion = DateTime.UtcNow;
            var fechaExpiracion = fechaGeneracion.AddMinutes(10);

            var codigoVerificacion = new CodigoVerificacionLogin
            {
                UsuarioId = usuario.Id,
                Codigo = nuevoCodigo,
                FechaGeneracion = fechaGeneracion,
                FechaExpiracion = fechaExpiracion,
                Usado = false,
                IntentosRestantes = 3
            };

            _context.CodigosVerificacionLogin.Add(codigoVerificacion);
            await _context.SaveChangesAsync();

            // Enviar código por email
            var emailEnviado = await _emailService.EnviarCodigoVerificacionLogin(
                usuario.Email, 
                nuevoCodigo, 
                usuario.NombreCompleto);

            if (!emailEnviado)
            {
                _logger.LogError("No se pudo enviar el código 2FA a {Email}", usuario.Email);
                return false;
            }

            _logger.LogInformation("Código 2FA reenviado a: {Email}", usuario.Email);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al reenviar código 2FA para {Email}", email);
            return false;
        }
    }

    private string GenerarCodigoVerificacion()
    {
        // Generar código de 6 dígitos
        var random = new Random();
        return random.Next(100000, 999999).ToString();
    }

    private string GenerarTokenVerificacion()
    {
        // Generar token seguro de 64 caracteres
        var randomBytes = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomBytes);
        }
        return Convert.ToBase64String(randomBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }
}
