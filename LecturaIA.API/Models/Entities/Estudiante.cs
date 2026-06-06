namespace LecturaIA.API.Models.Entities;

public class Estudiante
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public GradoEscolar Grado { get; set; }
    public int Edad { get; set; }
    public string? NivelEducativo { get; set; }
    public string? Intereses { get; set; }
    public NivelDificultad NivelDificultad { get; set; } = NivelDificultad.Facil;

    // Navegación
    public Usuario Usuario { get; set; } = null!;
}

public enum NivelDificultad
{
    Facil = 1,
    Medio = 2,
    Dificil = 3
}
