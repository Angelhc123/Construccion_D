import { alertaError, alertaInformativa } from '../utils/alerts';
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function VerificarEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [estado, setEstado] = useState<'verificando' | 'exito' | 'error'>('verificando');
  const [mensaje, setMensaje] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setEstado('error');
      setMensaje('Token de verificación no encontrado');
      return;
    }

    verificarEmail(token);
  }, [searchParams]);

  const verificarEmail = async (token: string) => {
    try {
      const response = await authService.verificarEmail(token);
      setEstado('exito');
      setMensaje(response.mensaje);
    } catch (err: any) {
      setEstado('error');
      setMensaje(err.response?.data?.mensaje || 'No se pudo verificar el email');
    }
  };

  const handleReenviar = async () => {
    if (!email) {
      alertaError('Por favor ingresa tu correo electrónico');
      return;
    }

    try {
      await authService.reenviarVerificacion(email);
      alertaInformativa('Se ha enviado un nuevo email de verificación');
    } catch (err: any) {
      alertaError(err.response?.data?.mensaje || 'Error al reenviar verificación');
    }
  };

  const irALogin = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        {/* Verificando */}
        {estado === 'verificando' && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
            <h2 className="text-2xl font-bold text-gray-800">Verificando email...</h2>
            <p className="text-gray-600">Por favor espera un momento</p>
          </div>
        )}

        {/* Éxito */}
        {estado === 'exito' && (
          <div className="space-y-6">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Email Verificado!</h2>
              <p className="text-gray-600">{mensaje}</p>
            </div>
            <button
              onClick={irALogin}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        )}

        {/* Error */}
        {estado === 'error' && (
          <div className="space-y-6">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Error de Verificación</h2>
              <p className="text-gray-600">{mensaje}</p>
            </div>
            
            {/* Formulario de reenvío */}
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={handleReenviar}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Reenviar Email de Verificación
              </button>
              <button
                onClick={irALogin}
                className="w-full text-gray-600 py-2 rounded-lg font-semibold hover:text-gray-800 transition-colors"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
