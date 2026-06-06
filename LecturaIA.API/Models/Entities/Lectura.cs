namespace LecturaIA.API.Models.Entities
{
    public class Lectura
    {
        public int Id { get; set; }
        public int? EstudianteId { get; set; } // Nullable para exámenes grupales
        public string Titulo { get; set; } = string.Empty;
        public string Contenido { get; set; } = string.Empty;
        public string? UrlImagen { get; set; }
        public string TipoLectura { get; set; } = string.Empty; // Narrativa, Descriptiva, etc.
        
        // Preferencias del estudiante
        public string Temas { get; set; } = string.Empty; // JSON array
        public string Personajes { get; set; } = string.Empty; // JSON array
        public string Escenario { get; set; } = string.Empty;
        public string Longitud { get; set; } = string.Empty; // Corta, Mediana, Larga
        public string Emocion { get; set; } = string.Empty;
        public string Proposito { get; set; } = string.Empty;
        
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public bool EsFavorita { get; set; } = false;
        public int Progreso { get; set; } = 0; // 0-100
        public string Estado { get; set; } = "pendiente"; // pendiente, en-progreso, completado
        
        // Navegación
        public Estudiante? Estudiante { get; set; }
    }
}
