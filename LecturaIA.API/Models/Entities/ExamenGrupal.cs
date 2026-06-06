namespace LecturaIA.API.Models.Entities;

/// <summary>
/// Representa un examen grupal creado por un docente y asignado a un salón completo
/// </summary>
public class ExamenGrupal
{
    public int Id { get; set; }
    public int AulaId { get; set; }
    public int DocenteId { get; set; }
    public int LecturaId { get; set; }
    
    public string Titulo { get; set; } = null!;
    public string? Descripcion { get; set; }
    
    /// <summary>
    /// Longitud del texto: Corto, Medio, Largo
    /// </summary>
    public string LongitudTexto { get; set; } = null!;
    
    /// <summary>
    /// Grado escolar: 4to, 5to, 6to
    /// </summary>
    public string GradoEscolar { get; set; } = null!;
    
    /// <summary>
    /// Complejidad: Basica, Intermedia, Avanzada
    /// </summary>
    public string Complejidad { get; set; } = null!;
    
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaLimite { get; set; }
    
    /// <summary>
    /// Si es true, los estudiantes pueden ver el examen. Si es false, está en borrador
    /// </summary>
    public bool Publicado { get; set; } = true;
    
    public bool Activo { get; set; } = true;

    // Navegación
    public Aula Aula { get; set; } = null!;
    public Docente Docente { get; set; } = null!;
    public Lectura Lectura { get; set; } = null!;
    public ICollection<AsignacionExamen> Asignaciones { get; set; } = new List<AsignacionExamen>();
}

/// <summary>
/// Relación entre un ExamenGrupal y un Estudiante (asignación individual)
/// </summary>
public class AsignacionExamen
{
    public int Id { get; set; }
    public int ExamenGrupalId { get; set; }
    public int EstudianteId { get; set; }
    
    /// <summary>
    /// Estado: Pendiente, Completado
    /// </summary>
    public string Estado { get; set; } = "Pendiente";
    
    public DateTime FechaAsignacion { get; set; }
    public DateTime? FechaCompletado { get; set; }
    
    /// <summary>
    /// ID de la sesión de lectura cuando el estudiante completa el examen
    /// </summary>
    public Guid? SesionLecturaId { get; set; }
    
    /// <summary>
    /// Calificación obtenida (0-10)
    /// </summary>
    public decimal? Calificacion { get; set; }

    // Navegación
    public ExamenGrupal ExamenGrupal { get; set; } = null!;
    public Estudiante Estudiante { get; set; } = null!;
    public SesionLectura? SesionLectura { get; set; }
}
