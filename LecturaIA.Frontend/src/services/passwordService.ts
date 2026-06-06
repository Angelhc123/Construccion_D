import api from '../config/api';
import type { CambiarPasswordDto, ValidacionPasswordDto } from '../types/auth.types';

/**
 * Servicio para gestión de contraseñas de usuarios autenticados.
 */
export const passwordService = {
  /**
   * Cambia la contraseña del usuario actual.
   * @param data DTO con contraseña actual y nueva.
   * @returns Mensaje de éxito.
   */
  async cambiarPassword(data: CambiarPasswordDto): Promise<{ mensaje: string }> {
    const response = await api.post('/password/cambiar', data);
    return response.data;
  },

  /**
   * Valida la fortaleza de una contraseña antes de usarla.
   * @param password Contraseña candidata.
   * @returns Resultado de la validación (score, feedback).
   */
  async validarFortaleza(password: string): Promise<ValidacionPasswordDto> {
    const response = await api.post('/password/validar', { password });
    return response.data;
  },
};
