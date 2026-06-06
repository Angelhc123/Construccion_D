using LecturaIA.API.Data;
using LecturaIA.API.Models.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LecturaIA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeedController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SeedController(ApplicationDbContext context)
    {
        _context = context;
    }

    // POST: api/seed/admin
    /// <summary>
    /// Crea un usuario administrador si no existe uno con el mismo email.
    /// </summary>
    [HttpPost("admin")]
    public async Task<ActionResult> CrearAdministrador([FromBody] CrearAdminRequest request)
    {
        // Fail fast: email ya registrado
        if (await _context.Usuarios.AnyAsync(u => u.Email == request.Email))
        {
            return BadRequest(new { mensaje = "Ya existe un usuario con ese email" });
        }
        var admin = new Usuario
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            NombreCompleto = request.NombreCompleto,
            TipoUsuario = TipoUsuario.Administrador,
            FechaRegistro = DateTime.UtcNow,
            Activo = true,
            EmailVerificado = true // Admin no necesita verificar email
        };
        _context.Usuarios.Add(admin);
        await _context.SaveChangesAsync();
        return Ok(new
        {
            mensaje = "Administrador creado exitosamente",
            id = admin.Id,
            email = admin.Email,
            nombreCompleto = admin.NombreCompleto
        });
    }

    // POST: api/seed/reparar-docentes
    [HttpPost("reparar-docentes")]
    public async Task<ActionResult> RepararDocentes()
    {
        // Buscar usuarios tipo Docente que no tienen registro en tabla Docentes
        var usuariosDocente = await _context.Usuarios
            .Where(u => u.TipoUsuario == TipoUsuario.Docente)
            .ToListAsync();

        var docentesReparados = new List<object>();

        foreach (var usuario in usuariosDocente)
        {
            // Verificar si ya tiene registro de docente
            var docenteExiste = await _context.Docentes
                .AnyAsync(d => d.UsuarioId == usuario.Id);

            if (!docenteExiste)
            {
                // Crear registro de docente
                var docente = new Docente
                {
                    UsuarioId = usuario.Id
                };

                _context.Docentes.Add(docente);
                docentesReparados.Add(new
                {
                    usuarioId = usuario.Id,
                    email = usuario.Email,
                    nombreCompleto = usuario.NombreCompleto
                });
            }
        }

        if (docentesReparados.Any())
        {
            await _context.SaveChangesAsync();
            return Ok(new
            {
                mensaje = $"Se repararon {docentesReparados.Count} docentes",
                docentes = docentesReparados
            });
        }

        return Ok(new { mensaje = "Todos los docentes tienen su perfil completo" });
    }

    // GET: api/seed/diagnostico
    [HttpGet("diagnostico")]
    public async Task<ActionResult> Diagnostico()
    {
        var totalUsuarios = await _context.Usuarios.CountAsync();
        var totalDocentes = await _context.Docentes.CountAsync();
        var totalEstudiantes = await _context.Estudiantes.CountAsync();
        
        var usuariosDocente = await _context.Usuarios
            .Where(u => u.TipoUsuario == TipoUsuario.Docente)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.NombreCompleto,
                TienePerfilDocente = _context.Docentes.Any(d => d.UsuarioId == u.Id)
            })
            .ToListAsync();

        return Ok(new
        {
            totalUsuarios,
            totalDocentes,
            totalEstudiantes,
            usuariosDocente,
            docentesSinPerfil = usuariosDocente.Count(u => !u.TienePerfilDocente)
        });
    }
}

public class CrearAdminRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
}
