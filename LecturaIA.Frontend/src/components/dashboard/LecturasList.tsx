import { useNavigate } from 'react-router-dom';
import type { LecturaLista } from '../../services/lecturaService';

interface LecturasListProps {
  lecturas: LecturaLista[];
  isLoading: boolean;
  activeTab: 'lista' | 'favoritas';
  onToggleFavorita: (id: number, esFavorita: boolean) => void;
  onComenzarLectura: (id: number) => void;
  onEliminarLectura: (id: number) => void;
}

export default function LecturasList({
  lecturas,
  isLoading,
  activeTab,
  onToggleFavorita,
  onComenzarLectura,
  onEliminarLectura
}: LecturasListProps) {
  const navigate = useNavigate();

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'en-progreso':
        return 'bg-yellow-100 text-yellow-800';
      case 'pendiente':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'Completado';
      case 'en-progreso':
        return 'En Progreso';
      case 'pendiente':
        return 'Pendiente';
      default:
        return 'Pendiente';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Título
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Tipo
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Long.
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Fecha
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Progreso
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Estado
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Fav
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-lg font-medium">Cargando tus lecturas...</p>
                  </div>
                </td>
              </tr>
            ) : lecturas.length > 0 ? (
              lecturas.map((lectura) => (
                <tr key={lectura.id} className="hover:bg-gray-50 transition">
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate" title={lectura.titulo}>{lectura.titulo}</div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{lectura.tipoLectura}</div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{lectura.longitud}</div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{new Date(lectura.fechaCreacion).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}</div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center min-w-[90px]">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-1.5">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${lectura.progreso}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 w-10 text-right">{lectura.progreso}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(lectura.estado)}`}>
                      {getEstadoTexto(lectura.estado)}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-center">
                    <button
                      onClick={() => onToggleFavorita(lectura.id, lectura.esFavorita)}
                      className={`p-1 transition ${lectura.esFavorita ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-300 hover:text-yellow-500'}`}
                      title={lectura.esFavorita ? "Quitar de favoritas" : "Agregar a favoritas"}
                    >
                      <svg className="w-5 h-5" fill={lectura.esFavorita ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="flex flex-wrap justify-end items-center gap-2">
                      {/* Botón principal según estado */}
                      {lectura.estado === 'pendiente' && (
                        <button
                          onClick={() => onComenzarLectura(lectura.id)}
                          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition text-xs font-medium whitespace-nowrap"
                          title="Comenzar a leer"
                        ><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg><span>Comenzar</span></button>
                      )}
                      {lectura.estado === 'en_progreso' && (
                        <button
                          onClick={() => onComenzarLectura(lectura.id)}
                          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition text-xs font-medium whitespace-nowrap"
                          title="Continuar lectura"
                        ><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg><span>Continuar</span></button>
                      )}
                      {lectura.estado === 'completado' && (
                        <button
                          onClick={() => onComenzarLectura(lectura.id)}
                          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition text-xs font-medium whitespace-nowrap"
                          title="Volver a leer"
                        ><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg><span>Releer</span></button>
                      )}
                      {lectura.estado === 'completado' && !lectura.cuestionarioEvaluado && (
                        <button
                          onClick={() => navigate(`/estudiante/lectura/${lectura.id}`)}
                          className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition text-xs font-medium whitespace-nowrap"
                          title="Ir a cuestionario"
                        ><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg><span>Cuestionario</span></button>
                      )}
                      {lectura.cuestionarioEvaluado && lectura.cuestionarioId && (
                        <button
                          onClick={() => navigate(`/estudiante/cuestionario/${lectura.id}/resultados?cuestionarioId=${lectura.cuestionarioId}`)}
                          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition text-xs font-medium whitespace-nowrap"
                          title="Ver resultados del cuestionario"
                        ><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg><span>Resultados</span></button>
                      )}

                      {/* Botones secundarios */}
                      {lectura.cuestionarioEvaluado && (
                        <button
                          onClick={() => navigate(`/estudiante/lectura/${lectura.id}/historial`)}
                          className="flex items-center gap-1 text-purple-600 hover:text-purple-900 hover:bg-purple-50 px-2 py-1.5 rounded transition text-xs whitespace-nowrap"
                          title="Ver historial de resultados"
                        ><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg><span>Historial</span></button>
                      )}
                      <button
                        onClick={() => onEliminarLectura(lectura.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-900 hover:bg-red-50 px-2 py-1.5 rounded transition text-xs whitespace-nowrap"
                        title="Eliminar lectura"
                      ><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg><span>Eliminar</span></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-lg font-medium">
                      {activeTab === 'favoritas' ? 'No tienes lecturas favoritas' : 'No se encontraron lecturas'}
                    </p>
                    <p className="text-sm mt-2">
                      {activeTab === 'favoritas'
                        ? 'Marca una lectura como favorita usando la estrella ⭐'
                        : 'Intenta ajustar los filtros de búsqueda'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
