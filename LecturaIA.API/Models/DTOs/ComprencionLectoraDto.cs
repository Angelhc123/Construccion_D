namespace LecturaIA.API.Models.DTOs
{
    // ===============================================
    // CU-005: SESIÓN DE LECTURA
    // ===============================================

    /// <summary>
    /// DTO para iniciar una sesión de lectura
    /// </summary>
    public class IniciarLecturaDto
    {
        public required int LecturaId { get; set; }
    }

    /// <summary>
    /// DTO de respuesta al iniciar lectura
    /// </summary>
    public class SesionLecturaDto
    {
        public Guid Id { get; set; }
        public int LecturaId { get; set; }
        public DateTime FechaInicio { get; set; }
        public bool Completada { get; set; }
    }

    /// <summary>
    /// DTO para finalizar la lectura
    /// </summary>
    public class FinalizarLecturaDto
    {
        public Guid SesionLecturaId { get; set; }
        public required decimal TiempoLecturaMinutos { get; set; }
    }

    /// <summary>
    /// DTO para actualizar tiempo de lectura (exámenes grupales)
    /// </summary>
    public class ActualizarTiempoDto
    {
        public required decimal TiempoLecturaMinutos { get; set; }
    }

    /// <summary>
    /// DTO de respuesta al finalizar lectura
    /// </summary>
    public class LecturaFinalizadaDto
    {
        public Guid SesionLecturaId { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFinalizacion { get; set; }
        public decimal TiempoLecturaMinutos { get; set; }
        public string Mensaje { get; set; } = "¡Felicitaciones! Has terminado de leer la historia";
    }

    // ===============================================
    // CU-006: GENERACIÓN DE CUESTIONARIO
    // ===============================================

    /// <summary>
    /// DTO para solicitar generación de cuestionario
    /// </summary>
    public class GenerarCuestionarioDto
    {
        public required Guid SesionLecturaId { get; set; }
    }

    /// <summary>
    /// DTO de pregunta del cuestionario
    /// </summary>
    public class PreguntaDto
    {
        public Guid Id { get; set; }
        public int Orden { get; set; }
        public string Tipo { get; set; } = ""; // "Literal", "Analitica", "Critica"
        public string Formato { get; set; } = ""; // "OpcionMultiple", "Abierta"
        public string TextoPregunta { get; set; } = "";
        public List<string>? Opciones { get; set; } // Solo para opción múltiple
        public string? Explicacion { get; set; } // No se envía al frontend, solo en revisión
    }

    /// <summary>
    /// DTO del cuestionario completo
    /// </summary>
    public class CuestionarioDto
    {
        public Guid Id { get; set; }
        public Guid? SesionLecturaId { get; set; }
        public int LecturaId { get; set; }
        public DateTime FechaGeneracion { get; set; }
        public string Estado { get; set; } = ""; // "generando", "listo", "en_progreso", "enviado"
        public string NivelDificultad { get; set; } = "";
        public string TipoTexto { get; set; } = "";
        public string TituloLectura { get; set; } = "";
        public List<PreguntaDto> Preguntas { get; set; } = new();
    }

    // ===============================================
    // CU-006: ENVÍO DE RESPUESTAS
    // ===============================================

    /// <summary>
    /// DTO de una respuesta del estudiante
    /// </summary>
    public class RespuestaDto
    {
        public Guid PreguntaId { get; set; }
        public string TextoRespuesta { get; set; } = "";
    }

    /// <summary>
    /// DTO para enviar todas las respuestas
    /// </summary>
    public class EnviarRespuestasDto
    {
        public Guid CuestionarioId { get; set; }
        public List<RespuestaDto> Respuestas { get; set; } = new();
        public decimal TiempoCuestionarioMinutos { get; set; }
    }

    // ===============================================
    // CU-007: RESULTADOS Y RETROALIMENTACIÓN
    // ===============================================

    /// <summary>
    /// DTO de detalle de una respuesta con corrección
    /// </summary>
    public class RespuestaDetalleDto
    {
        public Guid PreguntaId { get; set; }
        public int Orden { get; set; }
        public string Tipo { get; set; } = "";
        public string Formato { get; set; } = "";
        public string TextoPregunta { get; set; } = "";
        
        // Para opción múltiple
        public List<string>? Opciones { get; set; }
        public string? RespuestaEstudiante { get; set; }
        public string? RespuestaCorrecta { get; set; }
        public bool? EsCorrecta { get; set; }
        public string? Explicacion { get; set; }
        
        // Para preguntas abiertas
        public string? TextoRespuestaAbierta { get; set; }
        public decimal? PuntajeIA { get; set; }
        public string? RetroalimentacionIA { get; set; }
    }

    /// <summary>
    /// DTO de análisis por tipo de pregunta
    /// </summary>
    public class AnalisisPorTipoDto
    {
        public string Tipo { get; set; } = "";
        public int Correctas { get; set; }
        public int Total { get; set; }
        public decimal Porcentaje { get; set; }
    }

    /// <summary>
    /// DTO de resultado del cuestionario
    /// </summary>
    public class ResultadoCuestionarioDto
    {
        public Guid Id { get; set; }
        public Guid CuestionarioId { get; set; }
        public DateTime FechaEvaluacion { get; set; }
        
        // Tiempos
        public decimal TiempoLecturaMinutos { get; set; }
        public decimal TiempoCuestionarioMinutos { get; set; }
        
        // Puntajes
        public int PuntajeTotal { get; set; }
        public decimal Porcentaje { get; set; }
        public string MensajeAnimo { get; set; } = "";
        
        // Análisis detallado
        public int CorrectasLiterales { get; set; }
        public int CorrectasAnaliticas { get; set; }
        public decimal PuntajeCriticas { get; set; }
        public List<AnalisisPorTipoDto> AnalisisPorTipo { get; set; } = new();
        
        // Retroalimentación (mantener para compatibilidad)
        public string RetroalimentacionPersonalizada { get; set; } = "";
        
        // Retroalimentación estructurada (nuevo - para el frontend)
        public RetroalimentacionDto? Retroalimentacion { get; set; }
        
        // Adaptación de nivel
        public string NivelAnterior { get; set; } = "";
        public string NivelNuevo { get; set; } = "";
        public string AccionNivel { get; set; } = ""; // "subir", "mantener", "bajar", "maximo", "minimo"
        public string MensajeAdaptacion { get; set; } = "";
        
        // Detalle de respuestas (solo cuando se solicita "Ver Respuestas")
        public List<RespuestaDetalleDto>? DetalleRespuestas { get; set; }
    }

    /// <summary>
    /// DTO para retroalimentación estructurada
    /// </summary>
    public class RetroalimentacionDto
    {
        public string Logros { get; set; } = "";
        public string Mejora { get; set; } = "";
        public string Consejos { get; set; } = "";
        public string Animo { get; set; } = "";
    }

    // ===============================================
    // DASHBOARD: LISTAS DE LECTURAS
    // ===============================================

    /// <summary>
    /// DTO de lectura para el dashboard (vista lista)
    /// </summary>
    public class LecturaDashboardDto
    {
        public Guid Id { get; set; }
        public string Titulo { get; set; } = "";
        public string TipoLectura { get; set; } = "";
        public string? UrlImagen { get; set; }
        public DateTime FechaCreacion { get; set; }
        public bool EsFavorita { get; set; }
        public string Estado { get; set; } = ""; // "pendiente", "en_progreso", "completado"
        public int Progreso { get; set; } // 0-100
        
        // Información de sesión (si existe)
        public Guid? SesionLecturaId { get; set; }
        public bool TieneSesionActiva { get; set; }
        public bool LecturaCompletada { get; set; }
        
        // Información de cuestionario (si existe)
        public bool TieneCuestionario { get; set; }
        public string? EstadoCuestionario { get; set; }
        public bool CuestionarioCompletado { get; set; }
    }

    /// <summary>
    /// DTO para marcar/desmarcar favorita
    /// </summary>
    public class MarcarFavoritaDto
    {
        public required bool EsFavorita { get; set; }
    }
}
