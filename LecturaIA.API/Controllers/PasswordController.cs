using LecturaIA.API.Models.DTOs;
using LecturaIA.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LecturaIA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Estudiante,Docente")] // Solo estudiantes y docentes
public class PasswordController : ControllerBase
{
    private readonly IPasswordService _passwordService;
    private readonly ILogger<PasswordController> _logger;

    public PasswordController(IPasswordService passwordService, ILogger<PasswordController> logger)
    {
        _passwordService = passwordService;
        _logger = logger;
    }

    /// <summary>
    /// Cambiar contraseña del usuario autenticado (solo Estudiante o Docente)
    /// </summary>
    /// <summary>
    /// Cambia la contraseña del usuario autenticado (solo Estudiante o Docente).
    /// </summary>
    [HttpPost("cambiar")]
    public async Task<IActionResult> CambiarPassword([FromBody] CambiarPasswordDto dto)
    {
        try
        {
            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
            {
                // Fail fast: token inválido
                return Unauthorized(new { mensaje = "Token inválido" });
            }
            var (exito, mensaje) = await _passwordService.CambiarPassword(usuarioId, dto);
            if (!exito)
                return BadRequest(new { mensaje });
            return Ok(new { mensaje });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al cambiar contraseña");
            return StatusCode(500, new { mensaje = "Error al cambiar la contraseña" });
        }
    }

    /// <summary>
    /// Validar fortaleza de contraseña (endpoint público para validación en tiempo real)
    /// </summary>
    [HttpPost("validar")]
    [AllowAnonymous]
    public IActionResult ValidarFortaleza([FromBody] ValidarPasswordRequest request)
    {
        try
        {
            var validacion = _passwordService.ValidarFortalezaPassword(request.Password);
            return Ok(validacion);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al validar contraseña");
            return StatusCode(500, new { mensaje = "Error al validar la contraseña" });
        }
    }
}
