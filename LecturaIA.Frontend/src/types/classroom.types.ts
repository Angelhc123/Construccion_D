export interface AulaDetalle {
  id: number;
  nombre: string;
  descripcion?: string;
  codigoVinculacion: string;
  nombreDocente: string;
  cantidadEstudiantes: number;
  fechaCreacion: string;
}

export interface AulaInfo {
  id: number;
  nombre: string;
  descripcion?: string;
  nombreDocente: string;
  fechaVinculacion: string;
}

export interface EstudianteAula {
  estudianteId: number;
  nombreCompleto: string;
  email: string;
  grado?: string;
  fechaVinculacion: string;
  tareasDiarias: number;
}

export interface CrearAulaDto {
  nombre: string;
  descripcion?: string;
}

export interface UnirseAClaseDto {
  codigoVinculacion: string;
}
