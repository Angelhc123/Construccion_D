import { alertaError, alertaInformativa, confirmacionEliminar } from '../utils/alerts';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import CambiarPasswordModal from '../components/CambiarPasswordModal';
import CrearAulaModal from '../components/docente/CrearAulaModal';
import AyudaContextual from '../components/AyudaContextual';
import TutorialInicial from '../components/TutorialInicial';
import { aulasService, type AulaDetalle } from '../services/aulasService';
import { contenidoAyuda, tutorialDocente } from '../data/contenidoAyuda';

type TabType = 'aulas' | 'perfil';

export default function DocenteDashboard() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCrearAulaModal, setShowCrearAulaModal] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('aulas');
  const [aulas, setAulas] = useState<AulaDetalle[]>([]);
  const [isLoadingAulas, setIsLoadingAulas] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aulaAEliminar, setAulaAEliminar] = useState<AulaDetalle | null>(null);
  const [mostrarTutorial, setMostrarTutorial] = useState(false);
  const [cargandoTutorial, setCargandoTutorial] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      navigate('/docente');
      return;
    }

    if (user.tipoUsuario !== 'Docente') {
      navigate('/');
      return;
    }

    verificarPrimeraSesion();
  }, [user, isAuthenticated, authLoading, navigate]);

  /* const verificarPrimeraSesion = async () => {
    try {
      const estado = await ayudaService.obtenerEstadoTutorial();
      if (estado.primeraSesion) {
        setMostrarTutorial(true);
      }
    } catch (error) {
      console.error('Error al verificar tutorial:', error);
    } finally {
      setCargandoTutorial(false);
    }
  }; */

  const verificarPrimeraSesion = () => { setCargandoTutorial(false); };

  const cargarAulas = async () => {
    try {
      setIsLoadingAulas(true);
      setError(null);
      const data = await aulasService.obtenerMisAulas();
      setAulas(data);
    } catch (err: any) {
      console.error('Error al cargar aulas:', err);
      setError('Error al cargar las aulas');
    } finally {
      setIsLoadingAulas(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/docente');
  };

  const handleAulaCreada = () => {
    cargarAulas();
    setShowCrearAulaModal(false);
  };

  const handleIngresarAula = (id: number) => {
    navigate(`/docente/aula/${id}`);
  };

  const handleEliminarAula = async (aula: AulaDetalle) => {
    if (!(await confirmacionEliminar(`¿Estás seguro de eliminar el aula "${aula.nombre}"?\n\nTodos los estudiantes serán desvinculados.`))) {
      return;
    }

    try {
      await aulasService.eliminarAula(aula.id);
      cargarAulas();
    } catch (err: any) {
      alertaError('Error al eliminar el aula: ' + (err.response?.data?.mensaje || err.message));
    }
  };

  const copiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    alertaInformativa(`Código ${codigo} copiado al portapapeles`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Cargando sesión...</div>
      </div>
    );
  }

  if (!user || user.tipoUsuario !== 'Docente') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h1 className="text-2xl font-bold">LecturaIA - Docente</h1>
            </div>
            
            {/* Menú de usuario */}
            <div className="relative">
              <button
                onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                className="flex items-center space-x-2 bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{user.nombreCompleto}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showMenuDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                  <button
                    onClick={() => {
                      setShowMenuDropdown(false);
                      setShowPasswordModal(true);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span>Cambiar Contraseña</span>
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Área de trabajo del docente */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con tabs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Panel de Control Docente</h2>

          {/* Tabs */}
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('aulas')}
              className={`pb-3 px-4 font-medium transition ${
                activeTab === 'aulas'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              Mis Aulas de Clases
            </button>
            <button
              onClick={() => setActiveTab('perfil')}
              className={`pb-3 px-4 font-medium transition ${
                activeTab === 'perfil'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              Mi Perfil
            </button>
          </div>
        </div>

        {/* Contenido de las tabs */}
        {activeTab === 'aulas' && (
          <div className="space-y-6">
            {/* Botón Crear Aula */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setShowCrearAulaModal(true)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Crear Nueva Aula</span>
              </button>
            </div>

            {/* Contenido de aulas */}
            {isLoadingAulas ? (
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
                  onClick={() => setShowCrearAulaModal(true)}
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
                            onClick={() => copiarCodigo(aula.codigoVinculacion)}
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
                          onClick={() => setAulaAEliminar(aula)}
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
        )}

        {activeTab === 'perfil' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Mi Perfil</h3>
              
              <div className="space-y-6">
                {/* Información personal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800">
                    {user?.nombreCompleto}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800">
                    {user?.email}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Usuario</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800">
                    Docente
                  </div>
                </div>

                {/* Acciones */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Configuración</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full flex items-center justify-between bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-lg transition"
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        <span className="text-gray-700 font-medium">Cambiar Contraseña</span>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between bg-white border border-red-300 hover:bg-red-50 px-4 py-3 rounded-lg transition"
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-red-600 font-medium">Cerrar Sesión</span>
                      </div>
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Cambiar Contraseña */}
      <CambiarPasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />

      {/* Modal Crear Aula */}
      <CrearAulaModal
        isOpen={showCrearAulaModal}
        onClose={() => setShowCrearAulaModal(false)}
        onAulaCreada={handleAulaCreada}
      />

      {/* Modal de confirmación de eliminación */}
      {aulaAEliminar && (
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
            <p className="text-gray-700 mb-2">
              ¿Estás seguro de que deseas eliminar el aula <strong>{aulaAEliminar.nombre}</strong>?
            </p>
            <p className="text-gray-600 text-sm mb-6">
              Todos los estudiantes serán desvinculados.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setAulaAEliminar(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  handleEliminarAula(aulaAEliminar);
                  setAulaAEliminar(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ayuda Contextual */}
      {!cargandoTutorial && !mostrarTutorial && (
        <AyudaContextual
          pantalla="Dashboard Docente"
          contenido={contenidoAyuda.docenteDashboard}
          onVerTutorial={() => setMostrarTutorial(true)}
        />
      )}

      {/* Tutorial Inicial */}
      {mostrarTutorial && (
        <TutorialInicial
          pasos={tutorialDocente}
          onCompletar={() => setMostrarTutorial(false)}
          onOmitir={() => setMostrarTutorial(false)}
          tipoUsuario="Docente"
        />
      )}
    </div>
  );
}
