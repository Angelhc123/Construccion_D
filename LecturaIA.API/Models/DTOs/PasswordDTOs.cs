namespace LecturaIA.API.Models.DTOs;

public class CambiarPasswordDto
{
    public string PasswordActual { get; set; } = string.Empty;
    public string NuevaPassword { get; set; } = string.Empty;
    public string ConfirmarPassword { get; set; } = string.Empty;
}

public class ValidacionPasswordDto
{
    public bool EsFuerte { get; set; }
    public List<string> Mensajes { get; set; } = new();
    public string Nivel { get; set; } = "Débil"; // Débil, Media, Fuerte
}

public class ValidarPasswordRequest
{
    public string Password { get; set; } = string.Empty;
}
