namespace LecturaIA.API.Models.Entities;

/// <summary>
/// Código de verificación para doble autenticación en login de docentes
/// </summary>
public class CodigoVerificacionLogin
{
    public int Id { get; set; }
    
    public int UsuarioId { get; set; }
    public Usuario Usuario { get; set; } = null!;
    
    /// <summary>
    /// Código de 6 dígitos enviado por email
    /// </summary>
    public string Codigo { get; set; } = string.Empty;
    
    /// <summary>
    /// Fecha y hora de generación del código
    /// </summary>
    public DateTime FechaGeneracion { get; set; }
    
    /// <summary>
    /// Fecha y hora de expiración (10 minutos después de generación)
    /// </summary>
    public DateTime FechaExpiracion { get; set; }
    
    /// <summary>
    /// Indica si el código ya fue utilizado
    /// </summary>
    public bool Usado { get; set; }
    
    /// <summary>
    /// Número de intentos fallidos de validación
    /// </summary>
    public int IntentosRestantes { get; set; } = 3;
    
    /// <summary>
    /// Dirección IP desde donde se solicitó el código
    /// </summary>
    public string? DireccionIP { get; set; }
}
