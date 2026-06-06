import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { cuestionarioService, type ResultadoDto } from '../services/cuestionarioService';

export default function CuestionarioResultados() {
  const { id: lecturaId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const cuestionarioId = searchParams.get('cuestionarioId');
  const navigate = useNavigate();
  const location = useLocation();

  const [resultado, setResultado] = useState<ResultadoDto | null>(null);
  const [mostrarConfeti, setMostrarConfeti] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarResultado = async () => {
      try {
        // Si viene del state de navegación (recién terminó el cuestionario), usar ese
        if (location.state?.resultado) {
          setResultado(location.state.resultado);
          
          // Mostrar confeti si el puntaje es bueno (>= 7)
          if (location.state.resultado.puntajeTotal >= 7) {
            setMostrarConfeti(true);
            setTimeout(() => setMostrarConfeti(false), 3000);
          }
          setCargando(false);
        } 
        // Si viene desde el botón "Ver Resultados", cargar desde la API
        else if (cuestionarioId) {
          const resultadoApi = await cuestionarioService.obtenerResultado(cuestionarioId);
          setResultado(resultadoApi);
          setCargando(false);
        } 
        // Si no hay ni state ni cuestionarioId, redirigir
        else {
          navigate('/estudiante/dashboard');
        }
      } catch (err: any) {
        console.error('Error al cargar resultado:', err);
        setError(err.message || 'Error al cargar el resultado');
        setCargando(false);
      }
    };

    cargarResultado();
  }, [location.state, cuestionarioId, navigate]);

  const handleVerRespuestas = () => {
    navigate(`/estudiante/cuestionario/${lecturaId}/revision?cuestionarioId=${cuestionarioId}`);
  };

  const handleVolverDashboard = () => {
    navigate('/estudiante/dashboard');
  };

  const getColorPorPuntaje = (puntaje: number) => {
    if (puntaje >= 8) return 'text-green-600';
    if (puntaje >= 6) return 'text-blue-600';
    if (puntaje >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBgColorPorPuntaje = (puntaje: number) => {
    if (puntaje >= 8) return 'bg-green-50';
    if (puntaje >= 6) return 'bg-blue-50';
    if (puntaje >= 4) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getEmojiPorPuntaje = (puntaje: number) => {
    if (puntaje >= 9) return '🎉';
    if (puntaje >= 7) return '😊';
    if (puntaje >= 5) return '🙂';
    if (puntaje >= 3) return '😐';
    return '😔';
  };

  // Funciones comentadas porque la sección de adaptación de nivel está oculta
  /* 
  const getAccionNivelColor = (accion: string) => {
    switch (accion) {
      case 'subir':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'mantener':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'bajar':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'maximo':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'minimo':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAccionNivelIcono = (accion: string) => {
    switch (accion) {
      case 'subir':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'bajar':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      case 'maximo':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };
  */

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-gray-600">Cargando resultados...</p>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar resultados</h2>
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

  if (!resultado) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-gray-600">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-4">
      {/* Confeti animado */}
      {mostrarConfeti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)]
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Puntaje principal */}
        <div className={`${getBgColorPorPuntaje(resultado.puntajeTotal)} rounded-2xl shadow-2xl p-8 mb-6 text-center border-4 border-white`}>
          <div className="text-6xl mb-4">{getEmojiPorPuntaje(resultado.puntajeTotal)}</div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {resultado.mensajeAnimo}
          </h1>
          
          <div className={`text-8xl font-bold ${getColorPorPuntaje(resultado.puntajeTotal)} my-6`}>
            {resultado.puntajeTotal}/10
          </div>
          
          <div className="text-3xl font-semibold text-gray-700">
            {resultado.porcentaje.toFixed(0)}%
          </div>
        </div>

        {/* Tiempos de lectura y cuestionario */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tiempos de completado
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Tiempo de lectura */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-5 border-2 border-cyan-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-cyan-800 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Lectura
                </h3>
                <span className="text-3xl font-bold text-cyan-600">
                  {Math.floor(resultado.tiempoLecturaMinutos)}:{String(Math.round((resultado.tiempoLecturaMinutos % 1) * 60)).padStart(2, '0')}
                </span>
              </div>
              <p className="text-xs text-cyan-700">Tiempo que demoraste leyendo el texto</p>
            </div>

            {/* Tiempo de cuestionario */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-5 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-purple-800 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Cuestionario
                </h3>
                <span className="text-3xl font-bold text-purple-600">
                  {Math.floor(resultado.tiempoCuestionarioMinutos)}:{String(Math.round((resultado.tiempoCuestionarioMinutos % 1) * 60)).padStart(2, '0')}
                </span>
              </div>
              <p className="text-xs text-purple-700">Tiempo que demoraste respondiendo las preguntas</p>
            </div>
          </div>

          {/* Tiempo total */}
          <div className="mt-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border-2 border-indigo-300">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-indigo-800 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tiempo total
              </h3>
              <span className="text-2xl font-bold text-indigo-600">
                {Math.floor(resultado.tiempoLecturaMinutos + resultado.tiempoCuestionarioMinutos)}:{String(Math.round(((resultado.tiempoLecturaMinutos + resultado.tiempoCuestionarioMinutos) % 1) * 60)).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Análisis por tipo de pregunta */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Análisis por tipo de pregunta
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* Literales */}
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-blue-800">Literales</h3>
                <span className="text-2xl font-bold text-blue-600">
                  {resultado.correctasLiterales}/4
                </span>
              </div>
              <div className="bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(resultado.correctasLiterales / 4) * 100}%` }}
                />
              </div>
              <p className="text-xs text-blue-700 mt-2">Comprensión directa del texto</p>
            </div>

            {/* Analíticas */}
            <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-purple-800">Analíticas</h3>
                <span className="text-2xl font-bold text-purple-600">
                  {resultado.correctasAnaliticas}/4
                </span>
              </div>
              <div className="bg-purple-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${(resultado.correctasAnaliticas / 4) * 100}%` }}
                />
              </div>
              <p className="text-xs text-purple-700 mt-2">Análisis e inferencia</p>
            </div>

            {/* Críticas */}
            <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-orange-800">Críticas</h3>
                <span className="text-2xl font-bold text-orange-600">
                  {resultado.puntajeCriticas.toFixed(1)}/2
                </span>
              </div>
              <div className="bg-orange-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all"
                  style={{ width: `${(resultado.puntajeCriticas / 2) * 100}%` }}
                />
              </div>
              <p className="text-xs text-orange-700 mt-2">Pensamiento crítico (evaluado por IA)</p>
            </div>
          </div>
        </div>

        {/* Retroalimentación personalizada */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Retroalimentación personalizada
          </h2>
          
          {resultado.retroalimentacion ? (
            /* Retroalimentación estructurada */
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border-l-4 border-green-500">
                <h3 className="font-bold text-green-800 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Logros
                </h3>
                <p className="text-gray-700 leading-relaxed">{resultado.retroalimentacion.logros}</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-5 border-l-4 border-blue-500">
                <h3 className="font-bold text-blue-800 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Áreas de mejora
                </h3>
                <p className="text-gray-700 leading-relaxed">{resultado.retroalimentacion.mejora}</p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-5 border-l-4 border-purple-500">
                <h3 className="font-bold text-purple-800 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Consejos prácticos
                </h3>
                <p className="text-gray-700 leading-relaxed">{resultado.retroalimentacion.consejos}</p>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-5 border-l-4 border-yellow-500">
                <h3 className="font-bold text-yellow-800 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ánimo
                </h3>
                <p className="text-gray-700 leading-relaxed">{resultado.retroalimentacion.animo}</p>
              </div>
            </div>
          ) : (
            /* Fallback: retroalimentación como texto plano */
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border-l-4 border-blue-500">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {resultado.retroalimentacionPersonalizada}
              </p>
            </div>
          )}
        </div>

        {/* Adaptación de nivel - OCULTO PARA EXÁMENES GRUPALES */}
        {/* <div className={`rounded-xl shadow-md p-6 mb-6 border-2 ${getAccionNivelColor(resultado.accionNivel)}`}>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            {getAccionNivelIcono(resultado.accionNivel)}
            <span className="ml-2">Adaptación de nivel</span>
          </h2>
          
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Nivel anterior</div>
              <div className="text-2xl font-bold px-6 py-2 bg-white rounded-lg shadow">
                {resultado.nivelAnterior}
              </div>
            </div>
            
            <div className="text-3xl">
              {resultado.accionNivel === 'subir' && '→ 📈'}
              {resultado.accionNivel === 'bajar' && '→ 📉'}
              {resultado.accionNivel === 'mantener' && '→ ➡️'}
              {resultado.accionNivel === 'maximo' && '👑'}
              {resultado.accionNivel === 'minimo' && '🎯'}
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Nivel nuevo</div>
              <div className="text-2xl font-bold px-6 py-2 bg-white rounded-lg shadow">
                {resultado.nivelNuevo}
              </div>
            </div>
          </div>
          
          <p className="text-center font-medium">
            {resultado.mensajeAdaptacion}
          </p>
        </div> */}

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleVerRespuestas}
            className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl shadow-lg transition font-bold text-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>Ver respuestas detalladas</span>
          </button>
          
          <button
            onClick={handleVolverDashboard}
            className="flex-1 flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-xl shadow-lg transition font-bold text-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Volver al Dashboard</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}
