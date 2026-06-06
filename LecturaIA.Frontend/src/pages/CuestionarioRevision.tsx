import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { cuestionarioService, type CuestionarioRevisionDto } from '../services/cuestionarioService';

export default function CuestionarioRevision() {
  const { id: lecturaId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const cuestionarioId = searchParams.get('cuestionarioId');
  const navigate = useNavigate();

  const [revision, setRevision] = useState<CuestionarioRevisionDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!cuestionarioId) {
      setError('No se proporcionó ID de cuestionario');
      setIsLoading(false);
      return;
    }

    cargarRevision();
  }, [cuestionarioId]);

  const cargarRevision = async () => {
    try {
      setIsLoading(true);
      const data = await cuestionarioService.obtenerRevision(cuestionarioId!);
      setRevision(data);
    } catch (error: any) {
      console.error('Error al cargar revisión:', error);
      setError(error.message || 'Error al cargar la revisión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolverResultados = () => {
    navigate(`/estudiante/cuestionario/${lecturaId}/resultados?cuestionarioId=${cuestionarioId}`, {
      state: { resultado: revision }
    });
  };

  const handleVolverDashboard = () => {
    navigate('/estudiante/dashboard');
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Literal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Analitica':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Critica':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
          <p className="text-lg text-gray-600">Cargando revisión...</p>
        </div>
      </div>
    );
  }

  if (error || !revision) {
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
            onClick={handleVolverDashboard}
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              Revisión detallada
            </h1>
            <div className="text-right">
              <div className="text-sm text-gray-600">Puntaje final</div>
              <div className="text-3xl font-bold text-blue-600">
                {revision.puntajeTotal}/10
              </div>
            </div>
          </div>
          <p className="text-gray-600">Cuestionario ID: {revision.cuestionarioId}</p>
        </div>

        {/* Lista de preguntas con respuestas */}
        <div className="space-y-6">
          {revision.detalleRespuestas?.map((pregunta, index) => (
            <div 
              key={pregunta.preguntaId}
              className={`bg-white rounded-xl shadow-md overflow-hidden border-l-4 ${
                pregunta.esCorrecta ? 'border-green-500' : 'border-red-500'
              }`}
            >
              {/* Header de la pregunta */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-gray-700">
                      Pregunta {index + 1}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTipoColor(pregunta.tipo)}`}>
                      {pregunta.tipo}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      pregunta.formato === 'OpcionMultiple' 
                        ? 'bg-indigo-100 text-indigo-800' 
                        : 'bg-teal-100 text-teal-800'
                    }`}>
                      {pregunta.formato === 'OpcionMultiple' ? 'Opción Múltiple' : 'Abierta'}
                    </span>
                  </div>
                  
                  {pregunta.formato === 'OpcionMultiple' ? (
                    <div className={`flex items-center space-x-2 ${
                      pregunta.esCorrecta ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {pregunta.esCorrecta ? (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-bold">Correcta</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-bold">Incorrecta</span>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="font-bold">
                        Puntaje IA: {pregunta.puntajeIA?.toFixed(2)}/1.00
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contenido de la pregunta */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  {pregunta.textoPregunta}
                </h3>

                {/* Preguntas de opción múltiple */}
                {pregunta.formato === 'OpcionMultiple' && (
                  <div className="space-y-3 mb-4">
                    {pregunta.opciones?.map((opcion, idx) => {
                      // Extraer la letra de la opción (ej: "A. Ocho" -> "A")
                      const letraOpcion = opcion.split('.')[0].trim();
                      // Extraer la letra de la respuesta del estudiante (ej: "A. Ocho" -> "A")
                      const letraRespuestaEstudiante = pregunta.respuestaEstudiante?.split('.')[0].trim();
                      const esRespuestaEstudiante = letraOpcion === letraRespuestaEstudiante;
                      const esRespuestaCorrecta = letraOpcion === pregunta.respuestaCorrecta;

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border-2 ${
                            esRespuestaCorrecta
                              ? 'bg-green-50 border-green-500'
                              : esRespuestaEstudiante
                              ? 'bg-red-50 border-red-500'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mt-1">
                              {esRespuestaCorrecta && (
                                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                              {esRespuestaEstudiante && !esRespuestaCorrecta && (
                                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              )}
                              {!esRespuestaEstudiante && !esRespuestaCorrecta && (
                                <div className="w-5 h-5" />
                              )}
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-gray-700">{opcion}</p>
                              {esRespuestaCorrecta && esRespuestaEstudiante && (
                                <span className="text-xs font-medium text-green-700 mt-1 inline-block">
                                  ✓ Tu respuesta es correcta
                                </span>
                              )}
                              {esRespuestaCorrecta && !esRespuestaEstudiante && (
                                <span className="text-xs font-medium text-green-700 mt-1 inline-block">
                                  ✓ Respuesta correcta
                                </span>
                              )}
                              {esRespuestaEstudiante && !esRespuestaCorrecta && (
                                <span className="text-xs font-medium text-red-700 mt-1 inline-block">
                                  ✗ Tu respuesta
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Preguntas abiertas */}
                {pregunta.formato === 'Abierta' && (
                  <div className="space-y-4 mb-4">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-bold text-blue-800">Tu respuesta:</span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {pregunta.respuestaEstudiante}
                      </p>
                    </div>

                    {pregunta.retroalimentacionIA && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <span className="font-bold text-purple-800">
                            Retroalimentación de IA (Puntaje: {pregunta.puntajeIA?.toFixed(2)}/1.00):
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {pregunta.retroalimentacionIA}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Explicación */}
                {pregunta.explicacion && (
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 border-l-4 border-green-500 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <span className="font-bold text-green-800">Explicación:</span>
                        <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                          {pregunta.explicacion}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Botones de navegación */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={handleVolverResultados}
            className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl shadow-lg transition font-bold text-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Volver a Resultados</span>
          </button>
          
          <button
            onClick={handleVolverDashboard}
            className="flex-1 flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-xl shadow-lg transition font-bold text-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Cerrar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
