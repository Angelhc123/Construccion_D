import { alertaError, alertaInformativa, confirmacionAccion } from '../../utils/alerts';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import examenGrupalService from '../../services/examenGrupalService';
import type { ExamenGrupalDto } from '../../types/exam.types';

export default function ListaExamenesAula({ aulaId }: { aulaId: number }) {
  const navigate = useNavigate();
  const [examenes, setExamenes] = useState<ExamenGrupalDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [reasignando, setReasignando] = useState<number | null>(null);

  useEffect(() => {
    cargarExamenes();
  }, [aulaId]);

  const cargarExamenes = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await examenGrupalService.listarExamenesAula(aulaId);
      setExamenes(data);
    } catch (err: any) {
      console.error('Error al cargar exámenes:', err);
      setError(err.response?.data?.mensaje || 'Error al cargar exámenes');
    } finally {
      setIsLoading(false);
    }
  };

  const calcularEstado = (examen: ExamenGrupalDto) => {
    if (examen.porcentajeCompletado === 100) return 'Completado';
    if (examen.fechaLimite && new Date(examen.fechaLimite) < new Date() && examen.porcentajeCompletado < 100) return 'Vencido';
    return 'En Progreso';
  };

  const handleReasignar = async (examenId: number) => {
    if (!(await confirmacionAccion('¿Reasignar este examen a todos los estudiantes del aula? Se creará una nueva asignación.'))) {
      return;
    }

    try {
      setReasignando(examenId);
      await examenGrupalService.reasignarExamen(examenId, {});
      alertaInformativa('Examen reasignado exitosamente');
      cargarExamenes(); // Recargar lista
    } catch (err: any) {
      console.error('Error al reasignar:', err);
      alertaError('Error al reasignar examen: ' + (err.response?.data?.mensaje || err.message));
    } finally {
      setReasignando(null);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Completado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'En Progreso':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Vencido':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-gray-600">Cargando exámenes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-800">
              Exámenes del Aula ({examenes.length})
            </h3>
          </div>
          <button
            onClick={() => navigate(`/docente/aula/${aulaId}/examen/crear`)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Crear Examen</span>
          </button>
        </div>
      </div>

      {/* Lista de exámenes */}
      {examenes.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 mb-4">No hay exámenes creados para esta aula</p>
          <button
            onClick={() => navigate(`/docente/aula/${aulaId}/examen/crear`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Crear primer examen
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {examenes.map((examen) => (
            <div key={examen.id} className="px-6 py-4 hover:bg-gray-50 transition">
              <div className="flex items-start justify-between">
                {/* Información del examen */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-bold text-gray-800">{examen.titulo}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoBadge(calcularEstado(examen))}`}>
                      {calcularEstado(examen)}
                    </span>
                  </div>
                  
                  {examen.descripcion && (
                    <p className="text-sm text-gray-600 mb-3">{examen.descripcion}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Creado: {formatFecha(examen.fechaCreacion)}</span>
                    </div>

                    {examen.fechaLimite && (
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Límite: {formatFecha(examen.fechaLimite)}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{examen.totalEstudiantes} estudiantes</span>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Progreso de completado</span>
                      <span className="font-semibold">{examen.porcentajeCompletado.toFixed(0)}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-full transition-all duration-300"
                        style={{ width: `${examen.porcentajeCompletado}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => navigate(`/docente/examen/${examen.id}/resultados`)}
                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Ver Resultados</span>
                  </button>

                  <button
                    onClick={() => handleReasignar(examen.id)}
                    disabled={reasignando === examen.id}
                    className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reasignando === examen.id ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Reasignando...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Reasignar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
