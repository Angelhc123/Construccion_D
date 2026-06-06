import { alertaError, alertaInformativa } from '../utils/alerts';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { aulasService, type AulaDetalle } from '../services/aulasService';
import CrearAulaModal from '../components/docente/CrearAulaModal';

export default function DocenteAulasPage() {
  const [aulas, setAulas] = useState<AulaDetalle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [aulaEliminar, setAulaEliminar] = useState<number | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    cargarAulas();
  }, []);

  const cargarAulas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await aulasService.obtenerMisAulas();
      setAulas(data);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al cargar las aulas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminarAula = async (id: number) => {
    try {
      await aulasService.eliminarAula(id);
      setAulaEliminar(null);
      cargarAulas(); // Recargar la lista
    } catch (err: any) {
      alertaError(err.response?.data?.mensaje || 'Error al eliminar el aula');
    }
  };

  const handleIngresarAula = (id: number) => {
    navigate(`/docente/aula/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Aulas de Clases</h1>
              <p className="text-gray-600 mt-1">Gestiona tus aulas y estudiantes</p>
            </div>
            <button
              onClick={() => navigate('/docente')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
            >
              ← Volver al Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Barra de acciones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowCrearModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Crear Nueva Aula</span>
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 text-red-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        ) : aulas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes aulas creadas</h3>
            <p className="text-gray-600 mb-6">Crea tu primera aula para comenzar a gestionar tus estudiantes</p>
            <button
              onClick={() => setShowCrearModal(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Crear Primera Aula</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aulas.map((aula) => (
              <div key={aula.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden">
                {/* Header de la card */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
                  <h3 className="text-xl font-bold mb-2">{aula.nombre}</h3>
                  {aula.descripcion && (
                    <p className="text-blue-100 text-sm line-clamp-2">{aula.descripcion}</p>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-6">
                  {/* Código de vinculación */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <label className="text-xs text-gray-600 font-medium uppercase">Código de Vinculación</label>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-2xl font-bold text-gray-900 tracking-widest">{aula.codigoVinculacion}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aula.codigoVinculacion);
                          alertaInformativa('¡Código copiado al portapapeles!');
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600 transition"
                        title="Copiar código"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Estadísticas */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{aula.cantidadEstudiantes}</div>
                      <div className="text-xs text-gray-600">Estudiantes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">
                        {new Date(aula.fechaCreacion).toLocaleDateString('es-PE', { 
                          day: '2-digit', 
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-gray-600">Creada</div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleIngresarAula(aula.id)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Ingresar</span>
                    </button>
                    <button
                      onClick={() => setAulaEliminar(aula.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center"
                      title="Eliminar aula"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal crear aula */}
      <CrearAulaModal
        isOpen={showCrearModal}
        onClose={() => setShowCrearModal(false)}
        onAulaCreada={cargarAulas}
      />

      {/* Modal de confirmación de eliminación */}
      {aulaEliminar !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirmar eliminación</h3>
                <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que deseas eliminar esta aula? Todos los estudiantes serán desvinculados.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setAulaEliminar(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEliminarAula(aulaEliminar)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
