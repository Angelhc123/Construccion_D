using LecturaIA.API.Models.DTOs;

namespace LecturaIA.API.Services;

public interface IAuthService
{
    Task<bool> RegistrarEstudiante(RegistroEstudianteDto dto);
    Task<bool> RegistrarDocente(RegistroDocenteDto dto);
    Task<object> Login(LoginDto dto); // Puede retornar AuthResponseDto o LoginRequiere2FADto
    Task<bool> VerificarEmail(string token);
    Task<bool> ReenviarVerificacion(string email);
    Task<bool> SolicitarRecuperacionPassword(string email);
    Task<bool> RestablecerPassword(string token, string nuevaPassword);
    Task<bool> VerificarEmailExiste(string email);
    
    // Métodos de doble autenticación (2FA)
    Task<AuthResponseDto?> VerificarCodigoLogin(string email, string codigo);
    Task<bool> ReenviarCodigoLogin(string email);
}
