using LecturaIA.API.Data;
using LecturaIA.API.Models.DTOs;
using LecturaIA.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace LecturaIA.API.Services;

public class AdminService
{
    private readonly ApplicationDbContext _context;

    public AdminService(ApplicationDbContext context)
    {
        _context = context;
    }

    // Obtener todos los usuarios para gestión con filtro opcional por email
    public async Task<List<UsuarioAdminDto>> ObtenerTodosLosUsuarios(string? email = null)
    {
        var query = _context.Usuarios
            .Include(u => u.Estudiante)
            .Include(u => u.Docente)
            .AsQueryable();

        // Filtrar por email si se proporciona
        if (!string.IsNullOrEmpty(email))
        {
            query = query.Where(u => u.Email.Contains(email));
        }

        var usuarios = await query
            .Select(u => new UsuarioAdminDto
            {
                Id = u.Id,
                NombreCompleto = u.NombreCompleto,
                Email = u.Email,
                Tipo = u.TipoUsuario.ToString(),
                Estado = u.Activo ? (u.Suspendido ? "Suspendido" : "Activo") : "Inactivo",
                UltimoAcceso = u.UltimoAcceso,
                Suspendido = u.Suspendido,
                MotivoSuspension = u.MotivoSuspension,
                FechaSuspension = u.FechaSuspension
            })
            .OrderByDescending(u => u.Id)
            .ToListAsync();

        return usuarios;
    }

    // Suspender usuario
    public async Task<bool> SuspenderUsuario(SuspenderUsuarioDto dto)
    {
        var usuario = await _context.Usuarios.FindAsync(dto.UsuarioId);
        if (usuario == null || usuario.TipoUsuario == TipoUsuario.Administrador)
            return false;

        usuario.Suspendido = true;
        usuario.FechaSuspension = DateTime.UtcNow;
        usuario.MotivoSuspension = dto.Motivo;

        await _context.SaveChangesAsync();
        return true;
    }

    // Reactivar usuario
    public async Task<bool> ReactivarUsuario(ReactivarUsuarioDto dto)
    {
        var usuario = await _context.Usuarios.FindAsync(dto.UsuarioId);
        if (usuario == null)
            return false;

        usuario.Suspendido = false;
        usuario.FechaSuspension = null;
        usuario.MotivoSuspension = null;

        await _context.SaveChangesAsync();
        return true;
    }

    // Reiniciar contraseña
    public async Task<ReiniciarPasswordResponseDto> ReiniciarPassword(ReiniciarPasswordDto dto)
    {
        var usuario = await _context.Usuarios.FindAsync(dto.UsuarioId);
        if (usuario == null || usuario.TipoUsuario == TipoUsuario.Administrador)
        {
            return new ReiniciarPasswordResponseDto
            {
                Exito = false,
                Mensaje = "Usuario no encontrado o no se puede reiniciar contraseña de administrador"
            };
        }

        // Generar contraseña temporal
        var passwordTemporal = GenerarPasswordTemporal();
        usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(passwordTemporal);
        usuario.FechaReinicioPassword = DateTime.UtcNow;
        usuario.MotivoReinicioPassword = dto.Motivo;

        await _context.SaveChangesAsync();

        return new ReiniciarPasswordResponseDto
        {
            Exito = true,
            PasswordTemporal = passwordTemporal,
            Mensaje = $"Contraseña temporal generada correctamente: {passwordTemporal}. El usuario deberá cambiar su contraseña al iniciar sesión por seguridad."
        };
    }

    // ===== SISTEMA DE CÓDIGOS ELIMINADO =====
    // Ya no se usa el sistema de códigos de registro
    // Ahora todo se maneja con verificación por email desde AuthController

    // Obtener estadísticas
    public async Task<EstadisticasAdminDto> ObtenerEstadisticas()
    {
        var totalUsuarios = await _context.Usuarios.CountAsync();
        var totalDocentes = await _context.Usuarios.CountAsync(u => u.TipoUsuario == TipoUsuario.Docente);
        var totalEstudiantes = await _context.Usuarios.CountAsync(u => u.TipoUsuario == TipoUsuario.Estudiante);
        var usuariosActivos = await _context.Usuarios.CountAsync(u => u.Activo && !u.Suspendido);
        var usuariosSuspendidos = await _context.Usuarios.CountAsync(u => u.Suspendido);
        var lecturasGeneradas = await _context.Lecturas.CountAsync();
        var cuestionariosCompletados = await _context.Cuestionarios.CountAsync(c => c.Estado == "evaluado");
        var aulasActivas = await _context.Aulas.CountAsync(a => a.Activa);

        return new EstadisticasAdminDto
        {
            TotalUsuarios = totalUsuarios,
            TotalDocentes = totalDocentes,
            TotalEstudiantes = totalEstudiantes,
            UsuariosActivos = usuariosActivos,
            UsuariosSuspendidos = usuariosSuspendidos,
            LecturasGeneradas = lecturasGeneradas,
            CuestionariosCompletados = cuestionariosCompletados,
            AulasActivas = aulasActivas
        };
    }

    // Métodos auxiliares
    private string GenerarPasswordTemporal()
    {
        return $"TempDoc{DateTime.UtcNow.Year}{new Random().Next(1000, 9999)}";
    }
}
