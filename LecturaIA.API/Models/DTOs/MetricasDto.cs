namespace LecturaIA.API.Models.DTOs;

/// <summary>
/// DTO para métricas individuales de un estudiante
/// </summary>
public class MetricasEstudianteDto
{
    // Resumen General
    public int LecturasCompletadas { get; set; }
    public decimal PromedioQuiz { get; set; }
    public string NivelActual { get; set; } = null!;
    public string TipoTextoFavorito { get; set; } = "No determinado"; // Tipo de texto con mejor rendimiento
    public DateTime? UltimaActividad { get; set; }
    public decimal TiempoPromedioLectura { get; set; } // en minutos con decimales

    // Evolución Temporal (últimos 10 quizzes)
    public List<PuntoEvolucionDto> EvolucionTemporal { get; set; } = new();

    // Análisis por Habilidad
    public AnalisisHabilidadDto AnalisisHabilidad { get; set; } = new();
}

/// <summary>
/// Punto de datos para gráfica de evolución temporal
/// </summary>
public class PuntoEvolucionDto
{
    public int NumeroQuiz { get; set; }
    public decimal Calificacion { get; set; }
    public DateTime Fecha { get; set; }
    public string TituloLectura { get; set; } = null!;
}

/// <summary>
/// Análisis de habilidades por categoría
/// </summary>
public class AnalisisHabilidadDto
{
    public decimal PorcentajeLiteral { get; set; }
    public decimal PorcentajeInferencial { get; set; }
    public decimal PorcentajeCritico { get; set; }
}

/// <summary>
/// DTO para métricas del aula completa
/// </summary>
public class MetricasAulaDto
{
    public int AulaId { get; set; }
    public string NombreAula { get; set; } = null!;
    public int TotalEstudiantes { get; set; }
    public decimal PromedioClase { get; set; }
    public decimal TiempoPromedioLectura { get; set; } // Tiempo promedio de lectura en minutos
    public decimal TiempoPromedioCuestionario { get; set; } // Tiempo promedio de cuestionario en minutos

    // Progreso Semanal de la Clase (últimas 8 semanas)
    public List<ProgresoSemanalDto> ProgresoSemanal { get; set; } = new();
    
    // Distribución de rendimiento por tipo de texto
    public DistribucionTiposTextoDto DistribucionTiposTexto { get; set; } = new();
}

/// <summary>
/// Punto de datos para progreso semanal
/// </summary>
public class ProgresoSemanalDto
{
    public int NumeroSemana { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public decimal PromedioSemana { get; set; }
    public int CantidadQuizzes { get; set; }
}

/// <summary>
/// Distribución del rendimiento por tipo de texto en el aula
/// </summary>
public class DistribucionTiposTextoDto
{
    // Contadores
    public int CantidadNarrativo { get; set; }
    public int CantidadDescriptivo { get; set; }
    public int CantidadExpositivo { get; set; }
    public int CantidadArgumentativo { get; set; }
    public int CantidadInstructivo { get; set; }
    
    // Promedios de rendimiento
    public decimal PromedioNarrativo { get; set; }
    public decimal PromedioDescriptivo { get; set; }
    public decimal PromedioExpositivo { get; set; }
    public decimal PromedioArgumentativo { get; set; }
    public decimal PromedioInstructivo { get; set; }
}
