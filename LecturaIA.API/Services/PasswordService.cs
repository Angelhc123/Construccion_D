using LecturaIA.API.Data;
using LecturaIA.API.Models.DTOs;
using LecturaIA.API.Models.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace LecturaIA.API.Services;

public class PasswordService : IPasswordService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PasswordService> _logger;

    public PasswordService(ApplicationDbContext context, IConfiguration configuration, ILogger<PasswordService> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<(bool exito, string mensaje)> CambiarPassword(int usuarioId, CambiarPasswordDto dto)
    {
        // 1. Validar que las contraseñas coincidan
        if (dto.NuevaPassword != dto.ConfirmarPassword)
        {
            return (false, "Las contraseñas no coinciden");
        }

        // 2. Validar fortaleza
        var validacion = ValidarFortalezaPassword(dto.NuevaPassword);
        if (!validacion.EsFuerte)
        {
            return (false, string.Join(". ", validacion.Mensajes));
        }

        // 3. Buscar usuario
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Id == usuarioId);

        if (usuario == null)
        {
            return (false, "Usuario no encontrado");
        }

        // 4. Verificar que sea Estudiante o Docente
        if (usuario.TipoUsuario != TipoUsuario.Estudiante && usuario.TipoUsuario != TipoUsuario.Docente)
        {
            _logger.LogWarning("Intento de cambio de contraseña por usuario no autorizado: {UsuarioId}", usuarioId);
            return (false, "Solo estudiantes y docentes pueden cambiar su contraseña desde aquí");
        }

        // 5. Verificar contraseña actual
        if (!BCrypt.Net.BCrypt.Verify(dto.PasswordActual, usuario.PasswordHash))
        {
            _logger.LogWarning("Intento fallido de cambio de contraseña (contraseña incorrecta): {Email}", usuario.Email);
            return (false, "La contraseña actual es incorrecta. Verifica e intenta nuevamente");
        }

        // 6. Actualizar contraseña con BCrypt
        usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NuevaPassword);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Contraseña actualizada exitosamente para usuario: {Email}", usuario.Email);

        return (true, "Contraseña actualizada exitosamente");
    }

    public ValidacionPasswordDto ValidarFortalezaPassword(string password)
    {
        var validacion = new ValidacionPasswordDto();
        var minLength = _configuration.GetValue<int>("PasswordPolicy:MinLength", 8);
        var requireUppercase = _configuration.GetValue<bool>("PasswordPolicy:RequireUppercase", true);
        var requireNumber = _configuration.GetValue<bool>("PasswordPolicy:RequireNumber", true);

        // Validar longitud
        if (password.Length < minLength)
        {
            validacion.Mensajes.Add($"Debe tener mínimo {minLength} caracteres");
        }

        // Validar mayúscula
        if (requireUppercase && !Regex.IsMatch(password, @"[A-Z]"))
        {
            validacion.Mensajes.Add("Debe tener al menos 1 letra mayúscula");
        }

        // Validar número
        if (requireNumber && !Regex.IsMatch(password, @"[0-9]"))
        {
            validacion.Mensajes.Add("Debe tener al menos 1 número");
        }

        // Determinar nivel de fortaleza
        if (validacion.Mensajes.Count == 0)
        {
            validacion.EsFuerte = true;
            validacion.Nivel = "Fuerte";
        }
        else if (validacion.Mensajes.Count == 1)
        {
            validacion.Nivel = "Media";
        }
        else
        {
            validacion.Nivel = "Débil";
        }

        return validacion;
    }
}
