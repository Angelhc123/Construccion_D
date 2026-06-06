import api from '../config/api';
import type { UsuarioAdmin, CodigoDocente } from '../types/user.types';
import type { EstadisticasGenerales } from '../types/metrics.types';

export type { UsuarioAdmin, CodigoDocente, EstadisticasGenerales };

/**
 * Servicio para administradores del sistema. Gestiona usuarios, códigos de docentes y estadísticas globales.
 */
class AdminService {
  /**
   * Obtiene estadísticas demográficas generales del sistema.
   * @returns Un objeto con métricas de usuarios, actividades, etc.
   */
  async obtenerEstadisticas(): Promise<EstadisticasGenerales> {
    const response = await api.get<EstadisticasGenerales>('/Admin/estadisticas');
    return response.data;
  }

  /**
   * Obtiene la lista histórico de códigos de registro generados para docentes.
   * @returns Lista de códigos.
   */
  async obtenerCodigosDocentes(): Promise<CodigoDocente[]> {
    const response = await api.get<CodigoDocente[]>('/Admin/codigos-docentes');
    return response.data;
  }

  /**
   * Genera un nuevo código de invitación para que un docente pueda registrarse.
   * @param administradorId ID del administrador que genera el código.
   * @returns Objeto con el código generado y estado de la operación.
   */
  async generarCodigoDocente(administradorId: number): Promise<{ codigo: string; mensaje: string; exito: boolean }> {
    const response = await api.post<{ codigo: string; mensaje: string; exito: boolean }>('/Admin/codigos-docentes/generar', { administradorId });
    return response.data;
  }

  /**
   * Busca y lista usuarios del sistema.
   * @param email Filtro opcional por email.
   * @returns Lista de usuarios que coinciden con el criterio.
   */
  async obtenerUsuarios(email?: string): Promise<UsuarioAdmin[]> {
    const params = email ? { email } : {};
    const response = await api.get<UsuarioAdmin[]>('/Admin/usuarios', {
      params
    });
    return response.data;
  }

  /**
   * Suspende el acceso de un usuario al sistema.
   * @param usuarioId ID del usuario a suspender.
   * @param motivo Razón de la suspensión.
   */
  async suspenderUsuario(usuarioId: number, motivo: string): Promise<void> {
    await api.post('/Admin/usuarios/suspender', { usuarioId, motivo });
  }

  /**
   * Restaura el acceso de un usuario suspendido.
   * @param usuarioId ID del usuario a reactivar.
   */
  async reactivarUsuario(usuarioId: number): Promise<void> {
    await api.post('/Admin/usuarios/reactivar', { usuarioId });
  }

  /**
   * Fuerza el cambio de contraseña de un usuario, generando una temporal.
   * @param usuarioId ID del usuario.
   * @param motivo Razón del reinicio de contraseña.
   * @returns La contraseña temporal generada.
   */
  async reiniciarPassword(usuarioId: number, motivo: string): Promise<{ passwordTemporal: string; mensaje: string }> {
    const response = await api.post<{ passwordTemporal: string; mensaje: string }>('/Admin/usuarios/reiniciar-password', { usuarioId, motivo });
    return response.data;
  }
}

export const adminService = new AdminService();
