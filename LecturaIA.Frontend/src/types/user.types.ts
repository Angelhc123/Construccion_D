import type { AulaInfo } from './classroom.types';

export interface PerfilUsuario {
  nombreCompleto: string;
  email: string;
  tipoUsuario: string;
  grado?: string;
  edad?: number;
  nivelEducativo?: string;
  intereses?: string;
  nivelDificultad?: string;
  claseActual?: AulaInfo | null;
  avatarUrl?: string; // Nuevo campo para avatar
}

export type PerfilUsuarioDto = PerfilUsuario;

export interface ActualizarPerfilDto {
  nombreCompleto?: string;
  edad?: number;
  intereses?: string;
  nivelDificultad?: string;
}

export interface UsuarioAdmin {
  id: number;
  nombreCompleto: string;
  email: string;
  tipo: string;
  estado: string;
  ultimoAcceso: string | null;
  suspendido: boolean;
  motivoSuspension: string | null;
  fechaSuspension: string | null;
}

export interface CodigoDocente {
  id: number;
  codigo: string;
  estado: string;
  generadoPor: string;
  fechaCreacion: string;
  usadoPor: string | null;
  fechaUso: string | null;
}

export interface EstadoTutorial {
  primeraSesion: boolean;
}
