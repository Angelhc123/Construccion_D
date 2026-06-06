import { alertaError } from '../utils/alerts';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { cuestionarioService, type CuestionarioDto, type PreguntaDto, type RespuestaDto } from '../services/cuestionarioService';

export default function CuestionarioRespuesta() {
  const { id: lecturaId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const cuestionarioId = searchParams.get('cuestionarioId');
  const navigate = useNavigate();

  const [cuestionario, setCuestionario] = useState<CuestionarioDto | null>(null);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Timer del cuestionario
  const [tiempoInicio, setTiempoInicio] = useState<Date | null>(null);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0); // en segundos

  useEffect(() => {
    if (!cuestionarioId) {
      setError('No se proporcionó ID de cuestionario');
      return;
    }

    cargarCuestionario();
  }, [cuestionarioId]);

  // Timer del cuestionario
  useEffect(() => {
    if (!tiempoInicio) {
      // Iniciar el timer cuando se carga el cuestionario
      setTiempoInicio(new Date());
    }

    const interval = setInterval(() => {
      if (tiempoInicio) {
        const ahora = new Date();
        const segundos = Math.floor((ahora.getTime() - tiempoInicio.getTime()) / 1000);
        setTiempoTranscurrido(segundos);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tiempoInicio]);

  const cargarCuestionario = async () => {
    try {
      setIsLoading(true);
      const data = await cuestionarioService.obtenerCuestionario(cuestionarioId!);
      setCuestionario(data);
    } catch (error: any) {
      console.error('Error al cargar cuestionario:', error);
      setError(error.message || 'Error al cargar el cuestionario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespuesta = (preguntaId: string, respuesta: string) => {
    const nuevasRespuestas = new Map(respuestas);
    nuevasRespuestas.set(preguntaId, respuesta);
    setRespuestas(nuevasRespuestas);
  };

  const handleSiguiente = () => {
    if (preguntaActual < (cuestionario?.preguntas.length || 0) - 1) {
      setPreguntaActual(preguntaActual + 1);
      // Scroll al top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAnterior = () => {
    if (preguntaActual > 0) {
      setPreguntaActual(preguntaActual - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinalizarIntento = () => {
    // Verificar que todas las preguntas tengan respuesta
    const preguntasSinResponder = cuestionario?.preguntas.filter(
      p => !respuestas.has(p.id) || respuestas.get(p.id)?.trim() === ''
    );

    if (preguntasSinResponder && preguntasSinResponder.length > 0) {
      alertaError(`Tienes ${preguntasSinResponder.length} pregunta(s) sin responder. Por favor, responde todas las preguntas antes de enviar.`);
      return;
    }

    setMostrarConfirmacion(true);
  };

  const handleEnviar = async () => {
    try {
      setIsSubmitting(true);
      setMostrarConfirmacion(false);

      const respuestasArray: RespuestaDto[] = Array.from(respuestas.entries()).map(
        ([preguntaId, textoRespuesta]) => ({
          preguntaId,
          textoRespuesta
        })
      );

      // Calcular tiempo transcurrido en minutos con decimales precisos
      const tiempoMinutos = tiempoTranscurrido / 60;
      
      const resultado = await cuestionarioService.enviarRespuestas(cuestionarioId!, respuestasArray, tiempoMinutos);

      // Navegar a la página de resultados
      navigate(`/estudiante/cuestionario/${lecturaId}/resultados?cuestionarioId=${cuestionarioId}`, {
        state: { resultado }
      });
    } catch (error: any) {
      console.error('Error al enviar respuestas:', error);
      alertaError(error.message || 'Error al enviar las respuestas');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-gray-600">Cargando cuestionario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/estudiante/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!cuestionario) {
    return null;
  }

  const pregunta: PreguntaDto = cuestionario.preguntas[preguntaActual];
  const respuestaActual = respuestas.get(pregunta.id) || '';
  const progreso = ((preguntaActual + 1) / cuestionario.preguntas.length) * 100;

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Literal':
        return 'bg-blue-100 text-blue-800';
      case 'Analitica':
        return 'bg-purple-100 text-purple-800';
      case 'Critica':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header con progreso */}
        <div className="bg-white rounded-t-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {cuestionario.tituloLectura}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">
                Pregunta {preguntaActual + 1} de {cuestionario.preguntas.length}
              </span>
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-lg">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-blue-700">
                  {Math.floor(tiempoTranscurrido / 60)}:{String(tiempoTranscurrido % 60).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mb-2">
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progreso}%` }}
              ></div>
            </div>
          </div>

          {/* Indicador de respuestas completadas */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{respuestas.size} de {cuestionario.preguntas.length} respondidas</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(pregunta.tipo)}`}>
              {pregunta.tipo}
            </span>
          </div>
        </div>

        {/* Pregunta */}
        <div className="bg-white shadow-md p-8 mb-4">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {pregunta.textoPregunta}
            </h2>

            {pregunta.formato === 'OpcionMultiple' && pregunta.opciones && (
              <div className="space-y-3">
                {pregunta.opciones.map((opcion, index) => (
                  <label
                    key={index}
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
                      respuestaActual === opcion
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`pregunta-${pregunta.id}`}
                      value={opcion}
                      checked={respuestaActual === opcion}
                      onChange={(e) => handleRespuesta(pregunta.id, e.target.value)}
                      className="mt-1 mr-3"
                    />
                    <span className="flex-1 text-gray-700">{opcion}</span>
                  </label>
                ))}
              </div>
            )}

            {pregunta.formato === 'Abierta' && (
              <div>
                <textarea
                  value={respuestaActual}
                  onChange={(e) => handleRespuesta(pregunta.id, e.target.value)}
                  placeholder="Escribe tu respuesta aquí... Sé claro y justifica tu opinión."
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition min-h-[200px] resize-y"
                  rows={8}
                />
                <p className="text-sm text-gray-500 mt-2">
                  💡 Tip: Las preguntas críticas serán evaluadas por IA. Explica tu razonamiento con detalles.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navegación */}
        <div className="bg-white rounded-b-xl shadow-md p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={handleAnterior}
              disabled={preguntaActual === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition font-medium ${
                preguntaActual === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Anterior</span>
            </button>

            {preguntaActual < cuestionario.preguntas.length - 1 ? (
              <button
                onClick={handleSiguiente}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-medium"
              >
                <span>Siguiente</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleFinalizarIntento}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Finalizar</span>
              </button>
            )}
          </div>

          {/* Mini mapa de preguntas */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3 font-medium">Progreso del cuestionario:</p>
            <div className="flex flex-wrap gap-2">
              {cuestionario.preguntas.map((p, index) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setPreguntaActual(index);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-10 h-10 rounded-lg font-medium transition ${
                    index === preguntaActual
                      ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                      : respuestas.has(p.id) && respuestas.get(p.id)?.trim() !== ''
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  title={`Pregunta ${index + 1} - ${p.tipo}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                ¿Enviar cuestionario?
              </h3>
              <p className="text-gray-600">
                Una vez enviado, no podrás modificar tus respuestas. ¿Estás seguro?
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setMostrarConfirmacion(false)}
                disabled={isSubmitting}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg transition font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleEnviar}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition font-medium disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  'Sí, enviar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
