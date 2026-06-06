using LecturaIA.API.Data;
using LecturaIA.API.Models.DTOs;
using LecturaIA.API.Models.Entities;
using LecturaIA.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

using Microsoft.Data.SqlClient;

namespace LecturaIA.API.Controllers
{
    /// <summary>
    /// CU-006 y CU-007: Gestión de cuestionarios y evaluación
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Estudiante")]
    public class CuestionariosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ICuestionarioIAService _iaService;
        private readonly ILogger<CuestionariosController> _logger;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public CuestionariosController(
            ApplicationDbContext context,
            ICuestionarioIAService iaService,
            ILogger<CuestionariosController> logger,
            IServiceScopeFactory serviceScopeFactory)
        {
            _context = context;
            _iaService = iaService;
            _logger = logger;
            _serviceScopeFactory = serviceScopeFactory;
        }

        /// <summary>
        /// Método helper para obtener el ID del estudiante desde el token JWT
        /// </summary>
        /// <summary>
        /// Obtiene el ID del estudiante autenticado desde el token JWT.
        /// </summary>
        private async Task<(int? estudianteId, ActionResult? errorResult)> ObtenerEstudianteIdAsync()
        {
            var usuarioIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
            {
                return (null, Unauthorized(new { message = "Token inválido" }));
            }
            var estudiante = await _context.Estudiantes
                .FirstOrDefaultAsync(e => e.UsuarioId == usuarioId);
            if (estudiante == null)
            {
                _logger.LogWarning("No se encontró estudiante para usuario {UsuarioId}", usuarioId);
                return (null, Unauthorized(new { message = "Estudiante no encontrado" }));
            }
            return (estudiante.Id, null);
        }

        /// <summary>
        /// CU-006: Generar cuestionario con IA
        /// POST /api/Cuestionarios/generar
        /// </summary>
        [HttpPost("generar")]
        public async Task<ActionResult<CuestionarioDto>> GenerarCuestionario([FromBody] GenerarCuestionarioDto request)
        {
            try
            {
                var (estudianteIdNullable, errorResult) = await ObtenerEstudianteIdAsync();
                if (errorResult != null) return errorResult;
                var estudianteId = estudianteIdNullable!.Value;

                // Obtener sesión de lectura
                var sesion = await _context.SesionesLectura
                    .Include(s => s.Lectura)
                    .Include(s => s.Estudiante)
                    .FirstOrDefaultAsync(s => s.Id == request.SesionLecturaId && s.EstudianteId == estudianteId);

                if (sesion == null)
                {
                    return NotFound(new { message = "Sesión de lectura no encontrada" });
                }

                if (!sesion.Completada)
                {
                    return BadRequest(new { message = "Debes completar la lectura primero" });
                }

                // Verificar si ya existe un cuestionario
                var cuestionarioExistente = await _context.Cuestionarios
                    .FirstOrDefaultAsync(c => c.SesionLecturaId == sesion.Id);

                if (cuestionarioExistente != null)
                {
                    _logger.LogInformation("Cuestionario ya existe para sesión {SesionId}", sesion.Id);
                    return Ok(new CuestionarioDto
                    {
                        Id = cuestionarioExistente.Id,
                        SesionLecturaId = cuestionarioExistente.SesionLecturaId!.Value,
                        LecturaId = cuestionarioExistente.LecturaId,
                        FechaGeneracion = cuestionarioExistente.FechaGeneracion,
                        Estado = cuestionarioExistente.Estado,
                        NivelDificultad = cuestionarioExistente.NivelDificultad,
                        TipoTexto = cuestionarioExistente.TipoTexto,
                        TituloLectura = sesion.Lectura.Titulo,
                        Preguntas = new List<PreguntaDto>()
                    });
                }

                // Crear cuestionario
                var cuestionario = new Cuestionario
                {
                    Id = Guid.NewGuid(),
                    SesionLecturaId = sesion.Id,
                    LecturaId = sesion.LecturaId,
                    EstudianteId = estudianteId,
                    FechaGeneracion = DateTime.UtcNow,
                    Estado = "generando",
                    NivelDificultad = sesion.Estudiante.NivelDificultad.ToString(),
                    TipoTexto = sesion.Lectura.TipoLectura
                };

                _context.Cuestionarios.Add(cuestionario);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Iniciando generación de cuestionario {CuestionarioId} para lectura {LecturaId}", 
                    cuestionario.Id, sesion.LecturaId);

                // Generar preguntas con IA (proceso asíncrono)
                _ = Task.Run(async () =>
                {
                    try
                    {
                        _logger.LogInformation("Llamando a IA para generar preguntas del cuestionario {CuestionarioId}", 
                            cuestionario.Id);

                        var preguntas = await _iaService.GenerarCuestionarioAsync(
                            sesion.Lectura.Contenido,
                            sesion.Lectura.Titulo,
                            sesion.Lectura.TipoLectura,
                            cuestionario.NivelDificultad,
                            sesion.Estudiante.Edad);

                        _logger.LogInformation("IA generó {Count} preguntas para cuestionario {CuestionarioId}", 
                            preguntas.Count, cuestionario.Id);

                        // Asignar al cuestionario
                        foreach (var pregunta in preguntas)
                        {
                            pregunta.CuestionarioId = cuestionario.Id;
                        }

                        using var scope = _serviceScopeFactory.CreateScope();
                        var scopedContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                        scopedContext.Preguntas.AddRange(preguntas);
                        
                        var cuest = await scopedContext.Cuestionarios.FindAsync(cuestionario.Id);
                        if (cuest != null)
                        {
                            cuest.Estado = "listo";
                        }

                        await scopedContext.SaveChangesAsync();

                        _logger.LogInformation("✅ Cuestionario completado exitosamente: {CuestionarioId}", cuestionario.Id);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "❌ Error al generar preguntas del cuestionario {CuestionarioId}", 
                            cuestionario.Id);
                        
                        // Marcar como error en la BD
                        try
                        {
                            using var scope = _serviceScopeFactory.CreateScope();
                            var scopedContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                            var cuest = await scopedContext.Cuestionarios.FindAsync(cuestionario.Id);
                            if (cuest != null)
                            {
                                cuest.Estado = "error";
                                await scopedContext.SaveChangesAsync();
                            }
                        }
                        catch { }
                    }
                });

                return Ok(new CuestionarioDto
                {
                    Id = cuestionario.Id,
                    SesionLecturaId = cuestionario.SesionLecturaId!.Value,
                    LecturaId = cuestionario.LecturaId,
                    FechaGeneracion = cuestionario.FechaGeneracion,
                    Estado = "generando",
                    NivelDificultad = cuestionario.NivelDificultad,
                    TipoTexto = cuestionario.TipoTexto,
                    TituloLectura = sesion.Lectura.Titulo,
                    Preguntas = new List<PreguntaDto>()
                });
            }
            catch (DbUpdateException ex) when (ex.InnerException is SqlException sqlEx && (sqlEx.Number == 2601 || sqlEx.Number == 2627))
            {
                _logger.LogWarning("Intento de crear cuestionario duplicado para sesión {SesionId}", request.SesionLecturaId);
                
                // Si hubo un conflicto de inserción (race condition), recuperamos el cuestionario que ya fue insertado por el otro hilo
                var existente = await _context.Cuestionarios.FirstOrDefaultAsync(c => c.SesionLecturaId == request.SesionLecturaId);
                if (existente != null)
                {
                    return Ok(new CuestionarioDto
                    {
                        Id = existente.Id,
                        SesionLecturaId = existente.SesionLecturaId!.Value,
                        LecturaId = existente.LecturaId,
                        FechaGeneracion = existente.FechaGeneracion,
                        Estado = existente.Estado,
                        NivelDificultad = existente.NivelDificultad,
                        TipoTexto = existente.TipoTexto,
                        Preguntas = new List<PreguntaDto>()
                    });
                }

                return Conflict(new { 
                    message = "Ya existe un cuestionario para esta sesión de lectura",
                    sesionId = request.SesionLecturaId,
                    codigo = "DUPLICATE_CUESTIONARIO"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar cuestionario");
                return StatusCode(500, new { message = "Error al generar el cuestionario" });
            }
        }

        /// <summary>
        /// CU-006: Obtener cuestionario con sus preguntas
        /// GET /api/Cuestionarios/{id}
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<CuestionarioDto>> ObtenerCuestionario(Guid id)
        {
            try
            {
                var (estudianteIdNullable, errorResult) = await ObtenerEstudianteIdAsync();
                if (errorResult != null) return errorResult;
                var estudianteId = estudianteIdNullable!.Value;

                var cuestionario = await _context.Cuestionarios
                    .Include(c => c.Preguntas.OrderBy(p => p.Orden))
                    .Include(c => c.Lectura)
                    .FirstOrDefaultAsync(c => c.Id == id && c.EstudianteId == estudianteId);

                if (cuestionario == null)
                {
                    return NotFound(new { message = "Cuestionario no encontrado" });
                }

                var dto = new CuestionarioDto
                {
                    Id = cuestionario.Id,
                    SesionLecturaId = cuestionario.SesionLecturaId,
                    LecturaId = cuestionario.LecturaId,
                    FechaGeneracion = cuestionario.FechaGeneracion,
                    Estado = cuestionario.Estado,
                    NivelDificultad = cuestionario.NivelDificultad,
                    TipoTexto = cuestionario.TipoTexto,
                    TituloLectura = cuestionario.Lectura.Titulo,
                    Preguntas = cuestionario.Preguntas.Select(p => new PreguntaDto
                    {
                        Id = p.Id,
                        Orden = p.Orden,
                        Tipo = p.Tipo,
                        Formato = p.Formato,
                        TextoPregunta = p.TextoPregunta,
                        Opciones = p.Formato == "OpcionMultiple" 
                            ? JsonSerializer.Deserialize<List<string>>(p.Opciones ?? "[]")
                            : null,
                        Explicacion = null // No enviar al estudiante hasta que termine
                    }).ToList()
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener cuestionario");
                return StatusCode(500, new { message = "Error al obtener el cuestionario" });
            }
        }

        /// <summary>
        /// CU-006: Enviar respuestas del cuestionario
        /// POST /api/Cuestionarios/{id}/enviar
        /// </summary>
        [HttpPost("{id}/enviar")]
        public async Task<ActionResult<ResultadoCuestionarioDto>> EnviarRespuestas(
            Guid id,
            [FromBody] EnviarRespuestasDto request)
        {
            try
            {
                var (estudianteIdNullable, errorResult) = await ObtenerEstudianteIdAsync();
                if (errorResult != null) return errorResult;
                var estudianteId = estudianteIdNullable!.Value;

                var cuestionario = await _context.Cuestionarios
                    .Include(c => c.Preguntas)
                    .Include(c => c.Lectura)
                    .Include(c => c.Estudiante)
                    .FirstOrDefaultAsync(c => c.Id == id && c.EstudianteId == estudianteId);

                if (cuestionario == null)
                {
                    return NotFound(new { message = "Cuestionario no encontrado" });
                }

                if (cuestionario.Estado == "enviado" || cuestionario.Estado == "evaluado")
                {
                    return BadRequest(new { message = "Este cuestionario ya fue enviado" });
                }

                // Guardar respuestas
                foreach (var respuesta in request.Respuestas)
                {
                    var respuestaEntity = new RespuestaEstudiante
                    {
                        Id = Guid.NewGuid(),
                        PreguntaId = respuesta.PreguntaId,
                        EstudianteId = estudianteId,
                        TextoRespuesta = respuesta.TextoRespuesta,
                        FechaRespuesta = DateTime.UtcNow
                    };

                    _context.RespuestasEstudiantes.Add(respuestaEntity);
                }

                cuestionario.Estado = "enviado";
                cuestionario.FechaEnvio = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // CU-007: Evaluar respuestas (proceso inmediato)
                var resultado = await EvaluarCuestionarioAsync(cuestionario, request.TiempoCuestionarioMinutos);

                // Si es un examen grupal, marcar la asignación como completada
                if (cuestionario.SesionLecturaId != null)
                {
                    var asignacion = await _context.AsignacionesExamen
                        .FirstOrDefaultAsync(a => a.SesionLecturaId == cuestionario.SesionLecturaId 
                                                && a.EstudianteId == estudianteId);
                    
                    if (asignacion != null && asignacion.Estado != "Completado")
                    {
                        asignacion.Estado = "Completado";
                        asignacion.FechaCompletado = DateTime.UtcNow;
                        asignacion.Calificacion = resultado.PuntajeTotal; // Ya está en escala 0-10
                        await _context.SaveChangesAsync();
                        
                        _logger.LogInformation("Asignación {AsignacionId} marcada como completada para estudiante {EstudianteId}", 
                            asignacion.Id, estudianteId);
                    }
                }

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al enviar respuestas");
                return StatusCode(500, new { message = "Error al enviar las respuestas" });
            }
        }

        /// <summary>
        /// CU-007: Ver respuestas detalladas
        /// GET /api/Cuestionarios/{id}/respuestas
        /// </summary>
        [HttpGet("{id}/respuestas")]
        public async Task<ActionResult<ResultadoCuestionarioDto>> VerRespuestasDetalladas(Guid id)
        {
            try
            {
                var (estudianteIdNullable, errorResult) = await ObtenerEstudianteIdAsync();
                if (errorResult != null) return errorResult;
                var estudianteId = estudianteIdNullable!.Value;

                var resultado = await _context.ResultadosCuestionarios
                    .Include(r => r.Cuestionario)
                        .ThenInclude(c => c.Preguntas)
                            .ThenInclude(p => p.Respuesta)
                    .FirstOrDefaultAsync(r => r.CuestionarioId == id && r.EstudianteId == estudianteId);

                if (resultado == null)
                {
                    return NotFound(new { message = "Resultado no encontrado" });
                }

                var dto = MapearResultadoADto(resultado, incluirDetalles: true);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener respuestas detalladas");
                return StatusCode(500, new { message = "Error al obtener las respuestas" });
            }
        }

        // ========================================
        // MÉTODOS PRIVADOS DE EVALUACIÓN (CU-007)
        // ========================================

        private async Task<ResultadoCuestionarioDto> EvaluarCuestionarioAsync(Cuestionario cuestionario, decimal tiempoCuestionarioMinutos = 0)
        {
            // Validar que el cuestionario tenga un estudiante asignado
            if (!cuestionario.EstudianteId.HasValue)
            {
                throw new InvalidOperationException("No se puede evaluar un cuestionario sin estudiante asignado");
            }

            int correctasLiterales = 0;
            int correctasAnaliticas = 0;
            decimal puntajeCriticas = 0m;

            var preguntas = await _context.Preguntas
                .Where(p => p.CuestionarioId == cuestionario.Id)
                .Include(p => p.Respuesta)
                .OrderBy(p => p.Orden)
                .ToListAsync();

            // 1. Evaluar preguntas de opción múltiple (1-10)
            foreach (var pregunta in preguntas.Where(p => p.Formato == "OpcionMultiple"))
            {
                if (pregunta.Respuesta != null)
                {
                    // Extraer solo la letra de la respuesta (ej: "A. Ocho" -> "A")
                    var letraRespuesta = pregunta.Respuesta.TextoRespuesta.Split('.')[0].Trim();
                    bool esCorrecta = letraRespuesta == pregunta.RespuestaCorrecta;
                    pregunta.Respuesta.EsCorrecta = esCorrecta;

                    _logger.LogInformation($"🔍 DEBUG - Pregunta {pregunta.Orden}: Tipo='{pregunta.Tipo}', Respuesta='{letraRespuesta}', Correcta='{pregunta.RespuestaCorrecta}', EsCorrecta={esCorrecta}");

                    if (esCorrecta)
                    {
                        // Contar según el tipo de pregunta
                        if (pregunta.Tipo == "Literal")
                            correctasLiterales++;
                        else if (pregunta.Tipo == "Analitica" || pregunta.Tipo == "Inferencial")
                            correctasAnaliticas++;
                        else if (pregunta.Tipo == "Crítica" || pregunta.Tipo == "Critica")
                            puntajeCriticas += 1.0m; // Las preguntas críticas de opción múltiple valen 1 punto
                        
                        _logger.LogInformation($"✅ Correcta! Tipo: {pregunta.Tipo}, Literales: {correctasLiterales}, Analíticas: {correctasAnaliticas}, Críticas: {puntajeCriticas}");
                    }
                }
            }

            // 2. Evaluar preguntas abiertas con IA (9-10)
            foreach (var pregunta in preguntas.Where(p => p.Formato == "Abierta"))
            {
                if (pregunta.Respuesta != null)
                {
                    var (puntaje, retroalimentacionIA) = await _iaService.EvaluarRespuestaAbiertaAsync(
                        pregunta.TextoPregunta,
                        pregunta.Respuesta.TextoRespuesta,
                        cuestionario.Lectura.Contenido,
                        cuestionario.Estudiante!.Edad);

                    pregunta.Respuesta.PuntajeIA = puntaje;
                    pregunta.Respuesta.RetroalimentacionIA = retroalimentacionIA;
                    pregunta.Respuesta.EsCorrecta = puntaje >= 0.6m; // 60% para considerar correcta

                    puntajeCriticas += puntaje;
                }
            }

            await _context.SaveChangesAsync();

            // 3. Calcular puntaje total
            int puntajeTotal = correctasLiterales + correctasAnaliticas + (int)Math.Round(puntajeCriticas);
            decimal porcentaje = (puntajeTotal / 10m) * 100;

            // 4. Generar retroalimentación personalizada
            string retroalimentacion = await _iaService.GenerarRetroalimentacionPersonalizadaAsync(
                puntajeTotal,
                correctasLiterales,
                correctasAnaliticas,
                puntajeCriticas,
                cuestionario.NivelDificultad,
                cuestionario.Estudiante!.Edad);

            // 5. Adaptar nivel del estudiante
            var (nivelAnterior, nivelNuevo, accionNivel, mensajeAdaptacion) = 
                AdaptarNivelEstudiante(cuestionario.Estudiante!, puntajeTotal);

            // 6. Guardar resultado
            var resultado = new ResultadoCuestionario
            {
                Id = Guid.NewGuid(),
                CuestionarioId = cuestionario.Id,
                EstudianteId = cuestionario.EstudianteId.Value,
                FechaEvaluacion = DateTime.UtcNow,
                TiempoCuestionarioMinutos = tiempoCuestionarioMinutos,
                PuntajeTotal = puntajeTotal,
                Porcentaje = porcentaje,
                CorrectasLiterales = correctasLiterales,
                CorrectasAnaliticas = correctasAnaliticas,
                PuntajeCriticas = puntajeCriticas,
                RetroalimentacionPersonalizada = retroalimentacion,
                MensajeAnimo = ObtenerMensajeAnimo(puntajeTotal),
                NivelAnterior = nivelAnterior,
                NivelNuevo = nivelNuevo,
                AccionNivel = accionNivel,
                MensajeAdaptacion = mensajeAdaptacion
            };

            _context.ResultadosCuestionarios.Add(resultado);
            cuestionario.Estado = "evaluado";
            await _context.SaveChangesAsync();

            _logger.LogInformation("Cuestionario evaluado: {CuestionarioId}, Puntaje: {Puntaje}/10", 
                cuestionario.Id, puntajeTotal);

            return MapearResultadoADto(resultado, incluirDetalles: false);
        }

        private (string nivelAnterior, string nivelNuevo, string accion, string mensaje) 
            AdaptarNivelEstudiante(Estudiante estudiante, int puntaje)
        {
            var nivelAnterior = estudiante.NivelDificultad.ToString();
            var nivelActual = estudiante.NivelDificultad;
            string accion = "mantener";
            string mensaje = "";

            // Reglas de adaptación
            if (puntaje >= 8) // 80% o más → Subir
            {
                if (nivelActual == NivelDificultad.Medio)
                {
                    estudiante.NivelDificultad = NivelDificultad.Dificil;
                    accion = "subir";
                    mensaje = "¡Has subido de nivel! Ahora recibirás lecturas más desafiantes para seguir creciendo.";
                }
                else if (nivelActual == NivelDificultad.Facil)
                {
                    estudiante.NivelDificultad = NivelDificultad.Medio;
                    accion = "subir";
                    mensaje = "¡Has subido de nivel! Ahora recibirás lecturas más desafiantes para seguir creciendo.";
                }
                else // Ya está en Difícil
                {
                    accion = "maximo";
                    mensaje = "¡Excelente! Ya estás en el nivel máximo. Sigues demostrando un dominio excepcional.";
                }
            }
            else if (puntaje <= 3) // 30% o menos → Bajar
            {
                if (nivelActual == NivelDificultad.Medio)
                {
                    estudiante.NivelDificultad = NivelDificultad.Facil;
                    accion = "bajar";
                    mensaje = "Hemos ajustado tu nivel para que puedas fortalecer tus bases. ¡Es normal! Todos aprendemos a nuestro ritmo.";
                }
                else if (nivelActual == NivelDificultad.Dificil)
                {
                    estudiante.NivelDificultad = NivelDificultad.Medio;
                    accion = "bajar";
                    mensaje = "Hemos ajustado tu nivel para que puedas fortalecer tus bases. ¡Es normal! Todos aprendemos a nuestro ritmo.";
                }
                else // Ya está en Fácil
                {
                    accion = "minimo";
                    mensaje = "Tu nivel se mantiene en Fácil para que puedas seguir fortaleciendo tus habilidades.";
                }
            }
            else // 4-7 → Mantener
            {
                mensaje = "Tu nivel se mantiene. ¡Sigue practicando para seguir mejorando!";
            }

            return (nivelAnterior, estudiante.NivelDificultad.ToString(), accion, mensaje);
        }

        private string ObtenerMensajeAnimo(int puntaje)
        {
            return puntaje switch
            {
                10 => "¡Perfecto! ¡Impresionante!",
                >= 9 => "¡Excelente trabajo!",
                >= 7 => "¡Muy bien! Buen desempeño",
                >= 5 => "Buen intento. Puedes mejorar",
                >= 3 => "Sigue practicando. ¡Tú puedes!",
                _ => "No te desanimes. Sigue intentando"
            };
        }

        private ResultadoCuestionarioDto MapearResultadoADto(ResultadoCuestionario resultado, bool incluirDetalles)
        {
            // Obtener tiempo de lectura de la sesión
            var sesionLectura = _context.SesionesLectura
                .FirstOrDefault(s => s.Id == resultado.Cuestionario.SesionLecturaId);
            
            var dto = new ResultadoCuestionarioDto
            {
                Id = resultado.Id,
                CuestionarioId = resultado.CuestionarioId,
                FechaEvaluacion = resultado.FechaEvaluacion,
                TiempoLecturaMinutos = sesionLectura?.TiempoLecturaMinutos ?? 0,
                TiempoCuestionarioMinutos = resultado.TiempoCuestionarioMinutos,
                PuntajeTotal = resultado.PuntajeTotal,
                Porcentaje = resultado.Porcentaje,
                MensajeAnimo = resultado.MensajeAnimo,
                CorrectasLiterales = resultado.CorrectasLiterales,
                CorrectasAnaliticas = resultado.CorrectasAnaliticas,
                PuntajeCriticas = resultado.PuntajeCriticas,
                AnalisisPorTipo = new List<AnalisisPorTipoDto>
                {
                    new() { Tipo = "Literales", Correctas = resultado.CorrectasLiterales, Total = 4, 
                            Porcentaje = (resultado.CorrectasLiterales / 4m) * 100 },
                    new() { Tipo = "Analíticas", Correctas = resultado.CorrectasAnaliticas, Total = 4, 
                            Porcentaje = (resultado.CorrectasAnaliticas / 4m) * 100 },
                    new() { Tipo = "Críticas", Correctas = (int)Math.Round(resultado.PuntajeCriticas), Total = 2, 
                            Porcentaje = (resultado.PuntajeCriticas / 2m) * 100 }
                },
                RetroalimentacionPersonalizada = resultado.RetroalimentacionPersonalizada,
                NivelAnterior = resultado.NivelAnterior,
                NivelNuevo = resultado.NivelNuevo,
                AccionNivel = resultado.AccionNivel,
                MensajeAdaptacion = resultado.MensajeAdaptacion
            };

            // Parsear retroalimentación estructurada si es JSON
            try
            {
                if (!string.IsNullOrEmpty(resultado.RetroalimentacionPersonalizada) && 
                    resultado.RetroalimentacionPersonalizada.TrimStart().StartsWith("{"))
                {
                    using var jsonDoc = JsonDocument.Parse(resultado.RetroalimentacionPersonalizada);
                    
                    // Verificar si tiene la estructura {"retroalimentacion": {...}}
                    if (jsonDoc.RootElement.TryGetProperty("retroalimentacion", out var retroElement))
                    {
                        dto.Retroalimentacion = new RetroalimentacionDto
                        {
                            Logros = retroElement.TryGetProperty("logros", out var logros) 
                                ? logros.GetString() ?? "" : "",
                            Mejora = retroElement.TryGetProperty("mejora", out var mejora) 
                                ? mejora.GetString() ?? "" : "",
                            Consejos = retroElement.TryGetProperty("consejos", out var consejos) 
                                ? consejos.GetString() ?? "" : "",
                            Animo = retroElement.TryGetProperty("animo", out var animo) 
                                ? animo.GetString() ?? "" : ""
                        };
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "No se pudo parsear retroalimentación estructurada, usando texto plano");
                // Si falla el parseo, el frontend usará RetroalimentacionPersonalizada como texto plano
            }

            if (incluirDetalles)
            {
                dto.DetalleRespuestas = resultado.Cuestionario.Preguntas
                    .OrderBy(p => p.Orden)
                    .Select(p => new RespuestaDetalleDto
                    {
                        PreguntaId = p.Id,
                        Orden = p.Orden,
                        Tipo = p.Tipo,
                        Formato = p.Formato,
                        TextoPregunta = p.TextoPregunta,
                        Opciones = p.Formato == "OpcionMultiple" 
                            ? JsonSerializer.Deserialize<List<string>>(p.Opciones ?? "[]")
                            : null,
                        RespuestaEstudiante = p.Respuesta?.TextoRespuesta,
                        RespuestaCorrecta = p.RespuestaCorrecta,
                        EsCorrecta = p.Respuesta?.EsCorrecta,
                        Explicacion = p.Explicacion,
                        TextoRespuestaAbierta = p.Formato == "Abierta" ? p.Respuesta?.TextoRespuesta : null,
                        PuntajeIA = p.Respuesta?.PuntajeIA,
                        RetroalimentacionIA = p.Respuesta?.RetroalimentacionIA
                    }).ToList();
            }

            return dto;
        }

        /// <summary>
        /// Obtener resultado de un cuestionario evaluado (GET: api/Cuestionarios/{id}/resultado)
        /// </summary>
        [HttpGet("{id}/resultado")]
        public async Task<ActionResult<ResultadoCuestionarioDto>> ObtenerResultado(Guid id)
        {
            try
            {
                var (estudianteIdNullable, errorResult) = await ObtenerEstudianteIdAsync();
                if (errorResult != null) return errorResult;
                var estudianteId = estudianteIdNullable!.Value;

                // Buscar el cuestionario y verificar que pertenece al estudiante
                var cuestionario = await _context.Cuestionarios
                    .Include(c => c.SesionLectura)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (cuestionario == null)
                {
                    return NotFound(new { message = "Cuestionario no encontrado." });
                }

                if (cuestionario.SesionLectura?.EstudianteId != estudianteId)
                {
                    return Forbid();
                }

                // Verificar que el cuestionario está evaluado
                if (cuestionario.Estado != "evaluado")
                {
                    return BadRequest(new { message = "El cuestionario aún no ha sido evaluado." });
                }

                // Obtener el resultado
                var resultado = await _context.ResultadosCuestionarios
                    .Include(r => r.Cuestionario)
                        .ThenInclude(c => c.Preguntas)
                            .ThenInclude(p => p.Respuesta)
                    .FirstOrDefaultAsync(r => r.CuestionarioId == id);

                if (resultado == null)
                {
                    return NotFound(new { message = "Resultado no encontrado." });
                }

                var dto = MapearResultadoADto(resultado, incluirDetalles: false);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener resultado del cuestionario {CuestionarioId}", id);
                return StatusCode(500, new { message = "Error al obtener el resultado." });
            }
        }

        /// <summary>
        /// Obtener historial de resultados de una lectura (GET: api/Cuestionarios/lectura/{lecturaId}/historial)
        /// </summary>
        [HttpGet("lectura/{lecturaId}/historial")]
        public async Task<ActionResult<List<ResultadoCuestionarioDto>>> ObtenerHistorialLectura(int lecturaId)
        {
            try
            {
                var (estudianteIdNullable, errorResult) = await ObtenerEstudianteIdAsync();
                if (errorResult != null) return errorResult;
                var estudianteId = estudianteIdNullable!.Value;

                // Obtener todos los resultados de esta lectura para este estudiante
                var resultados = await _context.ResultadosCuestionarios
                    .Include(r => r.Cuestionario)
                        .ThenInclude(c => c.SesionLectura)
                    .Include(r => r.Cuestionario)
                        .ThenInclude(c => c.Preguntas)
                            .ThenInclude(p => p.Respuesta)
                    .Where(r => r.Cuestionario.SesionLectura!.LecturaId == lecturaId 
                             && r.Cuestionario.SesionLectura.EstudianteId == estudianteId
                             && r.Cuestionario.Estado == "evaluado")
                    .OrderByDescending(r => r.FechaEvaluacion)
                    .ToListAsync();

                var dtos = resultados.Select(r => MapearResultadoADto(r, incluirDetalles: false)).ToList();
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener historial de lectura {LecturaId}", lecturaId);
                return StatusCode(500, new { message = "Error al obtener el historial." });
            }
        }
    }
}
