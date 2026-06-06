using LecturaIA.API.Models.DTOs;
using LecturaIA.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace LecturaIA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private const string DatosInvalidosMensaje = "Datos inválidos";
    private const string EmailYaRegistradoMensaje = "Este correo ya está registrado. ¿Deseas iniciar sesión?";
    private const string RegistroFallidoMensaje = "No se pudo completar el registro. Intenta nuevamente";
    private const string RegistroExitosoMensaje = "Registro exitoso. Por favor, verifica tu correo electrónico para activar tu cuenta";

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Registra un nuevo estudiante.
    /// </summary>
    [HttpPost("registro/estudiante")]
    public async Task<ActionResult> RegistrarEstudiante([FromBody] RegistroEstudianteDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { mensaje = DatosInvalidosMensaje, errores = ModelState });
        }
        // Fail fast: email duplicado
        var emailExiste = await _authService.VerificarEmailExiste(dto.Email);
        if (emailExiste)
        {
            return BadRequest(new { mensaje = EmailYaRegistradoMensaje });
        }
        var resultado = await _authService.RegistrarEstudiante(dto);
        if (!resultado)
        {
            return BadRequest(new { mensaje = RegistroFallidoMensaje });
        }
        return Ok(new { mensaje = RegistroExitosoMensaje, email = dto.Email });
    }

    /// <summary>
    /// Registra un nuevo docente.
    /// </summary>
    [HttpPost("registro/docente")]
    public async Task<ActionResult> RegistrarDocente([FromBody] RegistroDocenteDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { mensaje = DatosInvalidosMensaje, errores = ModelState });
        }
        // Fail fast: email duplicado
        var emailExiste = await _authService.VerificarEmailExiste(dto.Email);
        if (emailExiste)
        {
            return BadRequest(new { mensaje = EmailYaRegistradoMensaje });
        }
        var resultado = await _authService.RegistrarDocente(dto);
        if (!resultado)
        {
            return BadRequest(new { mensaje = RegistroFallidoMensaje });
        }
        return Ok(new { mensaje = RegistroExitosoMensaje, email = dto.Email });
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { mensaje = DatosInvalidosMensaje, errores = ModelState });
        }

        var resultado = await _authService.Login(dto);

        if (resultado == null)
        {
            return Unauthorized(new
            {
                mensaje = "Correo o contraseña incorrectos, o email no verificado. Verifica tus datos e intenta nuevamente"
            });
        }

        // Si la cuenta está suspendida
        if (resultado is LoginCuentaSuspendidaDto cuentaSuspendida)
        {
            return StatusCode(403, new
            {
                cuentaSuspendida = true,
                mensaje = cuentaSuspendida.Mensaje
            });
        }

        // Si el resultado es LoginRequiere2FADto, retornar indicando que requiere código
        if (resultado is LoginRequiere2FADto requiere2FA)
        {
            return Ok(requiere2FA);
        }

        // Si es AuthResponseDto, retornar token JWT
        return Ok(new
        {
            mensaje = "Inicio de sesión exitoso",
            data = resultado
        });
    }

    [HttpPost("verificar-email")]
    public async Task<ActionResult> VerificarEmail([FromBody] VerificarEmailDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { mensaje = "Token inválido", errores = ModelState });
        }

        var resultado = await _authService.VerificarEmail(dto.Token);

        if (!resultado)
        {
            return BadRequest(new
            {
                mensaje = "Token de verificación inválido o expirado"
            });
        }

        return Ok(new
        {
            mensaje = "Email verificado exitosamente. Ya puedes iniciar sesión"
        });
    }

    [HttpPost("reenviar-verificacion")]
    public async Task<ActionResult> ReenviarVerificacion([FromBody] ReenviarVerificacionDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { mensaje = "Email inválido", errores = ModelState });
        }

        var resultado = await _authService.ReenviarVerificacion(dto.Email);

        if (!resultado)
        {
            return BadRequest(new
            {
                mensaje = "No se pudo reenviar el email. Verifica que el correo esté registrado y no verificado"
            });
        }

        return Ok(new
        {
            mensaje = "Email de verificación reenviado. Revisa tu bandeja de entrada"
        });
    }

    [HttpPost("solicitar-recuperacion")]
    public async Task<ActionResult> SolicitarRecuperacion([FromBody] SolicitarRecuperacionDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { mensaje = "Email inválido", errores = ModelState });
        }

        await _authService.SolicitarRecuperacionPassword(dto.Email);

        // Por seguridad, siempre devolvemos éxito aunque el email no exista
        return Ok(new
        {
            mensaje = "Si el correo está registrado, recibirás un email con instrucciones para restablecer tu contraseña"
        });
    }

    [HttpPost("restablecer-password")]
    public async Task<ActionResult> RestablecerPassword([FromBody] RestablecerPasswordDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { mensaje = DatosInvalidosMensaje, errores = ModelState });
        }

        var resultado = await _authService.RestablecerPassword(dto.Token, dto.NuevaPassword);

        if (!resultado)
        {
            return BadRequest(new
            {
                mensaje = "Token inválido o expirado"
            });
        }

        return Ok(new
        {
            mensaje = "Contraseña restablecida exitosamente. Ya puedes iniciar sesión"
        });
    }

    [HttpPost("verificar-codigo-login")]
    public async Task<ActionResult<AuthResponseDto>> VerificarCodigoLogin([FromBody] VerificarCodigoLoginDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { mensaje = DatosInvalidosMensaje, errores = ModelState });
        }

        var resultado = await _authService.VerificarCodigoLogin(dto.Email, dto.Codigo);

        if (resultado == null)
        {
            return Unauthorized(new
            {
                mensaje = "Código inválido o expirado. Verifica el código e intenta nuevamente"
            });
        }

        return Ok(new
        {
            mensaje = "Verificación exitosa. Inicio de sesión completado",
            data = resultado
        });
    }

    [HttpPost("reenviar-codigo-login")]
    public async Task<ActionResult> ReenviarCodigoLogin([FromBody] ReenviarCodigoLoginDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { mensaje = "Email inválido", errores = ModelState });
        }

        var resultado = await _authService.ReenviarCodigoLogin(dto.Email);

        if (!resultado)
        {
            return BadRequest(new
            {
                mensaje = "No se pudo reenviar el código. Intenta nuevamente"
            });
        }

        return Ok(new
        {
            mensaje = "Se ha enviado un nuevo código de verificación a tu correo electrónico"
        });
    }
}
