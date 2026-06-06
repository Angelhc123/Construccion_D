import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cuestionarioService, type ResultadoDto } from '../services/cuestionarioService';
import { lecturaService } from '../services/lecturaService';

export default function HistorialResultados() {
  const { id: lecturaId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [historial, setHistorial] = useState<ResultadoDto[]>([]);
  const [tituloLectura, setTituloLectura] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarHistorial();
  }, [lecturaId]);

  const cargarHistorial = async () => {
    try {
      setCargando(true);
      
      // Cargar título de la lectura
      const lectura = await lecturaService.obtenerLectura(Number(lecturaId));
      setTituloLectura(lectura.titulo);
      
      // Cargar historial de resultados
      const resultados = await cuestionarioService.obtenerHistorialLectura(Number(lecturaId));
      setHistorial(resultados);
      
      setCargando(false);
    } catch (err: any) {
      console.error('Error al cargar historial:', err);
      setError(err.message || 'Error al cargar el historial');
      setCargando(false);
    }
  };

  const handleVerDetalle = (resultado: ResultadoDto) => {
    navigate(`/estudiante/cuestionario/${lecturaId}/resultados?cuestionarioId=${resultado.cuestionarioId}`, {
      state: { resultado }
    });
  };

  const getColorPorPuntaje = (puntaje: number) => {
    if (puntaje >= 8) return 'text-green-600';
    if (puntaje >= 6) return 'text-blue-600';
    if (puntaje >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBgColorPorPuntaje = (puntaje: number) => {
    if (puntaje >= 8) return 'bg-green-50 border-green-200';
    if (puntaje >= 6) return 'bg-blue-50 border-blue-200';
    if (puntaje >= 4) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getEmojiPorPuntaje = (puntaje: number) => {
    if (puntaje >= 9) return '🎉';
    if (puntaje >= 7) return '😊';
    if (puntaje >= 5) return '🙂';
    if (puntaje >= 3) return '😐';
    return '😔';
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
          <svg className="w-16 h-16 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar historial</h2>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                📊 Historial de Resultados
              </h1>
              <p className="text-gray-600">
                Lectura: <span className="font-semibold">{tituloLectura}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Total de intentos: {historial.length}
              </p>
            </div>
            <button
              onClick={() => navigate('/estudiante/dashboard')}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Volver</span>
            </button>
          </div>
        </div>

        {/* Lista de resultados */}
        {historial.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No hay resultados</h2>
            <p className="text-gray-500 mb-6">Aún no has completado ningún cuestionario para esta lectura.</p>
            <button
              onClick={() => navigate('/estudiante/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
            >
              Ir al Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {historial.map((resultado, index) => (
              <div
                key={resultado.id}
                className={`bg-white rounded-xl shadow-md p-6 border-2 ${getBgColorPorPuntaje(resultado.puntajeTotal)} transition hover:shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  {/* Info principal */}
                  <div className="flex items-center space-x-6">
                    {/* Número de intento */}
                    <div className="text-center">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl shadow-lg">
                        #{historial.length - index}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Intento</p>
                    </div>

                    {/* Puntaje y fecha */}
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-4xl">{getEmojiPorPuntaje(resultado.puntajeTotal)}</span>
                        <div>
                          <div className={`text-4xl font-bold ${getColorPorPuntaje(resultado.puntajeTotal)}`}>
                            {resultado.puntajeTotal}/10
                          </div>
                          <div className="text-sm text-gray-600">
                            {resultado.porcentaje.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">📅</span> {(() => {
                          // Parsear fecha que viene en formato ISO desde backend (en UTC)
                          // y convertir a hora local del navegador
                          const fechaString = resultado.fechaEvaluacion;
                          // Si no tiene 'Z' al final, agregarla para indicar UTC
                          const fechaUTC = fechaString.endsWith('Z') ? fechaString : fechaString + 'Z';
                          const fecha = new Date(fechaUTC);
                          
                          return fecha.toLocaleString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          });
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Estadísticas */}
                  <div className="flex items-center space-x-6">
                    {/* Tiempos */}
                    <div className="text-center bg-white rounded-lg p-3 shadow">
                      <div className="text-xs text-gray-500 mb-1">⏱️ Tiempos</div>
                      <div className="flex space-x-2 text-sm">
                        <div>
                          <div className="font-bold text-cyan-600">
                            {Math.floor(resultado.tiempoLecturaMinutos)}:{String(Math.round((resultado.tiempoLecturaMinutos % 1) * 60)).padStart(2, '0')}
                          </div>
                          <div className="text-xs text-gray-500">Lectura</div>
                        </div>
                        <div className="text-gray-300">+</div>
                        <div>
                          <div className="font-bold text-purple-600">
                            {Math.floor(resultado.tiempoCuestionarioMinutos)}:{String(Math.round((resultado.tiempoCuestionarioMinutos % 1) * 60)).padStart(2, '0')}
                          </div>
                          <div className="text-xs text-gray-500">Quiz</div>
                        </div>
                      </div>
                    </div>

                    {/* Tipos de preguntas */}
                    <div className="text-center bg-white rounded-lg p-3 shadow">
                      <div className="text-xs text-gray-500 mb-1">📝 Respuestas</div>
                      <div className="flex space-x-2 text-sm">
                        <div className="text-blue-600 font-semibold">{resultado.correctasLiterales}/4</div>
                        <div className="text-purple-600 font-semibold">{resultado.correctasAnaliticas}/4</div>
                        <div className="text-orange-600 font-semibold">{resultado.puntajeCriticas.toFixed(1)}/2</div>
                      </div>
                    </div>

                    {/* Botón ver detalle */}
                    <button
                      onClick={() => handleVerDetalle(resultado)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>Ver Detalle</span>
                    </button>
                  </div>
                </div>

                {/* Nivel de dificultad */}
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">
                      <span className="font-semibold">Nivel anterior:</span> {resultado.nivelAnterior}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="text-gray-600">
                      <span className="font-semibold">Nivel nuevo:</span> {resultado.nivelNuevo}
                    </span>
                  </div>
                  {index === 0 && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                      ✨ Último intento
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
