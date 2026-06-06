import api from '../config/api';
import type { SesionLectura, LecturaFinalizada } from '../types/reading.types';

export type { SesionLectura, LecturaFinalizada };

/**
 * Servicio para gestionar el ciclo de vida de una sesión de lectura activa.
 */
export const sesionLecturaService = {
  /**
   * Inicia una nueva sesión de lectura para el estudiante y lectura especificados.
   * @param lecturaId ID de la lectura a comenzar.
   * @returns Objeto de la sesión creada con su ID y fecha de inicio.
   */
  async iniciarLectura(lecturaId: number): Promise<SesionLectura> {
    const response = await api.post<SesionLectura>('/SesionesLectura/iniciar', { lecturaId });
    return response.data;
  },

  /**
   * Finaliza una sesión de lectura en curso, registrando el tiempo empleado.
   * @param sesionLecturaId GUID de la sesión a finalizar.
   * @param tiempoLecturaMinutos Tiempo total de lectura en minutos.
   * @returns Datos de la lectura finalizada.
   */
  async finalizarLectura(sesionLecturaId: string, tiempoLecturaMinutos: number): Promise<LecturaFinalizada> {
    const response = await api.post<LecturaFinalizada>('/SesionesLectura/finalizar', {
      sesionLecturaId,
      tiempoLecturaMinutos
    });
    return response.data;
  },

  /**
   * Obtiene la sesión de lectura actualmente activa para una lectura específica, si existe.
   * @param lecturaId ID de la lectura.
   * @returns La sesión activa o null si no se encuentra.
   */
  async obtenerSesionActiva(lecturaId: number): Promise<SesionLectura | null> {
    try {
      const response = await api.get<SesionLectura>(`/SesionesLectura/activa/${lecturaId}`);
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  }
};

