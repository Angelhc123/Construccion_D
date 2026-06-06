using System.ComponentModel.DataAnnotations;

namespace LecturaIA.API.Models.Entities
{
    /// <summary>
    /// Representa un cuestionario generado para evaluar la comprensión lectora
    /// CU-006: Generación de Cuestionario con IA
    /// </summary>
    public class Cuestionario
    {
        [Key]
        public Guid Id { get; set; }

        public Guid? SesionLecturaId { get; set; } // Nullable para exámenes grupales

        [Required]
        public int LecturaId { get; set; }

        public int? EstudianteId { get; set; } // Nullable para exámenes grupales

        /// <summary>
        /// Fecha de generación del cuestionario
        /// </summary>
        [Required]
        public DateTime FechaGeneracion { get; set; }

        /// <summary>
        /// Fecha de envío de respuestas
        /// </summary>
        public DateTime? FechaEnvio { get; set; }

        /// <summary>
        /// Estado: "generando", "listo", "en_progreso", "enviado", "evaluado"
        /// </summary>
        [Required]
        [StringLength(20)]
        public string Estado { get; set; } = "generando";

        /// <summary>
        /// Nivel de dificultad del estudiante al momento de generar
        /// </summary>
        [StringLength(20)]
        public string NivelDificultad { get; set; } = "Medio";

        /// <summary>
        /// Tipo de texto de la lectura
        /// </summary>
        [StringLength(50)]
        public string TipoTexto { get; set; } = "";

        // Navigation properties
        public SesionLectura? SesionLectura { get; set; }
        public Lectura Lectura { get; set; } = null!;
        public Estudiante? Estudiante { get; set; }

        // Colecciones
        public ICollection<Pregunta> Preguntas { get; set; } = new List<Pregunta>();
        public ResultadoCuestionario? Resultado { get; set; }
    }
}
