using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LecturaIA.API.Data;
using LecturaIA.API.Models.DTOs;
using LecturaIA.API.Models.Entities;
using System.Security.Claims;

namespace LecturaIA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MetricasController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<MetricasController> _logger;

    public MetricasController(ApplicationDbContext context, ILogger<MetricasController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene métricas individuales de un estudiante
    /// </summary>
    /// <summary>
    /// Obtiene métricas individuales de un estudiante.
    /// </summary>
    [HttpGet("estudiante/{estudianteId}")]
    [Authorize(Roles = "Docente")]
    public async Task<ActionResult<MetricasEstudianteDto>> ObtenerMetricasEstudiante(int estudianteId)
    {
        try
        {
            var estudiante = await _context.Estudiantes
                .Include(e => e.Usuario)
                .FirstOrDefaultAsync(e => e.Id == estudianteId);
            if (estudiante == null)
            {
                // Fail fast: estudiante no encontrado
                return NotFound(new { mensaje = "Estudiante no encontrado" });
            }
            // Obtener sesiones completadas con sus cuestionarios evaluados
            var sesiones = await _context.SesionesLectura
                .Include(sl => sl.Lectura)
                .Include(sl => sl.Cuestionario)
                    .ThenInclude(c => c!.Resultado)
                .Include(sl => sl.Cuestionario)
                    .ThenInclude(c => c!.Preguntas)
                        .ThenInclude(p => p.Respuesta)
                .Where(sl => sl.EstudianteId == estudianteId && 
                            sl.Completada && 
                            sl.Cuestionario != null &&
                            sl.Cuestionario.Estado == "evaluado" &&
                            sl.Cuestionario.Resultado != null)
                .OrderByDescending(sl => sl.FechaFinalizacion)
                .ToListAsync();
            // 1. Lecturas Completadas
            var lecturasCompletadas = sesiones.Count;
            // 2. Promedio de Quiz (basado en porcentaje del resultado)
            var promedioQuiz = sesiones.Any() 
                ? sesiones.Average(sl => sl.Cuestionario!.Resultado!.Porcentaje) 
                : 0;
            // 3. Nivel Actual
            var nivelActual = estudiante.NivelDificultad switch
            {
                Models.Entities.NivelDificultad.Facil => "Fácil",
                Models.Entities.NivelDificultad.Medio => "Medio",
                Models.Entities.NivelDificultad.Dificil => "Difícil",
                _ => "No determinado"
            };
            // 4. Última Actividad
            var ultimaActividad = sesiones.FirstOrDefault()?.FechaFinalizacion;
            // 5. Tipo de Texto Favorito (con mejor rendimiento promedio)
            var tipoTextoFavorito = "No determinado";
            if (sesiones.Any())
            {
                var promediosPorTipo = sesiones
                    .Where(sl => !string.IsNullOrEmpty(sl.Lectura?.TipoLectura))
                    .GroupBy(sl => sl.Lectura!.TipoLectura)
                    .Select(g => new
                    {
                        TipoTexto = g.Key,
                        PromedioRendimiento = g.Average(sl => sl.Cuestionario!.Resultado!.Porcentaje),
                        CantidadLecturas = g.Count()
                    })
                    .Where(x => x.CantidadLecturas >= 1) // Al menos 1 lectura
                    .OrderByDescending(x => x.PromedioRendimiento)
                    .FirstOrDefault();
                if (promediosPorTipo != null)
                {
                    tipoTextoFavorito = promediosPorTipo.TipoTexto;
                }
            }
            // 6. Tiempo Promedio por Lectura (en minutos con decimales)
            var tiempoPromedioLectura = sesiones.Any() 
                ? Math.Round(sesiones.Average(sl => sl.TiempoLecturaMinutos), 2) 
                : 0;
            // 7. Evolución Temporal (últimos 10 quizzes)
            var evolucionTemporal = sesiones
                .Take(10)
                .Reverse()
                .Select((sl, index) => new PuntoEvolucionDto
                {
                    NumeroQuiz = index + 1,
                    Calificacion = sl.Cuestionario!.Resultado!.Porcentaje,
                    Fecha = sl.FechaFinalizacion ?? sl.FechaInicio,
                    TituloLectura = sl.Lectura?.Titulo ?? "Sin título"
                })
                .ToList();
            // 8. Análisis de Habilidad por Tipo de Pregunta
            decimal porcentajeLiteral = 0;
            decimal porcentajeInferencial = 0;
            decimal porcentajeCritico = 0;
            if (sesiones.Any())
            {
                const int PreguntasLiteralesPorCuestionario = 4;
                const int PreguntasAnaliticasPorCuestionario = 4;
                const int PreguntasCriticasPorCuestionario = 2;
                var totalLiterales = 0;
                var correctasLiterales = 0;
                var totalAnaliticas = 0;
                var correctasAnaliticas = 0;
                var totalCriticas = 0;
                decimal puntajeCriticas = 0;
                foreach (var sesion in sesiones)
                {
                    if (sesion.Cuestionario?.Resultado != null)
                    {
                        totalLiterales += PreguntasLiteralesPorCuestionario;
                        correctasLiterales += sesion.Cuestionario.Resultado.CorrectasLiterales;
                        totalAnaliticas += PreguntasAnaliticasPorCuestionario;
                        correctasAnaliticas += sesion.Cuestionario.Resultado.CorrectasAnaliticas;
                        totalCriticas += PreguntasCriticasPorCuestionario;
                        puntajeCriticas += sesion.Cuestionario.Resultado.PuntajeCriticas;
                    }
                }
                porcentajeLiteral = totalLiterales > 0 
                    ? (decimal)correctasLiterales / totalLiterales * 100 
                    : 0;
                porcentajeInferencial = totalAnaliticas > 0 
                    ? (decimal)correctasAnaliticas / totalAnaliticas * 100 
                    : 0;
                porcentajeCritico = totalCriticas > 0 
                    ? puntajeCriticas / totalCriticas * 100 
                    : 0;
            }
            var metricas = new MetricasEstudianteDto
            {
                LecturasCompletadas = lecturasCompletadas,
                PromedioQuiz = Math.Round(promedioQuiz, 2),
                NivelActual = nivelActual,
                TipoTextoFavorito = tipoTextoFavorito,
                UltimaActividad = ultimaActividad,
                TiempoPromedioLectura = tiempoPromedioLectura,
                EvolucionTemporal = evolucionTemporal,
                AnalisisHabilidad = new AnalisisHabilidadDto
                {
                    PorcentajeLiteral = Math.Round(porcentajeLiteral, 2),
                    PorcentajeInferencial = Math.Round(porcentajeInferencial, 2),
                    PorcentajeCritico = Math.Round(porcentajeCritico, 2)
                }
            };
            return Ok(metricas);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener métricas del estudiante {EstudianteId}", estudianteId);
            return StatusCode(500, new { mensaje = "Error al obtener las métricas del estudiante" });
        }
    }

    /// <summary>
    /// Obtiene métricas consolidadas de un aula
    /// </summary>
    [HttpGet("aula/{aulaId}")]
    [Authorize(Roles = "Docente")]
    public async Task<ActionResult<MetricasAulaDto>> ObtenerMetricasAula(int aulaId)
    {
        try
        {
            // Verificar que el docente es dueño del aula
            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
            {
                return Unauthorized(new { mensaje = "Token inválido" });
            }

            var aula = await _context.Aulas
                .Include(a => a.Docente)
                .FirstOrDefaultAsync(a => a.Id == aulaId && a.Activa);

            if (aula == null)
            {
                return NotFound(new { mensaje = "Aula no encontrada" });
            }

            if (aula.Docente.UsuarioId != usuarioId)
            {
                return Forbid();
            }

            // Obtener estudiantes activos del aula
            var estudiantesIds = await _context.EstudiantesAulas
                .Where(ea => ea.AulaId == aulaId && ea.Activo)
                .Select(ea => ea.EstudianteId)
                .ToListAsync();

            var totalEstudiantes = estudiantesIds.Count;

            // Obtener todas las sesiones completadas y evaluadas de los estudiantes del aula
            var todasLasSesiones = await _context.SesionesLectura
                .Include(sl => sl.Lectura)
                .Include(sl => sl.Cuestionario)
                    .ThenInclude(c => c!.Resultado)
                .Include(sl => sl.Estudiante)
                .Where(sl => estudiantesIds.Contains(sl.EstudianteId) &&
                            sl.Completada &&
                            sl.Cuestionario != null &&
                            sl.Cuestionario.Estado == "evaluado" &&
                            sl.Cuestionario.Resultado != null &&
                            sl.FechaFinalizacion.HasValue)
                .OrderBy(sl => sl.FechaFinalizacion)
                .ToListAsync();

            // 1. Promedio de Clase
            var promedioClase = todasLasSesiones.Any() 
                ? todasLasSesiones.Average(sl => sl.Cuestionario!.Resultado!.Porcentaje) 
                : 0;

            // Tiempos Promedio
            var tiempoPromedioLectura = todasLasSesiones.Any()
                ? Math.Round(todasLasSesiones.Average(sl => sl.TiempoLecturaMinutos), 2)
                : 0;

            var tiempoPromedioCuestionario = todasLasSesiones.Any()
                ? Math.Round(todasLasSesiones.Average(sl => sl.Cuestionario!.Resultado!.TiempoCuestionarioMinutos), 2)
                : 0;

            // 2. Progreso Semanal (últimas 8 semanas)
            var fechaActual = DateTime.UtcNow;
            var fechaInicio8Semanas = fechaActual.AddDays(-56);

            var progresoSemanal = new List<ProgresoSemanalDto>();
            for (int i = 0; i < 8; i++)
            {
                var inicioSemana = fechaInicio8Semanas.AddDays(i * 7);
                var finSemana = inicioSemana.AddDays(7);

                var sesionesEnSemana = todasLasSesiones
                    .Where(sl => sl.FechaFinalizacion >= inicioSemana && sl.FechaFinalizacion < finSemana)
                    .ToList();

                var promedioSemana = sesionesEnSemana.Any() 
                    ? sesionesEnSemana.Average(sl => sl.Cuestionario!.Resultado!.Porcentaje) 
                    : 0;

                progresoSemanal.Add(new ProgresoSemanalDto
                {
                    NumeroSemana = i + 1,
                    FechaInicio = inicioSemana,
                    FechaFin = finSemana,
                    PromedioSemana = Math.Round(promedioSemana, 2),
                    CantidadQuizzes = sesionesEnSemana.Count
                });
            }

            // 3. Distribución por Tipo de Texto
            var distribucionTiposTexto = new DistribucionTiposTextoDto();
            
            if (todasLasSesiones.Any())
            {
                var sesionesConTipo = todasLasSesiones
                    .Where(sl => !string.IsNullOrEmpty(sl.Lectura?.TipoLectura))
                    .ToList();

                // Narrativo
                var narrativas = sesionesConTipo.Where(sl => sl.Lectura!.TipoLectura.Contains("Narrativ", StringComparison.OrdinalIgnoreCase)).ToList();
                distribucionTiposTexto.CantidadNarrativo = narrativas.Count;
                distribucionTiposTexto.PromedioNarrativo = narrativas.Any() 
                    ? Math.Round(narrativas.Average(sl => sl.Cuestionario!.Resultado!.Porcentaje), 2) 
                    : 0;

                // Descriptivo
                var descriptivas = sesionesConTipo.Where(sl => sl.Lectura!.TipoLectura.Contains("Descriptiv", StringComparison.OrdinalIgnoreCase)).ToList();
                distribucionTiposTexto.CantidadDescriptivo = descriptivas.Count;
                distribucionTiposTexto.PromedioDescriptivo = descriptivas.Any() 
                    ? Math.Round(descriptivas.Average(sl => sl.Cuestionario!.Resultado!.Porcentaje), 2) 
                    : 0;

                // Expositivo
                var expositivas = sesionesConTipo.Where(sl => sl.Lectura!.TipoLectura.Contains("Expositiv", StringComparison.OrdinalIgnoreCase)).ToList();
                distribucionTiposTexto.CantidadExpositivo = expositivas.Count;
                distribucionTiposTexto.PromedioExpositivo = expositivas.Any() 
                    ? Math.Round(expositivas.Average(sl => sl.Cuestionario!.Resultado!.Porcentaje), 2) 
                    : 0;

                // Argumentativo
                var argumentativas = sesionesConTipo.Where(sl => sl.Lectura!.TipoLectura.Contains("Argumentativ", StringComparison.OrdinalIgnoreCase)).ToList();
                distribucionTiposTexto.CantidadArgumentativo = argumentativas.Count;
                distribucionTiposTexto.PromedioArgumentativo = argumentativas.Any() 
                    ? Math.Round(argumentativas.Average(sl => sl.Cuestionario!.Resultado!.Porcentaje), 2) 
                    : 0;

                // Instructivo
                var instructivas = sesionesConTipo.Where(sl => sl.Lectura!.TipoLectura.Contains("Instructiv", StringComparison.OrdinalIgnoreCase)).ToList();
                distribucionTiposTexto.CantidadInstructivo = instructivas.Count;
                distribucionTiposTexto.PromedioInstructivo = instructivas.Any() 
                    ? Math.Round(instructivas.Average(sl => sl.Cuestionario!.Resultado!.Porcentaje), 2) 
                    : 0;
            }

            var metricas = new MetricasAulaDto
            {
                AulaId = aula.Id,
                NombreAula = aula.Nombre,
                TotalEstudiantes = totalEstudiantes,
                PromedioClase = Math.Round(promedioClase, 2),
                TiempoPromedioLectura = tiempoPromedioLectura,
                TiempoPromedioCuestionario = tiempoPromedioCuestionario,
                ProgresoSemanal = progresoSemanal,
                DistribucionTiposTexto = distribucionTiposTexto
            };

            return Ok(metricas);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener métricas del aula {AulaId}", aulaId);
            return StatusCode(500, new { mensaje = "Error al obtener las métricas del aula" });
        }
    }
}
