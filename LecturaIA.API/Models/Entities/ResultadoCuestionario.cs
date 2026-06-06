using System.ComponentModel.DataAnnotations;

namespace LecturaIA.API.Models.Entities
{
    /// <summary>
    /// Representa el resultado y retroalimentación del cuestionario
    /// CU-007: Evaluación y Retroalimentación
    /// </summary>
    public class ResultadoCuestionario
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid CuestionarioId { get; set; }

        [Required]
        public int EstudianteId { get; set; }

        /// <summary>
        /// Fecha de evaluación
        /// </summary>
        [Required]
        public DateTime FechaEvaluacion { get; set; }

        /// <summary>
        /// Tiempo que tardó en responder el cuestionario (en minutos con decimales para precisión de segundos)
        /// </summary>
        public decimal TiempoCuestionarioMinutos { get; set; }

        /// <summary>
        /// Puntaje total (0-10)
        /// </summary>
        [Required]
        public int PuntajeTotal { get; set; }

        /// <summary>
        /// Porcentaje (0-100)
        /// </summary>
        [Required]
        public decimal Porcentaje { get; set; }

        /// <summary>
        /// Respuestas correctas en preguntas literales (0-4)
        /// </summary>
        public int CorrectasLiterales { get; set; }

        /// <summary>
        /// Respuestas correctas en preguntas analíticas (0-4)
        /// </summary>
        public int CorrectasAnaliticas { get; set; }

        /// <summary>
        /// Puntaje en preguntas críticas (0-2, puede ser decimal por evaluación IA)
        /// </summary>
        public decimal PuntajeCriticas { get; set; }

        /// <summary>
        /// Retroalimentación personalizada generada por IA
        /// </summary>
        [Required]
        public string RetroalimentacionPersonalizada { get; set; } = "";

        /// <summary>
        /// Mensaje de ánimo según desempeño
        /// </summary>
        public string MensajeAnimo { get; set; } = "";

        /// <summary>
        /// Nivel anterior del estudiante
        /// </summary>
        [StringLength(20)]
        public string NivelAnterior { get; set; } = "Medio";

        /// <summary>
        /// Nivel nuevo del estudiante (puede cambiar según rendimiento)
        /// </summary>
        [StringLength(20)]
        public string NivelNuevo { get; set; } = "Medio";

        /// <summary>
        /// Acción de nivel: "subir", "mantener", "bajar", "maximo", "minimo"
        /// </summary>
        [StringLength(20)]
        public string AccionNivel { get; set; } = "mantener";

        /// <summary>
        /// Mensaje de adaptación de nivel
        /// </summary>
        public string MensajeAdaptacion { get; set; } = "";

        // Navigation properties
        public Cuestionario Cuestionario { get; set; } = null!;
        public Estudiante Estudiante { get; set; } = null!;
    }
}
