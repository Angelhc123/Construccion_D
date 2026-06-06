import api from '../config/api';
import type { 
  CrearExamenGrupalDto, 
  ExamenGrupalDto, 
  AsignacionExamenDto, 
  ResultadoEstudianteDto, 
  EstadisticasExamenDto, 
  ResultadosExamenGrupalDto 
} from '../types/exam.types';

// ============================================
// EXPORTACIONES DE TIPOS
// ============================================

export type {
  CrearExamenGrupalDto,
  ExamenGrupalDto,
  AsignacionExamenDto,
  ResultadoEstudianteDto,
  EstadisticasExamenDto,
  ResultadosExamenGrupalDto,
};

// ============================================
// SERVICIO PRINCIPAL
// ============================================

/**
 * Servicio para la gestión de exámenes grupales en aulas, incluyendo creación, asignación y consulta de resultados.
 */
const examenGrupalService = {
  /**
   * Crea un nuevo examen grupal utilizando IA para generar el contenido.
   * @param dto Datos necesarios para crear el examen (tema, aula, configuración).
   * @returns Objeto con el examen creado y mensaje de éxito.
   */
  crearExamenConIA: async (dto: CrearExamenGrupalDto): Promise<{ mensaje: string; examen: ExamenGrupalDto }> => {
    const response = await api.post('/examengrupales/crear', dto);
    return response.data;
  },

  /**
   * Obtiene la lista de exámenes creados para un salón específico.
   * @param aulaId ID del aula a consultar.
   * @returns Lista de exámenes asociados al aula.
   */
  obtenerExamenesDelSalon: async (aulaId: number): Promise<ExamenGrupalDto[]> => {
    const response = await api.get(`/examengrupales/salon/${aulaId}`);
    return response.data;
  },

  /**
   * Obtiene los exámenes asignados al estudiante autenticado.
   * @returns Lista de asignaciones pendientes o completadas.
   */
  obtenerExamenesAsignados: async (): Promise<AsignacionExamenDto[]> => {
    const response = await api.get('/examengrupales/asignados');
    return response.data;
  },

  /**
   * Obtiene los resultados consolidados de todos los estudiantes para un examen grupal.
   * @param examenGrupalId ID del examen grupal.
   * @returns Estadísticas y resultados detallados por estudiante.
   */
  obtenerResultadosConsolidados: async (examenGrupalId: number): Promise<ResultadosExamenGrupalDto> => {
    const response = await api.get(`/examengrupales/${examenGrupalId}/resultados`);
    return response.data;
  },

  /**
   * Marca un examen como completado para un estudiante, vinculándolo a una sesión de lectura.
   * @param examenGrupalId ID del examen grupal.
   * @param sesionLecturaId GUID de la sesión de lectura completada.
   * @returns Mensaje de confirmación.
   */
  marcarComoCompletado: async (examenGrupalId: number, sesionLecturaId: string): Promise<{ mensaje: string }> => {
    const response = await api.post(`/examengrupales/${examenGrupalId}/completar`, { sesionLecturaId });
    return response.data;
  },

  /**
   * Elimina un examen grupal del sistema.
   * @param examenGrupalId ID del examen a eliminar.
   * @returns Mensaje de confirmación.
   */
  eliminarExamen: async (examenGrupalId: number): Promise<{ mensaje: string }> => {
    const response = await api.delete(`/examengrupales/${examenGrupalId}`);
    return response.data;
  },

  /**
   * Lista todos los exámenes de un aula desde la perspectiva del docente.
   * @param aulaId ID del aula.
   * @returns Lista completa de exámenes.
   */
  listarExamenesAula: async (aulaId: number): Promise<ExamenGrupalDto[]> => {
    const response = await api.get(`/examengrupales/docente/aula/${aulaId}`);
    return response.data;
  },

  /**
   * Reasigna un examen existente a los estudiantes actuales del aula (útil para nuevos estudiantes).
   * @param examenId ID del examen a reasignar.
   * @param dto Opciones de reasignación (ej: nueva fecha límite).
   * @returns Mensaje y cantidad de nuevas asignaciones creadas.
   */
  reasignarExamen: async (examenId: number, dto: { fechaLimite?: string }): Promise<{ mensaje: string; asignacionesCreadas: number }> => {
    const response = await api.post(`/examengrupales/${examenId}/reasignar`, dto);
    return response.data;
  },
};

export default examenGrupalService;
