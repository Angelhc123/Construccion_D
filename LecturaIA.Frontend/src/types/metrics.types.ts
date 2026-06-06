export interface EstadisticasGenerales {
  totalUsuarios: number;
  totalDocentes: number;
  totalEstudiantes: number;
  usuariosActivos: number;
  usuariosSuspendidos: number;
  lecturasGeneradas: number;
  cuestionariosCompletados: number;
  aulasActivas: number;
  codigosDocentesActivos?: number;
  codigosDocentesUsados?: number;
}

export interface PuntoEvolucion {
  numeroQuiz: number;
  calificacion: number;
  fecha: string;
  tituloLectura: string;
}

export interface AnalisisHabilidad {
  porcentajeLiteral: number;
  porcentajeInferencial: number;
  porcentajeCritico: number;
}

export interface MetricasEstudiante {
  lecturasCompletadas: number;
  promedioQuiz: number;
  nivelActual: string;
  tipoTextoFavorito: string;
  ultimaActividad: string | null;
  tiempoPromedioLectura: number;
  evolucionTemporal: PuntoEvolucion[];
  analisisHabilidad: AnalisisHabilidad;
}

export interface ProgresoSemanal {
  numeroSemana: number;
  fechaInicio: string;
  fechaFin: string;
  promedioSemana: number;
  cantidadQuizzes: number;
}

export interface DistribucionTiposTexto {
  cantidadNarrativo: number;
  cantidadDescriptivo: number;
  cantidadExpositivo: number;
  cantidadArgumentativo: number;
  cantidadInstructivo: number;
  promedioNarrativo: number;
  promedioDescriptivo: number;
  promedioExpositivo: number;
  promedioArgumentativo: number;
  promedioInstructivo: number;
}

export interface MetricasAula {
  aulaId: number;
  nombreAula: string;
  totalEstudiantes: number;
  promedioClase: number;
  tiempoPromedioLectura: number;
  tiempoPromedioCuestionario: number;
  progresoSemanal: ProgresoSemanal[];
  distribucionTiposTexto: DistribucionTiposTexto;
}
