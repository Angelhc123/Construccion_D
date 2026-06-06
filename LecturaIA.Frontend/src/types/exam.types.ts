export interface CrearExamenGrupalDto {
  aulaId: number;
  titulo: string;
  descripcion?: string;
  temaConcepto: string;
  tipoTexto: string;
  longitudTexto: string;
  gradoEscolar: string;
  complejidad: string;
  cantidadPreguntas: number;
  fechaLimite?: string;
  publicado: boolean;
}

export interface ExamenGrupalDto {
  id: number;
  aulaId: number;
  nombreAula: string;
  titulo: string;
  descripcion?: string;
  longitudTexto: string;
  gradoEscolar: string;
  complejidad: string;
  fechaCreacion: string;
  fechaLimite?: string;
  publicado: boolean;
  lecturaId: number;
  tituloLectura: string;
  tipoLectura: string;
  cantidadPreguntas: number;
  totalEstudiantes: number;
  estudiantesCompletados: number;
  porcentajeCompletado: number;
  promedioGrupal?: number;
  tiempoPromedioMinutos?: number;
}

export interface AsignacionExamenDto {
  id: number;
  examenGrupalId: number;
  tituloExamen: string;
  descripcionExamen?: string;
  nombreDocente: string;
  estado: string;
  fechaAsignacion: string;
  fechaLimite?: string;
  fechaCompletado?: string;
  calificacion?: number;
  lecturaId: number;
  tituloLectura: string;
  longitudTexto: string;
  cantidadPreguntas: number;
}

export interface ResultadoEstudianteDto {
  estudianteId: number;
  nombreCompleto: string;
  estado: string;
  fechaCompletado?: string;
  calificacion?: number;
  tiempoTotalMinutos?: number;
  tiempoLecturaMinutos?: number;
  tiempoQuizMinutos?: number;
}

export interface EstadisticasExamenDto {
  totalEstudiantes: number;
  completados: number;
  pendientes: number;
  porcentajeCompletado: number;
  promedioGrupal?: number;
  calificacionMaxima?: number;
  calificacionMinima?: number;
  tiempoPromedioMinutos?: number;
  estudiantesPendientes: string[];
  estudiantesConDificultad: string[];
  estudiantesDestacados: string[];
}

export interface ResultadosExamenGrupalDto {
  examenInfo: ExamenGrupalDto;
  resultados: ResultadoEstudianteDto[];
  estadisticas: EstadisticasExamenDto;
}
