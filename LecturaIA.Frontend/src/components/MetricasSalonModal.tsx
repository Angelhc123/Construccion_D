import { useEffect, useState } from 'react';
import { metricasService, type MetricasAula } from '../services/metricasService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface MetricasSalonModalProps {
  aulaId: number;
  nombreAula: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function MetricasSalonModal({ aulaId, nombreAula, isOpen, onClose }: MetricasSalonModalProps) {
  const [metricas, setMetricas] = useState<MetricasAula | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      cargarMetricas();
    }
  }, [isOpen, aulaId]);

  const cargarMetricas = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await metricasService.obtenerMetricasAula(aulaId);
      setMetricas(data);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al cargar las métricas del aula');
      console.error('Error al cargar métricas del aula:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Métricas del Salón</h2>
              <p className="text-cyan-100 mt-1">{nombreAula}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {metricas && !isLoading && (
            <div className="space-y-6">
              {/* Resumen General */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-lg border border-cyan-200">
                  <p className="text-sm text-gray-600 mb-1">Total de Estudiantes</p>
                  <p className="text-4xl font-bold text-cyan-600">{metricas.totalEstudiantes}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Promedio de Clase</p>
                  <p className="text-4xl font-bold text-green-600">{metricas.promedioClase.toFixed(1)}%</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Tiempo Prom. Lectura</p>
                  <p className="text-3xl font-bold text-blue-600">{metricas.tiempoPromedioLectura.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">minutos</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Tiempo Prom. Quiz</p>
                  <p className="text-3xl font-bold text-purple-600">{metricas.tiempoPromedioCuestionario.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">minutos</p>
                </div>
              </div>

              {/* Gráfica de Progreso Semanal */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Progreso Semanal de la Clase (Últimas 8 Semanas)</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={metricas.progresoSemanal}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="numeroSemana" 
                      label={{ value: 'Semana', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Promedio (%)', angle: -90, position: 'insideLeft' }}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                              <p className="font-semibold text-gray-800">Semana {data.numeroSemana}</p>
                              <p className="text-cyan-600">Promedio: {data.promedioSemana.toFixed(1)}%</p>
                              <p className="text-gray-600 text-sm">Quizzes: {data.cantidadQuizzes}</p>
                              <p className="text-gray-500 text-xs">
                                {new Date(data.fechaInicio).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - {new Date(data.fechaFin).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="promedioSemana" 
                      name="Promedio Semanal" 
                      stroke="#06b6d4" 
                      strokeWidth={3}
                      activeDot={{ r: 8 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cantidadQuizzes" 
                      name="Cantidad de Quizzes" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      yAxisId="right"
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      label={{ value: 'Quizzes', angle: 90, position: 'insideRight' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Distribución por Tipo de Texto */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Rendimiento por Tipo de Texto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gráfica de Barras */}
                  <div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { tipo: 'Narrativo', cantidad: metricas.distribucionTiposTexto.cantidadNarrativo, promedio: metricas.distribucionTiposTexto.promedioNarrativo },
                        { tipo: 'Descriptivo', cantidad: metricas.distribucionTiposTexto.cantidadDescriptivo, promedio: metricas.distribucionTiposTexto.promedioDescriptivo },
                        { tipo: 'Expositivo', cantidad: metricas.distribucionTiposTexto.cantidadExpositivo, promedio: metricas.distribucionTiposTexto.promedioExpositivo },
                        { tipo: 'Argumentativo', cantidad: metricas.distribucionTiposTexto.cantidadArgumentativo, promedio: metricas.distribucionTiposTexto.promedioArgumentativo },
                        { tipo: 'Instructivo', cantidad: metricas.distribucionTiposTexto.cantidadInstructivo, promedio: metricas.distribucionTiposTexto.promedioInstructivo }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="tipo" angle={-15} textAnchor="end" height={80} />
                        <YAxis label={{ value: 'Promedio (%)', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                                  <p className="font-semibold text-gray-800">{data.tipo}</p>
                                  <p className="text-blue-600">Promedio: {data.promedio.toFixed(1)}%</p>
                                  <p className="text-gray-600">Lecturas: {data.cantidad}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend />
                        <Bar dataKey="promedio" name="Rendimiento Promedio" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Tarjetas de Detalle */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div>
                        <p className="font-semibold text-gray-800">Narrativo</p>
                        <p className="text-sm text-gray-600">{metricas.distribucionTiposTexto.cantidadNarrativo} lecturas</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600">
                          {metricas.distribucionTiposTexto.promedioNarrativo.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div>
                        <p className="font-semibold text-gray-800">Descriptivo</p>
                        <p className="text-sm text-gray-600">{metricas.distribucionTiposTexto.cantidadDescriptivo} lecturas</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-600">
                          {metricas.distribucionTiposTexto.promedioDescriptivo.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div>
                        <p className="font-semibold text-gray-800">Expositivo</p>
                        <p className="text-sm text-gray-600">{metricas.distribucionTiposTexto.cantidadExpositivo} lecturas</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-purple-600">
                          {metricas.distribucionTiposTexto.promedioExpositivo.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                      <div>
                        <p className="font-semibold text-gray-800">Argumentativo</p>
                        <p className="text-sm text-gray-600">{metricas.distribucionTiposTexto.cantidadArgumentativo} lecturas</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-orange-600">
                          {metricas.distribucionTiposTexto.promedioArgumentativo.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg border border-pink-200">
                      <div>
                        <p className="font-semibold text-gray-800">Instructivo</p>
                        <p className="text-sm text-gray-600">{metricas.distribucionTiposTexto.cantidadInstructivo} lecturas</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-pink-600">
                          {metricas.distribucionTiposTexto.promedioInstructivo.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
