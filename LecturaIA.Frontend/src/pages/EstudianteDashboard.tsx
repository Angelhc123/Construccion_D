import { alertaError, alertaInformativa, confirmacionEliminar } from '../utils/alerts';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import CambiarPasswordModal from '../components/CambiarPasswordModal';
import MiPerfilModal from '../components/MiPerfilModal';
import MiClaseModal from '../components/MiClaseModal';
import EncuestaGuiadaModal, { type PreferenciasLectura } from '../components/EncuestaGuiadaModal';
import VistaPreviaPreferenciasModal from '../components/VistaPreviaPreferenciasModal';
import AyudaContextual from '../components/AyudaContextual';
import TutorialInicial from '../components/TutorialInicial';
import { lecturaService, type LecturaLista } from '../services/lecturaService';
import { contenidoAyuda, tutorialEstudiante } from '../data/contenidoAyuda';
import { ROLES } from '../config/constants';
import LecturasList from '../components/dashboard/LecturasList';
import LecturasFilter from '../components/dashboard/LecturasFilter';

type TabType = 'lista' | 'favoritas';

export default function EstudianteDashboard() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showClaseModal, setShowClaseModal] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('lista');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterNivel, setFilterNivel] = useState('todos');
  const navigate = useNavigate();

  // Estados para la encuesta y generación de lecturas
  const [showEncuesta, setShowEncuesta] = useState(false);
  const [showVistaPrevia, setShowVistaPrevia] = useState(false);
  const [preferenciasActuales, setPreferenciasActuales] = useState<PreferenciasLectura | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Lecturas del estudiante (ahora desde API)
  const [lecturas, setLecturas] = useState<LecturaLista[]>([]);
  const [isLoadingLecturas, setIsLoadingLecturas] = useState(true);

  // Estados para tutorial y ayuda
  const [mostrarTutorial, setMostrarTutorial] = useState(false);
  const [cargandoTutorial, setCargandoTutorial] = useState(true);

  // Cargar lecturas y verificar sesión
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      navigate('/estudiante');
      return;
    }

    if (user.tipoUsuario !== ROLES.ESTUDIANTE) {
      navigate('/');
      return;
    }

    cargarLecturas();
    // verificarPrimeraSesion(); // TODO: Necesita implementarse correctamente con API real
    setCargandoTutorial(false); // Deshabilitamos temporalmente la verificación de tutorial
  }, [user, isAuthenticated, authLoading, navigate]);

  // Recargar lecturas cuando el usuario regresa a esta página
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        cargarLecturas();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // También recargar cuando el componente se monta (navegación desde otra página)
    window.addEventListener('focus', cargarLecturas);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', cargarLecturas);
    };
  }, [isAuthenticated]);

  const cargarLecturas = async () => {
    try {
      setIsLoadingLecturas(true);
      const lecturasData = await lecturaService.obtenerLecturas();
      // Asegurarse de que sea un array
      if (Array.isArray(lecturasData)) {
        setLecturas(lecturasData);
      } else {
        console.error('Datos de lecturas inválidos:', lecturasData);
        setLecturas([]); // Fallback a array vacío
      }
    } catch (error) {
      console.error('Error al cargar lecturas:', error);
      setLecturas([]);
    } finally {
      setIsLoadingLecturas(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/estudiante');
  };

  const handleGenerarLectura = () => {
    setShowEncuesta(true);
  };

  const handleEncuestaComplete = (preferencias: PreferenciasLectura) => {
    setPreferenciasActuales(preferencias);
    setShowEncuesta(false);
    setShowVistaPrevia(true);
  };

  const handleGenerarLecturaConIA = async () => {
    if (!preferenciasActuales) return;

    try {
      setIsGenerating(true);
      const lecturaGenerada = await lecturaService.generarLectura(preferenciasActuales);
      
      // Cerrar modales
      setShowVistaPrevia(false);
      setPreferenciasActuales(null);
      setIsGenerating(false);

      // Recargar lecturas
      await cargarLecturas();

      // Navegar a la lectura generada
      navigate(`/estudiante/lectura/${lecturaGenerada.id}`);
    } catch (error: any) {
      setIsGenerating(false);
      alertaError(error.message || 'Error al generar la lectura');
    }
  };

  const handleEliminarLectura = async (id: number) => {
    if ((await confirmacionEliminar('¿Estás seguro de eliminar esta lectura?'))) {
      try {
        await lecturaService.eliminarLectura(id);
        // Recargar la lista de lecturas
        await cargarLecturas();
        alertaInformativa('Lectura eliminada exitosamente');
      } catch (error: any) {
        console.error('Error al eliminar lectura:', error);
        alertaError(`Error al eliminar la lectura: ${error.message}`);
      }
    }
  };

  const handleToggleFavorita = async (id: number, esFavorita: boolean) => {
    try {
      await lecturaService.toggleFavorita(id, !esFavorita);
      // Recargar la lista de lecturas
      await cargarLecturas();
    } catch (error: any) {
      alertaError(`Error al actualizar favorita: ${error.message}`);
    }
  };

  const handleComenzarLectura = (id: number) => {
    navigate(`/estudiante/leer/${id}`);
  };

  // Filtrar lecturas según búsqueda, filtros y tab activa
  const lecturasFiltradas = Array.isArray(lecturas) ? lecturas.filter(lectura => {
    const matchSearch = lectura.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filterTipo === 'todos' || lectura.tipoLectura === filterTipo;
    const matchLongitud = filterNivel === 'todos' || lectura.longitud === filterNivel;
    const matchTab = activeTab === 'lista' || (activeTab === 'favoritas' && lectura.esFavorita);
    return matchSearch && matchTipo && matchLongitud && matchTab;
  }) : [];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Cargando sesión...</div>
      </div>
    );
  }

  // Verificación robusta del usuario y su rol
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="text-xl text-red-600 font-semibold mb-2">No se ha detectado un usuario activo.</div>
        <div className="text-gray-600 mb-4">Redirigiendo al inicio de sesión...</div>
        <button onClick={() => navigate('/estudiante')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Ir a Iniciar Sesión
        </button>
      </div>
    );
  }

  // Normalización para verificación de rol (Manejo de mayúsculas/minúsculas o propiedades alternativas)
  // @ts-ignore - Soporte para posibles inconsistencias del backend
  const userRole = user.tipoUsuario || user.TipoUsuario || user.role || '';
  
  if (userRole !== 'Estudiante') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
        <p className="text-gray-700 mb-4">
          Tu usuario ({user.nombreCompleto}) tiene el rol: <strong>{userRole}</strong>
        </p>
        <p className="text-gray-600 mb-6">Esta página es exclusiva para Estudiantes.</p>
        <button onClick={handleLogout} className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Cerrar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center min-w-[90px]">
              <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h1 className="text-2xl font-bold">LecturaIA - Estudiante</h1>
            </div>
            
            {/* Botón Mis Exámenes */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/estudiante/examenes')}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Mis Exámenes</span>
              </button>
            </div>
            
            {/* Menú de usuario */}
            <div className="relative">
              <button
                onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                      setShowPerfilModal(true);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Ver Perfil</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenuDropdown(false);
                      setShowClaseModal(true);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>Mi Clase</span>
                  </button>
                  <hr className="my-2" />
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Área de trabajo del estudiante */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con tabs y botón Mi perfil */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Área de Trabajo</h2>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('lista')}
              className={`pb-3 px-4 font-medium transition ${
                activeTab === 'lista'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Lista de Lecturas
            </button>
            <button
              onClick={() => setActiveTab('favoritas')}
              className={`pb-3 px-4 font-medium transition ${
                activeTab === 'favoritas'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Lecturas Favoritas
            </button>
          </div>
        </div>

        {/* Contenido de las tabs */}
        {activeTab === 'lista' && (
          <div className="space-y-6">
            <LecturasFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterTipo={filterTipo}
              setFilterTipo={setFilterTipo}
              filterNivel={filterNivel}
              setFilterNivel={setFilterNivel}
              onGenerarLectura={handleGenerarLectura}
            />

            <LecturasList
              activeTab={activeTab}
              lecturas={lecturasFiltradas}
              isLoading={isLoadingLecturas}
              onEliminarLectura={handleEliminarLectura}
              onToggleFavorita={handleToggleFavorita}
              onComenzarLectura={handleComenzarLectura}
            />
          </div>
        )}

        {activeTab === 'favoritas' && (
          <div className="space-y-6">
            {/* En favoritas no mostramos filtros, solo la lista */}
            <LecturasList
              activeTab={activeTab}
              lecturas={lecturasFiltradas}
              isLoading={isLoadingLecturas}
              onEliminarLectura={handleEliminarLectura}
              onToggleFavorita={handleToggleFavorita}
              onComenzarLectura={handleComenzarLectura}
            />
          </div>
        )}
      </div>

      {/* Modal de Cambiar Contraseña */}
      <CambiarPasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />

      {/* Modal de Mi Perfil */}
      <MiPerfilModal
        isOpen={showPerfilModal}
        onClose={() => setShowPerfilModal(false)}
      />

      {/* Modal de Mi Clase */}
      <MiClaseModal
        isOpen={showClaseModal}
        onClose={() => setShowClaseModal(false)}
      />

      {/* Modal de Encuesta Guiada */}
      <EncuestaGuiadaModal
        isOpen={showEncuesta}
        onClose={() => setShowEncuesta(false)}
        onComplete={handleEncuestaComplete}
      />

      {/* Modal de Vista Previa de Preferencias */}
      {preferenciasActuales && (
        <VistaPreviaPreferenciasModal
          isOpen={showVistaPrevia}
          preferencias={preferenciasActuales}
          onClose={() => {
            setShowVistaPrevia(false);
            setPreferenciasActuales(null);
          }}
          onGenerarLectura={handleGenerarLecturaConIA}
          isGenerating={isGenerating}
        />
      )}

      {/* Ayuda Contextual */}
      {!cargandoTutorial && !mostrarTutorial && contenidoAyuda?.estudianteDashboard && (
        <AyudaContextual
          pantalla="Dashboard Estudiante"
          contenido={contenidoAyuda.estudianteDashboard}
          onVerTutorial={() => setMostrarTutorial(true)}
        />
      )}

      {/* Tutorial Inicial */}
      {mostrarTutorial && tutorialEstudiante && (
        <TutorialInicial
          pasos={tutorialEstudiante}
          onCompletar={() => setMostrarTutorial(false)}
          onOmitir={() => setMostrarTutorial(false)}
          tipoUsuario="Estudiante"
        />
      )}
    </div>
  );
}

