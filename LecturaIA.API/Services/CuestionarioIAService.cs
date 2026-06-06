using System.Text;
using System.Text.Json;
using LecturaIA.API.Configuration;
using LecturaIA.API.Data;
using LecturaIA.API.Models.DTOs;
using LecturaIA.API.Models.Entities;
using Microsoft.Extensions.Options;

namespace LecturaIA.API.Services
{
    /// <summary>
    /// Interfaz para el servicio de generación de cuestionarios
    /// </summary>
    public interface ICuestionarioIAService
    {
        /// <summary>
        /// CU-006: Genera un cuestionario de 10 preguntas usando IA
        /// </summary>
        Task<List<Pregunta>> GenerarCuestionarioAsync(
            string contenidoLectura,
            string tituloLectura,
            string tipoTexto,
            string nivelDificultad,
            int edad);

        /// <summary>
        /// CU-007: Evalúa respuestas abiertas usando IA
        /// </summary>
        Task<(decimal puntaje, string retroalimentacion)> EvaluarRespuestaAbiertaAsync(
            string pregunta,
            string respuestaEstudiante,
            string contenidoLectura,
            int edad);

        /// <summary>
        /// CU-007: Genera retroalimentación personalizada
        /// </summary>
        Task<string> GenerarRetroalimentacionPersonalizadaAsync(
            int puntajeTotal,
            int correctasLiterales,
            int correctasAnaliticas,
            decimal puntajeCriticas,
            string nivelDificultad,
            int edad);

        /// <summary>
        /// CU-013: Genera cuestionario específico para examen grupal
        /// </summary>
        Task<Cuestionario?> GenerarCuestionarioParaExamenGrupalAsync(
            int lecturaId,
            string contenidoLectura,
            int cantidadPreguntas,
            string gradoEscolar);
    }

    public class CuestionarioIAService : ICuestionarioIAService
    {
        private readonly HttpClient _httpClient;
        private readonly IASettings _iaSettings;
        private readonly ILogger<CuestionarioIAService> _logger;
        private readonly ApplicationDbContext _context;

        public CuestionarioIAService(
            HttpClient httpClient,
            IOptions<IASettings> iaSettings,
            ILogger<CuestionarioIAService> logger,
            ApplicationDbContext context)
        {
            _httpClient = httpClient;
            _iaSettings = iaSettings.Value;
            _logger = logger;
            _context = context;
        }

        /// <summary>
        /// CU-006: Genera 10 preguntas (4 Literales, 4 Analíticas, 2 Críticas)
        /// </summary>
        public async Task<List<Pregunta>> GenerarCuestionarioAsync(
            string contenidoLectura,
            string tituloLectura,
            string tipoTexto,
            string nivelDificultad,
            int edad)
        {
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            try
            {
                _logger.LogInformation("🤖 Iniciando generación de cuestionario con IA para: {Titulo}", tituloLectura);
                _logger.LogInformation("📊 Lectura: {Length} chars, Nivel: {Nivel}, Edad: {Edad}", 
                    contenidoLectura.Length, nivelDificultad, edad);
                
                var prompt = ConstruirPromptCuestionario(
                    contenidoLectura,
                    tituloLectura,
                    tipoTexto,
                    nivelDificultad,
                    edad);

                _logger.LogInformation("📝 Prompt construido en {Ms}ms (longitud: {Length} chars)", 
                    stopwatch.ElapsedMilliseconds, prompt.Length);

                var llamadaStart = stopwatch.ElapsedMilliseconds;
                var respuestaIA = await LlamarGeminiAsync(prompt);
                _logger.LogInformation("⏱️ Llamada a Gemini completada en {Ms}ms", 
                    stopwatch.ElapsedMilliseconds - llamadaStart);

                var parseStart = stopwatch.ElapsedMilliseconds;
                var preguntas = ParsearPreguntasDeRespuesta(respuestaIA);
                _logger.LogInformation("📦 Parseo completado en {Ms}ms", 
                    stopwatch.ElapsedMilliseconds - parseStart);

                if (preguntas.Count != 10)
                {
                    _logger.LogWarning("⚠️ Se esperaban 10 preguntas pero se generaron {Count}", preguntas.Count);
                }

                stopwatch.Stop();
                _logger.LogInformation("✅ Cuestionario generado exitosamente: {Count} preguntas en {TotalMs}ms ({Seconds}s)", 
                    preguntas.Count, stopwatch.ElapsedMilliseconds, stopwatch.Elapsed.TotalSeconds);
                return preguntas;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error crítico al generar cuestionario con IA");
                
                // Si falla después de todos los reintentos, lanzar excepción clara
                throw new Exception(
                    $"No se pudo generar el cuestionario después de múltiples intentos. " +
                    $"Error: {ex.Message}. Por favor, intenta más tarde o contacta al administrador.", 
                    ex);
            }
        }

        /// <summary>
        /// Construye el prompt para Gemini 2.0
        /// </summary>
        private string ConstruirPromptCuestionario(
            string contenido,
            string titulo,
            string tipoTexto,
            string nivel,
            int edad)
        {
            // Limitar contenido si es muy largo
            var contenidoLimitado = contenido.Length > 3000 
                ? contenido.Substring(0, 3000) 
                : contenido;

            return $@"Eres un experto en evaluación de comprensión lectora para niños de {edad} años.

TEXTO A ANALIZAR:
{contenidoLimitado}

TAREA: Genera exactamente 10 preguntas de comprensión lectora basadas en el texto anterior.

DISTRIBUCIÓN OBLIGATORIA:
- 4 preguntas de tipo LITERAL
- 4 preguntas de tipo ANALÍTICA  
- 2 preguntas de tipo CRÍTICA

DESCRIPCIÓN DE CADA TIPO:

1. PREGUNTAS LITERALES:
   - Evalúan información EXPLÍCITA del texto
   - Respuesta directa que aparece textualmente
   - Ejemplos: ¿Quién...? ¿Dónde...? ¿Cuándo...? ¿Qué hizo...?
   - Formato: Opción múltiple con 4 alternativas
   - Una sola respuesta correcta

2. PREGUNTAS ANALÍTICAS:
   - Requieren INFERENCIA y relación de ideas
   - La respuesta NO está explícita, hay que deducirla
   - Ejemplos: ¿Por qué...? ¿Cómo se relaciona...? ¿Qué significa...?
   - Formato: Opción múltiple con 4 alternativas
   - Una sola respuesta correcta

3. PREGUNTAS CRÍTICAS:
   - Requieren REFLEXIÓN PERSONAL y juicio valorativo
   - El estudiante debe evaluar y emitir una opinión
   - Ejemplos: ¿Qué opinas sobre...? ¿Cuál crees que es la mejor...? ¿Qué habrías hecho tú...?
   - Formato: Opción múltiple con 4 alternativas
   - Una sola respuesta correcta (la más razonable/apropiada)

NIVEL DE DIFICULTAD: {nivel}
TIPO DE TEXTO: {tipoTexto}
EDAD DEL ESTUDIANTE: {edad} años

INSTRUCCIONES CRÍTICAS:
- TODAS las 10 preguntas DEBEN ser de opción múltiple con exactamente 4 opciones
- NO generes preguntas abiertas
- Las preguntas críticas también tienen 4 opciones donde una es la más apropiada
- Las preguntas deben ser apropiadas para la edad
- Usa lenguaje claro y sencillo
- Las opciones incorrectas deben ser plausibles pero claramente incorrectas
- Cada pregunta debe tener una explicación breve de por qué la respuesta es correcta
- Enumera las preguntas del 1 al 10

FORMATO DE SALIDA (JSON):
{{
  ""preguntas"": [
    {{
      ""orden"": 1,
      ""tipo"": ""Literal"",
      ""formato"": ""OpcionMultiple"",
      ""textoPregunta"": ""¿Quién es el personaje principal?"",
      ""opciones"": [""Opción A"", ""Opción B"", ""Opción C"", ""Opción D""],
      ""respuestaCorrecta"": ""Opción A"",
      ""explicacion"": ""La respuesta correcta es A porque...""
    }},
    {{
      ""orden"": 9,
      ""tipo"": ""Critica"",
      ""formato"": ""OpcionMultiple"",
      ""textoPregunta"": ""¿Qué opinas sobre la decisión del personaje?"",
      ""opciones"": [""Fue muy acertada porque..."", ""Fue incorrecta porque..."", ""Podría haber sido mejor si..."", ""No importa mucho porque...""],
      ""respuestaCorrecta"": ""Fue muy acertada porque..."",
      ""explicacion"": ""Esta es la opción más razonable considerando el contexto de la historia""
    }}
  ]
}}

IMPORTANTE: 
- Responde ÚNICAMENTE con el JSON, sin texto adicional antes o después
- TODAS las preguntas deben tener formato ""OpcionMultiple""
- TODAS las preguntas deben tener exactamente 4 opciones en el array ""opciones""
- NINGUNA pregunta debe tener formato ""Abierta""";
        }

        /// <summary>
        /// CU-007: Evalúa una respuesta abierta (pregunta crítica)
        /// </summary>
        public async Task<(decimal puntaje, string retroalimentacion)> EvaluarRespuestaAbiertaAsync(
            string pregunta,
            string respuestaEstudiante,
            string contenidoLectura,
            int edad)
        {
            try
            {
                var prompt = $@"Eres un evaluador de comprensión lectora infantil.

CONTEXTO DE LA LECTURA:
{contenidoLectura.Substring(0, Math.Min(1000, contenidoLectura.Length))}...

PREGUNTA CRÍTICA:
{pregunta}

RESPUESTA DEL ESTUDIANTE ({edad} años):
{respuestaEstudiante}

INSTRUCCIONES DE EVALUACIÓN:
1. Evalúa la respuesta del estudiante en escala 0.0 a 1.0
2. Considera:
   - ¿Responde a la pregunta?
   - ¿Tiene coherencia?
   - ¿Muestra reflexión personal?
   - ¿Relaciona con el texto?
   - Vocabulario apropiado para {edad} años

CRITERIOS DE PUNTAJE:
- 0.0-0.3: No responde o respuesta incoherente
- 0.4-0.6: Responde parcialmente, poca justificación
- 0.7-0.8: Buena respuesta, bien fundamentada
- 0.9-1.0: Excelente, reflexión profunda

FORMATO DE RESPUESTA (JSON):
{{
  ""puntaje"": 0.8,
  ""retroalimentacion"": ""Tu respuesta muestra una buena reflexión...""
}}

Genera solo el JSON:";

                var respuestaIA = await LlamarGeminiAsync(prompt);
                return ParsearEvaluacionRespuestaAbierta(respuestaIA);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al evaluar respuesta abierta");
                // En caso de error, asignar puntaje neutral
                return (0.5m, "No se pudo evaluar la respuesta automáticamente");
            }
        }

        /// <summary>
        /// CU-007: Genera retroalimentación personalizada basada en desempeño
        /// </summary>
        public async Task<string> GenerarRetroalimentacionPersonalizadaAsync(
            int puntajeTotal,
            int correctasLiterales,
            int correctasAnaliticas,
            decimal puntajeCriticas,
            string nivelDificultad,
            int edad)
        {
            try
            {
                var prompt = $@"Eres un tutor virtual experto en comprensión lectora infantil.

DESEMPEÑO DEL ESTUDIANTE:
- Edad: {edad} años
- Nivel: {nivelDificultad}
- Puntaje Total: {puntajeTotal}/10 ({puntajeTotal * 10}%)
- Literales correctas: {correctasLiterales}/4
- Analíticas correctas: {correctasAnaliticas}/4
- Críticas: {puntajeCriticas:F2}/2

TAREA:
Genera una retroalimentación personalizada, motivadora y pedagógica en formato JSON.

ESTRUCTURA REQUERIDA:
{{
  ""retroalimentacion"": {{
    ""logros"": ""Reconoce los logros específicos del estudiante"",
    ""mejora"": ""Identifica áreas de mejora (sin ser negativo)"",
    ""consejos"": ""Da consejos prácticos para mejorar"",
    ""animo"": ""Mensaje motivador para seguir practicando""
  }}
}}

TONO:
- Amigable y motivador
- Apropiado para {edad} años
- Celebra esfuerzo, no solo resultado
- Constructivo

LONGITUD: Cada campo debe tener 2-3 oraciones.

Genera SOLO el JSON (sin texto adicional antes o después):";

                var retroalimentacion = await LlamarGeminiAsync(prompt);
                var textoLimpio = LimpiarTextoRespuesta(retroalimentacion);
                
                _logger.LogInformation("🔍 Retroalimentación generada (limpia): {Retro}", textoLimpio);
                
                return textoLimpio;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar retroalimentación");
                return GenerarRetroalimentacionPorDefecto(puntajeTotal);
            }
        }

        // ========================================
        // MÉTODOS AUXILIARES
        // ========================================

        private async Task<string> LlamarGeminiAsync(string prompt, int maxReintentos = 3)
        {
            var apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={_iaSettings.GeminiApiKey}";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[] { new { text = "Instrucción del sistema: Eres un experto en evaluar comprensión lectora para niños. Respondes SOLO con JSON válido, sin texto oculto ni markdown.\n\n" + prompt } }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.3f,
                    maxOutputTokens = 6000
                }
            };

            var jsonContent = JsonSerializer.Serialize(requestBody);
            
            // Sistema de reintentos con backoff exponencial
            for (int intento = 0; intento < maxReintentos; intento++)
            {
                try
                {
                    _logger.LogInformation("Intento {Intento}/{Max} de llamada a Gemini API", intento + 1, maxReintentos);
                    
                    var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
                    
                    var response = await _httpClient.PostAsync(apiUrl, content);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        var responseJson = await response.Content.ReadAsStringAsync();
                        var doc = JsonDocument.Parse(responseJson);

                        var resultado = doc.RootElement
                            .GetProperty("candidates")[0]
                            .GetProperty("content")
                            .GetProperty("parts")[0]
                            .GetProperty("text")
                            .GetString() ?? "";

                        _logger.LogInformation("✅ Respuesta de Gemini recibida exitosamente");
                        return resultado;
                    }
                    
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("❌ Error en Gemini API (Status {Status}): {Error}", 
                        response.StatusCode, errorContent);
                    
                    if ((int)response.StatusCode >= 400 && (int)response.StatusCode < 500)
                    {
                        throw new Exception($"Error en API de Gemini: {response.StatusCode} - {errorContent}");
                    }
                }
                catch (HttpRequestException ex)
                {
                    _logger.LogWarning(ex, "Error de red al llamar a Gemini (intento {Intento})", intento + 1);
                }
                catch (TaskCanceledException ex)
                {
                    _logger.LogWarning(ex, "Timeout al llamar a Gemini (intento {Intento})", intento + 1);
                }
                
                // Si no es el último intento, esperar antes de reintentar
                if (intento < maxReintentos - 1)
                {
                    var delayMs = (int)Math.Pow(2, intento) * 1000; // 1s, 2s, 4s
                    _logger.LogInformation("⏳ Esperando {Delay}ms antes de reintentar...", delayMs);
                    await Task.Delay(delayMs);
                }
            }
            
            throw new Exception($"No se pudo obtener respuesta de Gemini después de {maxReintentos} intentos");
        }

        private List<Pregunta> ParsearPreguntasDeRespuesta(string respuestaIA)
        {
            try
            {
                _logger.LogInformation("Parseando respuesta de IA (longitud: {Length})", respuestaIA.Length);
                
                // Limpiar markdown y espacios
                var jsonText = respuestaIA
                    .Replace("```json", "")
                    .Replace("```", "")
                    .Trim();

                // Buscar el JSON si viene con texto adicional
                var inicioJson = jsonText.IndexOf('{');
                var finJson = jsonText.LastIndexOf('}');
                if (inicioJson >= 0 && finJson > inicioJson)
                {
                    jsonText = jsonText.Substring(inicioJson, finJson - inicioJson + 1);
                }

                _logger.LogDebug("JSON limpio: {Json}", jsonText.Length > 500 ? jsonText.Substring(0, 500) + "..." : jsonText);

                var doc = JsonDocument.Parse(jsonText);
                var preguntasJson = doc.RootElement.GetProperty("preguntas");

                var preguntas = new List<Pregunta>();

                foreach (var pregJson in preguntasJson.EnumerateArray())
                {
                    var pregunta = new Pregunta
                    {
                        Id = Guid.NewGuid(),
                        Orden = pregJson.GetProperty("orden").GetInt32(),
                        Tipo = pregJson.GetProperty("tipo").GetString() ?? "",
                        Formato = pregJson.GetProperty("formato").GetString() ?? "",
                        TextoPregunta = pregJson.GetProperty("textoPregunta").GetString() ?? "",
                        Explicacion = pregJson.TryGetProperty("explicacion", out var exp) 
                            ? exp.GetString() : "Pregunta generada por IA"
                    };

                    // Solo para opción múltiple
                    if (pregunta.Formato == "OpcionMultiple")
                    {
                        var opciones = new List<string>();
                        foreach (var opcion in pregJson.GetProperty("opciones").EnumerateArray())
                        {
                            opciones.Add(opcion.GetString() ?? "");
                        }
                        pregunta.Opciones = JsonSerializer.Serialize(opciones);
                        pregunta.RespuestaCorrecta = pregJson.GetProperty("respuestaCorrecta").GetString();
                    }

                    preguntas.Add(pregunta);
                }

                _logger.LogInformation("✅ Parseadas {Count} preguntas correctamente", preguntas.Count);
                return preguntas;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error al parsear respuesta de IA: {Respuesta}", 
                    respuestaIA.Length > 1000 ? respuestaIA.Substring(0, 1000) + "..." : respuestaIA);
                throw new Exception("No se pudo interpretar la respuesta de la IA. Por favor, intenta de nuevo.", ex);
            }
        }

        private (decimal puntaje, string retroalimentacion) ParsearEvaluacionRespuestaAbierta(string respuestaIA)
        {
            var jsonText = respuestaIA
                .Replace("```json", "")
                .Replace("```", "")
                .Trim();

            var doc = JsonDocument.Parse(jsonText);
            var puntaje = doc.RootElement.GetProperty("puntaje").GetDecimal();
            var retroalimentacion = doc.RootElement.GetProperty("retroalimentacion").GetString() ?? "";

            return (puntaje, retroalimentacion);
        }

        private string LimpiarTextoRespuesta(string texto)
        {
            if (string.IsNullOrWhiteSpace(texto))
                return texto;

            // Remover bloques de código markdown
            texto = texto.Replace("```json", "").Replace("```", "").Trim();
            
            // Si hay texto antes del JSON, intentar extraer solo el JSON
            var inicio = texto.IndexOf('{');
            var fin = texto.LastIndexOf('}');
            
            if (inicio >= 0 && fin > inicio)
            {
                texto = texto.Substring(inicio, fin - inicio + 1);
            }
            
            return texto.Trim();
        }

        private string GenerarRetroalimentacionPorDefecto(int puntaje)
        {
            return puntaje switch
            {
                >= 9 => "¡Excelente trabajo! Demostraste una comprensión sobresaliente del texto. ¡Sigue así!",
                >= 7 => "¡Muy bien! Tienes una buena comprensión de la lectura. Sigue practicando para mejorar aún más.",
                >= 5 => "Buen intento. Entiendes las ideas principales, pero puedes mejorar prestando más atención a los detalles.",
                >= 3 => "Sigue practicando. La comprensión lectora mejora con la práctica constante. ¡Tú puedes!",
                _ => "No te desanimes. Todos aprendemos a nuestro ritmo. Sigue leyendo y practicando todos los días."
            };
        }

        /// <summary>
        /// Genera un cuestionario específico para un examen grupal con parámetros personalizados
        /// </summary>
        public async Task<Cuestionario?> GenerarCuestionarioParaExamenGrupalAsync(
            int lecturaId,
            string contenidoLectura,
            int cantidadPreguntas,
            string gradoEscolar)
        {
            try
            {
                _logger.LogInformation("📝 Generando cuestionario para examen grupal - {CantidadPreguntas} preguntas, Grado: {Grado}", 
                    cantidadPreguntas, gradoEscolar);

                var edad = gradoEscolar switch
                {
                    "4to" => 9,
                    "5to" => 10,
                    "6to" => 11,
                    _ => 10
                };

                // Distribución de preguntas: 40% literales, 40% inferenciales, 20% críticas
                var literales = (int)Math.Round(cantidadPreguntas * 0.4);
                var inferenciales = (int)Math.Round(cantidadPreguntas * 0.4);
                var criticas = cantidadPreguntas - literales - inferenciales;

                var prompt = $@"Genera un cuestionario de {cantidadPreguntas} preguntas de OPCIÓN MÚLTIPLE para evaluar la comprensión de este texto para estudiantes de {gradoEscolar} grado ({edad} años).

TEXTO:
{contenidoLectura}

DISTRIBUCIÓN DE PREGUNTAS:
- {literales} preguntas LITERALES (respuestas explícitas en el texto)
- {inferenciales} preguntas INFERENCIALES (requieren deducción)
- {criticas} preguntas CRÍTICAS (opinión fundamentada)

INSTRUCCIONES:
1. Todas las preguntas deben ser de OPCIÓN MÚLTIPLE con 4 alternativas (A, B, C, D)
2. Las preguntas deben ser claras y apropiadas para {gradoEscolar} grado
3. Las preguntas literales deben tener respuesta directa en el texto
4. Las preguntas inferenciales requieren conectar ideas
5. Las preguntas críticas evalúan comprensión profunda
6. Solo UNA alternativa es correcta
7. Los distractores deben ser plausibles pero incorrectos

FORMATO JSON:
{{
  ""preguntas"": [
    {{
      ""orden"": 1,
      ""tipo"": ""Literal"",
      ""pregunta"": ""Texto de la pregunta"",
      ""opciones"": [
        {{""letra"": ""A"", ""texto"": ""Primera opción""}},
        {{""letra"": ""B"", ""texto"": ""Segunda opción""}},
        {{""letra"": ""C"", ""texto"": ""Tercera opción""}},
        {{""letra"": ""D"", ""texto"": ""Cuarta opción""}}
      ],
      ""respuestaCorrecta"": ""A"",
      ""explicacion"": ""Breve explicación de por qué es correcta""
    }},
    ...
  ]
}}

Responde SOLO con el JSON, sin texto adicional.";

                var requestBody = new
                {
                    contents = new[]
                    {
                        new { parts = new[] { new { text = "Instrucción del sistema: Eres un experto en crear evaluaciones educativas. Respondes SOLO con JSON válido.\n\n" + prompt } } }
                    },
                    generationConfig = new
                    {
                        temperature = 0.5f,
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
                    _logger.LogError("Error al generar cuestionario: {Error}", errorContent);
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
                        _logger.LogError("No se pudo extraer JSON del cuestionario. RAW: {Raw}", textoRespuesta);
                        return null;
                    }

                var jsonText = textoRespuesta.Substring(startIdx, endIdx - startIdx);
                var cuestionarioJson = JsonDocument.Parse(jsonText);
                
                // Crear cuestionario
                var cuestionario = new Cuestionario
                {
                    LecturaId = lecturaId,
                    SesionLecturaId = null, // Exámenes grupales no tienen sesión de lectura
                    EstudianteId = null, // Exámenes grupales no tienen estudiante específico
                    FechaGeneracion = DateTime.UtcNow,
                    Estado = "generado",
                    NivelDificultad = gradoEscolar,
                    TipoTexto = "Examen Grupal",
                    Preguntas = new List<Pregunta>()
                };

                var preguntasArray = cuestionarioJson.RootElement.GetProperty("preguntas");
                foreach (var preguntaJson in preguntasArray.EnumerateArray())
                {
                    // Procesar opciones de respuesta múltiple - convertir a formato string simple
                    var opcionesTexto = new List<string>();
                    if (preguntaJson.TryGetProperty("opciones", out var opcionesArray))
                    {
                        foreach (var opcion in opcionesArray.EnumerateArray())
                        {
                            var letra = opcion.GetProperty("letra").GetString();
                            var texto = opcion.GetProperty("texto").GetString();
                            opcionesTexto.Add($"{letra}. {texto}");
                        }
                    }

                    var pregunta = new Pregunta
                    {
                        Orden = preguntaJson.GetProperty("orden").GetInt32(),
                        Tipo = preguntaJson.GetProperty("tipo").GetString() ?? "Literal",
                        Formato = "OpcionMultiple",
                        TextoPregunta = preguntaJson.GetProperty("pregunta").GetString() ?? "",
                        Opciones = JsonSerializer.Serialize(opcionesTexto), // Serializar como array de strings
                        RespuestaCorrecta = preguntaJson.TryGetProperty("respuestaCorrecta", out var resp) 
                            ? resp.GetString() 
                            : "",
                        Explicacion = preguntaJson.TryGetProperty("explicacion", out var expl) 
                            ? expl.GetString() 
                            : ""
                    };

                    cuestionario.Preguntas.Add(pregunta);
                }

                // Guardar el cuestionario y las preguntas en la base de datos
                _context.Cuestionarios.Add(cuestionario);
                await _context.SaveChangesAsync();

                _logger.LogInformation("✅ Cuestionario generado con {CantidadPreguntas} preguntas", cuestionario.Preguntas.Count);
                return cuestionario;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error al parsear el JSON del cuestionario. RAW: {Raw}", responseContent);
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar cuestionario para examen grupal");
                return null;
            }
        }
    }
}
