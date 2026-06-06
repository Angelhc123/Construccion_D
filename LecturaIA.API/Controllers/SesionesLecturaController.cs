using LecturaIA.API.Data;
using LecturaIA.API.Models.DTOs;
using LecturaIA.API.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LecturaIA.API.Controllers
{
    /// <summary>
    /// CU-005: Gestión de sesiones de lectura
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Estudiante")]
    public class SesionesLecturaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SesionesLecturaController> _logger;

        public SesionesLecturaController(
            ApplicationDbContext context,
            ILogger<SesionesLecturaController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// CU-005: Iniciar una sesión de lectura
        /// POST /api/SesionesLectura/iniciar
        /// </summary>
        /// <summary>
        /// Inicia una nueva sesión de lectura para el estudiante autenticado.
        /// </summary>
        [HttpPost("iniciar")]
        public async Task<ActionResult<SesionLecturaDto>> IniciarLectura([FromBody] IniciarLecturaDto request)
        {
            try
            {
                var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
                {
                    return Unauthorized(new { message = "Estudiante no encontrado" });
                }
                var estudiante = await _context.Estudiantes
                    .FirstOrDefaultAsync(e => e.UsuarioId == usuarioId);
                if (estudiante == null)
                {
                    _logger.LogWarning("No se encontró estudiante para usuario {UsuarioId}", usuarioId);
                    return Unauthorized(new { message = "Estudiante no encontrado" });
                }
                var estudianteId = estudiante.Id;
                var lectura = await _context.Lecturas
                    .FirstOrDefaultAsync(l => l.Id == request.LecturaId && l.EstudianteId == estudianteId);
                if (lectura == null)
                {
                    _logger.LogWarning("Lectura {LecturaId} no encontrada para estudiante {EstudianteId}",
                        request.LecturaId, estudianteId);
                    return NotFound(new { message = "Lectura no encontrada" });
                }
                var sesion = new SesionLectura
                {
                    Id = Guid.NewGuid(),
                    EstudianteId = estudianteId,
                    LecturaId = request.LecturaId,
                    FechaInicio = DateTime.UtcNow,
                    TiempoLecturaMinutos = 0,
                    Completada = false
                };
                _context.SesionesLectura.Add(sesion);
                lectura.Estado = "en_progreso";
                await _context.SaveChangesAsync();
                _logger.LogInformation("Sesión de lectura iniciada: {SesionId} para estudiante {EstudianteId}", 
                    sesion.Id, estudianteId);
                return Ok(new SesionLecturaDto
                {
                    Id = sesion.Id,
                    LecturaId = sesion.LecturaId,
                    FechaInicio = sesion.FechaInicio,
                    Completada = false
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al iniciar sesión de lectura");
                return StatusCode(500, new { message = "Error al iniciar la lectura" });
            }
        }

        /// <summary>
        /// CU-005: Finalizar una sesión de lectura
        /// POST /api/SesionesLectura/finalizar
        /// </summary>
        [HttpPost("finalizar")]
        public async Task<ActionResult<LecturaFinalizadaDto>> FinalizarLectura([FromBody] FinalizarLecturaDto request)
        {
            try
            {
                // Obtener el ID del usuario del token JWT
                var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                
                // Buscar el estudiante asociado al usuario
                var estudiante = await _context.Estudiantes
                    .FirstOrDefaultAsync(e => e.UsuarioId == usuarioId);

                if (estudiante == null)
                {
                    return Unauthorized(new { message = "Estudiante no encontrado" });
                }

                var estudianteId = estudiante.Id;

                var sesion = await _context.SesionesLectura
                    .Include(s => s.Lectura)
                    .FirstOrDefaultAsync(s => s.Id == request.SesionLecturaId && s.EstudianteId == estudianteId);

                if (sesion == null)
                {
                    return NotFound(new { message = "Sesión de lectura no encontrada" });
                }

                if (sesion.Completada)
                {
                    return BadRequest(new { message = "Esta sesión ya fue completada" });
                }

                // Registrar finalización
                sesion.FechaFinalizacion = DateTime.UtcNow;
                sesion.TiempoLecturaMinutos = request.TiempoLecturaMinutos;
                sesion.Completada = true;

                // Actualizar estado de la lectura a "completado"
                sesion.Lectura.Estado = "completado";
                sesion.Lectura.Progreso = 100;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Sesión de lectura finalizada: {SesionId}, tiempo: {Tiempo} minutos", 
                    sesion.Id, request.TiempoLecturaMinutos);

                return Ok(new LecturaFinalizadaDto
                {
                    SesionLecturaId = sesion.Id,
                    FechaInicio = sesion.FechaInicio,
                    FechaFinalizacion = sesion.FechaFinalizacion.Value,
                    TiempoLecturaMinutos = sesion.TiempoLecturaMinutos,
                    Mensaje = "¡Felicitaciones! Has terminado de leer la historia"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al finalizar sesión de lectura");
                return StatusCode(500, new { message = "Error al finalizar la lectura" });
            }
        }

        /// <summary>
        /// Obtener sesión activa de una lectura
        /// GET /api/SesionesLectura/activa/{lecturaId}
        /// </summary>
        [HttpGet("activa/{lecturaId}")]
        public async Task<ActionResult<SesionLecturaDto>> ObtenerSesionActiva(int lecturaId)
        {
            try
            {
                // Obtener el ID del usuario del token JWT
                var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                
                // Buscar el estudiante asociado al usuario
                var estudiante = await _context.Estudiantes
                    .FirstOrDefaultAsync(e => e.UsuarioId == usuarioId);

                if (estudiante == null)
                {
                    return Unauthorized(new { message = "Estudiante no encontrado" });
                }

                var estudianteId = estudiante.Id;

                var sesion = await _context.SesionesLectura
                    .Where(s => s.LecturaId == lecturaId && 
                                s.EstudianteId == estudianteId && 
                                s.Completada)
                    .OrderByDescending(s => s.FechaInicio)
                    .FirstOrDefaultAsync();

                if (sesion == null)
                {
                    return NotFound(new { message = "No hay sesión completada para esta lectura" });
                }

                return Ok(new SesionLecturaDto
                {
                    Id = sesion.Id,
                    LecturaId = sesion.LecturaId,
                    FechaInicio = sesion.FechaInicio,
                    Completada = sesion.Completada
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener sesión activa");
                return StatusCode(500, new { message = "Error al obtener la sesión" });
            }
        }

        /// <summary>
        /// Actualizar tiempo de lectura de una sesión (para exámenes grupales)
        /// PATCH /api/SesionesLectura/{sesionId}/tiempo
        /// </summary>
        [HttpPatch("{sesionId}/tiempo")]
        public async Task<ActionResult> ActualizarTiempoLectura(Guid sesionId, [FromBody] ActualizarTiempoDto request)
        {
            try
            {
                _logger.LogInformation("🔄 Actualizando tiempo de lectura - SesionId: {SesionId}, TiempoMinutos: {Tiempo}", 
                    sesionId, request.TiempoLecturaMinutos);

                // Obtener el ID del usuario del token JWT
                var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                
                // Buscar el estudiante asociado al usuario
                var estudiante = await _context.Estudiantes
                    .FirstOrDefaultAsync(e => e.UsuarioId == usuarioId);

                if (estudiante == null)
                {
                    _logger.LogWarning("❌ Estudiante no encontrado para usuario {UsuarioId}", usuarioId);
                    return Unauthorized(new { message = "Estudiante no encontrado" });
                }

                var estudianteId = estudiante.Id;

                var sesion = await _context.SesionesLectura
                    .FirstOrDefaultAsync(s => s.Id == sesionId && s.EstudianteId == estudianteId);

                if (sesion == null)
                {
                    _logger.LogWarning("❌ Sesión no encontrada - SesionId: {SesionId}, EstudianteId: {EstudianteId}", 
                        sesionId, estudianteId);
                    return NotFound(new { message = "Sesión de lectura no encontrada" });
                }

                // Actualizar tiempo de lectura
                var tiempoAnterior = sesion.TiempoLecturaMinutos;
                sesion.TiempoLecturaMinutos = request.TiempoLecturaMinutos;
                await _context.SaveChangesAsync();

                _logger.LogInformation("✅ Tiempo de lectura actualizado - SesionId: {SesionId}, Anterior: {Anterior} min, Nuevo: {Nuevo} min", 
                    sesion.Id, tiempoAnterior, request.TiempoLecturaMinutos);

                return Ok(new { message = "Tiempo de lectura actualizado correctamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar tiempo de lectura");
                return StatusCode(500, new { message = "Error al actualizar el tiempo" });
            }
        }
    }
}
