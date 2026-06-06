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
public class AulasController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AulasController> _logger;

    public AulasController(ApplicationDbContext context, ILogger<AulasController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Genera un código de vinculación único (formato: BCH47X)
    /// </summary>
    private string GenerarCodigoVinculacion()
    {
        const string CaracteresCodigo = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Sin vocales ni 0,1 para evitar confusiones
        const int LongitudCodigo = 6;
        var random = new Random();
        string codigo;
        do
        {
            codigo = new string(Enumerable.Range(0, LongitudCodigo)
                .Select(_ => CaracteresCodigo[random.Next(CaracteresCodigo.Length)])
                .ToArray());
        }
        while (_context.Aulas.Any(a => a.CodigoVinculacion == codigo));
        return codigo;
    }
    /// <summary>
    /// Crea un aula nueva (solo Docentes)
    /// </summary>
    [HttpPost("crear")]
    [Authorize(Roles = "Docente")]
    public async Task<ActionResult<AulaDetalleDto>> CrearAula([FromBody] CrearAulaDto dto)
    {
        try
        {
            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
            {
                // Fail fast: token inválido
                return Unauthorized(new { mensaje = "Token inválido" });
            }

            var docente = await _context.Docentes
                .Include(d => d.Usuario)
                .FirstOrDefaultAsync(d => d.UsuarioId == usuarioId);

            if (docente == null)
            {
                // Fail fast: docente no encontrado
                return NotFound(new { mensaje = "Docente no encontrado" });
            }

            var codigoVinculacion = GenerarCodigoVinculacion();

            var aula = new Aula
            {
                DocenteId = docente.Id,
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion,
                CodigoVinculacion = codigoVinculacion,
                FechaCreacion = DateTime.UtcNow,
                Activa = true
            };

            _context.Aulas.Add(aula);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Aula creada: {aula.Nombre} (Código: {codigoVinculacion}) por docente {docente.Id}");

            var aulaDetalle = new AulaDetalleDto
            {
                Id = aula.Id,
                Nombre = aula.Nombre,
                Descripcion = aula.Descripcion,
                CodigoVinculacion = aula.CodigoVinculacion,
                NombreDocente = docente.Usuario.NombreCompleto,
                CantidadEstudiantes = 0,
                FechaCreacion = aula.FechaCreacion
            };

            return CreatedAtAction(nameof(ObtenerAula), new { id = aula.Id }, aulaDetalle);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear aula");
            return StatusCode(500, new { mensaje = "Error al crear el aula" });
        }
    }

    /// <summary>
    /// Unirse a un aula usando código de vinculación (solo Estudiantes)
    /// </summary>
    [HttpPost("unirse")]
    [Authorize(Roles = "Estudiante")]
    public async Task<ActionResult<AulaDetalleDto>> UnirseAClase([FromBody] UnirseAClaseDto dto)
    {
        try
        {
            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
            {
                return Unauthorized(new { mensaje = "Token inválido" });
            }

            var estudiante = await _context.Estudiantes
                .FirstOrDefaultAsync(e => e.UsuarioId == usuarioId);

            if (estudiante == null)
            {
                return NotFound(new { mensaje = "Estudiante no encontrado" });
            }

            // Buscar aula por código de vinculación (case insensitive)
            var aula = await _context.Aulas
                .Include(a => a.Docente)
                    .ThenInclude(d => d.Usuario)
                .FirstOrDefaultAsync(a => a.CodigoVinculacion.ToUpper() == dto.CodigoVinculacion.ToUpper() && a.Activa);

            if (aula == null)
            {
                return NotFound(new { mensaje = "Código de vinculación inválido o aula inactiva" });
            }

            // Verificar si el estudiante ya está vinculado a esta aula
            var vinculacionExistente = await _context.EstudiantesAulas
                .FirstOrDefaultAsync(ea => ea.EstudianteId == estudiante.Id && ea.AulaId == aula.Id);

            if (vinculacionExistente != null)
            {
                if (vinculacionExistente.Activo)
                {
                    return BadRequest(new { mensaje = "Ya estás vinculado a esta clase" });
                }
                else
                {
                    // Reactivar vinculación
                    vinculacionExistente.Activo = true;
                    vinculacionExistente.FechaVinculacion = DateTime.UtcNow;
                }
            }
            else
            {
                // Crear nueva vinculación
                var nuevaVinculacion = new EstudianteAula
                {
                    EstudianteId = estudiante.Id,
                    AulaId = aula.Id,
                    FechaVinculacion = DateTime.UtcNow,
                    Activo = true
                };
                _context.EstudiantesAulas.Add(nuevaVinculacion);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Estudiante {estudiante.Id} se unió al aula {aula.Id} ({aula.Nombre})");

            var cantidadEstudiantes = await _context.EstudiantesAulas
                .CountAsync(ea => ea.AulaId == aula.Id && ea.Activo);

            var aulaDetalle = new AulaDetalleDto
            {
                Id = aula.Id,
                Nombre = aula.Nombre,
                Descripcion = aula.Descripcion,
                CodigoVinculacion = aula.CodigoVinculacion,
                NombreDocente = aula.Docente.Usuario.NombreCompleto,
                CantidadEstudiantes = cantidadEstudiantes,
                FechaCreacion = aula.FechaCreacion
            };

            return Ok(aulaDetalle);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al unirse a clase");
            return StatusCode(500, new { mensaje = "Error al unirse a la clase" });
        }
    }

    /// <summary>
    /// Obtiene el aula actual del estudiante
    /// </summary>
    [HttpGet("mi-clase")]
    [Authorize(Roles = "Estudiante")]
    public async Task<ActionResult<AulaDetalleDto>> ObtenerMiClase()
    {
        try
        {
            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
            {
                return Unauthorized(new { mensaje = "Token inválido" });
            }

            var estudiante = await _context.Estudiantes
                .FirstOrDefaultAsync(e => e.UsuarioId == usuarioId);

            if (estudiante == null)
            {
                return NotFound(new { mensaje = "Estudiante no encontrado" });
            }

            var vinculacionActiva = await _context.EstudiantesAulas
                .Include(ea => ea.Aula)
                    .ThenInclude(a => a.Docente)
                        .ThenInclude(d => d.Usuario)
                .Where(ea => ea.EstudianteId == estudiante.Id && ea.Activo)
                .OrderByDescending(ea => ea.FechaVinculacion)
                .FirstOrDefaultAsync();

            if (vinculacionActiva == null)
            {
                return NotFound(new { mensaje = "No estás vinculado a ninguna clase" });
            }

            var cantidadEstudiantes = await _context.EstudiantesAulas
                .CountAsync(ea => ea.AulaId == vinculacionActiva.AulaId && ea.Activo);

            var aulaDetalle = new AulaDetalleDto
            {
                Id = vinculacionActiva.Aula.Id,
                Nombre = vinculacionActiva.Aula.Nombre,
                Descripcion = vinculacionActiva.Aula.Descripcion,
                CodigoVinculacion = vinculacionActiva.Aula.CodigoVinculacion,
                NombreDocente = vinculacionActiva.Aula.Docente.Usuario.NombreCompleto,
                CantidadEstudiantes = cantidadEstudiantes,
                FechaCreacion = vinculacionActiva.Aula.FechaCreacion
            };

            return Ok(aulaDetalle);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener clase del estudiante");
            return StatusCode(500, new { mensaje = "Error al obtener la clase" });
        }
    }

    /// <summary>
    /// Obtiene un aula por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<AulaDetalleDto>> ObtenerAula(int id)
    {
        try
        {
            var aula = await _context.Aulas
                .Include(a => a.Docente)
                    .ThenInclude(d => d.Usuario)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (aula == null)
            {
                return NotFound(new { mensaje = "Aula no encontrada" });
            }

            var cantidadEstudiantes = await _context.EstudiantesAulas
                .CountAsync(ea => ea.AulaId == aula.Id && ea.Activo);

            var aulaDetalle = new AulaDetalleDto
            {
                Id = aula.Id,
                Nombre = aula.Nombre,
                Descripcion = aula.Descripcion,
                CodigoVinculacion = aula.CodigoVinculacion,
                NombreDocente = aula.Docente.Usuario.NombreCompleto,
                CantidadEstudiantes = cantidadEstudiantes,
                FechaCreacion = aula.FechaCreacion
            };

            return Ok(aulaDetalle);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener aula");
            return StatusCode(500, new { mensaje = "Error al obtener el aula" });
        }
    }

    /// <summary>
    /// Salir de la clase actual (Estudiante)
    /// </summary>
    [HttpPost("salir")]
    [Authorize(Roles = "Estudiante")]
    public async Task<IActionResult> SalirDeClase()
    {
        try
        {
            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
            {
                return Unauthorized(new { mensaje = "Token inválido" });
            }

            var estudiante = await _context.Estudiantes
                .FirstOrDefaultAsync(e => e.UsuarioId == usuarioId);

            if (estudiante == null)
            {
                return NotFound(new { mensaje = "Estudiante no encontrado" });
            }

            var vinculacionActiva = await _context.EstudiantesAulas
                .Where(ea => ea.EstudianteId == estudiante.Id && ea.Activo)
                .FirstOrDefaultAsync();

            if (vinculacionActiva == null)
            {
                return BadRequest(new { mensaje = "No estás vinculado a ninguna clase" });
            }

            vinculacionActiva.Activo = false;
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Estudiante {estudiante.Id} salió del aula {vinculacionActiva.AulaId}");

            return Ok(new { mensaje = "Has salido de la clase exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al salir de clase");
            return StatusCode(500, new { mensaje = "Error al salir de la clase" });
        }
    }

    /// <summary>
    /// Obtiene todas las aulas del docente autenticado
    /// </summary>
    [HttpGet("mis-aulas")]
    [Authorize(Roles = "Docente")]
    public async Task<ActionResult<List<AulaDetalleDto>>> ObtenerMisAulas()
    {
        try
        {
            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
            {
                return Unauthorized(new { mensaje = "Token inválido" });
            }

            var docente = await _context.Docentes
                .Include(d => d.Usuario)
                .FirstOrDefaultAsync(d => d.UsuarioId == usuarioId);

            if (docente == null)
            {
                return NotFound(new { mensaje = "Docente no encontrado" });
            }

            var aulas = await _context.Aulas
                .Where(a => a.DocenteId == docente.Id && a.Activa)
                .OrderByDescending(a => a.FechaCreacion)
                .Select(a => new AulaDetalleDto
                {
                    Id = a.Id,
                    Nombre = a.Nombre,
                    Descripcion = a.Descripcion,
                    CodigoVinculacion = a.CodigoVinculacion,
                    NombreDocente = docente.Usuario.NombreCompleto,
                    CantidadEstudiantes = _context.EstudiantesAulas.Count(ea => ea.AulaId == a.Id && ea.Activo),
                    FechaCreacion = a.FechaCreacion
                })
                .ToListAsync();

            return Ok(aulas);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener aulas del docente");
            return StatusCode(500, new { mensaje = "Error al obtener las aulas" });
        }
    }

    /// <summary>
    /// Elimina un aula (solo el docente propietario)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Docente")]
    public async Task<IActionResult> EliminarAula(int id)
    {
        try
        {
            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
            {
                return Unauthorized(new { mensaje = "Token inválido" });
            }

            var docente = await _context.Docentes
                .FirstOrDefaultAsync(d => d.UsuarioId == usuarioId);

            if (docente == null)
            {
                return NotFound(new { mensaje = "Docente no encontrado" });
            }

            var aula = await _context.Aulas
                .FirstOrDefaultAsync(a => a.Id == id && a.DocenteId == docente.Id);

            if (aula == null)
            {
                return NotFound(new { mensaje = "Aula no encontrada o no tienes permiso para eliminarla" });
            }

            // Marcar como inactiva en lugar de eliminar (soft delete)
            aula.Activa = false;
            
            // También desactivar todas las vinculaciones
            var vinculaciones = await _context.EstudiantesAulas
                .Where(ea => ea.AulaId == id && ea.Activo)
                .ToListAsync();
            
            foreach (var vinculacion in vinculaciones)
            {
                vinculacion.Activo = false;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Aula {id} ({aula.Nombre}) marcada como inactiva por docente {docente.Id}");

            return Ok(new { mensaje = "Aula eliminada exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar aula");
            return StatusCode(500, new { mensaje = "Error al eliminar el aula" });
        }
    }

    /// <summary>
    /// Obtiene los estudiantes vinculados a un aula
    /// </summary>
    [HttpGet("{id}/estudiantes")]
    [Authorize(Roles = "Docente")]
    public async Task<ActionResult<List<EstudianteAulaDto>>> ObtenerEstudiantesDelAula(int id)
    {
        try
        {
            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
            {
                return Unauthorized(new { mensaje = "Token inválido" });
            }

            var docente = await _context.Docentes
                .FirstOrDefaultAsync(d => d.UsuarioId == usuarioId);

            if (docente == null)
            {
                return NotFound(new { mensaje = "Docente no encontrado" });
            }

            var aula = await _context.Aulas
                .FirstOrDefaultAsync(a => a.Id == id && a.DocenteId == docente.Id && a.Activa);

            if (aula == null)
            {
                return NotFound(new { mensaje = "Aula no encontrada o no tienes permiso para verla" });
            }

            var estudiantes = await _context.EstudiantesAulas
                .Include(ea => ea.Estudiante)
                    .ThenInclude(e => e.Usuario)
                .Where(ea => ea.AulaId == id && ea.Activo)
                .OrderBy(ea => ea.Estudiante.Usuario.NombreCompleto)
                .Select(ea => new EstudianteAulaDto
                {
                    EstudianteId = ea.EstudianteId,
                    NombreCompleto = ea.Estudiante.Usuario.NombreCompleto,
                    Email = ea.Estudiante.Usuario.Email,
                    Grado = ea.Estudiante.Grado.ToString(),
                    FechaVinculacion = ea.FechaVinculacion,
                    // TODO: Calcular tareas diarias cuando se implemente el sistema de tareas
                    TareasDiarias = 0
                })
                .ToListAsync();

            return Ok(estudiantes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener estudiantes del aula");
            return StatusCode(500, new { mensaje = "Error al obtener los estudiantes" });
        }
    }

    /// <summary>
    /// Remover un estudiante de un aula
    /// </summary>
    [HttpDelete("{aulaId}/estudiante/{estudianteId}")]
    [Authorize(Roles = "Docente")]
    public async Task<IActionResult> RemoverEstudiante(int aulaId, int estudianteId)
    {
        try
        {
            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
            {
                return Unauthorized(new { mensaje = "Token inválido" });
            }

            var docente = await _context.Docentes
                .FirstOrDefaultAsync(d => d.UsuarioId == usuarioId);

            if (docente == null)
            {
                return NotFound(new { mensaje = "Docente no encontrado" });
            }

            var aula = await _context.Aulas
                .FirstOrDefaultAsync(a => a.Id == aulaId && a.DocenteId == docente.Id && a.Activa);

            if (aula == null)
            {
                return NotFound(new { mensaje = "Aula no encontrada o no tienes permiso" });
            }

            var vinculacion = await _context.EstudiantesAulas
                .FirstOrDefaultAsync(ea => ea.AulaId == aulaId && ea.EstudianteId == estudianteId && ea.Activo);

            if (vinculacion == null)
            {
                return NotFound(new { mensaje = "Estudiante no encontrado en esta aula" });
            }

            vinculacion.Activo = false;
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Docente {docente.Id} removió al estudiante {estudianteId} del aula {aulaId}");

            return Ok(new { mensaje = "Estudiante removido exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al remover estudiante");
            return StatusCode(500, new { mensaje = "Error al remover el estudiante" });
        }
    }
}
