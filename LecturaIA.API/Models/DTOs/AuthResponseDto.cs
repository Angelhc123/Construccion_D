namespace LecturaIA.API.Models.DTOs;

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string TipoUsuario { get; set; } = string.Empty;
    public DateTime FechaExpiracion { get; set; }
}
