import { useEffect, useState } from 'react';
import { metricasService, type MetricasEstudiante } from '../services/metricasService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface MetricasEstudianteModalProps {
  estudianteId: number;
  nombreEstudiante: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function MetricasEstudianteModal({ estudianteId, nombreEstudiante, isOpen, onClose }: MetricasEstudianteModalProps) {
  const [metricas, setMetricas] = useState<MetricasEstudiante | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      cargarMetricas();
    }
  }, [isOpen, estudianteId]);

  const cargarMetricas = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await metricasService.obtenerMetricasEstudiante(estudianteId);
      setMetricas(data);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al cargar las métricas');
      console.error('Error al cargar métricas del estudiante:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return 'No disponible';
    return new Date(fecha).toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Métricas de Estudiante</h2>
              <p className="text-blue-100 mt-1">{nombreEstudiante}</p>
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {metricas && !isLoading && (
            <div className="space-y-6">
              {/* Resumen de Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Lecturas Completadas</p>
                  <p className="text-3xl font-bold text-blue-600">{metricas.lecturasCompletadas}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Promedio de Quiz</p>
                  <p className="text-3xl font-bold text-green-600">{metricas.promedioQuiz.toFixed(1)}%</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Nivel Actual</p>
                  <p className="text-3xl font-bold text-purple-600">{metricas.nivelActual}</p>
                </div>
              </div>

              {/* Segunda fila de métricas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-600 mb-1">Tipo de Texto Favorito</p>
                  <p className="text-xl font-bold text-orange-600">{metricas.tipoTextoFavorito}</p>
                  <p className="text-xs text-gray-500 mt-1">Mayor rendimiento</p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200">
                  <p className="text-sm text-gray-600 mb-1">Última Actividad</p>
                  <p className="text-lg font-bold text-pink-600">{formatearFecha(metricas.ultimaActividad)}</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                  <p className="text-sm text-gray-600 mb-1">Tiempo Promedio</p>
                  <p className="text-xl font-bold text-indigo-600">{metricas.tiempoPromedioLectura.toFixed(2)} min</p>
                  <p className="text-xs text-gray-500 mt-1">Por lectura</p>
                </div>
              </div>

              {/* Gráfica de Evolución Temporal */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Evolución Temporal del Promedio</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metricas.evolucionTemporal}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="numeroQuiz" 
                      label={{ value: 'Número de Quiz', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Calificación (%)', angle: -90, position: 'insideLeft' }}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                              <p className="font-semibold text-gray-800">{data.tituloLectura}</p>
                              <p className="text-blue-600">Calificación: {data.calificacion.toFixed(1)}%</p>
                              <p className="text-gray-600 text-sm">{formatearFecha(data.fecha)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="calificacion" 
                      name="Calificación" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Análisis de Habilidad por Pregunta */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Análisis de Habilidad por Tipo de Pregunta</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gráfica de Radar */}
                  <div>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={[
                        { habilidad: 'Literal', porcentaje: metricas.analisisHabilidad.porcentajeLiteral },
                        { habilidad: 'Inferencial', porcentaje: metricas.analisisHabilidad.porcentajeInferencial },
                        { habilidad: 'Crítico', porcentaje: metricas.analisisHabilidad.porcentajeCritico }
                      ]}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="habilidad" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar 
                          name="Rendimiento" 
                          dataKey="porcentaje" 
                          stroke="#8b5cf6" 
                          fill="#8b5cf6" 
                          fillOpacity={0.6} 
                        />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Tabla de porcentajes */}
                  <div className="flex flex-col justify-center space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="font-semibold text-gray-700">Preguntas Literales</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {metricas.analisisHabilidad.porcentajeLiteral.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-semibold text-gray-700">Preguntas Inferenciales</span>
                      <span className="text-2xl font-bold text-green-600">
                        {metricas.analisisHabilidad.porcentajeInferencial.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="font-semibold text-gray-700">Preguntas Críticas</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {metricas.analisisHabilidad.porcentajeCritico.toFixed(1)}%
                      </span>
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
