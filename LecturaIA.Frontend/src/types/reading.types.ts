export interface PreferenciasLectura {
  temas: string[];
  personajes: string[];
  escenario: string;
  longitud: string;
  emocion: string;
  proposito: string;
}

export interface LecturaGenerada {
  id: number;
  titulo: string;
  contenido: string;
  urlImagen?: string;
  tipoLectura: string;
  preferencias: PreferenciasLectura;
  fechaCreacion: string;
}

export interface LecturaLista {
  id: number;
  titulo: string;
  tipoLectura: string;
  longitud: string;
  fechaCreacion: string;
  progreso: number;
  estado: string;
  esFavorita: boolean;
  tieneCuestionario: boolean;
  cuestionarioId?: string;
  cuestionarioEvaluado: boolean;
}

export interface PreguntaDto {
  id: string;
  orden: number;
  tipo: string; // "Literal", "Analitica", "Critica"
  formato: string; // "OpcionMultiple", "Abierta"
  textoPregunta: string;
  opciones?: string[]; // Solo para opción múltiple
}

export interface CuestionarioDto {
  id: string;
  sesionLecturaId: string;
  lecturaId: number;
  fechaGeneracion: string;
  estado: string; // "generando", "listo", "enviado", "evaluado"
  nivelDificultad: string;
  tipoTexto: string;
  tituloLectura: string;
  preguntas: PreguntaDto[];
}

export interface RespuestaDto {
  preguntaId: string;
  textoRespuesta: string;
}

export interface EnviarRespuestasDto {
  respuestas: RespuestaDto[];
  tiempoCuestionarioMinutos: number;
}

export interface RetroalimentacionDto {
  logros: string;
  mejora: string;
  consejos: string;
  animo: string;
}

export interface PreguntaRevisionDto {
  preguntaId: string;
  orden: number;
  tipo: string;
  formato: string;
  textoPregunta: string;
  opciones?: string[];
  respuestaCorrecta?: string;
  explicacion?: string;
  respuestaEstudiante?: string;
  esCorrecta?: boolean;
  puntajeIA?: number;
  retroalimentacionIA?: string;
  textoRespuestaAbierta?: string;
}

export interface ResultadoDto {
  id: string;
  cuestionarioId: string;
  fechaEvaluacion: string;
  tiempoLecturaMinutos: number;
  tiempoCuestionarioMinutos: number;
  puntajeTotal: number;
  porcentaje: number;
  correctasLiterales: number;
  correctasAnaliticas: number;
  puntajeCriticas: number;
  retroalimentacionPersonalizada: string;
  retroalimentacion?: RetroalimentacionDto; // Nueva estructura
  mensajeAnimo: string;
  nivelAnterior: string;
  nivelNuevo: string;
  accionNivel: string; // "subir", "mantener", "bajar", "maximo", "minimo"
  mensajeAdaptacion: string;
  detalleRespuestas?: PreguntaRevisionDto[]; // Respuestas detalladas (solo en /respuestas)
}

export type CuestionarioRevisionDto = ResultadoDto;

export interface SesionLectura {
  id: string;
  lecturaId: number;
  fechaInicio: string;
  completada: boolean;
}

export interface LecturaFinalizada {
  sesionLecturaId: string;
  fechaInicio: string;
  fechaFinalizacion: string;
  tiempoLecturaMinutos: number;
  mensaje: string;
}
