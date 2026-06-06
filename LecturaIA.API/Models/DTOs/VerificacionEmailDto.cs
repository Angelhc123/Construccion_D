using System.ComponentModel.DataAnnotations;

namespace LecturaIA.API.Models.DTOs;

public class VerificarEmailDto
{
    [Required(ErrorMessage = "El token de verificación es obligatorio")]
    public string Token { get; set; } = string.Empty;
}

public class ReenviarVerificacionDto
{
    [Required(ErrorMessage = "El email es obligatorio")]
    [EmailAddress(ErrorMessage = "El formato del email no es válido")]
    public string Email { get; set; } = string.Empty;
}
