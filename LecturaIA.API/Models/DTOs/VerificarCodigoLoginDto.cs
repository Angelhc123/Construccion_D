using System.ComponentModel.DataAnnotations;

namespace LecturaIA.API.Models.DTOs;

/// <summary>
/// DTO para validar el código de doble autenticación
/// </summary>
public class VerificarCodigoLoginDto
{
    [Required(ErrorMessage = "El email es obligatorio")]
    [EmailAddress(ErrorMessage = "El formato del correo no es válido")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "El código es obligatorio")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "El código debe tener exactamente 6 dígitos")]
    [RegularExpression(@"^\d{6}$", ErrorMessage = "El código debe contener solo dígitos")]
    public string Codigo { get; set; } = string.Empty;
}

/// <summary>
/// DTO para reenviar código de doble autenticación
/// </summary>
public class ReenviarCodigoLoginDto
{
    [Required(ErrorMessage = "El email es obligatorio")]
    [EmailAddress(ErrorMessage = "El formato del correo no es válido")]
    public string Email { get; set; } = string.Empty;
}

/// <summary>
/// Respuesta del login cuando requiere 2FA
/// </summary>
public class LoginRequiere2FADto
{
    public bool RequiereVerificacion { get; set; } = true;
    public string Mensaje { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int TiempoExpiracionMinutos { get; set; } = 10;
}

/// <summary>
/// Respuesta cuando la cuenta está suspendida
/// </summary>
public class LoginCuentaSuspendidaDto
{
    public bool CuentaSuspendida { get; set; } = true;
    public string Mensaje { get; set; } = "Tu cuenta ha sido suspendida. Contacta al administrador para más información.";
}
