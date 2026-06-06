using Microsoft.AspNetCore.Mvc;
using LecturaIA.API.Models.Entities;

namespace LecturaIA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GradosController : ControllerBase
{
    private readonly ILogger<GradosController> _logger;

    public GradosController(ILogger<GradosController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Obtiene la lista de grados disponibles para el ComboBox.
    /// </summary>
    /// <returns>Lista de opciones de grado con value y label</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<object>), StatusCodes.Status200OK)]
    public IActionResult ObtenerGrados()
    {
        try
        {
            var grados = Enum.GetValues<GradoEscolar>()
                .Select(g => new
                {
                    value = (int)g,
                    label = ObtenerEtiquetaGrado(g)
                })
                .ToList();
            return Ok(grados);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener grados");
            // Fail fast: error controlado
            return StatusCode(500, new { mensaje = "Error al obtener la lista de grados" });
        }
    }

    private static string ObtenerEtiquetaGrado(GradoEscolar grado)
    {
        return grado switch
        {
            GradoEscolar.Cuarto => "4to Grado",
            GradoEscolar.Quinto => "5to Grado",
            GradoEscolar.Sexto => "6to Grado",
            _ => grado.ToString()
        };
    }
}
