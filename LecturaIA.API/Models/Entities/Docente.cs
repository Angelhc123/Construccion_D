namespace LecturaIA.API.Models.Entities;

public class Docente
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }

    // Navegación
    public Usuario Usuario { get; set; } = null!;
}
