import api from '../config/api';
import type { PerfilUsuarioDto, ActualizarPerfilDto } from '../types/user.types';

/**
 * Servicio para gestión del perfil del usuario autenticado.
 */

export interface AulaDetalle {
  id: number;
  nombre: string;
  codigo?: string;

  descripcion?: string;
  nombreDocente?: string;
  cantidadEstudiantes?: number;
  fechaCreacion?: string;
}

export const perfilService = {

  /**
   * Obtiene los datos del perfil actual.
   */
  async obtenerPerfil(): Promise<PerfilUsuarioDto> {
    const response = await api.get('/perfil');
    return response.data;
  },

  /**
   * Actualiza datos básicos del perfil.
   */
  async actualizarPerfil(data: ActualizarPerfilDto): Promise<PerfilUsuarioDto> {
    const response = await api.put('/perfil', data);
    return response.data;
  },

  /**
   * Sube avatar.
   */
  async subirAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();

    formData.append('avatar', file);

    const response = await api.post('/perfil/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

  /**
   * Obtiene la clase actual del usuario.
   */
  async obtenerMiClase() {
    const response = await api.get('/perfil/miclase');
    return response.data;
  },

  /**
   * Unirse a una clase.
   */
  async unirseAClase(codigo: string) {
    const response = await api.post('/perfil/unirse', { codigo });
    return response.data;
  },

  /**
   * Salir de una clase.
   */
  async salirDeClase() {
    const response = await api.post('/perfil/salir');
    return response.data;
  },
};