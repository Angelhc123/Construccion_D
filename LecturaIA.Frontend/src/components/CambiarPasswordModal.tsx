import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { passwordService } from '../services/passwordService';
import type { ValidacionPasswordDto } from '../types/auth.types';
import { useAuth } from '../hooks/useAuth';
import { UI_CONFIG } from '../config/constants';

interface CambiarPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CambiarPasswordModal({ isOpen, onClose }: CambiarPasswordModalProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [validacion, setValidacion] = useState<ValidacionPasswordDto | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Validar fortaleza de contraseña en tiempo real
  useEffect(() => {
    if (nuevaPassword.length > 0) {
      const timer = setTimeout(async () => {
        try {
          const result = await passwordService.validarFortaleza(nuevaPassword);
          setValidacion(result);
        } catch (err) {
          console.error('Error validando contraseña:', err);
        }
      }, UI_CONFIG.DEBOUNCE_DELAY_MS);

      return () => clearTimeout(timer);
    } else {
      setValidacion(null);
    }
  }, [nuevaPassword]);

  // Countdown para cerrar sesión
  useEffect(() => {
    if (showSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showSuccess && countdown === 0) {
      // Determinar redirección
      let redirectUrl = '/';
      
      if (user) {
        if (user.tipoUsuario === 'Estudiante') {
          redirectUrl = '/estudiante';
        } else if (user.tipoUsuario === 'Docente' || user.tipoUsuario === 'Administrador') {
          redirectUrl = '/docente'; 
        }
      }
      
      // Cerrar sesión y redirigir
      logout();
      navigate(redirectUrl);
    }
  }, [showSuccess, countdown, user, logout, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones básicas
    if (!passwordActual || !nuevaPassword || !confirmarPassword) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (validacion && validacion.nivel !== 'Fuerte') {
      setError('La contraseña no cumple con los requisitos de seguridad');
      return;
    }

    setLoading(true);

    try {
      await passwordService.cambiarPassword({
        passwordActual,
        nuevaPassword,
        confirmarPassword,
      });

      setShowSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al cambiar la contraseña');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPasswordActual('');
    setNuevaPassword('');
    setConfirmarPassword('');
    setValidacion(null);
    setError('');
    setLoading(false);
    setShowSuccess(false);
    setCountdown(3);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  // Modal de éxito
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ✅ Contraseña Actualizada
          </h2>
          <p className="text-gray-600 mb-4">
            Tu contraseña ha sido cambiada exitosamente.
          </p>
          <p className="text-gray-800 font-semibold mb-2">
            Por seguridad, tu sesión se cerrará en:
          </p>
          <p className="text-4xl font-bold text-blue-600 mb-4">{countdown}</p>
          <p className="text-sm text-gray-500">
            Por favor, inicia sesión nuevamente con tu nueva contraseña.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Cambiar Contraseña</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contraseña Actual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña Actual
            </label>
            <input
              type="password"
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
            />
          </div>

          {/* Nueva Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva Contraseña
            </label>
            <input
              type="password"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
            />
            {/* Indicador de fortaleza */}
            {validacion && (
              <div className="mt-2">
                {validacion.nivel === 'Fuerte' ? (
                  <div className="flex items-center text-green-600 text-sm">
                    <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">Contraseña fuerte</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center text-red-600 text-sm mb-1">
                      <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">Contraseña {validacion.nivel.toLowerCase()}</span>
                    </div>
                    <ul className="text-sm text-red-600 ml-6 list-disc">
                      {validacion.feedback.map((mensaje: string, idx: number) => (
                        <li key={idx}>{mensaje}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
            />
            {/* Verificación de coincidencia */}
            {confirmarPassword.length > 0 && (
              <div className="mt-2">
                {nuevaPassword === confirmarPassword ? (
                  <div className="flex items-center text-green-600 text-sm">
                    <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Las contraseñas coinciden</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600 text-sm">
                    <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Las contraseñas no coinciden</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={
                loading ||
                !passwordActual ||
                !nuevaPassword ||
                !confirmarPassword ||
                nuevaPassword !== confirmarPassword ||
                (validacion ? validacion.nivel !== 'Fuerte' : false)
              }
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
