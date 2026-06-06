namespace LecturaIA.API.Models.DTOs;

/// <summary>
/// DTO para obtener perfil de usuario (Estudiante o Docente)
/// </summary>
public class PerfilUsuarioDto
{
    public string NombreCompleto { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string TipoUsuario { get; set; } = null!;
    
    // Datos específicos de Estudiante
    public string? Grado { get; set; }
    public int? Edad { get; set; }
    public string? NivelEducativo { get; set; }
    public string? Intereses { get; set; }
    public string? NivelDificultad { get; set; }
    
    // Datos de clase actual (para estudiante)
    public AulaInfoDto? ClaseActual { get; set; }
}

/// <summary>
/// DTO para información básica de Aula
/// </summary>
public class AulaInfoDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = null!;
    public string? Descripcion { get; set; }
    public string NombreDocente { get; set; } = null!;
    public DateTime FechaVinculacion { get; set; }
}

/// <summary>
/// DTO para unirse a una clase
/// </summary>
public class UnirseAClaseDto
{
    public string CodigoVinculacion { get; set; } = null!;
}

/// <summary>
/// DTO para crear un aula (Docente)
/// </summary>
public class CrearAulaDto
{
    public string Nombre { get; set; } = null!;
    public string? Descripcion { get; set; }
}

/// <summary>
/// DTO de respuesta al crear o unirse a un aula
/// </summary>
public class AulaDetalleDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = null!;
    public string? Descripcion { get; set; }
    public string CodigoVinculacion { get; set; } = null!;
    public string NombreDocente { get; set; } = null!;
    public int CantidadEstudiantes { get; set; }
    public DateTime FechaCreacion { get; set; }
}

/// <summary>
/// DTO para estudiante vinculado a un aula (vista del docente)
/// </summary>
public class EstudianteAulaDto
{
    public int EstudianteId { get; set; }
    public string NombreCompleto { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Grado { get; set; }
    public DateTime FechaVinculacion { get; set; }
    public int TareasDiarias { get; set; }
}

