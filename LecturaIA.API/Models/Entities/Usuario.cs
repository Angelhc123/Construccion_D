namespace LecturaIA.API.Models.Entities;

public class Usuario
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public TipoUsuario TipoUsuario { get; set; }
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;
    public bool Activo { get; set; } = true;
    public DateTime? UltimoAcceso { get; set; }

    // Campos de verificación de email
    public bool EmailVerificado { get; set; } = false;
    public string? TokenVerificacion { get; set; }
    public DateTime? FechaExpiracionToken { get; set; }

    // Campos para administración
    public bool Suspendido { get; set; } = false;
    public DateTime? FechaSuspension { get; set; }
    public string? MotivoSuspension { get; set; }
    public DateTime? FechaReinicioPassword { get; set; }
    public string? MotivoReinicioPassword { get; set; }

    // Doble autenticación (2FA)
    public bool RequiereDobleAutenticacion { get; set; } = false;

    // Tutorial y ayuda
    public bool PrimeraSesion { get; set; } = true;

    // Navegación polimórfica
    public Estudiante? Estudiante { get; set; }
    public Docente? Docente { get; set; }
    public ICollection<CodigoVerificacionLogin> CodigosVerificacion { get; set; } = new List<CodigoVerificacionLogin>();
}

public enum TipoUsuario
{
    Estudiante = 1,
    Docente = 2,
    Administrador = 3
}
