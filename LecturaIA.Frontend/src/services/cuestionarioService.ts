import api from '../config/api';
import type { 
  PreguntaDto, 
  CuestionarioDto, 
  RespuestaDto, 
  EnviarRespuestasDto, 
  RetroalimentacionDto, 
  ResultadoDto, 
  PreguntaRevisionDto 
} from '../types/reading.types';

export type { 
  PreguntaDto, 
  CuestionarioDto, 
  RespuestaDto, 
  EnviarRespuestasDto, 
  RetroalimentacionDto, 
  ResultadoDto, 
  PreguntaRevisionDto 
};

// ResultadoCuestionarioDto ya incluye todo lo necesario
export type CuestionarioRevisionDto = ResultadoDto;

/**
 * Servicio para gestionar la generación, evaluación y revisión de cuestionarios asociados a lecturas.
 */
export const cuestionarioService = {
  
  /**
   * Solicita la generación de un nuevo cuestionario basado en una sesión de lectura completada.
   * @param sesionLecturaId GUID de la sesión de lectura.
   * @returns El DTO del cuestionario generado o en proceso.
   */
  async generarCuestionario(sesionLecturaId: string): Promise<CuestionarioDto> {
    const response = await api.post<CuestionarioDto>('/Cuestionarios/generar', { sesionLecturaId });
    return response.data;
  },

  /**
   * Obtiene un cuestionario por su ID. Útil para verificar si la generación asíncrona ha terminado.
   * @param cuestionarioId GUID del cuestionario.
   * @returns Detalles del cuestionario.
   */
  async obtenerCuestionario(cuestionarioId: string): Promise<CuestionarioDto> {
    const response = await api.get<CuestionarioDto>(`/Cuestionarios/${cuestionarioId}`);
    return response.data;
  },

  /**
   * Envía las respuestas del estudiante para ser evaluadas.
   * @param cuestionarioId GUID del cuestionario.
   * @param respuestas Lista de respuestas seleccionadas por el estudiante.
   * @param tiempoCuestionarioMinutos Tiempo empleado en resolver el cuestionario.
   * @returns El resultado de la evaluación.
   */
  async enviarRespuestas(cuestionarioId: string, respuestas: RespuestaDto[], tiempoCuestionarioMinutos: number): Promise<ResultadoDto> {
    const response = await api.post<ResultadoDto>(`/Cuestionarios/${cuestionarioId}/enviar`, { 
      respuestas,
      tiempoCuestionarioMinutos 
    });
    return response.data;
  },

  /**
   * Obtiene la revisión detallada de un cuestionario ya evaluado, incluyendo respuestas correctas y explicaciones.
   * @param cuestionarioId GUID del cuestionario.
   * @returns Datos necesarios para visualizar la corrección.
   */
  async obtenerRevision(cuestionarioId: string): Promise<CuestionarioRevisionDto> {
    const response = await api.get<CuestionarioRevisionDto>(`/Cuestionarios/${cuestionarioId}/respuestas`);
    return response.data;
  },

  /**
   * Obtiene el resultado numérico y cualitativo de un cuestionario.
   * @param cuestionarioId GUID del cuestionario.
   * @returns Resultado de la evaluación.
   */
  async obtenerResultado(cuestionarioId: string): Promise<ResultadoDto> {
    const response = await api.get<ResultadoDto>(`/Cuestionarios/${cuestionarioId}/resultado`);
    return response.data;
  },

  /**
   * Devuelve el historial de resultados obtenidos en los diferentes intentos de una misma lectura.
   * @param lecturaId ID de la lectura.
   * @returns Lista de resultados históricos.
   */
  async obtenerHistorialLectura(lecturaId: number): Promise<ResultadoDto[]> {
    const response = await api.get<ResultadoDto[]>(`/Cuestionarios/lectura/${lecturaId}/historial`);
    return response.data;
  }
};

export default cuestionarioService;
export type { CuestionarioDto as Cuestionario };
