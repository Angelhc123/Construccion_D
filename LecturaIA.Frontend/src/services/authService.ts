import api from '../config/api';
import { logger } from '../utils/logger';
import type { 
  LoginDto, 
  RegistroEstudianteDto, 
  RegistroDocenteDto, 
  AuthResponseDto, 
  LoginRequiere2FADto, 
  GradoOption 
} from '../types/auth.types';

export type { 
  LoginDto, 
  RegistroEstudianteDto, 
  RegistroDocenteDto, 
  AuthResponseDto, 
  LoginRequiere2FADto, 
  GradoOption 
};

/**
 * Servicio encargado de gestionar todos los aspectos del ciclo de vida de autenticación y autorización.
 */
class AuthService {

  // ==================== REGISTRO ====================

  /**
   * Registra un nuevo estudiante en el sistema.
   * @param datos Objeto con los datos necesarios para el registro de un estudiante.
   * @returns Un objeto con un mensaje de éxito y el email registrado.
   */
  async registrarEstudiante(datos: RegistroEstudianteDto): Promise<{ mensaje: string; email: string }> {
    const response = await api.post('/auth/registro/estudiante', datos);
    return response.data;
  }

  /**
   * Registra un nuevo docente en el sistema.
   * @param datos Objeto con los datos necesarios para el registro de un docente.
   * @returns Un objeto con un mensaje de éxito y el email registrado.
   */
  async registrarDocente(datos: RegistroDocenteDto): Promise<{ mensaje: string; email: string }> {
    const response = await api.post('/auth/registro/docente', datos);
    return response.data;
  }

  // ==================== LOGIN ====================
  
  /**
   * Inicia el proceso de inicio de sesión.
   * Dependiendo del rol y configuración, puede retornar un token de acceso directo o solicitar verificación de dos factores (2FA).
   * @param datos Credenciales del usuario (email y contraseña).
   * @returns Los datos de autenticación (token) o un objeto indicando que se requiere 2FA.
   */
  async login(datos: LoginDto): Promise<AuthResponseDto | LoginRequiere2FADto> {
    const response = await api.post('/auth/login', datos);
    
    // Si retorna requiereVerificacion, es un docente que necesita 2FA
    if (response.data.requiereVerificacion) {
      return response.data as LoginRequiere2FADto;
    }
    
    // Si no, es login exitoso directo (estudiante o después de 2FA)
    // Verificamos si la respuesta viene envuelta en 'data' o es directa
    const responseData = response.data;
    // @ts-ignore - Verificación dinámica en runtime
    const authData = responseData.data || responseData;
    
    return authData as AuthResponseDto;
  }

  // ==================== VERIFICACIÓN Y RECUPERACIÓN ====================
  
  /**
   * Verifica la dirección de correo electrónico utilizando un token enviado por email.
   * @param token Token de verificación.
   * @returns Mensaje de éxito.
   */
  async verificarEmail(token: string): Promise<{ mensaje: string }> {
    const response = await api.post('/auth/verificar-email', { token });
    return response.data;
  }

  /**
   * Reenvía el correo de verificación de cuenta.
   * @param email Email al cual reenviar la verificación.
   * @returns Mensaje de éxito.
   */
  async reenviarVerificacion(email: string): Promise<{ mensaje: string }> {
    const response = await api.post('/auth/reenviar-verificacion', { email });
    return response.data;
  }
  
  /**
   * Solicita el envío de un correo para recuperar la contraseña olvidada.
   * @param email Email del usuario que olvidó su contraseña.
   * @returns Mensaje de éxito.
   */
  async solicitarRecuperacion(email: string): Promise<{ mensaje: string }> {
    const response = await api.post('/auth/solicitar-recuperacion', { email });
    return response.data;
  }

  /**
   * Restablece la contraseña utilizando el token recibido por correo.
   * @param token Token de recuperación de contraseña.
   * @param nuevaPassword La nueva contraseña deseada.
   * @param confirmarPassword Confirmación de la nueva contraseña.
   * @returns Mensaje de éxito.
   */
  async restablecerPassword(token: string, nuevaPassword: string, confirmarPassword: string): Promise<{ mensaje: string }> {
    const response = await api.post('/auth/restablecer-password', {
      token,
      nuevaPassword,
      confirmarPassword
    });
    return response.data;
  }

  // ==================== DOBLE AUTENTICACIÓN (2FA) ====================
  
  /**
   * Verifica el código de 2FA para completar el inicio de sesión.
   * @param email Email del usuario.
   * @param codigo Código de 6 dígitos enviado por correo.
   * @returns Los datos de autenticación finales (token, usuario, etc.).
   */
  async verificarCodigoLogin(email: string, codigo: string): Promise<AuthResponseDto> {
    const response = await api.post('/auth/verificar-codigo-login', {
      email,
      codigo
    });
    return response.data.data;
  }

  /**
   * Reenvía el código de verificación de 2FA para el inicio de sesión.
   * @param email Email del usuario.
   * @returns Mensaje de éxito.
   */
  async reenviarCodigoLogin(email: string): Promise<{ mensaje: string }> {
    const response = await api.post('/auth/reenviar-codigo-login', { email });
    return response.data;
  }

  // ==================== CATALOGOS ====================
  
  /**
   * Obtiene la lista de grados académicos disponibles para el registro de estudiantes.
   * @returns Lista de opciones de grados.
   */
  async obtenerGrados(): Promise<GradoOption[]> {
    const response = await api.get('/grados');
    return response.data;
  }

  // ==================== UTILIDADES DE SESIÓN ====================
  
  /**
   * Almacena los datos de la sesión (token y usuario) en el LocalStorage.
   * @param authData Datos de la sesión autenticada.
   */
  guardarSesion(authData: AuthResponseDto) {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('userData', JSON.stringify(authData));
  }

  /**
   * Elimina los datos de sesión del LocalStorage, cerrando efectivamente la sesión.
   */
  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  }

  /**
   * Recupera la información del usuario almacenada en la sesión actual.
   * @returns Objeto con los datos del usuario o null si no hay sesión o los datos están corruptos.
   */
  obtenerUsuario(): AuthResponseDto | null {
    const userData = localStorage.getItem('userData');
    if (!userData) return null;
    try {
      return JSON.parse(userData);
    } catch (e) {
      logger.error('Error parsing user data from localStorage', e);
      // Data corrupta, limpiamos
      this.cerrarSesion();
      return null;
    }
  }

  /**
   * Comprueba si existe un token de sesión activo.
   * @returns true si hay un token almacenado, false en caso contrario.
   */
  estaAutenticado(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Obtiene el token de autenticación actual.
   * @returns El string del token JWT o null si no existe.
   */
  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }
}

export const authService = new AuthService();
