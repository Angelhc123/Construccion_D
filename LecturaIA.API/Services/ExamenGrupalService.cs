using LecturaIA.API.Data;
using LecturaIA.API.Models.DTOs;
using LecturaIA.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace LecturaIA.API.Services;

public class ExamenGrupalService
{
    private readonly ApplicationDbContext _context;
    private readonly ILecturaIAService _lecturaIAService;
    private readonly ICuestionarioIAService _cuestionarioIAService;
    private readonly ILogger<ExamenGrupalService> _logger;

    public ExamenGrupalService(
        ApplicationDbContext context,
        ILecturaIAService lecturaIAService,
        ICuestionarioIAService cuestionarioIAService,
        ILogger<ExamenGrupalService> logger)
    {
        _context = context;
        _lecturaIAService = lecturaIAService;
        _cuestionarioIAService = cuestionarioIAService;
        _logger = logger;
    }

    /// <summary>
    /// Crea un examen grupal generando lectura y cuestionario con IA
    /// </summary>
    public async Task<(bool Success, string Message, ExamenGrupalDto? ExamenDto)> CrearExamenConIAAsync(
        CrearExamenGrupalDto dto, int docenteId)
    {
        try
        {
            // 1. Verificar que el aula existe y pertenece al docente
            var aula = await _context.Aulas
                .Include(a => a.Estudiantes)
                .FirstOrDefaultAsync(a => a.Id == dto.AulaId && a.DocenteId == docenteId && a.Activa);

            if (aula == null)
            {
                return (false, "Aula no encontrada o no pertenece al docente", null);
            }

            var estudiantesActivos = aula.Estudiantes.Where(e => e.Activo).ToList();
            if (estudiantesActivos.Count == 0)
            {
                return (false, "El aula no tiene estudiantes activos", null);
            }

            // 2. Generar lectura con IA según parámetros del examen
            _logger.LogInformation("Generando lectura con IA para examen grupal...");
            
            var parametrosLectura = new
            {
                Tema = dto.TemaConcepto,
                TipoTexto = dto.TipoTexto,
                Longitud = dto.LongitudTexto,
                GradoEscolar = dto.GradoEscolar,
                Complejidad = dto.Complejidad
            };

            // Generar lectura adaptada a los parámetros del examen
            var lectura = await _lecturaIAService.GenerarLecturaParaExamenGrupalAsync(
                dto.TemaConcepto,
                dto.TipoTexto,
                dto.LongitudTexto,
                dto.GradoEscolar,
                dto.Complejidad,
                docenteId // Asignamos al docente como creador
            );

            if (lectura == null)
            {
                return (false, "Error al generar la lectura con IA", null);
            }

            // 3. Generar cuestionario con IA
            _logger.LogInformation("Generando cuestionario con IA...");
            
            var cuestionario = await _cuestionarioIAService.GenerarCuestionarioParaExamenGrupalAsync(
                lectura.Id,
                lectura.Contenido,
                dto.CantidadPreguntas,
                dto.GradoEscolar
            );

            if (cuestionario == null)
            {
                // Eliminar lectura si falló el cuestionario
                _context.Lecturas.Remove(lectura);
                await _context.SaveChangesAsync();
                return (false, "Error al generar el cuestionario con IA", null);
            }

            // 4. Crear examen grupal
            var examenGrupal = new ExamenGrupal
            {
                AulaId = dto.AulaId,
                DocenteId = docenteId,
                LecturaId = lectura.Id,
                Titulo = dto.Titulo,
                Descripcion = dto.Descripcion,
                LongitudTexto = dto.LongitudTexto,
                GradoEscolar = dto.GradoEscolar,
                Complejidad = dto.Complejidad,
                FechaCreacion = DateTime.UtcNow,
                FechaLimite = dto.FechaLimite,
                Publicado = dto.Publicado,
                Activo = true
            };

            _context.ExamenesGrupales.Add(examenGrupal);
            await _context.SaveChangesAsync();

            // 5. Asignar a todos los estudiantes del salón
            var asignaciones = estudiantesActivos.Select(ea => new AsignacionExamen
            {
                ExamenGrupalId = examenGrupal.Id,
                EstudianteId = ea.EstudianteId,
                Estado = "Pendiente",
                FechaAsignacion = DateTime.UtcNow
            }).ToList();

            _context.AsignacionesExamen.AddRange(asignaciones);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Examen grupal creado exitosamente. ID: {ExamenId}, Asignado a {CantidadEstudiantes} estudiantes",
                examenGrupal.Id, asignaciones.Count);

            // 6. Retornar DTO del examen creado
            var examenDto = await ObtenerExamenGrupalDtoAsync(examenGrupal.Id);

            return (true, $"Examen creado y asignado a {asignaciones.Count} estudiantes", examenDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear examen grupal con IA");
            return (false, "Error interno al crear el examen", null);
        }
    }

    /// <summary>
    /// Obtiene todos los exámenes de un salón (vista del docente)
    /// </summary>
    public async Task<List<ExamenGrupalDto>> ObtenerExamenesDelSalonAsync(int aulaId, int docenteId)
    {
        var examenes = await _context.ExamenesGrupales
            .Include(e => e.Aula)
            .Include(e => e.Lectura)
            .Include(e => e.Asignaciones)
                .ThenInclude(a => a.SesionLectura)
                    .ThenInclude(s => s!.Cuestionario)
                        .ThenInclude(c => c!.Resultado)
            .Where(e => e.AulaId == aulaId && e.DocenteId == docenteId && e.Activo)
            .OrderByDescending(e => e.FechaCreacion)
            .ToListAsync();

        return examenes.Select(e => MapearAExamenGrupalDto(e)).ToList();
    }

    /// <summary>
    /// Obtiene los exámenes asignados a un estudiante
    /// </summary>
    public async Task<List<AsignacionExamenDto>> ObtenerExamenesAsignadosAsync(int estudianteId)
    {
        var asignaciones = await _context.AsignacionesExamen
            .Include(a => a.ExamenGrupal)
                .ThenInclude(e => e.Lectura)
            .Include(a => a.ExamenGrupal)
                .ThenInclude(e => e.Docente)
                    .ThenInclude(d => d.Usuario)
            .Include(a => a.SesionLectura)
                .ThenInclude(s => s!.Cuestionario)
                    .ThenInclude(c => c!.Resultado)
            .Where(a => a.EstudianteId == estudianteId && a.ExamenGrupal.Activo && a.ExamenGrupal.Publicado)
            .OrderBy(a => a.ExamenGrupal.FechaLimite.HasValue ? a.ExamenGrupal.FechaLimite : DateTime.MaxValue) // Pendientes con fecha límite primero
            .ThenByDescending(a => a.FechaAsignacion)
            .ToListAsync();

        return asignaciones.Select(a => new AsignacionExamenDto
        {
            Id = a.Id,
            ExamenGrupalId = a.ExamenGrupalId,
            TituloExamen = a.ExamenGrupal.Titulo,
            DescripcionExamen = a.ExamenGrupal.Descripcion,
            NombreDocente = a.ExamenGrupal.Docente.Usuario.NombreCompleto,
            Estado = a.Estado,
            FechaAsignacion = a.FechaAsignacion,
            FechaLimite = a.ExamenGrupal.FechaLimite,
            FechaCompletado = a.FechaCompletado,
            Calificacion = a.Calificacion,
            LecturaId = a.ExamenGrupal.LecturaId,
            TituloLectura = a.ExamenGrupal.Lectura.Titulo,
            LongitudTexto = a.ExamenGrupal.LongitudTexto,
            CantidadPreguntas = a.SesionLectura != null && a.SesionLectura.Cuestionario != null 
                ? a.SesionLectura.Cuestionario.Preguntas.Count 
                : 0
        }).ToList();
    }

    /// <summary>
    /// Obtiene los resultados consolidados de un examen grupal
    /// </summary>
    public async Task<ResultadosExamenGrupalDto?> ObtenerResultadosConsolidadosAsync(int examenGrupalId, int docenteId)
    {
        var examen = await _context.ExamenesGrupales
            .Include(e => e.Aula)
            .Include(e => e.Lectura)
            .Include(e => e.Asignaciones)
                .ThenInclude(a => a.Estudiante)
                    .ThenInclude(est => est.Usuario)
            .Include(e => e.Asignaciones)
                .ThenInclude(a => a.SesionLectura)
                    .ThenInclude(s => s!.Cuestionario)
                        .ThenInclude(c => c!.Resultado)
            .FirstOrDefaultAsync(e => e.Id == examenGrupalId && e.DocenteId == docenteId);

        if (examen == null)
        {
            return null;
        }

        var resultados = examen.Asignaciones.Select(a => new ResultadoEstudianteDto
        {
            EstudianteId = a.EstudianteId,
            NombreCompleto = a.Estudiante.Usuario.NombreCompleto,
            Estado = a.Estado,
            FechaCompletado = a.FechaCompletado,
            Calificacion = a.Calificacion,
            TiempoLecturaMinutos = a.SesionLectura?.TiempoLecturaMinutos ?? 0,
            TiempoQuizMinutos = a.SesionLectura?.Cuestionario?.Resultado?.TiempoCuestionarioMinutos ?? 0,
            TiempoTotalMinutos = (a.SesionLectura?.TiempoLecturaMinutos ?? 0) + 
                                 (a.SesionLectura?.Cuestionario?.Resultado?.TiempoCuestionarioMinutos ?? 0)
        }).OrderByDescending(r => r.Calificacion ?? 0).ToList();

        var completados = resultados.Where(r => r.Estado == "Completado").ToList();
        var pendientes = resultados.Where(r => r.Estado == "Pendiente").ToList();

        var estadisticas = new EstadisticasExamenDto
        {
            TotalEstudiantes = resultados.Count(),
            Completados = completados.Count(),
            Pendientes = pendientes.Count(),
            PorcentajeCompletado = resultados.Count() > 0
                ? Math.Round((decimal)completados.Count() / resultados.Count() * 100, 2)
                : 0,
            PromedioGrupal = completados.Any()
                ? Math.Round(completados.Average(r => r.Calificacion!.Value), 2)
                : null,
            CalificacionMaxima = completados.Any()
                ? completados.Max(r => r.Calificacion!.Value)
                : null,
            CalificacionMinima = completados.Any()
                ? completados.Min(r => r.Calificacion!.Value)
                : null,
            TiempoPromedioMinutos = completados.Any()
                ? Math.Round(completados.Average(r => r.TiempoTotalMinutos!.Value), 2)
                : null,
            EstudiantesPendientes = pendientes.Select(p => p.NombreCompleto).ToList(),
            EstudiantesConDificultad = completados
                .Where(c => c.Calificacion < 7.0m || c.TiempoTotalMinutos > 20)
                .Select(c => $"{c.NombreCompleto} - Cal: {c.Calificacion:F1}, Tiempo: {c.TiempoTotalMinutos:F1} min")
                .ToList(),
            EstudiantesDestacados = completados
                .Where(c => c.Calificacion >= 9.0m)
                .Select(c => $"{c.NombreCompleto} - {c.Calificacion:F1}/10")
                .ToList()
        };

        return new ResultadosExamenGrupalDto
        {
            ExamenInfo = MapearAExamenGrupalDto(examen),
            Resultados = resultados,
            Estadisticas = estadisticas
        };
    }

    /// <summary>
    /// Marca una asignación como completada cuando el estudiante termina el examen
    /// </summary>
    public async Task<bool> MarcarComoCompletadoAsync(int examenGrupalId, int estudianteId, Guid sesionLecturaId)
    {
        try
        {
            var asignacion = await _context.AsignacionesExamen
                .Include(a => a.SesionLectura)
                    .ThenInclude(s => s!.Cuestionario)
                        .ThenInclude(c => c!.Resultado)
                .FirstOrDefaultAsync(a => a.ExamenGrupalId == examenGrupalId && a.EstudianteId == estudianteId);

            if (asignacion == null)
            {
                return false;
            }

            var sesion = await _context.SesionesLectura
                .Include(s => s.Cuestionario)
                    .ThenInclude(c => c!.Resultado)
                .FirstOrDefaultAsync(s => s.Id == sesionLecturaId);

            if (sesion == null || sesion.Cuestionario?.Resultado == null)
            {
                return false;
            }

            asignacion.Estado = "Completado";
            asignacion.FechaCompletado = DateTime.UtcNow;
            asignacion.SesionLecturaId = sesionLecturaId;
            asignacion.Calificacion = sesion.Cuestionario.Resultado.Porcentaje / 10; // Convertir de 0-100 a 0-10

            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al marcar asignación como completada");
            return false;
        }
    }

    /// <summary>
    /// Elimina un examen grupal (solo si ningún estudiante lo ha completado)
    /// </summary>
    public async Task<(bool Success, string Message)> EliminarExamenAsync(int examenGrupalId, int docenteId)
    {
        try
        {
            var examen = await _context.ExamenesGrupales
                .Include(e => e.Asignaciones)
                .FirstOrDefaultAsync(e => e.Id == examenGrupalId && e.DocenteId == docenteId);

            if (examen == null)
            {
                return (false, "Examen no encontrado");
            }

            var completados = examen.Asignaciones.Count(a => a.Estado == "Completado");
            if (completados > 0)
            {
                return (false, $"No se puede eliminar. {completados} estudiantes ya completaron el examen.");
            }

            examen.Activo = false;
            await _context.SaveChangesAsync();

            return (true, "Examen eliminado correctamente");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar examen grupal");
            return (false, "Error interno al eliminar el examen");
        }
    }

    // Métodos privados auxiliares

    private async Task<ExamenGrupalDto?> ObtenerExamenGrupalDtoAsync(int examenGrupalId)
    {
        var examen = await _context.ExamenesGrupales
            .Include(e => e.Aula)
            .Include(e => e.Lectura)
            .Include(e => e.Asignaciones)
                .ThenInclude(a => a.SesionLectura)
                    .ThenInclude(s => s!.Cuestionario)
                        .ThenInclude(c => c!.Resultado)
            .FirstOrDefaultAsync(e => e.Id == examenGrupalId);

        return examen != null ? MapearAExamenGrupalDto(examen) : null;
    }

    private ExamenGrupalDto MapearAExamenGrupalDto(ExamenGrupal examen)
    {
        var completados = examen.Asignaciones.Count(a => a.Estado == "Completado");
        var total = examen.Asignaciones.Count;
        var calificaciones = examen.Asignaciones
            .Where(a => a.Calificacion.HasValue)
            .Select(a => a.Calificacion!.Value)
            .ToList();

        return new ExamenGrupalDto
        {
            Id = examen.Id,
            AulaId = examen.AulaId,
            NombreAula = examen.Aula.Nombre,
            Titulo = examen.Titulo,
            Descripcion = examen.Descripcion,
            LongitudTexto = examen.LongitudTexto,
            GradoEscolar = examen.GradoEscolar,
            Complejidad = examen.Complejidad,
            FechaCreacion = examen.FechaCreacion,
            FechaLimite = examen.FechaLimite,
            Publicado = examen.Publicado,
            LecturaId = examen.LecturaId,
            TituloLectura = examen.Lectura.Titulo,
            TipoLectura = examen.Lectura.TipoLectura,
            CantidadPreguntas = examen.Asignaciones
                .Where(a => a.SesionLectura?.Cuestionario != null)
                .Select(a => a.SesionLectura!.Cuestionario!.Preguntas.Count)
                .FirstOrDefault(),
            TotalEstudiantes = total,
            EstudiantesCompletados = completados,
            PorcentajeCompletado = total > 0 ? Math.Round((decimal)completados / total * 100, 2) : 0,
            PromedioGrupal = calificaciones.Any() ? Math.Round(calificaciones.Average(), 2) : null,
            TiempoPromedioMinutos = examen.Asignaciones
                .Where(a => a.SesionLectura != null)
                .Select(a => a.SesionLectura!.TiempoLecturaMinutos)
                .DefaultIfEmpty(0)
                .Average()
        };
    }
}
