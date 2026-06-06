using System.ComponentModel.DataAnnotations;

namespace LecturaIA.API.Models.DTOs;

public class RegistroDocenteDto
{
    [Required(ErrorMessage = "El correo es obligatorio")]
    [EmailAddress(ErrorMessage = "El formato del correo no es válido")]
    [MaxLength(100, ErrorMessage = "El correo no puede exceder 100 caracteres")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria")]
    [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Confirmar contraseña es obligatorio")]
    [Compare("Password", ErrorMessage = "Las contraseñas no coinciden")]
    public string ConfirmarPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre completo es obligatorio")]
    [MaxLength(200, ErrorMessage = "El nombre no puede exceder 200 caracteres")]
    public string NombreCompleto { get; set; } = string.Empty;
}
