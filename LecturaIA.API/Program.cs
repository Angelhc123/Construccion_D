using LecturaIA.API.Data;
using LecturaIA.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;

namespace LecturaIA.API;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddControllers()
            .AddJsonOptions(options =>
            {
                // Configurar serialización de fechas - el cliente debe manejar la conversión a hora local
                options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.Never;
                // Asegurar que las propiedades se serializan en camelCase
                options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            });
        builder.Services.AddEndpointsApiExplorer();

        // Configure Swagger with JWT Authentication
        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
            {
                Title = "LecturaIA.API",
                Version = "v1"
            });

            // Agregar definición de seguridad JWT
            c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Description = "JWT Authorization header usando el esquema Bearer. Ejemplo: \"Bearer {token}\"",
                Name = "Authorization",
                In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
                Scheme = "Bearer"
            });

            // Agregar requerimiento de seguridad global
            c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
            {
                {
                    new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                    {
                        Reference = new Microsoft.OpenApi.Models.OpenApiReference
                        {
                            Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    new string[] {}
                }
            });
        });

        // Configure Database
        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

        // Configure JWT Authentication
        var jwtSettings = builder.Configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"]
            ?? throw new InvalidOperationException("JwtSettings:SecretKey no está configurada en la aplicación.");

        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings["Issuer"] ?? "LecturaIA",
                ValidAudience = jwtSettings["Audience"] ?? "LecturaIA",
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
            };
        });

        builder.Services.AddAuthorization();

        // Configure Email Settings
        builder.Services.Configure<LecturaIA.API.Configuration.EmailSettings>(
            builder.Configuration.GetSection("EmailSettings"));

        // Configure IA Settings
        builder.Services.Configure<LecturaIA.API.Configuration.IASettings>(
            builder.Configuration.GetSection("IASettings"));

        // Register Services
        builder.Services.AddScoped<IEmailService, EmailService>();
        builder.Services.AddScoped<IAuthService, AuthService>();
        builder.Services.AddScoped<AdminService>();
        builder.Services.AddScoped<AyudaService>();
        builder.Services.AddScoped<IPasswordService, PasswordService>();
        builder.Services.AddScoped<ExamenGrupalService>(); // CU-013: Exámenes Grupales
        builder.Services.AddHttpClient<ILecturaIAService, LecturaIAService>()
            .ConfigureHttpClient(client =>
            {
                client.Timeout = TimeSpan.FromMinutes(3); // 3 minutos para generación de lecturas
            });
        builder.Services.AddHttpClient<ICuestionarioIAService, CuestionarioIAService>()
            .ConfigureHttpClient(client =>
            {
                client.Timeout = TimeSpan.FromMinutes(2); // 2 minutos para cuestionarios
            });

        // Configure CORS
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend",
                policy =>
                {
                    policy.WithOrigins(
                            "http://localhost:5000",
                            "http://localhost:5000",
                            "http://localhost:5000",
                            "http://localhost:5000", // Vite ports local
                            "http://lecturasia.serveblog.net", // Producción
                            "https://lecturasia.serveblog.net", // Producción HTTPS
                            "https://construccion-d.vercel.app"
                          )
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
        });
        var app = builder.Build();

                using (var scope = app.Services.CreateScope())
        {
            var services = scope.ServiceProvider;

            try
            {
                var context = services.GetRequiredService<ApplicationDbContext>();

                context.Database.Migrate();
            }
            catch (Exception ex)
            {
                var logger = services.GetRequiredService<ILogger<Program>>();

                logger.LogError(ex, "Error aplicando migraciones");
            }
        }

        // Configure the HTTP request pipeline.
     //   if (app.Environment.IsDevelopment())
       // {
            app.UseSwagger();
            app.UseSwaggerUI();
        //}

        // UseHttpsRedirection deshabilitado en desarrollo local para usar HTTP

        // Servir archivos estáticos (imágenes generadas)
        app.UseStaticFiles();

        app.UseCors("AllowFrontend");

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        app.Run();
    }
}