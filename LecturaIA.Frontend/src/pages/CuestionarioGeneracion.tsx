import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { cuestionarioService } from '../services/cuestionarioService';
import { EstadoCuestionario } from '../types/enums';
import { UI_CONFIG } from '../config/constants';

const POLLING_INTERVAL_MS = UI_CONFIG.POLLING_INTERVAL_MS;
const POLLING_MAX_ATTEMPTS = UI_CONFIG.POLLING_MAX_ATTEMPTS;

export default function CuestionarioGeneracion() {
  const { id: lecturaId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const sesionId = searchParams.get('sesionId');
  const navigate = useNavigate();

  const [estado, setEstado] = useState<EstadoCuestionario>(EstadoCuestionario.GENERANDO);
  const [, setCuestionarioId] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string>('');
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    if (!sesionId) {
      setMensajeError('No se proporcionó ID de sesión');
      setEstado(EstadoCuestionario.ERROR);
      return;
    }

    iniciarGeneracion();
  }, [sesionId]);

  const iniciarGeneracion = async () => {
    try {
      // Llamar al endpoint para generar el cuestionario
      const cuestionario = await cuestionarioService.generarCuestionario(sesionId!);
      const id = cuestionario.id;
      setCuestionarioId(id);

      // Iniciar polling para verificar el estado
      iniciarPolling(id);
    } catch (error: any) {
      console.error('Error al iniciar generación:', error);
      setMensajeError(error.message || 'Error al generar cuestionario');
      setEstado(EstadoCuestionario.ERROR);
    }
  };

  const iniciarPolling = (id: string) => {
    let intentos = 0;

    const interval = setInterval(async () => {
      try {
        intentos++;
        
        // Actualizar barra de progreso (simulada)
        setProgreso(Math.min((intentos / POLLING_MAX_ATTEMPTS) * 100, 95));

        const cuestionario = await cuestionarioService.obtenerCuestionario(id);

        if (cuestionario.estado === EstadoCuestionario.LISTO) {
          clearInterval(interval);
          setProgreso(100);
          setEstado(EstadoCuestionario.LISTO);
          
          // Esperar un poco antes de redirigir para mostrar el 100%
          setTimeout(() => {
            navigate(`/estudiante/cuestionario/${lecturaId}/responder?cuestionarioId=${id}`);
          }, 1000);
        } else if (cuestionario.estado === EstadoCuestionario.ERROR) {
          // El backend marcó el cuestionario como error
          clearInterval(interval);
          setMensajeError('Hubo un error al generar el cuestionario. Por favor, intenta de nuevo.');
          setEstado(EstadoCuestionario.ERROR);
        } else if (intentos >= POLLING_MAX_ATTEMPTS) {
          clearInterval(interval);
          setMensajeError('El cuestionario está tardando demasiado. Por favor, intenta más tarde o contacta al administrador.');
          setEstado(EstadoCuestionario.ERROR);
        }
      } catch (error: any) {
        console.error('Error en polling:', error);
        clearInterval(interval);
        setMensajeError(error.message || 'Error al verificar estado del cuestionario');
        setEstado(EstadoCuestionario.ERROR);
      }
    }, POLLING_INTERVAL_MS);
  };


  const handleVolver = () => {
    navigate('/estudiante/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        {estado === EstadoCuestionario.GENERANDO && (
          <div className="text-center">
            {/* Icono animado de IA */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                {/* Círculos animados alrededor */}
                <div className="absolute top-0 left-0 w-full h-full">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                  </div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-2">
                    <div className="w-3 h-3 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-2">
                    <div className="w-3 h-3 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Generando tu cuestionario
            </h1>
            
            <p className="text-gray-600 mb-8">
              Nuestra IA está analizando la lectura y creando preguntas personalizadas para ti...
            </p>

            {/* Barra de progreso */}
            <div className="mb-8">
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progreso}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">{Math.round(progreso)}%</p>
            </div>

            {/* Mensajes informativos */}
            <div className="space-y-3 text-left bg-blue-50 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-gray-700">
                  <strong>4 preguntas literales</strong> - Evalúan tu comprensión directa del texto
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-gray-700">
                  <strong>4 preguntas analíticas</strong> - Requieren análisis e inferencia
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-gray-700">
                  <strong>2 preguntas críticas</strong> - Evalúan tu pensamiento crítico y opinión
                </p>
              </div>
            </div>
          </div>
        )}

        {estado === EstadoCuestionario.LISTO && (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              ¡Cuestionario listo!
            </h1>
            
            <p className="text-gray-600 mb-8">
              Redirigiendo...
            </p>
          </div>
        )}

        {estado === EstadoCuestionario.ERROR && (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Error al generar cuestionario
            </h1>
            
            <p className="text-red-600 mb-8">
              {mensajeError}
            </p>

            <button
              onClick={handleVolver}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition font-medium"
            >
              Volver al Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
