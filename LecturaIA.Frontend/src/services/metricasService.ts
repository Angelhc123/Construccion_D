import api from '../config/api';
import type { 
  MetricasEstudiante, 
  MetricasAula 
} from '../types/metrics.types';

export type { MetricasEstudiante, MetricasAula };

/**
 * Servicio para consultar métricas y estadísticas de rendimiento.
 */
class MetricasService {
  /**
   * Obtiene las métricas individuales de un estudiante.
   * @param estudianteId ID del estudiante.
   * @returns Estadísticas de lectura y progreso.
   */
  async obtenerMetricasEstudiante(estudianteId: number): Promise<MetricasEstudiante> {
    const response = await api.get<MetricasEstudiante>(`/Metricas/estudiante/${estudianteId}`);
    return response.data;
  }

  /**
   * Obtiene las métricas consolidadas de un aula completa.
   * @param aulaId ID del aula.
   * @returns Estadísticas grupales.
   */
  async obtenerMetricasAula(aulaId: number): Promise<MetricasAula> {
    const response = await api.get<MetricasAula>(`/Metricas/aula/${aulaId}`);
    return response.data;
  }
}

export const metricasService = new MetricasService();
