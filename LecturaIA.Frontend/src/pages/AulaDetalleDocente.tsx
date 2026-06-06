import { alertaError, alertaInformativa } from '../utils/alerts';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { aulasService, type AulaDetalle, type EstudianteAula } from '../services/aulasService';
import MetricasEstudianteModal from '../components/MetricasEstudianteModal';
import MetricasSalonModal from '../components/MetricasSalonModal';
import ListaExamenesAula from '../components/docente/ListaExamenesAula';

export default function AulaDetalleDocente() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [aula, setAula] = useState<AulaDetalle | null>(null);
  const [estudiantes, setEstudiantes] = useState<EstudianteAula[]>([]);
  const [isLoadingAula, setIsLoadingAula] = useState(true);
  const [isLoadingEstudiantes, setIsLoadingEstudiantes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estudianteAEliminar, setEstudianteAEliminar] = useState<EstudianteAula | null>(null);
  const [tabActiva, setTabActiva] = useState<'estudiantes' | 'examenes'>('estudiantes');
  
  // Estados para los modales de métricas
  const [showMetricasEstudiante, setShowMetricasEstudiante] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<{ id: number; nombre: string } | null>(null);
  const [showMetricasSalon, setShowMetricasSalon] = useState(false);

  useEffect(() => {
    if (id) {
      cargarDatosAula();
    }
  }, [id]);

  const cargarDatosAula = async () => {
    try {
      setIsLoadingAula(true);
      setIsLoadingEstudiantes(true);
      setError(null);

      const aulaId = parseInt(id!);
      
      // Cargar datos del aula
      const aulaData = await aulasService.obtenerAula(aulaId);
      setAula(aulaData);

      // Cargar estudiantes del aula
      const estudiantesData = await aulasService.obtenerEstudiantesAula(aulaId);
      setEstudiantes(estudiantesData);
    } catch (err: any) {
      console.error('Error al cargar aula:', err);
      setError(err.response?.data?.mensaje || 'Error al cargar los datos del aula');
    } finally {
      setIsLoadingAula(false);
      setIsLoadingEstudiantes(false);
    }
  };

  const handleRemoverEstudiante = async (estudiante: EstudianteAula) => {
    try {
      const aulaId = parseInt(id!);
      await aulasService.removerEstudiante(aulaId, estudiante.estudianteId);
      
      // Recargar lista de estudiantes
      cargarDatosAula();
      setEstudianteAEliminar(null);
    } catch (err: any) {
      alertaError('Error al remover estudiante: ' + (err.response?.data?.mensaje || err.message));
    }
  };

  const copiarCodigo = async (codigo: string) => {
    try {
      // Intentar usar la API moderna del portapapeles
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(codigo);
      } else {
        // Fallback para navegadores más antiguos o sin permisos
        const textarea = document.createElement('textarea');
        textarea.value = codigo;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      alertaInformativa(`Código ${codigo} copiado`);
    } catch (error) {
      console.error('Error al copiar:', error);
      // Fallback si todo falla
      const textarea = document.createElement('textarea');
      textarea.value = codigo;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alertaInformativa(`Código ${codigo} copiado`);
    }
  };

  if (isLoadingAula) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !aula) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 text-red-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error || 'Aula no encontrada'}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/docente/dashboard')}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/docente/dashboard')}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold">{aula.nombre}</h1>
                {aula.descripcion && (
                  <p className="text-blue-100 mt-1">{aula.descripcion}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Card: Código de Vinculación */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 uppercase mb-2">Código de Vinculación</h3>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-gray-900 tracking-widest">{aula.codigoVinculacion}</span>
              <button
                onClick={() => copiarCodigo(aula.codigoVinculacion)}
                className="p-2 text-gray-600 hover:text-blue-600 transition"
                title="Copiar código"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Comparte este código con tus estudiantes</p>
          </div>

          {/* Card: Total Estudiantes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 uppercase mb-2">Total Estudiantes</h3>
            <div className="text-4xl font-bold text-blue-600">{aula.cantidadEstudiantes}</div>
            <p className="text-xs text-gray-500 mt-2">Estudiantes activos en esta aula</p>
          </div>

          {/* Card: Fecha Creación */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 uppercase mb-2">Fecha de Creación</h3>
            <div className="text-xl font-semibold text-gray-900">
              {new Date(aula.fechaCreacion).toLocaleDateString('es-PE', { 
                day: 'numeric', 
                month: 'long',
                year: 'numeric'
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">Aula creada</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={() => setShowMetricasSalon(true)}
            className="flex-1 sm:flex-initial px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition shadow-md hover:shadow-lg flex items-center justify-center space-x-2 font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Ver Métricas del Salón</span>
          </button>
          
          <button
            onClick={() => navigate(`/docente/aula/${id}/examen/crear`)}
            className="flex-1 sm:flex-initial px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition shadow-md hover:shadow-lg flex items-center justify-center space-x-2 font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Crear Examen Grupal</span>
          </button>
        </div>

        {/* Pestañas */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setTabActiva('estudiantes')}
                className={`${
                  tabActiva === 'estudiantes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Estudiantes ({estudiantes.length})</span>
              </button>
              
              <button
                onClick={() => setTabActiva('examenes')}
                className={`${
                  tabActiva === 'examenes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Exámenes</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Contenido según pestaña */}
        {tabActiva === 'examenes' ? (
          <ListaExamenesAula aulaId={parseInt(id!)} />
        ) : (
          /* Lista de Estudiantes */
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">Estudiantes del Aula</h2>
          </div>

          {isLoadingEstudiantes ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : estudiantes.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay alumnos aún</h3>
              <p className="text-gray-600 mb-4">
                Comparte el código de vinculación <span className="font-bold text-blue-600">{aula.codigoVinculacion}</span> con tus estudiantes para que se unan.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre Completo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Vinculación
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {estudiantes.map((estudiante) => (
                    <tr key={estudiante.estudianteId} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{estudiante.nombreCompleto}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{estudiante.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{estudiante.grado || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {new Date(estudiante.fechaVinculacion).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Botón Ver Métricas */}
                          <button
                            onClick={() => {
                              setEstudianteSeleccionado({
                                id: estudiante.estudianteId,
                                nombre: estudiante.nombreCompleto
                              });
                              setShowMetricasEstudiante(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition"
                            title="Ver métricas"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </button>
                          {/* Botón Remover */}
                          <button
                            onClick={() => setEstudianteAEliminar(estudiante)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition"
                            title="Remover estudiante"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación de estudiante */}
      {estudianteAEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Remover Estudiante</h3>
                <p className="text-sm text-gray-600">Esta acción desvinculará al estudiante</p>
              </div>
            </div>
            <p className="text-gray-700 mb-2">
              ¿Estás seguro de que deseas remover a <strong>{estudianteAEliminar.nombreCompleto}</strong> de esta aula?
            </p>
            <p className="text-gray-600 text-sm mb-6">
              El estudiante podrá volver a unirse usando el código de vinculación.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEstudianteAEliminar(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRemoverEstudiante(estudianteAEliminar)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Métricas del Estudiante */}
      {estudianteSeleccionado && (
        <MetricasEstudianteModal
          estudianteId={estudianteSeleccionado.id}
          nombreEstudiante={estudianteSeleccionado.nombre}
          isOpen={showMetricasEstudiante}
          onClose={() => {
            setShowMetricasEstudiante(false);
            setEstudianteSeleccionado(null);
          }}
        />
      )}

      {/* Modal de Métricas del Salón */}
      {aula && (
        <MetricasSalonModal
          aulaId={aula.id}
          nombreAula={aula.nombre}
          isOpen={showMetricasSalon}
          onClose={() => setShowMetricasSalon(false)}
        />
      )}
    </div>
  );
}
