export interface LoginDto {
  email: string;
  password: string;
}

export interface RegistroEstudianteDto {
  email: string;
  password: string;
  confirmarPassword: string;
  nombreCompleto: string;
  grado: number; // 4, 5 o 6
  edad: number;
}

export interface RegistroDocenteDto {
  email: string;
  password: string;
  confirmarPassword: string;
  nombreCompleto: string;
}

export interface AuthResponseDto {
  id?: number; // Opcional porque puede no estar en el JSON almacenado
  token: string;
  tipoUsuario: 'Estudiante' | 'Docente' | 'Administrador';
  nombreCompleto: string;
  email: string;
  expiracion: string;
}

export interface CambiarPasswordDto {
  passwordActual: string;
  nuevaPassword: string;
  confirmarPassword: string;
}

export interface ValidacionPasswordDto {
  score: number;
  feedback: string[];
  nivel: 'Debil' | 'Media' | 'Fuerte';
}

export interface LoginRequiere2FADto {
  requiereVerificacion: boolean;
  mensaje: string;
  email: string;
  tiempoExpiracionMinutos: number;
}

export interface GradoOption {
  value: number;
  label: string;
}
