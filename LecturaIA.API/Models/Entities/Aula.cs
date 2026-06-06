namespace LecturaIA.API.Models.Entities;

public class Aula
{
    public int Id { get; set; }
    public int DocenteId { get; set; }
    public string Nombre { get; set; } = null!;
    public string? Descripcion { get; set; }
    public string CodigoVinculacion { get; set; } = null!; // BCH47X
    public DateTime FechaCreacion { get; set; }
    public bool Activa { get; set; } = true;

    // Navegación
    public Docente Docente { get; set; } = null!;
    public ICollection<EstudianteAula> Estudiantes { get; set; } = new List<EstudianteAula>();
}

/// <summary>
/// Tabla de relación Muchos a Muchos entre Estudiante y Aula
/// </summary>
public class EstudianteAula
{
    public int EstudianteId { get; set; }
    public int AulaId { get; set; }
    public DateTime FechaVinculacion { get; set; }
    public bool Activo { get; set; } = true;

    // Navegación
    public Estudiante Estudiante { get; set; } = null!;
    public Aula Aula { get; set; } = null!;
}
