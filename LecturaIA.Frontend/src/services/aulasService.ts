import api from '../config/api';
import type { AulaDetalle, EstudianteAula, CrearAulaDto } from '../types/classroom.types';

export type { AulaDetalle, EstudianteAula, CrearAulaDto };

// ===== FUNCIONES PARA DOCENTES =====

/**
 * Obtiene todas las aulas creadas por el docente actualmente autenticado.
 * @returns Lista de aulas con sus detalles básicos.
 */
export async function obtenerMisAulas(): Promise<AulaDetalle[]> {
  const response = await api.get<AulaDetalle[]>('/Aulas/mis-aulas');
  return response.data;
}

/**
 * Crea una nueva aula virtual para un docente.
 * @param dto Datos necesarios para crear el aula (nombre, grado, etc.).
 * @returns El objeto del aula recién creada.
 */
export async function crearAula(dto: CrearAulaDto): Promise<AulaDetalle> {
  const response = await api.post<AulaDetalle>('/Aulas/crear', dto);
  return response.data;
}

/**
 * Obtiene la información detallada de un aula específica.
 * @param id ID del aula.
 * @returns Detalles del aula.
 */
export async function obtenerAula(id: number): Promise<AulaDetalle> {
  const response = await api.get<AulaDetalle>(`/Aulas/${id}`);
  return response.data;
}

/**
 * Obtiene la lista de estudiantes inscritos en un aula específica.
 * @param aulaId ID del aula.
 * @returns Lista de estudiantes.
 */
export async function obtenerEstudiantesAula(aulaId: number): Promise<EstudianteAula[]> {
  const response = await api.get<EstudianteAula[]>(`/Aulas/${aulaId}/estudiantes`);
  return response.data;
}

/**
 * Elimina un aula del sistema.
 * @param id ID del aula a eliminar.
 */
export async function eliminarAula(id: number): Promise<void> {
  await api.delete(`/Aulas/${id}`);
}

/**
 * Da de baja a un estudiante de un aula específica.
 * @param aulaId ID del aula.
 * @param estudianteId ID del estudiante a remover.
 */
export async function removerEstudiante(aulaId: number, estudianteId: number): Promise<void> {
  await api.delete(`/Aulas/${aulaId}/estudiante/${estudianteId}`);
}

/**
 * Servicio para gestión de aulas virtuales por parte de docentes.
 */
export const aulasService = {
  obtenerMisAulas,
  crearAula,
  obtenerAula,
  obtenerEstudiantesAula,
  eliminarAula,
  removerEstudiante
};
