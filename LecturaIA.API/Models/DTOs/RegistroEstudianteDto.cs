using System.ComponentModel.DataAnnotations;
using LecturaIA.API.Models.Entities;

namespace LecturaIA.API.Models.DTOs;

public class RegistroEstudianteDto : IValidatableObject
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

    [Required(ErrorMessage = "El grado es obligatorio")]
    public GradoEscolar Grado { get; set; }

    [Required(ErrorMessage = "La edad es obligatoria")]
    [Range(5, 100, ErrorMessage = "La edad debe estar entre 5 y 100 años")]
    public required int Edad { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        // Validar que el grado sea uno de los valores definidos en el enum
        if (!Enum.IsDefined(typeof(GradoEscolar), Grado))
        {
            yield return new ValidationResult(
                "El grado debe ser 4 (Cuarto), 5 (Quinto) o 6 (Sexto)",
                new[] { nameof(Grado) }
            );
        }
    }
}
