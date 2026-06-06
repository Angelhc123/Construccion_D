namespace LecturaIA.API.Models.DTOs;

/// <summary>
/// DTO para crear un examen grupal con IA
/// </summary>
public class CrearExamenGrupalDto
{
    public int AulaId { get; set; }
    public string Titulo { get; set; } = null!;
    public string? Descripcion { get; set; }
    
    // Parámetros para generación con IA
    public string TemaConcepto { get; set; } = null!;
    public string TipoTexto { get; set; } = null!; // Narrativo, Descriptivo, Expositivo, Argumentativo, Instructivo
    public string LongitudTexto { get; set; } = null!; // Corto, Medio, Largo
    public string GradoEscolar { get; set; } = null!; // 4to, 5to, 6to
    public string Complejidad { get; set; } = null!; // Basica, Intermedia, Avanzada
    public int CantidadPreguntas { get; set; } = 10;
    
    public DateTime? FechaLimite { get; set; }
    public bool Publicado { get; set; } = true;
}

/// <summary>
/// DTO para listar exámenes grupales
/// </summary>
public class ExamenGrupalDto
{
    public int Id { get; set; }
    public int AulaId { get; set; }
    public string NombreAula { get; set; } = null!;
    public string Titulo { get; set; } = null!;
    public string? Descripcion { get; set; }
    public string LongitudTexto { get; set; } = null!;
    public string GradoEscolar { get; set; } = null!;
    public string Complejidad { get; set; } = null!;
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaLimite { get; set; }
    public bool Publicado { get; set; }
    
    // Información de la lectura asociada
    public int LecturaId { get; set; }
    public string TituloLectura { get; set; } = null!;
    public string TipoLectura { get; set; } = null!;
    public int CantidadPreguntas { get; set; }
    
    // Estadísticas (para vista del docente)
    public int TotalEstudiantes { get; set; }
    public int EstudiantesCompletados { get; set; }
    public decimal PorcentajeCompletado { get; set; }
    public double CompletadosPorcentaje { get; set; }
    public string Estado { get; set; } = "Pendiente";
    public decimal? PromedioGrupal { get; set; }
    public decimal? TiempoPromedioMinutos { get; set; }
}

/// <summary>
/// DTO para reasignar un examen grupal existente
/// </summary>
public class ReasignarExamenDto
{
    public DateTime? FechaLimite { get; set; }
}

/// <summary>
/// DTO para examen asignado a un estudiante
/// </summary>
public class AsignacionExamenDto
{
    public int Id { get; set; }
    public int ExamenGrupalId { get; set; }
    public string TituloExamen { get; set; } = null!;
    public string? DescripcionExamen { get; set; }
    public string NombreDocente { get; set; } = null!;
    public string Estado { get; set; } = null!; // Pendiente, Completado
    public DateTime FechaAsignacion { get; set; }
    public DateTime? FechaLimite { get; set; }
    public DateTime? FechaCompletado { get; set; }
    public decimal? Calificacion { get; set; }
    
    // Información de la lectura
    public int LecturaId { get; set; }
    public string TituloLectura { get; set; } = null!;
    public string LongitudTexto { get; set; } = null!;
    public int CantidadPreguntas { get; set; }
}

/// <summary>
/// DTO para resultados consolidados de un examen grupal
/// </summary>
public class ResultadosExamenGrupalDto
{
    public ExamenGrupalDto ExamenInfo { get; set; } = null!;
    public List<ResultadoEstudianteDto> Resultados { get; set; } = new();
    public EstadisticasExamenDto Estadisticas { get; set; } = null!;
}

/// <summary>
/// DTO para el resultado individual de un estudiante en un examen
/// </summary>
public class ResultadoEstudianteDto
{
    public int EstudianteId { get; set; }
    public string NombreCompleto { get; set; } = null!;
    public string Estado { get; set; } = null!; // Pendiente, Realizando, Completado
    public DateTime? FechaCompletado { get; set; }
    public decimal? Calificacion { get; set; }
    public decimal? TiempoTotalMinutos { get; set; }
    public decimal? TiempoLecturaMinutos { get; set; }
    public decimal? TiempoQuizMinutos { get; set; }
}

/// <summary>
/// DTO para estadísticas generales del examen grupal
/// </summary>
public class EstadisticasExamenDto
{
    public int TotalEstudiantes { get; set; }
    public int Completados { get; set; }
    public int Pendientes { get; set; }
    public decimal PorcentajeCompletado { get; set; }
    public decimal? PromedioGrupal { get; set; }
    public decimal? CalificacionMaxima { get; set; }
    public decimal? CalificacionMinima { get; set; }
    public decimal? TiempoPromedioMinutos { get; set; }
    
    // Alertas
    public List<string> EstudiantesPendientes { get; set; } = new();
    public List<string> EstudiantesConDificultad { get; set; } = new(); // Tiempo excesivo o calificación baja
    public List<string> EstudiantesDestacados { get; set; } = new(); // Alta calificación
}
