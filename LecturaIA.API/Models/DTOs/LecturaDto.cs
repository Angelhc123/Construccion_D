namespace LecturaIA.API.Models.DTOs
{
    public class PreferenciasLecturaDto
    {
        public List<string> Temas { get; set; } = new(); // Máximo 2
        public List<string> Personajes { get; set; } = new(); // Máximo 2
        public string Escenario { get; set; } = string.Empty; // Solo 1
        public string Longitud { get; set; } = string.Empty; // Corta, Mediana, Larga
        public string Emocion { get; set; } = string.Empty; // Solo 1
        public string Proposito { get; set; } = string.Empty; // Solo 1
    }

    public class GenerarLecturaRequestDto
    {
        public PreferenciasLecturaDto Preferencias { get; set; } = new();
    }

    public class LecturaGeneradaDto
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Contenido { get; set; } = string.Empty;
        public string? UrlImagen { get; set; }
        public string TipoLectura { get; set; } = string.Empty;
        public PreferenciasLecturaDto Preferencias { get; set; } = new();
        public DateTime FechaCreacion { get; set; }
    }

    public class LecturaListaDto
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string TipoLectura { get; set; } = string.Empty;
        public string Longitud { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; }
        public int Progreso { get; set; }
        public string Estado { get; set; } = string.Empty;
        public bool EsFavorita { get; set; }
        public bool TieneCuestionario { get; set; }
        public Guid? CuestionarioId { get; set; }
        public bool CuestionarioEvaluado { get; set; }
    }
}
