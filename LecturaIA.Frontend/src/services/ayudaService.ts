import api from '../config/api';
import type { EstadoTutorial } from '../types/user.types';

export type { EstadoTutorial };

/**
 * Servicio para gestionar el estado de onboarding y tutoriales del usuario.
 */
export const ayudaService = {
  /**
   * Consulta si el usuario ha visto ya el tutorial inicial.
   * @returns Objeto indicador del estado del tutorial.
   */
  async obtenerEstadoTutorial(): Promise<EstadoTutorial> {
    const response = await api.get<EstadoTutorial>('/Ayuda/estado-tutorial');
    return response.data;
  },

  /**
   * Marca el tutorial inicial como visto para que no vuelva a aparecer.
   */
  async marcarTutorialVisto(): Promise<void> {
    await api.post('/Ayuda/marcar-tutorial-visto', {});
  }
};
