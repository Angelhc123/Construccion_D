using System.ComponentModel.DataAnnotations;

namespace LecturaIA.API.Models.Entities
{
    /// <summary>
    /// Representa una pregunta del cuestionario
    /// CU-006: Tipos de preguntas (Literal, Analítica, Crítica)
    /// </summary>
    public class Pregunta
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid CuestionarioId { get; set; }

        /// <summary>
        /// Número de orden (1-10)
        /// </summary>
        [Required]
        public int Orden { get; set; }

        /// <summary>
        /// Tipo: "Literal", "Analitica", "Critica"
        /// </summary>
        [Required]
        [StringLength(20)]
        public string Tipo { get; set; } = "";

        /// <summary>
        /// Formato: "OpcionMultiple", "Abierta"
        /// </summary>
        [Required]
        [StringLength(20)]
        public string Formato { get; set; } = "";

        /// <summary>
        /// Texto de la pregunta
        /// </summary>
        [Required]
        public string TextoPregunta { get; set; } = "";

        /// <summary>
        /// Opciones de respuesta (JSON array) - solo para opción múltiple
        /// Ejemplo: ["Opción A", "Opción B", "Opción C", "Opción D"]
        /// </summary>
        public string? Opciones { get; set; }

        /// <summary>
        /// Respuesta correcta (solo para opción múltiple)
        /// Ejemplo: "Opción B"
        /// </summary>
        public string? RespuestaCorrecta { get; set; }

        /// <summary>
        /// Explicación de la respuesta correcta
        /// </summary>
        public string? Explicacion { get; set; }

        // Navigation properties
        public Cuestionario Cuestionario { get; set; } = null!;
        public RespuestaEstudiante? Respuesta { get; set; }
    }
}
