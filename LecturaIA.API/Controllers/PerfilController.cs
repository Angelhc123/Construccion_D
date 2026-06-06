using LecturaIA.API.Data;
using LecturaIA.API.Models.DTOs;
using LecturaIA.API.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LecturaIA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PerfilController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<PerfilController> _logger;

    public PerfilController(ApplicationDbContext context, ILogger<PerfilController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene el perfil del usuario autenticado (Estudiante o Docente)
    /// </summary>
    /// <summary>
    /// Obtiene el perfil del usuario autenticado (Estudiante o Docente).
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PerfilUsuarioDto>> ObtenerPerfil()
    {
        try
        {
            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
            {
                // Fail fast: token inválido
                return Unauthorized(new { mensaje = "Token inválido" });
            }
            var usuario = await _context.Usuarios
                .Include(u => u.Estudiante)
                .Include(u => u.Docente)
                .FirstOrDefaultAsync(u => u.Id == usuarioId);
            if (usuario == null)
            {
                // Fail fast: usuario no encontrado
                return NotFound(new { mensaje = "Usuario no encontrado" });
            }
            var perfil = new PerfilUsuarioDto
            {
                NombreCompleto = usuario.NombreCompleto,
                Email = usuario.Email,
                TipoUsuario = usuario.TipoUsuario.ToString()
            };
            // Si es estudiante, agregar datos adicionales
            if (usuario.TipoUsuario == TipoUsuario.Estudiante && usuario.Estudiante != null)
            {
                perfil.Grado = usuario.Estudiante.Grado.ToString();
                perfil.Edad = usuario.Estudiante.Edad;
                perfil.NivelEducativo = usuario.Estudiante.NivelEducativo;
                perfil.Intereses = usuario.Estudiante.Intereses;
                perfil.NivelDificultad = usuario.Estudiante.NivelDificultad.ToString();
                // Obtener clase actual (última vinculación activa)
                var vinculacionActiva = await _context.EstudiantesAulas
                    .Include(ea => ea.Aula)
                        .ThenInclude(a => a.Docente)
                            .ThenInclude(d => d.Usuario)
                    .Where(ea => ea.EstudianteId == usuario.Estudiante.Id && ea.Activo)
                    .OrderByDescending(ea => ea.FechaVinculacion)
                    .FirstOrDefaultAsync();
                if (vinculacionActiva != null)
                {
                    perfil.ClaseActual = new AulaInfoDto
                    {
                        Id = vinculacionActiva.Aula.Id,
                        Nombre = vinculacionActiva.Aula.Nombre,
                        Descripcion = vinculacionActiva.Aula.Descripcion,
                        NombreDocente = vinculacionActiva.Aula.Docente.Usuario.NombreCompleto,
                        FechaVinculacion = vinculacionActiva.FechaVinculacion
                    };
                }
            }
            return Ok(perfil);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener perfil de usuario");
            return StatusCode(500, new { mensaje = "Error al obtener el perfil" });
        }
    }
}
