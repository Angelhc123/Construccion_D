export enum UserRole {
  ADMINISTRADOR = 'Administrador',
  DOCENTE = 'Docente',
  ESTUDIANTE = 'Estudiante',
}

export enum GradoEscolar {
  CUARTO = 4,
  QUINTO = 5,
  SEXTO = 6,
}

export enum TipoTexto {
  NARRATIVO = 'Narrativo',
  DESCRIPTIVO = 'Descriptivo',
  EXPOSITIVO = 'Expositivo',
  ARGUMENTATIVO = 'Argumentativo',
  INSTRUCTIVO = 'Instructivo',
}

export enum LongitudTexto {
  CORTO = 'Corto',
  MEDIO = 'Medio',
  LARGO = 'Largo',
}

export enum ComplejidadTexto {
  BASICA = 'Basica',
  INTERMEDIA = 'Intermedia',
  AVANZADA = 'Avanzada',
}

export enum EstadoCuestionario {
  GENERANDO = 'generando',
  LISTO = 'listo',
  ERROR = 'error',
}
