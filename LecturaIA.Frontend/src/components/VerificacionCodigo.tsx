import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

interface VerificacionCodigoProps {
  email: string;
  onVolver: () => void;
}

export default function VerificacionCodigo({ email, onVolver }: VerificacionCodigoProps) {
  const { login } = useAuth();
  const [codigo, setCodigo] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(600); // 10 minutos en segundos
  const [puedeReenviar, setPuedeReenviar] = useState(false);
  const navigate = useNavigate();

  // Contador de tiempo
  useEffect(() => {
    if (tiempoRestante > 0) {
      const timer = setTimeout(() => setTiempoRestante(tiempoRestante - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setPuedeReenviar(true);
    }
  }, [tiempoRestante]);

  const formatearTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index: number, value: string) => {
    // Solo permitir números
    if (value && !/^\d$/.test(value)) return;

    const nuevoCodigo = [...codigo];
    nuevoCodigo[index] = value;
    setCodigo(nuevoCodigo);
    setError('');

    // Auto-focus al siguiente input
    if (value && index < 5) {
      const nextInput = document.getElementById(`codigo-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit cuando se completa el código
    if (index === 5 && value) {
      const codigoCompleto = nuevoCodigo.join('');
      if (codigoCompleto.length === 6) {
        verificarCodigo(codigoCompleto);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !codigo[index] && index > 0) {
      const prevInput = document.getElementById(`codigo-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (/^\d{6}$/.test(pastedData)) {
      const nuevoCodigo = pastedData.split('');
      setCodigo(nuevoCodigo);
      setError('');
      
      // Auto-submit
      verificarCodigo(pastedData);
    }
  };

  const verificarCodigo = async (codigoCompleto?: string) => {
    const codigoFinal = codigoCompleto || codigo.join('');
    
    if (codigoFinal.length !== 6) {
      setError('Por favor ingresa el código completo de 6 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const authData = await authService.verificarCodigoLogin(email, codigoFinal);
      
      // Guardar sesión usando el hook
      login(authData);
      
      // La redirección ocurrirá automáticamente por las rutas protegidas, o aquí:
      navigate('/docente/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Código inválido o expirado');
      setCodigo(['', '', '', '', '', '']);
      document.getElementById('codigo-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async () => {
    setLoading(true);
    setError('');

    try {
      await authService.reenviarCodigoLogin(email);
      setTiempoRestante(600); // Reiniciar contador a 10 minutos
      setPuedeReenviar(false);
      setCodigo(['', '', '', '', '', '']);
      document.getElementById('codigo-0')?.focus();
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'No se pudo reenviar el código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Verificación de Seguridad
          </h2>
          <p className="text-gray-600 text-sm">
            Hemos enviado un código de 6 dígitos a
          </p>
          <p className="text-indigo-600 font-semibold">{email}</p>
        </div>

        {/* Inputs de código */}
        <div className="mb-6">
          <div className="flex justify-center gap-2 mb-4">
            {codigo.map((digit, index) => (
              <input
                key={index}
                id={`codigo-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                disabled={loading}
              />
            ))}
          </div>

          {/* Tiempo restante */}
          <div className="text-center">
            {tiempoRestante > 0 ? (
              <p className="text-sm text-gray-600">
                ⏱️ El código expira en <span className="font-semibold text-indigo-600">{formatearTiempo(tiempoRestante)}</span>
              </p>
            ) : (
              <p className="text-sm text-red-600 font-semibold">
                ⚠️ El código ha expirado
              </p>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Botones */}
        <div className="space-y-3">
          <button
            onClick={() => verificarCodigo()}
            disabled={loading || codigo.join('').length !== 6}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Verificando...' : 'Verificar Código'}
          </button>

          <button
            onClick={handleReenviar}
            disabled={loading || !puedeReenviar}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {puedeReenviar ? 'Reenviar Código' : 'Reenviar código disponible cuando expire'}
          </button>

          <button
            onClick={onVolver}
            disabled={loading}
            className="w-full text-gray-600 py-2 rounded-lg font-semibold hover:text-gray-800 transition-colors"
          >
            ← Volver al inicio de sesión
          </button>
        </div>

        {/* Info adicional */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            💡 <strong>Consejo:</strong> Revisa tu bandeja de entrada y carpeta de spam. 
            El código es válido por 10 minutos.
          </p>
        </div>
      </div>
    </div>
  );
}
