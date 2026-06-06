using System.ComponentModel.DataAnnotations;

namespace LecturaIA.API.Models.Entities
{
    /// <summary>
    /// Representa la respuesta del estudiante a una pregunta
    /// </summary>
    public class RespuestaEstudiante
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid PreguntaId { get; set; }

        [Required]
        public int EstudianteId { get; set; }

        /// <summary>
        /// Texto de la respuesta (puede ser opción seleccionada o texto libre)
        /// </summary>
        [Required]
        public string TextoRespuesta { get; set; } = "";

        /// <summary>
        /// Si la respuesta es correcta (calculado automáticamente para opción múltiple)
        /// </summary>
        public bool? EsCorrecta { get; set; }

        /// <summary>
        /// Puntaje asignado por IA (para preguntas abiertas, escala 0-1)
        /// </summary>
        public decimal? PuntajeIA { get; set; }

        /// <summary>
        /// Retroalimentación de la IA para preguntas abiertas
        /// </summary>
        public string? RetroalimentacionIA { get; set; }

        /// <summary>
        /// Fecha de respuesta
        /// </summary>
        [Required]
        public DateTime FechaRespuesta { get; set; }

        // Navigation properties
        public Pregunta Pregunta { get; set; } = null!;
        public Estudiante Estudiante { get; set; } = null!;
    }
}
