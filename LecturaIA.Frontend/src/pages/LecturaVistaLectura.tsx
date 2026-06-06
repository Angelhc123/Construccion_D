import { alertaError } from '../utils/alerts';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lecturaService, getImageUrl, type LecturaGenerada } from '../services/lecturaService';
import { sesionLecturaService } from '../services/sesionLecturaService';

export default function LecturaVistaLectura() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [lectura, setLectura] = useState<LecturaGenerada | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [sesionId, setSesionId] = useState<string | null>(null);
  const [tiempoInicio, setTiempoInicio] = useState<Date | null>(null);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0); // en segundos
  const [terminando, setTerminando] = useState(false);
  const [mostrarFelicitaciones, setMostrarFelicitaciones] = useState(false);

  useEffect(() => {
    cargarLecturaEIniciarSesion();
  }, [id]);

  // Timer de lectura
  useEffect(() => {
    if (!tiempoInicio) return;

    const intervalo = setInterval(() => {
      const ahora = new Date();
      const segundos = Math.floor((ahora.getTime() - tiempoInicio.getTime()) / 1000);
      setTiempoTranscurrido(segundos);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [tiempoInicio]);

  const cargarLecturaEIniciarSesion = async () => {
    try {
      setLoading(true);
      const data = await lecturaService.obtenerLectura(Number(id));
      setLectura(data);
      
      // Iniciar sesión de lectura
      const sesion = await sesionLecturaService.iniciarLectura(Number(id));
      setSesionId(sesion.id);
      setTiempoInicio(new Date());
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error completo:', err);
      setError(err.message || 'Error al cargar la lectura');
      setLoading(false);
    }
  };

  const handleTerminarLectura = async () => {
    if (!sesionId || !tiempoInicio) return;
    
    try {
      setTerminando(true);
      
      // Calcular tiempo de lectura en minutos con decimales precisos
      const tiempoFin = new Date();
      const tiempoMinutos = (tiempoFin.getTime() - tiempoInicio.getTime()) / 60000;
      
      await sesionLecturaService.finalizarLectura(sesionId, tiempoMinutos);
      
      // Mostrar mensaje de felicitaciones
      setMostrarFelicitaciones(true);
      
    } catch (err: any) {
      alertaError('Error al finalizar la lectura: ' + err.message);
      setTerminando(false);
    }
  };

  const handleComenzarCuestionario = () => {
    // Navegar a la página de generación de cuestionario
    navigate(`/estudiante/cuestionario/${id}?sesionId=${sesionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando lectura...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/estudiante/dashboard')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!lectura) {
    return null;
  }

  // Modal de felicitaciones
  if (mostrarFelicitaciones) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center animate-fade-in">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-purple-600 mb-4">
            ¡Felicitaciones!
          </h2>
          <p className="text-xl text-gray-700 mb-2">
            Has terminado de leer la historia
          </p>
          <p className="text-lg text-gray-600 mb-8">
            "{lectura.titulo}"
          </p>
          
          <div className="bg-purple-50 rounded-lg p-6 mb-8">
            <p className="text-gray-700 mb-2">
              ¿Listo para poner a prueba tu comprensión?
            </p>
            <p className="text-sm text-gray-600">
              Responde un cuestionario personalizado generado por IA
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/estudiante/dashboard')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Volver al Dashboard
            </button>
            <button
              onClick={handleComenzarCuestionario}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition shadow-lg"
            >
              Comenzar Cuestionario →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista de lectura normal
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header con botón volver */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/estudiante/dashboard')}
            className="text-purple-600 hover:text-purple-700 flex items-center gap-2 mb-4"
          >
            ← Volver al Dashboard
          </button>
        </div>

        {/* Contenedor de la lectura */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Título */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {lectura.titulo}
            </h1>
            <span className="inline-block bg-white/20 px-4 py-1 rounded-full text-sm">
              📖 {lectura.tipoLectura}
            </span>
          </div>

          {/* Imagen */}
          {lectura.urlImagen && (
            <div className="flex justify-center p-8 bg-gray-50">
              <img
                src={getImageUrl(lectura.urlImagen)}
                alt={lectura.titulo}
                className="max-w-2xl w-full rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%23e5e7eb"/><text x="50%" y="50%" text-anchor="middle" fill="%239ca3af" font-size="20">Imagen no disponible</text></svg>';
                }}
              />
            </div>
          )}

          {/* Contenido de la lectura - SCROLLEABLE */}
          <div className="p-8 max-h-[600px] overflow-y-auto">
            <div className="prose prose-lg max-w-none">
              {lectura.contenido.split('\n\n').map((parrafo, i) => (
                <p key={`${i}-${parrafo.substring(0, 10)}`} className="text-gray-700 leading-relaxed mb-4 text-justify">
                  {parrafo}
                </p>
              ))}
            </div>
          </div>

          {/* Footer con botón de terminar */}
          <div className="bg-gray-50 p-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <p>📝 Longitud: {lectura.preferencias.longitud}</p>
                <p>😊 Emoción: {lectura.preferencias.emocion}</p>
              </div>
              <button
                onClick={handleTerminarLectura}
                disabled={terminando}
                className={`
                  px-8 py-3 rounded-lg font-semibold text-white shadow-lg
                  ${terminando 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                  }
                  transition-all transform hover:scale-105
                `}
              >
                {terminando ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Finalizando...
                  </span>
                ) : (
                  '✓ Terminar Lectura'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Indicador de tiempo de lectura */}
        {tiempoInicio && (
          <div className="mt-4 text-center text-sm font-medium text-gray-600 bg-blue-50 py-2 px-4 rounded-lg inline-block">
            ⏱️ Tiempo de lectura: {Math.floor(tiempoTranscurrido / 60)}:{String(tiempoTranscurrido % 60).padStart(2, '0')}
          </div>
        )}
      </div>
    </div>
  );
}
