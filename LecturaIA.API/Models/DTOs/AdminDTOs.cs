namespace LecturaIA.API.Models.DTOs;

// DTOs para gestión de usuarios
public class UsuarioAdminDto
{
    public int Id { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public DateTime? UltimoAcceso { get; set; }
    public bool Suspendido { get; set; }
    public string? MotivoSuspension { get; set; }
    public DateTime? FechaSuspension { get; set; }
}

public class SuspenderUsuarioDto
{
    public int UsuarioId { get; set; }
    public string Motivo { get; set; } = string.Empty;
}

public class ReactivarUsuarioDto
{
    public int UsuarioId { get; set; }
}

public class ReiniciarPasswordDto
{
    public int UsuarioId { get; set; }
    public string Motivo { get; set; } = string.Empty;
}

public class ReiniciarPasswordResponseDto
{
    public bool Exito { get; set; }
    public string? PasswordTemporal { get; set; }
    public string Mensaje { get; set; } = string.Empty;
}

// DTOs para códigos de registro de docentes
public class CodigoRegistroDocenteDto
{
    public int Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public string GeneradoPor { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }
    public string? UsadoPor { get; set; }
    public DateTime? FechaUso { get; set; }
}

public class GenerarCodigoDocenteDto
{
    public int AdministradorId { get; set; }
}

public class GenerarCodigoDocenteResponseDto
{
    public bool Exito { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Mensaje { get; set; } = string.Empty;
}

// DTO para estadísticas del dashboard
public class EstadisticasAdminDto
{
    public int TotalUsuarios { get; set; }
    public int TotalDocentes { get; set; }
    public int TotalEstudiantes { get; set; }
    public int UsuariosActivos { get; set; }
    public int UsuariosSuspendidos { get; set; }
    public int LecturasGeneradas { get; set; }
    public int CuestionariosCompletados { get; set; }
    public int AulasActivas { get; set; }
}
