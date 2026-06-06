using LecturaIA.API.Data;
using LecturaIA.API.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace LecturaIA.API.Services;

public class AyudaService
{
    private readonly ApplicationDbContext _context;

    public AyudaService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EstadoTutorialDto> ObtenerEstadoTutorial(int usuarioId)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Id == usuarioId);

        if (usuario == null)
        {
            throw new Exception("Usuario no encontrado");
        }

        return new EstadoTutorialDto
        {
            PrimeraSesion = usuario.PrimeraSesion
        };
    }

    public async Task MarcarTutorialVisto(int usuarioId)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Id == usuarioId);

        if (usuario == null)
        {
            throw new Exception("Usuario no encontrado");
        }

        usuario.PrimeraSesion = false;
        await _context.SaveChangesAsync();
    }
}
