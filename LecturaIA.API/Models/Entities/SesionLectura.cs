using System.ComponentModel.DataAnnotations;

namespace LecturaIA.API.Models.Entities
{
    /// <summary>
    /// Representa una sesión de lectura completada por un estudiante
    /// CU-005: Iniciar y Finalizar Lectura
    /// </summary>
    public class SesionLectura
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public int EstudianteId { get; set; }

        [Required]
        public int LecturaId { get; set; }

        /// <summary>
        /// Fecha y hora cuando comenzó a leer
        /// </summary>
        [Required]
        public DateTime FechaInicio { get; set; }

        /// <summary>
        /// Fecha y hora cuando terminó de leer
        /// </summary>
        public DateTime? FechaFinalizacion { get; set; }

        /// <summary>
        /// Tiempo total de lectura en minutos (con decimales para precisión de segundos)
        /// </summary>
        public decimal TiempoLecturaMinutos { get; set; }

        /// <summary>
        /// Si completó la lectura
        /// </summary>
        public bool Completada { get; set; }

        // Navigation properties
        public Estudiante Estudiante { get; set; } = null!;
        public Lectura Lectura { get; set; } = null!;

        // Relación con cuestionario (opcional hasta que complete el quiz)
        public Cuestionario? Cuestionario { get; set; }
    }
}
