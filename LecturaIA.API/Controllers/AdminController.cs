using LecturaIA.API.Models.DTOs;
using LecturaIA.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LecturaIA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")] // Solo administradores
public class AdminController : ControllerBase
{
    private readonly AdminService _adminService;

    public AdminController(AdminService adminService)
    {
        _adminService = adminService;
    }

    /// <summary>
    /// Obtiene la lista de usuarios administrados, filtrando opcionalmente por email.
    /// </summary>
    /// <param name="email">Email a filtrar (opcional)</param>
    [HttpGet("usuarios")]
    public async Task<ActionResult<List<UsuarioAdminDto>>> ObtenerUsuarios([FromQuery] string? email = null)
    {
        var usuarios = await _adminService.ObtenerTodosLosUsuarios(email);
        return Ok(usuarios);
    }

    /// <summary>
    /// Suspende un usuario dado su información.
    /// </summary>
    [HttpPost("usuarios/suspender")]
    public async Task<ActionResult> SuspenderUsuario([FromBody] SuspenderUsuarioDto dto)
    {
        var resultado = await _adminService.SuspenderUsuario(dto);
        if (!resultado)
        {
            // Fail fast: retorna inmediatamente si falla
            return BadRequest(new { mensaje = "No se pudo suspender el usuario" });
        }
        return Ok(new { mensaje = "Usuario suspendido correctamente" });
    }

    /// <summary>
    /// Reactiva un usuario dado su información.
    /// </summary>
    [HttpPost("usuarios/reactivar")]
    public async Task<ActionResult> ReactivarUsuario([FromBody] ReactivarUsuarioDto dto)
    {
        var resultado = await _adminService.ReactivarUsuario(dto);
        if (!resultado)
        {
            // Fail fast: retorna inmediatamente si falla
            return BadRequest(new { mensaje = "No se pudo reactivar el usuario" });
        }
        return Ok(new { mensaje = "Usuario reactivado correctamente" });
    }

    /// <summary>
    /// Reinicia la contraseña de un usuario.
    /// </summary>
    [HttpPost("usuarios/reiniciar-password")]
    public async Task<ActionResult<ReiniciarPasswordResponseDto>> ReiniciarPassword([FromBody] ReiniciarPasswordDto dto)
    {
        var resultado = await _adminService.ReiniciarPassword(dto);
        if (!resultado.Exito)
        {
            // Fail fast: retorna inmediatamente si falla
            return BadRequest(resultado);
        }
        return Ok(resultado);
    }

    /// <summary>
    /// Obtiene estadísticas generales para el panel de administración.
    /// </summary>
    [HttpGet("estadisticas")]
    public async Task<ActionResult<EstadisticasAdminDto>> ObtenerEstadisticas()
    {
        var estadisticas = await _adminService.ObtenerEstadisticas();
        return Ok(estadisticas);
    }
}
