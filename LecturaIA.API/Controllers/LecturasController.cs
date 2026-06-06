using LecturaIA.API.Data;
using LecturaIA.API.Models.DTOs;
using LecturaIA.API.Models.Entities;
using LecturaIA.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace LecturaIA.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LecturasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILecturaIAService _lecturaIAService;
        private readonly ILogger<LecturasController> _logger;
        private const string EstudianteNoEncontrado = "Estudiante no encontrado";

        public LecturasController(
            ApplicationDbContext context,
            ILecturaIAService lecturaIAService,
            ILogger<LecturasController> logger)
        {
            _context = context;
            _lecturaIAService = lecturaIAService;
            _logger = logger;
        }

        /// <summary>
        /// Genera una nueva lectura personalizada para el estudiante autenticado.
        /// </summary>
        [HttpPost("generar")]
        public async Task<ActionResult<LecturaGeneradaDto>> GenerarLectura([FromBody] GenerarLecturaRequestDto request)
        {
            try
            {
                var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
                {
                    return Unauthorized(new { mensaje = EstudianteNoEncontrado });
                }
                var estudiante = await _context.Estudiantes
                    .FirstOrDefaultAsync(e => e.UsuarioId == usuarioId);
                if (estudiante == null)
                {
                    return Unauthorized(new { mensaje = EstudianteNoEncontrado });
                }
                // Fail fast: máximo 2 temas
                if (request.Preferencias.Temas.Count > 2)
                {
                    return BadRequest(new { mensaje = "Solo puedes seleccionar máximo 2 temas" });
                }
                // Fail fast: máximo 2 personajes
                if (request.Preferencias.Personajes.Count > 2)
                {
                    return BadRequest(new { mensaje = "Solo puedes seleccionar máximo 2 personajes" });
                }
                // Seleccionar tipo de lectura aleatorio
                string[] tiposLectura = { "Narrativa", "Descriptiva", "Argumentativa", "Expositiva", "Informativa" };
                var random = new Random();
                var tipoLectura = tiposLectura[random.Next(tiposLectura.Length)];
                _logger.LogInformation("Generando lectura de tipo {TipoLectura} para estudiante {EstudianteId}", tipoLectura, estudiante.Id);
                var (titulo, contenido, urlImagen) = await _lecturaIAService.GenerarLecturaAsync(
                    request.Preferencias,
                    tipoLectura,
                    estudiante.Edad,
                    estudiante.Grado.ToString()
                );
                var lectura = new Lectura
                {
                    EstudianteId = estudiante.Id,
                    Titulo = titulo,
                    Contenido = contenido,
                    UrlImagen = urlImagen,
                    TipoLectura = tipoLectura,
                    Temas = JsonSerializer.Serialize(request.Preferencias.Temas),
                    Personajes = JsonSerializer.Serialize(request.Preferencias.Personajes),
                    Escenario = request.Preferencias.Escenario,
                    Longitud = request.Preferencias.Longitud,
                    Emocion = request.Preferencias.Emocion,
                    Proposito = request.Preferencias.Proposito,
                    FechaCreacion = DateTime.UtcNow,
                    Estado = "pendiente",
                    Progreso = 0,
                    EsFavorita = false
                };
                _context.Lecturas.Add(lectura);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Lectura generada exitosamente con ID {LecturaId}", lectura.Id);
                return Ok(new LecturaGeneradaDto
                {
                    Id = lectura.Id,
                    Titulo = lectura.Titulo,
                    Contenido = lectura.Contenido,
                    UrlImagen = lectura.UrlImagen,
                    TipoLectura = lectura.TipoLectura,
                    Preferencias = request.Preferencias,
                    FechaCreacion = lectura.FechaCreacion
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar lectura");
                return StatusCode(500, new { mensaje = "Error al generar la lectura", error = ex.Message });
            }
        }

        // GET: api/Lecturas
        [HttpGet]
        public async Task<ActionResult<List<LecturaListaDto>>> ObtenerLecturas()
        {
            try
            {
                var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var estudiante = await _context.Estudiantes
                    .FirstOrDefaultAsync(e => e.UsuarioId == usuarioId);

                if (estudiante == null)
                {
                    return Unauthorized(new { mensaje = EstudianteNoEncontrado });
                }

                var lecturas = await _context.Lecturas
                    .Where(l => l.EstudianteId == estudiante.Id)
                    .OrderByDescending(l => l.FechaCreacion)
                    .Select(l => new LecturaListaDto
                    {
                        Id = l.Id,
                        Titulo = l.Titulo,
                        TipoLectura = l.TipoLectura,
                        Longitud = l.Longitud,
                        FechaCreacion = l.FechaCreacion,
                        Progreso = l.Progreso,
                        Estado = l.Estado,
                        EsFavorita = l.EsFavorita,
                        TieneCuestionario = _context.Cuestionarios.Any(c => c.LecturaId == l.Id),
                        CuestionarioId = _context.Cuestionarios
                            .Where(c => c.LecturaId == l.Id)
                            .Select(c => (Guid?)c.Id)
                            .FirstOrDefault(),
                        CuestionarioEvaluado = _context.Cuestionarios
                            .Any(c => c.LecturaId == l.Id && c.Estado == "evaluado")
                    })
                    .ToListAsync();

                return Ok(lecturas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener lecturas");
                return StatusCode(500, new { mensaje = "Error al obtener lecturas" });
            }
        }

        // GET: api/Lecturas/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<LecturaGeneradaDto>> ObtenerLectura(int id)
        {
            try
            {
                var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                _logger.LogInformation("Buscando lectura {LecturaId} para usuario {UsuarioId}", id, usuarioId);
                
                var estudiante = await _context.Estudiantes
                    .FirstOrDefaultAsync(e => e.UsuarioId == usuarioId);

                if (estudiante == null)
                {
                    _logger.LogWarning("No se encontró estudiante para usuario {UsuarioId}", usuarioId);
                    return Unauthorized(new { mensaje = EstudianteNoEncontrado });
                }

                _logger.LogInformation("Estudiante encontrado: {EstudianteId}", estudiante.Id);

                var lectura = await _context.Lecturas
                    .FirstOrDefaultAsync(l => l.Id == id && l.EstudianteId == estudiante.Id);

                if (lectura == null)
                {
                    _logger.LogWarning("No se encontró lectura {LecturaId} para estudiante {EstudianteId}", id, estudiante.Id);
                    
                    // Verificar si la lectura existe pero no pertenece al estudiante
                    var lecturaExiste = await _context.Lecturas.AnyAsync(l => l.Id == id);
                    if (lecturaExiste)
                    {
                        _logger.LogWarning("La lectura {LecturaId} existe pero no pertenece al estudiante {EstudianteId}", id, estudiante.Id);
                        return NotFound(new { mensaje = "Lectura no encontrada o no tienes permiso para acceder a ella" });
                    }
                    
                    return NotFound(new { mensaje = "Lectura no encontrada" });
                }

                return Ok(new LecturaGeneradaDto
                {
                    Id = lectura.Id,
                    Titulo = lectura.Titulo,
                    Contenido = lectura.Contenido,
                    UrlImagen = lectura.UrlImagen,
                    TipoLectura = lectura.TipoLectura,
                    Preferencias = new PreferenciasLecturaDto
                    {
                        Temas = JsonSerializer.Deserialize<List<string>>(lectura.Temas) ?? new(),
                        Personajes = JsonSerializer.Deserialize<List<string>>(lectura.Personajes) ?? new(),
                        Escenario = lectura.Escenario,
                        Longitud = lectura.Longitud,
                        Emocion = lectura.Emocion,
                        Proposito = lectura.Proposito
                    },
                    FechaCreacion = lectura.FechaCreacion
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener lectura");
                return StatusCode(500, new { mensaje = "Error al obtener la lectura" });
            }
        }

        // DELETE: api/Lecturas/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> EliminarLectura(int id)
        {
            try
            {
                var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var estudiante = await _context.Estudiantes
                    .FirstOrDefaultAsync(e => e.UsuarioId == usuarioId);

                if (estudiante == null)
                {
                    return Unauthorized(new { mensaje = EstudianteNoEncontrado });
                }

                var lectura = await _context.Lecturas
                    .FirstOrDefaultAsync(l => l.Id == id && l.EstudianteId == estudiante.Id);

                if (lectura == null)
                {
                    return NotFound(new { mensaje = "Lectura no encontrada" });
                }

                // Eliminar entidades relacionadas primero
                // 1. Eliminar sesiones de lectura y sus cuestionarios
                var sesiones = await _context.SesionesLectura
                    .Where(s => s.LecturaId == id)
                    .ToListAsync();

                foreach (var sesion in sesiones)
                {
                    // Eliminar cuestionarios de la sesión
                    var cuestionarios = await _context.Cuestionarios
                        .Where(c => c.SesionLecturaId == sesion.Id)
                        .ToListAsync();

                    // Simplificado: obtener IDs de cuestionarios para consultas
                    var cuestionariosIds = cuestionarios.Select(c => c.Id).ToList();

                    foreach (var cuestionario in cuestionarios)
                    {
                        // Eliminar respuestas del cuestionario
                        var respuestas = await _context.RespuestasEstudiantes
                            .Where(r => _context.Preguntas
                                .Any(p => p.Id == r.PreguntaId && p.CuestionarioId == cuestionario.Id))
                            .ToListAsync();
                        _context.RespuestasEstudiantes.RemoveRange(respuestas);

                        // Eliminar preguntas del cuestionario
                        var preguntas = await _context.Preguntas
                            .Where(p => p.CuestionarioId == cuestionario.Id)
                            .ToListAsync();
                        _context.Preguntas.RemoveRange(preguntas);

                        // Eliminar resultado si existe
                        var resultado = await _context.ResultadosCuestionarios
                            .FirstOrDefaultAsync(r => r.CuestionarioId == cuestionario.Id);
                        if (resultado != null)
                        {
                            _context.ResultadosCuestionarios.Remove(resultado);
                        }
                    }

                    _context.Cuestionarios.RemoveRange(cuestionarios);
                }

                _context.SesionesLectura.RemoveRange(sesiones);

                // 2. Ahora eliminar la lectura
                _context.Lecturas.Remove(lectura);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Lectura {LecturaId} eliminada exitosamente por estudiante {EstudianteId}", id, estudiante.Id);

                return Ok(new { mensaje = "Lectura eliminada exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar lectura {LecturaId}", id);
                return StatusCode(500, new { mensaje = "Error al eliminar la lectura", detalle = ex.Message });
            }
        }

        // PUT: api/Lecturas/{id}/favorita
        [HttpPut("{id}/favorita")]
        public async Task<ActionResult> MarcarFavorita(int id, [FromBody] MarcarFavoritaDto request)
        {
            try
            {
                var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var estudiante = await _context.Estudiantes
                    .FirstOrDefaultAsync(e => e.UsuarioId == usuarioId);

                if (estudiante == null)
                {
                    return Unauthorized(new { mensaje = EstudianteNoEncontrado });
                }

                var lectura = await _context.Lecturas
                    .FirstOrDefaultAsync(l => l.Id == id && l.EstudianteId == estudiante.Id);

                if (lectura == null)
                {
                    return NotFound(new { mensaje = "Lectura no encontrada" });
                }

                lectura.EsFavorita = request.EsFavorita;
                await _context.SaveChangesAsync();

                return Ok(new { mensaje = request.EsFavorita ? "Agregada a favoritas" : "Removida de favoritas" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar favorita");
                return StatusCode(500, new { mensaje = "Error al actualizar favorita" });
            }
        }

        // GET: api/Lecturas/favoritas
        [HttpGet("favoritas")]
        public async Task<ActionResult<List<LecturaListaDto>>> ObtenerFavoritas()
        {
            try
            {
                var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var estudiante = await _context.Estudiantes
                    .FirstOrDefaultAsync(e => e.UsuarioId == usuarioId);

                if (estudiante == null)
                {
                    return Unauthorized(new { mensaje = EstudianteNoEncontrado });
                }

                var lecturas = await _context.Lecturas
                    .Where(l => l.EstudianteId == estudiante.Id && l.EsFavorita)
                    .OrderByDescending(l => l.FechaCreacion)
                    .Select(l => new LecturaListaDto
                    {
                        Id = l.Id,
                        Titulo = l.Titulo,
                        TipoLectura = l.TipoLectura,
                        Longitud = l.Longitud,
                        FechaCreacion = l.FechaCreacion,
                        Progreso = l.Progreso,
                        Estado = l.Estado,
                        EsFavorita = l.EsFavorita
                    })
                    .ToListAsync();

                return Ok(lecturas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener favoritas");
                return StatusCode(500, new { mensaje = "Error al obtener las lecturas favoritas" });
            }
        }
    }
}
