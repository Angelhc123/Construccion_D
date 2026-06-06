using System.Text;
using System.Text.Json;
using LecturaIA.API.Configuration;
using LecturaIA.API.Data;
using LecturaIA.API.Models.DTOs;
using Microsoft.Extensions.Options;

namespace LecturaIA.API.Services
{
    public interface ILecturaIAService
    {
        Task<(string titulo, string contenido, string urlImagen)> GenerarLecturaAsync(PreferenciasLecturaDto preferencias, string tipoLectura, int edad, string grado);
        Task<Models.Entities.Lectura?> GenerarLecturaParaExamenGrupalAsync(string temaConcepto, string tipoTexto, string longitudTexto, string gradoEscolar, string complejidad, int docenteId);
    }

    public class LecturaIAService : ILecturaIAService
    {
        private readonly HttpClient _httpClient;
        private readonly IASettings _iaSettings;
        private readonly ILogger<LecturaIAService> _logger;
        private readonly IWebHostEnvironment _environment;
        private readonly ApplicationDbContext _context;

        public LecturaIAService(
            HttpClient httpClient, 
            IOptions<IASettings> iaSettings, 
            ILogger<LecturaIAService> logger,
            IWebHostEnvironment environment,
            ApplicationDbContext context)
        {
            _httpClient = httpClient;
            _iaSettings = iaSettings.Value;
            _logger = logger;
            _environment = environment;
            _context = context;
        }

        public async Task<(string titulo, string contenido, string urlImagen)> GenerarLecturaAsync(
            PreferenciasLecturaDto preferencias, 
            string tipoLectura, 
            int edad, 
            string grado)
        {
            try
            {
                // PASO 1: Generar título y contenido con Gemini
                var (titulo, contenido) = await GenerarTextoConGeminiAsync(preferencias, tipoLectura, edad, grado);

                // PASO 2: Generar imagen con Hugging Face
                var urlImagen = string.Empty;

                return (titulo, contenido, urlImagen);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar lectura con IA para tipo {TipoLectura}", tipoLectura);
                throw;
            }
        }

        private async Task<(string titulo, string contenido)> GenerarTextoConGeminiAsync(
            PreferenciasLecturaDto preferencias,
            string tipoLectura,
            int edad,
            string grado)
        {
            _logger.LogInformation("📚 Iniciando generación de lectura con Gemini");
            
            var longitud = preferencias.Longitud.ToLower() switch
            {
                "corta" => "200",
                "mediana" => "400",
                "larga" => "700",
                _ => "400"
            };

            var temas = string.Join(", ", preferencias.Temas);
            var personajes = string.Join(", ", preferencias.Personajes);
            
            _logger.LogInformation("📝 Parámetros: Longitud={Longitud}, Temas={Temas}, Edad={Edad}", 
                longitud, temas, edad);

            var prompt = $@"Eres un escritor experto en literatura infantil. Respondes SOLO con JSON válido, sin texto adicional.
            
Crea una historia de tipo {tipoLectura} para un niño de {edad} años ({grado} grado de primaria).

PREFERENCIAS DEL NIÑO:
- Temas favoritos: {temas}
- Personajes preferidos: {personajes}
- Escenario: {preferencias.Escenario}
- Emoción deseada: {preferencias.Emocion}
- Propósito: {preferencias.Proposito}

INSTRUCCIONES IMPORTANTES:
1. La historia debe tener aproximadamente {longitud} palabras
2. Usa un lenguaje apropiado para su edad ({edad} años)
3. Incluye valores educativos sutiles
4. Debe ser {preferencias.Emocion.ToLower()}
5. El tipo de texto es {tipoLectura}

FORMATO DE RESPUESTA (JSON):
{{
  ""titulo"": ""Título creativo y atractivo para niños"",
  ""contenido"": ""Texto completo de la historia (aproximadamente {longitud} palabras)""
}}

Responde SOLO con el JSON, sin texto adicional.";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.7f,
                    maxOutputTokens = 6000
                }
            };

            var jsonContent = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={_iaSettings.GeminiApiKey}";
            
            // Sistema de reintentos
            for (int intento = 0; intento < 3; intento++)
            {
                try
                {
                    _logger.LogInformation("🔄 Intento {Intento}/3 de llamada a Gemini para lectura", intento + 1);
                    
                    var response = await _httpClient.PostAsync(apiUrl, content);
                    var responseContent = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                    {
                        _logger.LogWarning("❌ Error en Gemini API (Status {Status}): {Error}", 
                            response.StatusCode, responseContent);
                        
                        if (intento < 2)
                        {
                            await Task.Delay((int)Math.Pow(2, intento) * 1000);
                            content = new StringContent(jsonContent, Encoding.UTF8, "application/json"); // Renew content
                            continue;
                        }
                        throw new HttpRequestException($"Error en API de Gemini: {response.StatusCode} - {responseContent}");
                    }
                    
                    try 
                    {
                        var responseJson = JsonDocument.Parse(responseContent);
                        _logger.LogInformation("✅ Respuesta de Gemini recibida exitosamente");

                        if (!responseJson.RootElement.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
                        {
                            throw new Exception("La respuesta de Gemini no contiene 'candidates'.");
                        }

                        // Extraer el texto de la respuesta de Gemini
                        var textoRespuesta = candidates[0]
                            .GetProperty("content")
                            .GetProperty("parts")[0]
                            .GetProperty("text")
                            .GetString() ?? "";

                        // Extraer JSON de la respuesta
                        var startIdx = textoRespuesta.IndexOf('{');
                        var endIdx = textoRespuesta.LastIndexOf('}') + 1;
                        
                        if (startIdx >= 0 && endIdx > startIdx)
                        {
                            var jsonText = textoRespuesta.Substring(startIdx, endIdx - startIdx);
                            var lecturaJson = JsonDocument.Parse(jsonText);
                            
                            var titulo = lecturaJson.RootElement.GetProperty("titulo").GetString() ?? "Historia Mágica";
                            var contenido = lecturaJson.RootElement.GetProperty("contenido").GetString() ?? "";

                            _logger.LogInformation("📖 Lectura generada: {Titulo} ({Length} chars)", titulo, contenido.Length);
                            return (titulo, contenido);
                        }

                        throw new InvalidOperationException($"No se pudo extraer el JSON. Raw text: {textoRespuesta}");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "❌ Parseo fallido. RAW Response: {RawResponse}", responseContent);
                        throw;
                    }
                }
                catch (Exception ex) when (intento < 2)
                {
                    _logger.LogWarning(ex, "⚠️ Error en intento {Intento}, reintentando...", intento + 1);
                    await Task.Delay((int)Math.Pow(2, intento) * 1000);
                }
            }
            
            throw new InvalidOperationException("No se pudo generar la lectura después de 3 intentos");
        }

        private async Task<string> GenerarImagenConGeminiAsync(PreferenciasLecturaDto preferencias)
        {
            try
            {
                _logger.LogInformation("🎨 Iniciando generación de imagen con Gemini 3.1");
                
                var temas = string.Join(", ", preferencias.Temas);
                var personajes = string.Join(", ", preferencias.Personajes);

                var promptImagen = $"Children's book illustration, {preferencias.Escenario}, {personajes}, {temas}, colorful, friendly style, detailed, high quality, watercolor art";

                _logger.LogInformation("📝 Prompt de imagen: {Prompt}", promptImagen);

                var apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={_iaSettings.GeminiApiKey}";
                



                var requestBody = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[] { new { text = promptImagen } }
                        }
                    }
                };
                var jsonContent = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                _logger.LogInformation("📤 Enviando petición a Gemini API");
                var response = await _httpClient.PostAsync(apiUrl, content);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("❌ Error al generar imagen con Gemini - StatusCode: {StatusCode}, Response: {Response}", 
                        response.StatusCode, errorContent);
                    return "";
                }

                var responseString = await response.Content.ReadAsStringAsync();
                
                // Extraer base64 de la respuesta
                using var document = JsonDocument.Parse(responseString);
                var parts = document.RootElement.GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0];
                
                string base64Image = "";
                if (parts.TryGetProperty("inlineData", out var inlineData)) {
                    base64Image = inlineData.GetProperty("data").GetString() ?? "";
                } else if (parts.TryGetProperty("blob", out var blobData)) {
                    base64Image = blobData.GetProperty("data").GetString() ?? "";
                }
                
                if (string.IsNullOrEmpty(base64Image)) {
                    _logger.LogError("No se encontró la imagen en la respuesta.");
                    return "";
                }
                var imageBytes = Convert.FromBase64String(base64Image);
                _logger.LogInformation("✅ Imagen recibida de Gemini, tamaño: {Size} bytes", imageBytes.Length);
                
                // Guardar imagen en wwwroot usando la ruta correcta
                var wwwroot = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var imagesFolder = Path.Combine(wwwroot, "images", "lecturas");
                
                // Crear directorio si no existe
                if (!Directory.Exists(imagesFolder))
                {
                    Directory.CreateDirectory(imagesFolder);
                }
                
                var fileName = $"lectura_{Guid.NewGuid()}.png";
                var imagePath = Path.Combine(imagesFolder, fileName);
                
                await File.WriteAllBytesAsync(imagePath, imageBytes);

                _logger.LogInformation("💾 Imagen guardada en: {ImagePath}", imagePath);
                return $"/images/lecturas/{fileName}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error al guardar la imagen de Nano Banana");
                return "";
            }
        }

        /// <summary>
        /// Genera una lectura específica para un examen grupal con parámetros personalizados
        /// </summary>
        public async Task<Models.Entities.Lectura?> GenerarLecturaParaExamenGrupalAsync(
            string temaConcepto,
            string tipoTexto,
            string longitudTexto,
            string gradoEscolar,
            string complejidad,
            int docenteId)
        {
            try
            {
                _logger.LogInformation("📚 Generando lectura para examen grupal - Tema: {Tema}, Grado: {Grado}", 
                    temaConcepto, gradoEscolar);

                // Mapear parámetros
                var edad = gradoEscolar switch
                {
                    "4to" => 9,
                    "5to" => 10,
                    "6to" => 11,
                    _ => 10
                };

                var cantidadPalabras = longitudTexto switch
                {
                    "Corto" => "300",
                    "Medio" => "500",
                    "Largo" => "700",
                    _ => "500"
                };

                var nivelVocabulario = complejidad switch
                {
                    "Basica" => "vocabulario simple y oraciones cortas (8-12 palabras)",
                    "Intermedia" => "vocabulario moderado y oraciones medianas (10-15 palabras)",
                    "Avanzada" => "vocabulario rico y oraciones largas (12-18 palabras)",
                    _ => "vocabulario moderado"
                };

                // Prompt específico para examen grupal
                var prompt = $@"Eres un experto en crear textos educativos para evaluación escolar. Respondes SOLO con JSON válido.
                
Crea un texto de tipo {tipoTexto} sobre el tema: ""{temaConcepto}"" para estudiantes de {gradoEscolar} grado de primaria ({edad} años).

PARÁMETROS ESPECÍFICOS:
- Longitud: {cantidadPalabras} palabras (±20 palabras)
- Complejidad: {complejidad} - Usar {nivelVocabulario}
- Tipo de texto: {tipoTexto}
- Propósito: Evaluación académica grupal

INSTRUCCIONES IMPORTANTES:
1. El texto debe ser apropiado para {gradoEscolar} grado
2. Debe tener exactamente {cantidadPalabras} palabras aproximadamente
3. Debe incluir información que permita formular preguntas literales, inferenciales y críticas
4. El contenido debe ser educativo y preciso
5. Usar {nivelVocabulario}

FORMATO DE RESPUESTA (JSON):
{{
  ""titulo"": ""Título claro y descriptivo del tema"",
  ""contenido"": ""Texto completo de {cantidadPalabras} palabras aproximadamente""
}}

Responde SOLO con el JSON, sin texto adicional.";

                var requestBody = new
                {
                    contents = new[]
                    {
                        new 
                        { 
                            parts = new[] { new { text = prompt } } 
                        }
                    },
                    generationConfig = new
                    {
                        temperature = 0.6f,
                        maxOutputTokens = 6000
                    }
                };

                var apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={_iaSettings.GeminiApiKey}";
                var jsonContent = JsonSerializer.Serialize(requestBody);
                
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PostAsync(apiUrl, content);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Error al generar lectura con Gemini: {Error}", errorContent);
                    return null;
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                try
                {
                    var responseJson = JsonDocument.Parse(responseContent);
                    
                    if (!responseJson.RootElement.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
                    {
                        _logger.LogError("La respuesta de Gemini no contiene 'candidates'. RAW: {Raw}", responseContent);
                        return null;
                    }

                    var textoRespuesta = candidates[0]
                        .GetProperty("content")
                        .GetProperty("parts")[0]
                        .GetProperty("text")
                        .GetString() ?? "";

                    // Extraer JSON
                    var startIdx = textoRespuesta.IndexOf('{');
                    var endIdx = textoRespuesta.LastIndexOf('}') + 1;
                    
                    if (startIdx < 0 || endIdx <= startIdx)
                    {
                        _logger.LogError("No se pudo extraer JSON de la respuesta. RAW: {Raw}", textoRespuesta);
                        return null;
                    }

                    var jsonText = textoRespuesta.Substring(startIdx, endIdx - startIdx);
                    var lecturaJson = JsonDocument.Parse(jsonText);
                    
                    var titulo = lecturaJson.RootElement.GetProperty("titulo").GetString() ?? temaConcepto;
                    var contenido = lecturaJson.RootElement.GetProperty("contenido").GetString() ?? "";

                    // Generar imagen
                    var urlImagen = string.Empty;

                    // Crear entidad Lectura
                    var lectura = new Models.Entities.Lectura
                    {
                        EstudianteId = null, // Exámenes grupales no tienen estudiante específico
                        Titulo = titulo,
                        Contenido = contenido,
                        TipoLectura = tipoTexto,
                        Temas = temaConcepto,
                        Personajes = "Variados", // Para exámenes grupales
                        Escenario = "Educativo",
                        Longitud = longitudTexto,
                        Emocion = "Educativa",
                        Proposito = "Evaluación",
                        Estado = "generada",
                        FechaCreacion = DateTime.UtcNow,
                        UrlImagen = urlImagen
                    };

                    // Guardar la lectura en la base de datos para obtener el Id
                    _context.Lecturas.Add(lectura);
                await _context.SaveChangesAsync();

                _logger.LogInformation("✅ Lectura generada para examen grupal: {Titulo}", titulo);
                return lectura;                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error al generar lectura para examen grupal. RAW: {Raw}", responseContent);
                    return null;
                }            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar lectura para examen grupal");
                return null;
            }
        }

        private async Task<string> GenerarImagenExamenGrupalAsync(string temaConcepto)
        {
            try
            {
                _logger.LogInformation("🎨 Iniciando generación de imagen de examen grupal con Gemini 3.1");

                var promptImagen = $"Educational illustration for children, {temaConcepto}, colorful, clear, detailed, high quality, professional";

                var apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={_iaSettings.GeminiApiKey}";
                



                var requestBody = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[] { new { text = promptImagen } }
                        }
                    }
                };
                var jsonContent = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(apiUrl, content);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("No se pudo generar imagen (Status: {Status}), Error: {Error}", response.StatusCode, errorContent);
                    return "";
                }

                var responseString = await response.Content.ReadAsStringAsync();
                
                // Extraer base64 de la respuesta
                using var document = JsonDocument.Parse(responseString);
                var parts = document.RootElement.GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0];
                
                string base64Image = "";
                if (parts.TryGetProperty("inlineData", out var inlineData)) {
                    base64Image = inlineData.GetProperty("data").GetString() ?? "";
                } else if (parts.TryGetProperty("blob", out var blobData)) {
                    base64Image = blobData.GetProperty("data").GetString() ?? ""; // Asumiendo que podria retornar text en un caso especial
                }
                
                if (string.IsNullOrEmpty(base64Image)) {
                    _logger.LogError("No se encontró la imagen en la respuesta.");
                    return "";
                }
                var imageBytes = Convert.FromBase64String(base64Image);
                
                var wwwroot = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var imagesFolder = Path.Combine(wwwroot, "images", "examenes");
                
                if (!Directory.Exists(imagesFolder))
                {
                    Directory.CreateDirectory(imagesFolder);
                }
                
                var fileName = $"examen_{Guid.NewGuid()}.png";
                var imagePath = Path.Combine(imagesFolder, fileName);
                
                await File.WriteAllBytesAsync(imagePath, imageBytes);

                return $"/images/examenes/{fileName}";
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error al generar imagen para examen grupal");
                return "";
            }
        }
    }
}
