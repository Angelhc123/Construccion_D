import { alertaInformativa } from '../utils/alerts';
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function RecuperarPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  // Formulario de solicitud (sin token)
  const [email, setEmail] = useState('');
  const [emailEnviado, setEmailEnviado] = useState(false);
  
  // Formulario de restablecimiento (con token)
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSolicitarRecuperacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.solicitarRecuperacion(email);
      setEmailEnviado(true);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al solicitar recuperación');
    } finally {
      setLoading(false);
    }
  };

  const handleRestablecerPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (nuevaPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.restablecerPassword(token!, nuevaPassword, confirmarPassword);
      alertaInformativa('Contraseña restablecida exitosamente');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Token inválido o expirado');
    } finally {
      setLoading(false);
    }
  };

  // Vista: Solicitar recuperación (sin token)
  if (!token) {
    if (emailEnviado) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Email Enviado!</h2>
            <p className="text-gray-600 mb-6">
              Si el correo <strong>{email}</strong> está registrado, recibirás instrucciones para restablecer tu contraseña.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">¿Olvidaste tu contraseña?</h2>
            <p className="text-gray-600 text-sm">
              Ingresa tu correo electrónico y te enviaremos instrucciones para restablecerla
            </p>
          </div>

          <form onSubmit={handleSolicitarRecuperacion} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
            >
              {loading ? 'Enviando...' : 'Enviar Instrucciones'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full text-gray-600 py-2 rounded-lg font-semibold hover:text-gray-800 transition-colors"
            >
              ← Volver al inicio de sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Vista: Restablecer contraseña (con token)
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Restablecer Contraseña</h2>
          <p className="text-gray-600 text-sm">Ingresa tu nueva contraseña</p>
        </div>

        <form onSubmit={handleRestablecerPassword} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={nuevaPassword}
              onChange={(e) => { setNuevaPassword(e.target.value); setError(''); }}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
          </div>

          <div>
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmarPassword}
              onChange={(e) => { setConfirmarPassword(e.target.value); setError(''); }}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
          >
            {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
