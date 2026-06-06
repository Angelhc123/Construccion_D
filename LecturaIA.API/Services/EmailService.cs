using LecturaIA.API.Configuration;
using Microsoft.Extensions.Options;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;

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
                var body = $@"
                    <html>
                    <body style='font-family: Arial, sans-serif;'>
                        <div style='max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;'>
                            <div style='background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                                <h2 style='color: #4F46E5; margin-bottom: 20px;'>¡Bienvenido a LecturaIA, {nombreCompleto}!</h2>
                                <p style='color: #374151; font-size: 16px; line-height: 1.6;'>
                                    Gracias por registrarte en nuestra plataforma educativa de comprensión lectora.
                                </p>
                                <p style='color: #374151; font-size: 16px; line-height: 1.6;'>
                                    Para activar tu cuenta, haz clic en el siguiente botón:
                                </p>
                                <div style='text-align: center; margin: 30px 0;'>
                                    <a href='{verificationUrl}' 
                                       style='background-color: #4F46E5; 
                                              color: white; 
                                              padding: 14px 40px; 
                                              text-decoration: none; 
                                              border-radius: 8px;
                                              display: inline-block;
                                              font-weight: bold;
                                              font-size: 16px;'>
                                        Verificar mi cuenta
                                    </a>
                                </div>
                                <p style='color: #6B7280; font-size: 14px; margin-top: 30px;'>
                                    Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
                                </p>
                                <p style='color: #4F46E5; font-size: 12px; word-break: break-all;'>
                                    {verificationUrl}
                                </p>
                                <hr style='border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;' />
                                <p style='color: #9CA3AF; font-size: 12px; text-align: center;'>
                                    Este enlace expirará en 24 horas. Si no solicitaste este registro, ignora este correo.
                                </p>
                            </div>
                        </div>
                    </body>
                    </html>";

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
                var body = $@"
                    <html>
                    <body style='font-family: Arial, sans-serif;'>
                        <div style='max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;'>
                            <div style='background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                                <h2 style='color: #DC2626; margin-bottom: 20px;'>Recuperación de Contraseña</h2>
                                <p style='color: #374151; font-size: 16px; line-height: 1.6;'>
                                    Hola {nombreCompleto},
                                </p>
                                <p style='color: #374151; font-size: 16px; line-height: 1.6;'>
                                    Recibimos una solicitud para restablecer tu contraseña. Si no realizaste esta solicitud, 
                                    puedes ignorar este correo de forma segura.
                                </p>
                                <p style='color: #374151; font-size: 16px; line-height: 1.6;'>
                                    Para restablecer tu contraseña, haz clic en el siguiente botón:
                                </p>
                                <div style='text-align: center; margin: 30px 0;'>
                                    <a href='{resetUrl}' 
                                       style='background-color: #DC2626; 
                                              color: white; 
                                              padding: 14px 40px; 
                                              text-decoration: none; 
                                              border-radius: 8px;
                                              display: inline-block;
                                              font-weight: bold;
                                              font-size: 16px;'>
                                        Restablecer Contraseña
                                    </a>
                                </div>
                                <p style='color: #6B7280; font-size: 14px; margin-top: 30px;'>
                                    Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
                                </p>
                                <p style='color: #DC2626; font-size: 12px; word-break: break-all;'>
                                    {resetUrl}
                                </p>
                                <hr style='border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;' />
                                <p style='color: #9CA3AF; font-size: 12px; text-align: center;'>
                                    Este enlace expirará en 24 horas por razones de seguridad.
                                </p>
                            </div>
                        </div>
                    </body>
                    </html>";

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
                var body = $@"
                    <html>
                    <body style='font-family: Arial, sans-serif;'>
                        <div style='max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;'>
                            <div style='background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                                <h2 style='color: #4F46E5; margin-bottom: 20px;'>Código de Verificación</h2>
                                <p style='color: #374151; font-size: 16px; line-height: 1.6;'>
                                    Hola {nombreCompleto},
                                </p>
                                <p style='color: #374151; font-size: 16px; line-height: 1.6;'>
                                    Has iniciado sesión en LecturaIA. Para completar el acceso, utiliza el siguiente código de verificación:
                                </p>
                                <div style='text-align: center; margin: 30px 0;'>
                                    <div style='display: inline-block; 
                                                background-color: #EEF2FF; 
                                                padding: 20px 40px; 
                                                border-radius: 10px;
                                                border: 2px dashed #4F46E5;'>
                                        <span style='font-size: 36px; 
                                                     font-weight: bold; 
                                                     color: #4F46E5; 
                                                     letter-spacing: 8px;'>
                                            {codigo}
                                        </span>
                                    </div>
                                </div>
                                <p style='color: #6B7280; font-size: 14px; line-height: 1.6;'>
                                    <strong>⏱️ Este código expira en 10 minutos.</strong>
                                </p>
                                <p style='color: #6B7280; font-size: 14px; line-height: 1.6;'>
                                    Si no solicitaste este código, ignora este mensaje. Tu cuenta permanece segura.
                                </p>
                                <hr style='border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;'>
                                <p style='color: #9CA3AF; font-size: 12px; text-align: center;'>
                                    Este es un email automático de LecturaIA - Sistema de Comprensión Lectora<br>
                                    Por favor no respondas a este correo
                                </p>
                            </div>
                        </div>
                    </body>
                    </html>";

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
                var email = new MimeMessage();
                email.From.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.SenderEmail));
                email.To.Add(MailboxAddress.Parse(destinatario));
                email.Subject = asunto;
                email.Body = new TextPart(TextFormat.Html) { Text = cuerpoHtml };

                using var smtp = new SmtpClient();
                
                // Conectar usando STARTTLS si EnableSsl es true
                await smtp.ConnectAsync(
                    _emailSettings.SmtpServer, 
                    _emailSettings.SmtpPort, 
                    _emailSettings.EnableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto);

                // Autenticar
                await smtp.AuthenticateAsync(_emailSettings.Username, _emailSettings.Password);
                
                // Enviar y desconectar
                await smtp.SendAsync(email);
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
