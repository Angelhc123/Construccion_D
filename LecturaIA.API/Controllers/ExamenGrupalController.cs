using LecturaIA.API.Data;
using LecturaIA.API.Models.DTOs;
using LecturaIA.API.Models.Entities;
using LecturaIA.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LecturaIA.API.Controllers;

/// <summary>
/// CU-013: Controller para gestión de exámenes grupales
/// </summary>
[ApiController]
[Route("api/examengrupales")]
[Authorize]
public class ExamenGrupalController : ControllerBase
{
    private readonly ExamenGrupalService _examenGrupalService;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ExamenGrupalController> _logger;

    public ExamenGrupalController(
        ExamenGrupalService examenGrupalService,
        ApplicationDbContext context,
        ILogger<ExamenGrupalController> logger)
    {
        _examenGrupalService = examenGrupalService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Listar exámenes grupales de un aula (GET: api/examengrupales/docente/aula/{aulaId})
    /// </summary>
    [HttpGet("docente/aula/{aulaId}")]
    [Authorize(Roles = "Docente")]
    public async Task<ActionResult<List<ExamenGrupalDto>>> ListarExamenesDeAula(int aulaId)
    {
        try
        {
            var docenteId = await ObtenerDocenteIdAsync();
            if (docenteId == 0)
            {
                // Fail fast: usuario no autorizado
                return Unauthorized(new { mensaje = "Usuario no autorizado" });
            }
            // Verificar que el aula pertenece al docente
            var aula = await _context.Aulas
                .FirstOrDefaultAsync(a => a.Id == aulaId && a.DocenteId == docenteId);
            if (aula == null)
            {
                // Fail fast: aula no encontrada o no autorizado
                return NotFound(new { mensaje = "Aula no encontrada o no autorizado" });
            }
            var examenes = await _context.ExamenesGrupales
                .Include(e => e.Lectura)
                .Include(e => e.Asignaciones)
                .Where(e => e.AulaId == aulaId)
                .OrderByDescending(e => e.FechaCreacion)
                .Select(e => new ExamenGrupalDto
                {
                    Id = e.Id,
                    Titulo = e.Titulo,
                    Descripcion = e.Descripcion,
                    FechaCreacion = e.FechaCreacion,
                    FechaLimite = e.FechaLimite,
                    AulaId = e.AulaId,
                    LecturaId = e.LecturaId,
                    TotalEstudiantes = e.Asignaciones.Count,
                    CompletadosPorcentaje = e.Asignaciones.Any() 
                        ? (e.Asignaciones.Count(a => a.Estado == "Completado") * 100.0 / e.Asignaciones.Count)
                        : 0,
                    Estado = e.Asignaciones.All(a => a.Estado == "Completado") ? "Completado"
                        : e.Asignaciones.Any(a => a.Estado == "En Progreso") ? "En Progreso"
                        : e.FechaLimite < DateTime.UtcNow ? "Vencido"
                        : "Pendiente"
                })
                .ToListAsync();
            return Ok(examenes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al listar exámenes del aula {AulaId}", aulaId);
            return StatusCode(500, new { mensaje = "Error al listar exámenes", detalle = ex.Message });
        }
    }

    /// <summary>
    /// Reasignar un examen grupal existente (POST: api/examengrupales/{examenId}/reasignar)
    /// </summary>
    [HttpPost("{examenId}/reasignar")]
    [Authorize(Roles = "Docente")]
    public async Task<ActionResult> ReasignarExamen(int examenId, [FromBody] ReasignarExamenDto dto)
    {
        try
        {
            var docenteId = await ObtenerDocenteIdAsync();
            if (docenteId == 0)
            {
                return Unauthorized(new { mensaje = "Usuario no autorizado" });
            }

            // Verificar que el examen existe y pertenece al docente
            var examen = await _context.ExamenesGrupales
                .Include(e => e.Aula)
                .Include(e => e.Lectura)
                .FirstOrDefaultAsync(e => e.Id == examenId && e.Aula.DocenteId == docenteId);

            if (examen == null)
            {
                return NotFound(new { mensaje = "Examen no encontrado o no autorizado" });
            }

            // Obtener estudiantes del aula
            var estudiantesIds = await _context.EstudiantesAulas
                .Where(ea => ea.AulaId == examen.AulaId)
                .Select(ea => ea.EstudianteId)
                .ToListAsync();

            if (!estudiantesIds.Any())
            {
                return BadRequest(new { mensaje = "No hay estudiantes en el aula" });
            }

            // Obtener asignaciones existentes
            var asignacionesExistentes = await _context.AsignacionesExamen
                .Where(a => a.ExamenGrupalId == examenId && estudiantesIds.Contains(a.EstudianteId))
                .ToListAsync();

            int actualizadas = 0;
            int creadas = 0;

            foreach (var estudianteId in estudiantesIds)
            {
                var asignacionExistente = asignacionesExistentes.FirstOrDefault(a => a.EstudianteId == estudianteId);
                
                // Buscar y eliminar TODAS las sesiones del estudiante para esta lectura
                var sesionesAnteriores = await _context.SesionesLectura
                    .Where(s => s.EstudianteId == estudianteId && s.LecturaId == examen.LecturaId)
                    .ToListAsync();

                foreach (var sesionAnterior in sesionesAnteriores)
                {
                    // Eliminar cuestionario personal y sus respuestas
                    var cuestionarioAnterior = await _context.Cuestionarios
                        .Include(c => c.Preguntas)
                        .FirstOrDefaultAsync(c => c.SesionLecturaId == sesionAnterior.Id);

                    if (cuestionarioAnterior != null)
                    {
                        // Eliminar respuestas
                        var respuestas = await _context.RespuestasEstudiantes
                            .Where(r => cuestionarioAnterior.Preguntas.Select(p => p.Id).Contains(r.PreguntaId))
                            .ToListAsync();
                        _context.RespuestasEstudiantes.RemoveRange(respuestas);

                        // Eliminar resultado si existe
                        var resultado = await _context.ResultadosCuestionarios
                            .FirstOrDefaultAsync(r => r.CuestionarioId == cuestionarioAnterior.Id);
                        if (resultado != null)
                        {
                            _context.ResultadosCuestionarios.Remove(resultado);
                        }

                        // Eliminar cuestionario
                        _context.Cuestionarios.Remove(cuestionarioAnterior);
                    }

                    // Eliminar sesión
                    _context.SesionesLectura.Remove(sesionAnterior);
                }
                
                if (asignacionExistente != null)
                {

                    // Actualizar asignación existente - resetear a Pendiente
                    asignacionExistente.Estado = "Pendiente";
                    asignacionExistente.FechaAsignacion = DateTime.UtcNow;
                    asignacionExistente.FechaCompletado = null;
                    asignacionExistente.Calificacion = null;
                    asignacionExistente.SesionLecturaId = null;
                    actualizadas++;
                }
                else
                {
                    // Crear nueva asignación
                    _context.AsignacionesExamen.Add(new AsignacionExamen
                    {
                        ExamenGrupalId = examenId,
                        EstudianteId = estudianteId,
                        FechaAsignacion = DateTime.UtcNow,
                        Estado = "Pendiente"
                    });
                    creadas++;
                }
            }

            // Actualizar fecha límite si se proporcionó nueva
            var nuevaFechaLimite = dto.FechaLimite ?? examen.FechaLimite;
            if (dto.FechaLimite.HasValue)
            {
                examen.FechaLimite = dto.FechaLimite.Value;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Examen {ExamenId} reasignado: {Actualizadas} actualizadas, {Creadas} creadas por docente {DocenteId}", 
                examenId, actualizadas, creadas, docenteId);

            return Ok(new
            {
                mensaje = $"Examen reasignado exitosamente",
                asignacionesActualizadas = actualizadas,
                asignacionesCreadas = creadas,
                totalEstudiantes = estudiantesIds.Count,
                fechaLimite = nuevaFechaLimite
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al reasignar examen {ExamenId}", examenId);
            return StatusCode(500, new { mensaje = "Error al reasignar examen", detalle = ex.Message });
        }
    }

    /// <summary>
    /// Crea un examen grupal generando lectura y cuestionario con IA
    /// </summary>
    [HttpPost("crear")]
    [Authorize(Roles = "Docente")]
    public async Task<ActionResult<ExamenGrupalDto>> CrearExamenConIA([FromBody] CrearExamenGrupalDto dto)
    {
        try
        {
            var docenteId = await ObtenerDocenteIdAsync();
            if (docenteId == 0)
            {
                return Unauthorized(new { mensaje = "Usuario no autorizado" });
            }

            _logger.LogInformation("Docente {DocenteId} creando examen grupal para aula {AulaId}", 
                docenteId, dto.AulaId);

            var (success, message, examenDto) = await _examenGrupalService.CrearExamenConIAAsync(dto, docenteId);

            if (!success || examenDto == null)
            {
                return BadRequest(new { mensaje = message });
            }

            return Ok(new
            {
                mensaje = message,
                examen = examenDto
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear examen grupal");
            return StatusCode(500, new { mensaje = "Error interno al crear el examen" });
        }
    }

    /// <summary>
    /// Obtiene todos los exámenes de un salón (vista del docente)
    /// </summary>
    [HttpGet("salon/{aulaId}")]
    [Authorize(Roles = "Docente")]
    public async Task<ActionResult<List<ExamenGrupalDto>>> ObtenerExamenesDelSalon(int aulaId)
    {
        try
        {
            var docenteId = await ObtenerDocenteIdAsync();
            if (docenteId == 0)
            {
                return Unauthorized(new { mensaje = "Usuario no autorizado" });
            }

            var examenes = await _examenGrupalService.ObtenerExamenesDelSalonAsync(aulaId, docenteId);
            return Ok(examenes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener exámenes del salón {AulaId}", aulaId);
            return StatusCode(500, new { mensaje = "Error al obtener los exámenes" });
        }
    }

    /// <summary>
    /// Obtiene los exámenes asignados a un estudiante
    /// </summary>
    [HttpGet("asignados")]
    [Authorize(Roles = "Estudiante")]
    public async Task<ActionResult<List<AsignacionExamenDto>>> ObtenerExamenesAsignados()
    {
        try
        {
            var estudianteId = await ObtenerEstudianteIdAsync();
            if (estudianteId == 0)
            {
                return Unauthorized(new { mensaje = "Usuario no autorizado" });
            }

            var asignaciones = await _examenGrupalService.ObtenerExamenesAsignadosAsync(estudianteId);
            return Ok(asignaciones);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener exámenes asignados");
            return StatusCode(500, new { mensaje = "Error al obtener los exámenes asignados" });
        }
    }

    /// <summary>
    /// Obtiene los resultados consolidados de un examen grupal
    /// </summary>
    [HttpGet("{examenGrupalId}/resultados")]
    [Authorize(Roles = "Docente")]
    public async Task<ActionResult<ResultadosExamenGrupalDto>> ObtenerResultadosConsolidados(int examenGrupalId)
    {
        try
        {
            var docenteId = await ObtenerDocenteIdAsync();
            if (docenteId == 0)
            {
                return Unauthorized(new { mensaje = "Usuario no autorizado" });
            }

            var resultados = await _examenGrupalService.ObtenerResultadosConsolidadosAsync(examenGrupalId, docenteId);
            
            if (resultados == null)
            {
                return NotFound(new { mensaje = "Examen no encontrado" });
            }

            return Ok(resultados);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener resultados del examen {ExamenId}", examenGrupalId);
            return StatusCode(500, new { mensaje = "Error al obtener los resultados" });
        }
    }

    /// <summary>
    /// Marca una asignación como completada (llamado automáticamente cuando estudiante termina el examen)
    /// </summary>
    [HttpPost("{examenGrupalId}/completar")]
    [Authorize(Roles = "Estudiante")]
    public async Task<ActionResult> MarcarComoCompletado(int examenGrupalId, [FromBody] CompletarExamenDto dto)
    {
        try
        {
            var estudianteId = await ObtenerEstudianteIdAsync();
            if (estudianteId == 0)
            {
                return Unauthorized(new { mensaje = "Usuario no autorizado" });
            }

            var success = await _examenGrupalService.MarcarComoCompletadoAsync(
                examenGrupalId, 
                estudianteId, 
                dto.SesionLecturaId);

            if (!success)
            {
                return BadRequest(new { mensaje = "No se pudo marcar el examen como completado" });
            }

            return Ok(new { mensaje = "Examen completado exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al marcar examen como completado");
            return StatusCode(500, new { mensaje = "Error al procesar la solicitud" });
        }
    }

    /// <summary>
    /// Elimina un examen grupal (solo si ningún estudiante lo ha completado)
    /// </summary>
    [HttpDelete("{examenGrupalId}")]
    [Authorize(Roles = "Docente")]
    public async Task<ActionResult> EliminarExamen(int examenGrupalId)
    {
        try
        {
            var docenteId = await ObtenerDocenteIdAsync();
            if (docenteId == 0)
            {
                return Unauthorized(new { mensaje = "Usuario no autorizado" });
            }

            var (success, message) = await _examenGrupalService.EliminarExamenAsync(examenGrupalId, docenteId);

            if (!success)
            {
                return BadRequest(new { mensaje = message });
            }

            return Ok(new { mensaje = message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar examen {ExamenId}", examenGrupalId);
            return StatusCode(500, new { mensaje = "Error al eliminar el examen" });
        }
    }

    /// <summary>
    /// Obtiene los datos de una asignación de examen para que el estudiante pueda realizarlo
    /// </summary>
    [HttpGet("asignacion/{asignacionId}")]
    [Authorize(Roles = "Estudiante")]
    public async Task<IActionResult> ObtenerAsignacionExamenAsync(int asignacionId)
    {
        try
        {
            var estudianteId = await ObtenerEstudianteIdAsync();
            if (estudianteId == 0)
            {
                return Unauthorized(new { mensaje = "No se encontró el estudiante asociado al usuario." });
            }

            var asignacion = await _context.AsignacionesExamen
                .Include(a => a.ExamenGrupal)
                    .ThenInclude(e => e.Lectura)
                .FirstOrDefaultAsync(a => a.Id == asignacionId && a.EstudianteId == estudianteId);

            if (asignacion == null)
            {
                return NotFound(new { mensaje = "No se encontró la asignación del examen." });
            }

            // Si el examen está en progreso, buscar el cuestionario personal del estudiante
            Cuestionario? cuestionario = null;
            Guid? sesionLecturaId = null;

            if (asignacion.Estado == "En Progreso")
            {
                // Buscar el cuestionario personal del estudiante
                cuestionario = await _context.Cuestionarios
                    .Include(c => c.Preguntas)
                    .Where(c => c.LecturaId == asignacion.ExamenGrupal.LecturaId && 
                               c.EstudianteId == estudianteId)
                    .FirstOrDefaultAsync();

                if (cuestionario != null)
                {
                    sesionLecturaId = cuestionario.SesionLecturaId;
                }
            }

            // Si no tiene cuestionario personal, obtener el template
            if (cuestionario == null)
            {
                cuestionario = await _context.Cuestionarios
                    .Include(c => c.Preguntas)
                    .Where(c => c.LecturaId == asignacion.ExamenGrupal.LecturaId && 
                               c.EstudianteId == null && 
                               c.SesionLecturaId == null)
                    .FirstOrDefaultAsync();
            }

            if (cuestionario == null)
            {
                return NotFound(new { mensaje = "No se encontró el cuestionario del examen." });
            }

            return Ok(new
            {
                id = asignacion.Id,
                estado = asignacion.Estado,
                fechaAsignacion = asignacion.FechaAsignacion,
                sesionLecturaId = sesionLecturaId,
                examen = new
                {
                    id = asignacion.ExamenGrupal.Id,
                    titulo = asignacion.ExamenGrupal.Titulo,
                    descripcion = asignacion.ExamenGrupal.Descripcion,
                    fechaCreacion = asignacion.ExamenGrupal.FechaCreacion,
                    fechaLimite = asignacion.ExamenGrupal.FechaLimite
                },
                lectura = new
                {
                    id = asignacion.ExamenGrupal.Lectura.Id,
                    titulo = asignacion.ExamenGrupal.Lectura.Titulo,
                    contenido = asignacion.ExamenGrupal.Lectura.Contenido
                },
                cuestionario = new
                {
                    id = cuestionario.Id,
                    cantidadPreguntas = cuestionario.Preguntas.Count
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener la asignación del examen {AsignacionId}", asignacionId);
            return StatusCode(500, new { mensaje = "Error al obtener la asignación del examen." });
        }
    }

    /// <summary>
    /// Inicia un examen grupal para un estudiante (crea su SesionLectura y Cuestionario personal)
    /// </summary>
    [HttpPost("iniciar/{asignacionId}")]
    [Authorize(Roles = "Estudiante")]
    public async Task<IActionResult> IniciarExamenAsync(int asignacionId)
    {
        try
        {
            var estudianteId = await ObtenerEstudianteIdAsync();
            if (estudianteId == 0)
            {
                return Unauthorized(new { mensaje = "No se encontró el estudiante asociado al usuario." });
            }

            // Verificar que la asignación existe y pertenece al estudiante
            var asignacion = await _context.AsignacionesExamen
                .Include(a => a.ExamenGrupal)
                .FirstOrDefaultAsync(a => a.Id == asignacionId && a.EstudianteId == estudianteId);

            if (asignacion == null)
            {
                return NotFound(new { mensaje = "No se encontró la asignación del examen." });
            }

            if (asignacion.Estado == "Completado")
            {
                return BadRequest(new { mensaje = "Este examen ya fue completado." });
            }

            // Verificar si ya tiene una sesión de lectura creada
            var sesionExistente = await _context.SesionesLectura
                .FirstOrDefaultAsync(s => s.EstudianteId == estudianteId && 
                                         s.LecturaId == asignacion.ExamenGrupal.LecturaId);

            if (sesionExistente != null)
            {
                // Ya inició el examen, devolver la sesión existente
                var cuestionarioExistente = await _context.Cuestionarios
                    .FirstOrDefaultAsync(c => c.SesionLecturaId == sesionExistente.Id);

                return Ok(new
                {
                    sesionLecturaId = sesionExistente.Id,
                    cuestionarioId = cuestionarioExistente?.Id,
                    mensaje = "Examen ya iniciado previamente"
                });
            }

            // Obtener el cuestionario template
            var cuestionarioTemplate = await _context.Cuestionarios
                .Include(c => c.Preguntas)
                .Where(c => c.LecturaId == asignacion.ExamenGrupal.LecturaId && 
                           c.EstudianteId == null && 
                           c.SesionLecturaId == null)
                .FirstOrDefaultAsync();

            if (cuestionarioTemplate == null)
            {
                return NotFound(new { mensaje = "No se encontró el cuestionario template del examen." });
            }

            // Crear SesionLectura personal
            var sesionLectura = new SesionLectura
            {
                Id = Guid.NewGuid(),
                EstudianteId = estudianteId,
                LecturaId = asignacion.ExamenGrupal.LecturaId,
                FechaInicio = DateTime.UtcNow,
                FechaFinalizacion = null,
                Completada = false,
                TiempoLecturaMinutos = 0
            };
            _context.SesionesLectura.Add(sesionLectura);

            // Clonar el cuestionario template con el EstudianteId del estudiante
            var cuestionarioPersonal = new Cuestionario
            {
                EstudianteId = estudianteId,
                SesionLecturaId = sesionLectura.Id,
                LecturaId = asignacion.ExamenGrupal.LecturaId,
                FechaGeneracion = DateTime.UtcNow,
                Estado = "listo",
                NivelDificultad = cuestionarioTemplate.NivelDificultad,
                TipoTexto = cuestionarioTemplate.TipoTexto,
                Preguntas = new List<Pregunta>()
            };

            // Clonar todas las preguntas
            foreach (var preguntaTemplate in cuestionarioTemplate.Preguntas)
            {
                var preguntaPersonal = new Pregunta
                {
                    Orden = preguntaTemplate.Orden,
                    TextoPregunta = preguntaTemplate.TextoPregunta,
                    Tipo = preguntaTemplate.Tipo,
                    Formato = preguntaTemplate.Formato,
                    Opciones = preguntaTemplate.Opciones,
                    RespuestaCorrecta = preguntaTemplate.RespuestaCorrecta,
                    Explicacion = preguntaTemplate.Explicacion
                };

                cuestionarioPersonal.Preguntas.Add(preguntaPersonal);
            }

            _context.Cuestionarios.Add(cuestionarioPersonal);

            // Actualizar estado de la asignación y vincular la sesión
            asignacion.Estado = "En Progreso";
            asignacion.SesionLecturaId = sesionLectura.Id;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                sesionLecturaId = sesionLectura.Id,
                cuestionarioId = cuestionarioPersonal.Id,
                mensaje = "Examen iniciado exitosamente"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al iniciar el examen {AsignacionId}", asignacionId);
            return StatusCode(500, new { mensaje = "Error al iniciar el examen." });
        }
    }

    // Métodos auxiliares privados

    private async Task<int> ObtenerDocenteIdAsync()
    {
        var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(usuarioIdClaim, out int usuarioId))
            return 0;

        var docente = await _context.Docentes
            .FirstOrDefaultAsync(d => d.UsuarioId == usuarioId);
        
        return docente?.Id ?? 0;
    }

    private async Task<int> ObtenerEstudianteIdAsync()
    {
        var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(usuarioIdClaim, out int usuarioId))
            return 0;

        var estudiante = await _context.Estudiantes
            .FirstOrDefaultAsync(e => e.UsuarioId == usuarioId);
        
        return estudiante?.Id ?? 0;
    }
}

/// <summary>
/// DTO para completar un examen
/// </summary>
public class CompletarExamenDto
{
    public Guid SesionLecturaId { get; set; }
}
