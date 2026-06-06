using System.ComponentModel.DataAnnotations;

namespace LecturaIA.API.Models.DTOs;

public class SolicitarRecuperacionDto
{
    [Required(ErrorMessage = "El correo es obligatorio")]
    [EmailAddress(ErrorMessage = "El formato del correo no es válido")]
    public string Email { get; set; } = string.Empty;
}

public class RestablecerPasswordDto
{
    [Required(ErrorMessage = "El token es obligatorio")]
    public string Token { get; set; } = string.Empty;

    [Required(ErrorMessage = "La nueva contraseña es obligatoria")]
    [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
    public string NuevaPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Confirmar contraseña es obligatorio")]
    [Compare("NuevaPassword", ErrorMessage = "Las contraseñas no coinciden")]
    public string ConfirmarPassword { get; set; } = string.Empty;
}
