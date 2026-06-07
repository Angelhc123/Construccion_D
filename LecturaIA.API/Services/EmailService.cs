using LecturaIA.API.Configuration;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace LecturaIA.API.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(
            IOptions<EmailSettings> emailSettings,
            IConfiguration configuration,
            ILogger<EmailService> logger)
        {
            _emailSettings = emailSettings.Value;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> EnviarEmailVerificacion(string email, string token, string nombreCompleto)
        {
            try
            {
                var frontendUrl = _configuration["VerificationSettings:FrontendUrl"];
                var verificationUrl = $"{frontendUrl}/verificar-email?token={token}";
                var subject = "Verifica tu cuenta - LecturaIA";
                var body = $@"<html><body style='font-family: Arial, sans-serif;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <h2 style='color: #4F46E5;'>¡Bienvenido a LecturaIA, {nombreCompleto}!</h2>
                        <p>Para activar tu cuenta, haz clic en el siguiente botón:</p>
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='{verificationUrl}' style='background-color: #4F46E5; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px;'>
                                Verificar mi cuenta
                            </a>
                        </div>
                        <p>O copia este enlace: {verificationUrl}</p>
                        <p style='color: #9CA3AF; font-size: 12px;'>Este enlace expirará en 24 horas.</p>
                    </div></body></html>";
                return await EnviarEmail(email, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al enviar email de verificación a {Email}", email);
                return false;
            }
        }

        public async Task<bool> EnviarEmailRecuperacion(string email, string token, string nombreCompleto)
        {
            try
            {
                var frontendUrl = _configuration["VerificationSettings:FrontendUrl"];
                var resetUrl = $"{frontendUrl}/restablecer-password?token={token}";
                var subject = "Recuperación de contraseña - LecturaIA";
                var body = $@"<html><body style='font-family: Arial, sans-serif;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <h2 style='color: #DC2626;'>Recuperación de Contraseña</h2>
                        <p>Hola {nombreCompleto}, para restablecer tu contraseña haz clic aquí:</p>
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='{resetUrl}' style='background-color: #DC2626; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px;'>
                                Restablecer Contraseña
                            </a>
                        </div>
                        <p>O copia este enlace: {resetUrl}</p>
                        <p style='color: #9CA3AF; font-size: 12px;'>Este enlace expirará en 24 horas.</p>
                    </div></body></html>";
                return await EnviarEmail(email, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al enviar email de recuperación a {Email}", email);
                return false;
            }
        }

        public async Task<bool> EnviarCodigoVerificacionLogin(string email, string codigo, string nombreCompleto)
        {
            try
            {
                var subject = "Código de verificación - LecturaIA";
                var body = $@"<html><body style='font-family: Arial, sans-serif;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <h2 style='color: #4F46E5;'>Código de Verificación</h2>
                        <p>Hola {nombreCompleto}, tu código es:</p>
                        <div style='text-align: center; margin: 30px 0;'>
                            <span style='font-size: 36px; font-weight: bold; color: #4F46E5; letter-spacing: 8px;'>{codigo}</span>
                        </div>
                        <p style='color: #6B7280;'>Este código expira en 10 minutos.</p>
                    </div></body></html>";
                return await EnviarEmail(email, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al enviar código de verificación a {Email}", email);
                return false;
            }
        }

        private async Task<bool> EnviarEmail(string destinatario, string asunto, string cuerpoHtml)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.SenderEmail));
                message.To.Add(new MailboxAddress("", destinatario));
                message.Subject = asunto;
                message.Body = new BodyBuilder { HtmlBody = cuerpoHtml }.ToMessageBody();

                using var smtp = new SmtpClient();
                await smtp.ConnectAsync(_emailSettings.SmtpServer, _emailSettings.SmtpPort, SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(_emailSettings.Username, _emailSettings.Password);
                await smtp.SendAsync(message);
                await smtp.DisconnectAsync(true);

                _logger.LogInformation("Email enviado exitosamente a {Email}", destinatario);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error crítico al enviar email a {Email}", destinatario);
                return false;
            }
        }
    }
}