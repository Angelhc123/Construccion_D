namespace LecturaIA.API.Services
{
    public interface IEmailService
    {
        Task<bool> EnviarEmailVerificacion(string email, string token, string nombreCompleto);
        Task<bool> EnviarEmailRecuperacion(string email, string token, string nombreCompleto);
        Task<bool> EnviarCodigoVerificacionLogin(string email, string codigo, string nombreCompleto);
    }
}
