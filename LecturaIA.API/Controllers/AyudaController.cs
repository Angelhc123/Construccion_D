using LecturaIA.API.Models.DTOs;
using LecturaIA.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LecturaIA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AyudaController : ControllerBase
{
    private readonly AyudaService _ayudaService;

    public AyudaController(AyudaService ayudaService)
    {
        _ayudaService = ayudaService;
    }

    /// <summary>
    /// Obtiene el estado del tutorial para el usuario autenticado.
    /// </summary>
    [HttpGet("estado-tutorial")]
    public async Task<ActionResult<EstadoTutorialDto>> ObtenerEstadoTutorial()
    {
        try
        {
            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
            {
                return Unauthorized(new { mensaje = "Token inválido" });
            }
            var estado = await _ayudaService.ObtenerEstadoTutorial(usuarioId);
            return Ok(estado);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    /// <summary>
    /// Marca el tutorial como visto para el usuario autenticado.
    /// </summary>
    [HttpPost("marcar-tutorial-visto")]
    public async Task<ActionResult> MarcarTutorialVisto()
    {
        try
        {
            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
            {
                return Unauthorized(new { mensaje = "Token inválido" });
            }
            await _ayudaService.MarcarTutorialVisto(usuarioId);
            return Ok(new { mensaje = "Tutorial marcado como visto" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }
}
