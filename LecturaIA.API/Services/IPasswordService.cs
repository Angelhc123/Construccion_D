using LecturaIA.API.Models.DTOs;

namespace LecturaIA.API.Services;

public interface IPasswordService
{
    Task<(bool exito, string mensaje)> CambiarPassword(int usuarioId, CambiarPasswordDto dto);
    ValidacionPasswordDto ValidarFortalezaPassword(string password);
}
