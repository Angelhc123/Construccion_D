import api, { API_URL } from '../config/api';
import type { LecturaGenerada, LecturaLista, PreferenciasLectura } from '../types/reading.types';

export type { LecturaGenerada, LecturaLista, PreferenciasLectura };

/**
 * Parsea una ruta relativa de imagen para devolver la URL completa de la API
 * @param relativePath Ruta relativa de la imagen (ej: "/images/cover.jpg")
 * @returns URL absoluta completa incluyendo el dominio de la API
 */
export const getImageUrl = (relativePath?: string): string => {
  if (!relativePath) return '';
  if (relativePath.startsWith('http')) return relativePath;
  
  // Si API_URL está definido, lo usamos como base
  if (API_URL) {
    // Si la imagen empieza con /, nos aseguramos que no haya doble slash
    const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    return `${API_URL}${cleanPath}`;
  }
  
  return relativePath;
};

/**
 * Servicio para gestionar las operaciones relacionadas con lecturas generadas por IA
 */
export const lecturaService = {
  
  /**
   * Genera una nueva lectura personalizada basada en las preferencias del usuario
   * @param preferencias Objeto con las opciones seleccionadas por el estudiante (tema, personajes, etc.)
   * @returns La lectura generada incluyendo título, contenido y metadatos
   */
  async generarLectura(preferencias: PreferenciasLectura): Promise<LecturaGenerada> {
    const response = await api.post<LecturaGenerada>('/Lecturas/generar', {
      preferencias: {
        temas: preferencias.temas,
        personajes: preferencias.personajes,
        escenario: preferencias.escenario,
        longitud: preferencias.longitud,
        emocion: preferencias.emocion,
        proposito: preferencias.proposito
      }
    });
    return response.data;
  },

  /**
   * Obtiene el listado completo de lecturas disponibles para el estudiante actual
   * @returns Lista de lecturas con información resumida
   */
  async obtenerLecturas(): Promise<LecturaLista[]> {
    const response = await api.get<LecturaLista[]>('/Lecturas');
    return response.data;
  },

  /**
   * Obtiene los detalles completos de una lectura específica por su ID
   * @param id ID único de la lectura
   * @returns Objeto detallado de la lectura incluyendo contenido completo
   */
  async obtenerLectura(id: number): Promise<LecturaGenerada> {
    const response = await api.get<LecturaGenerada>(`/Lecturas/${id}`);
    return response.data;
  },

  /**
   * Elimina una lectura del sistema
   * @param id ID de la lectura a eliminar
   */
  async eliminarLectura(id: number): Promise<void> {
    await api.delete(`/Lecturas/${id}`);
  },

  /**
   * Cambia el estado de "favorita" de una lectura
   * @param lecturaId ID de la lectura
   * @param esFavorita Nuevo estado (true para marcar, false para desmarcar)
   */
  async toggleFavorita(lecturaId: number, esFavorita: boolean): Promise<void> {
    await api.put(`/Lecturas/${lecturaId}/favorita`, { esFavorita });
  },

  /**
   * Obtiene únicamente las lecturas marcadas como favoritas por el estudiante
   * @returns Lista filtrada de lecturas favoritas
   */
  async obtenerFavoritas(): Promise<LecturaLista[]> {
    const response = await api.get<LecturaLista[]>('/Lecturas/favoritas');
    return response.data;
  }
};

