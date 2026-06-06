import { alertaError, alertaInformativa, promptTexto } from '../utils/alerts';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AyudaContextual from '../components/AyudaContextual';
import TutorialInicial from '../components/TutorialInicial';
import { adminService, type UsuarioAdmin, type EstadisticasGenerales } from '../services/adminService';
import { ayudaService } from '../services/ayudaService';
import { contenidoAyuda, tutorialAdmin } from '../data/contenidoAyuda';

export default function AdminDashboard() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<UsuarioAdmin[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasGenerales | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [vistaActual, setVistaActual] = useState<'usuarios' | 'estadisticas'>('usuarios');
  
  // Modales
  const [showModalSuspender, setShowModalSuspender] = useState(false);
  const [showModalReactivar, setShowModalReactivar] = useState(false);
  const [showModalReiniciar, setShowModalReiniciar] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioAdmin | null>(null);
  const [motivoSuspension, setMotivoSuspension] = useState('');
  const [passwordTemporal, setPasswordTemporal] = useState('');
  const [mostrarTutorial, setMostrarTutorial] = useState(false);
  const [cargandoTutorial, setCargandoTutorial] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      navigate('/docente'); // Admin login is through Docente page for now
      return;
    }

    if (user.tipoUsuario !== 'Administrador') {
      navigate('/');
      return;
    }

    cargarDatos();
    verificarPrimeraSesion();
  }, [isAuthenticated, user, authLoading, navigate]);

  const verificarPrimeraSesion = async () => {
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
  };

  useEffect(() => {
    // Filtrar usuarios en tiempo real
    if (busqueda.trim() === '') {
      setUsuariosFiltrados(usuarios);
    } else {
      const filtrados = usuarios.filter(u => 
        u.email.toLowerCase().includes(busqueda.toLowerCase())
      );
      setUsuariosFiltrados(filtrados);
    }
  }, [busqueda, usuarios]);

  const cargarDatos = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [usuariosData, statsData] = await Promise.all([
        adminService.obtenerUsuarios(),
        adminService.obtenerEstadisticas()
      ]);
      setUsuarios(usuariosData);
      setUsuariosFiltrados(usuariosData);
      setEstadisticas(statsData);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al cargar datos');
      console.error('Error al cargar datos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspender = (usuario: UsuarioAdmin) => {
    setUsuarioSeleccionado(usuario);
    setShowModalSuspender(true);
  };

  const confirmarSuspension = async () => {
    if (!usuarioSeleccionado || !motivoSuspension.trim()) {
      alertaError('Por favor ingrese un motivo válido');
      return;
    }

    try {
      await adminService.suspenderUsuario(usuarioSeleccionado.id, motivoSuspension);
      setShowModalSuspender(false);
      setMotivoSuspension('');
      setUsuarioSeleccionado(null);
      await cargarDatos();
      alertaInformativa('Usuario suspendido correctamente');
    } catch (err: any) {
      alertaError(err.response?.data?.mensaje || 'Error al suspender usuario');
    }
  };

  const handleReactivar = (usuario: UsuarioAdmin) => {
    setUsuarioSeleccionado(usuario);
    setShowModalReactivar(true);
  };

  const confirmarReactivacion = async () => {
    if (!usuarioSeleccionado) return;

    try {
      await adminService.reactivarUsuario(usuarioSeleccionado.id);
      setShowModalReactivar(false);
      setUsuarioSeleccionado(null);
      await cargarDatos();
      alertaInformativa('Usuario reactivado correctamente');
    } catch (err: any) {
      alertaError(err.response?.data?.mensaje || 'Error al reactivar usuario');
    }
  };

  const handleReiniciarPassword = async (usuario: UsuarioAdmin) => {
    const motivo = (await promptTexto('Ingrese el motivo del reinicio de contraseña:'));
    if (!motivo) return;

    try {
      const response = await adminService.reiniciarPassword(usuario.id, motivo);
      setPasswordTemporal(response.passwordTemporal);
      setUsuarioSeleccionado(usuario);
      setShowModalReiniciar(true);
    } catch (err: any) {
      alertaError(err.response?.data?.mensaje || 'Error al reiniciar contraseña');
    }
  };

  const handleCerrarSesion = () => {
    logout();
    navigate('/docente');
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return 'Nunca';
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">Panel Admin</h1>
        
        <nav className="space-y-2">
          <button
            onClick={() => setVistaActual('estadisticas')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              vistaActual === 'estadisticas' ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            📊 Estadísticas Generales
          </button>
          <button
            onClick={() => setVistaActual('usuarios')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              vistaActual === 'usuarios' ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            👥 Gestión de Usuarios
          </button>
        </nav>

        <button
          onClick={handleCerrarSesion}
          className="absolute bottom-6 left-6 right-6 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          🚪 Cerrar Sesión
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Vista de Estadísticas */}
        {vistaActual === 'estadisticas' && estadisticas && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Estadísticas Generales</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600 mb-2">Total Usuarios</p>
                <p className="text-4xl font-bold text-blue-600">{estadisticas.totalUsuarios}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600 mb-2">Docentes</p>
                <p className="text-4xl font-bold text-green-600">{estadisticas.totalDocentes}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600 mb-2">Estudiantes</p>
                <p className="text-4xl font-bold text-purple-600">{estadisticas.totalEstudiantes}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600 mb-2">Usuarios Activos</p>
                <p className="text-4xl font-bold text-cyan-600">{estadisticas.usuariosActivos}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600 mb-2">Suspendidos</p>
                <p className="text-4xl font-bold text-red-600">{estadisticas.usuariosSuspendidos}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600 mb-2">Lecturas Generadas</p>
                <p className="text-4xl font-bold text-orange-600">{estadisticas.lecturasGeneradas}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600 mb-2">Cuestionarios Completados</p>
                <p className="text-4xl font-bold text-pink-600">{estadisticas.cuestionariosCompletados}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600 mb-2">Aulas Activas</p>
                <p className="text-4xl font-bold text-indigo-600">{estadisticas.aulasActivas}</p>
              </div>
            </div>
          </div>
        )}

        {/* Vista de Gestión de Usuarios */}
        {vistaActual === 'usuarios' && !isLoading && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Usuarios</h2>
            
            {/* Barra de búsqueda */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Buscar por correo electrónico..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Tabla de usuarios */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Acceso</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nota</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usuariosFiltrados.map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{usuario.nombreCompleto}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{usuario.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            usuario.tipo === 'Administrador' ? 'bg-red-100 text-red-800' :
                            usuario.tipo === 'Docente' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {usuario.tipo}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            usuario.suspendido ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {usuario.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatearFecha(usuario.ultimoAcceso)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {usuario.motivoSuspension || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {usuario.tipo !== 'Administrador' && (
                            <>
                              {!usuario.suspendido ? (
                                <button
                                  onClick={() => handleSuspender(usuario)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Suspender
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleReactivar(usuario)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Reactivar
                                </button>
                              )}
                              <button
                                onClick={() => handleReiniciarPassword(usuario)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Reiniciar Contraseña
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {usuariosFiltrados.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron usuarios
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Suspender Usuario */}
      {showModalSuspender && usuarioSeleccionado && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Suspender Usuario</h3>
            <p className="mb-4">¿Está seguro de suspender a <strong>{usuarioSeleccionado.nombreCompleto}</strong>?</p>
            
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Motivo de la suspensión:
            </label>
            <textarea
              value={motivoSuspension}
              onChange={(e) => setMotivoSuspension(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              rows={3}
              placeholder="Ingrese el motivo..."
            />
            
            <div className="flex space-x-3">
              <button
                onClick={confirmarSuspension}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Confirmar
              </button>
              <button
                onClick={() => {
                  setShowModalSuspender(false);
                  setMotivoSuspension('');
                  setUsuarioSeleccionado(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reactivar Usuario */}
      {showModalReactivar && usuarioSeleccionado && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Reactivar Usuario</h3>
            <p className="mb-4">¿Está seguro de reactivar a <strong>{usuarioSeleccionado.nombreCompleto}</strong>?</p>
            
            <div className="flex space-x-3">
              <button
                onClick={confirmarReactivacion}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Confirmar
              </button>
              <button
                onClick={() => {
                  setShowModalReactivar(false);
                  setUsuarioSeleccionado(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Password Temporal */}
      {showModalReiniciar && usuarioSeleccionado && passwordTemporal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Contraseña Reiniciada</h3>
            <p className="mb-4">La contraseña de <strong>{usuarioSeleccionado.nombreCompleto}</strong> ha sido reiniciada.</p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700 mb-2">Contraseña temporal:</p>
              <p className="text-2xl font-mono font-bold text-blue-600">{passwordTemporal}</p>
              <p className="text-xs text-gray-500 mt-2">Por favor comunique esta contraseña al usuario de forma segura.</p>
            </div>
            
            <button
              onClick={() => {
                setShowModalReiniciar(false);
                setPasswordTemporal('');
                setUsuarioSeleccionado(null);
              }}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Ayuda Contextual */}
      {!cargandoTutorial && !mostrarTutorial && (
        <AyudaContextual
          pantalla="Dashboard Administrador"
          contenido={contenidoAyuda.adminDashboard}
          onVerTutorial={() => setMostrarTutorial(true)}
        />
      )}

      {/* Tutorial Inicial */}
      {mostrarTutorial && (
        <TutorialInicial
          pasos={tutorialAdmin}
          onCompletar={() => setMostrarTutorial(false)}
          onOmitir={() => setMostrarTutorial(false)}
          tipoUsuario="Administrador"
        />
      )}
    </div>
  );
}
