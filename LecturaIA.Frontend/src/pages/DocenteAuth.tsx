import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, type RegistroDocenteDto, type AuthResponseDto } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import VerificacionCodigo from '../components/VerificacionCodigo';

export default function DocenteAuth() {
  const { login } = useAuth();
  const [modo, setModo] = useState<'login' | 'registro'>('login');
  const [requiereVerificacion, setRequiereVerificacion] = useState(false);
  const [emailVerificacion, setEmailVerificacion] = useState('');
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [emailRegistrado, setEmailRegistrado] = useState('');
  const [aceptaPoliticas, setAceptaPoliticas] = useState(false);

  const [formDataLogin, setFormDataLogin] = useState({ email: '', password: '' });
  const [formDataRegistro, setFormDataRegistro] = useState<RegistroDocenteDto>({
    email: '', password: '', confirmarPassword: '', nombreCompleto: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const resultado = await authService.login(formDataLogin);
      if ('requiereVerificacion' in resultado) {
        setEmailVerificacion(formDataLogin.email);
        setRequiereVerificacion(true);
        setLoading(false);
        return;
      }
      if (resultado.tipoUsuario !== 'Docente' && resultado.tipoUsuario !== 'Administrador') {
        setError('Este acceso es solo para docentes');
        return;
      }
      login(resultado as AuthResponseDto);
      if (resultado.tipoUsuario === 'Administrador') navigate('/admin');
      else navigate('/docente/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response?.status === 403 && err.response?.data?.cuentaSuspendida) {
        setError('Tu cuenta ha sido suspendida. Contacta al administrador para más información.');
      } else {
        // Mejor manejo de errores
        const msg = err.response?.data?.mensaje || err.response?.data || 'Correo o contraseña incorrectos';
        setError(typeof msg === 'string' ? msg : 'Error al iniciar sesión');
      }
    } finally { setLoading(false); }
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aceptaPoliticas) { setError('Debes aceptar las políticas de privacidad para continuar'); return; }
    if (formDataRegistro.password !== formDataRegistro.confirmarPassword) { setError('Las contraseñas no coinciden'); return; }
    if (formDataRegistro.password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
    
    setLoading(true);
    setError('');
    
    try {
      await authService.registrarDocente(formDataRegistro);
      setEmailRegistrado(formDataRegistro.email);
      setRegistroExitoso(true);
    } catch (err: any) {
      console.error('Registro error:', err);
      let mensaje = 'Error en el registro';
      if (err.response?.data?.mensaje) mensaje = err.response.data.mensaje;
      else if (typeof err.response?.data === 'string') mensaje = err.response.data;
      else if (err.request && !err.response) mensaje = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
      
      setError(mensaje);
    } finally { setLoading(false); }
  };

  if (registroExitoso) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center p-4'>
        <div className='bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center'>
          <div className='bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6'>
            <svg className='w-10 h-10 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
            </svg>
          </div>
          <h2 className='text-2xl font-bold text-gray-800 mb-4'>¡Registro Exitoso!</h2>
          <p className='text-gray-600 mb-2'>Hemos enviado un email de verificación a:</p>
          <p className='text-purple-600 font-semibold mb-6'>{emailRegistrado}</p>
          <p className='text-gray-600 text-sm mb-8'>Por favor revisa tu correo y haz clic en el enlace para activar tu cuenta.</p>
          <button onClick={() => { setRegistroExitoso(false); setModo('login'); }} className='w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700'>Ir a Iniciar Sesión</button>
        </div>
      </div>
    );
  }

  if (requiereVerificacion) {
    return <VerificacionCodigo email={emailVerificacion} onVolver={() => { setRequiereVerificacion(false); setFormDataLogin({ email: '', password: '' }); }} />;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md'>
        <div className='text-center mb-8'>
          <div className='bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg className='w-8 h-8 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
            </svg>
          </div>
          <h2 className='text-3xl font-bold text-gray-800'>Docentes</h2>
          <p className='text-gray-600 mt-2'>LecturaIA - Comprensión Lectora</p>
        </div>

        <div className='flex mb-6 bg-gray-100 rounded-lg p-1'>
          <button onClick={() => { setModo('login'); setError(''); }} className={'flex-1 py-2 rounded-md font-semibold transition-colors ' + (modo === 'login' ? 'bg-white text-purple-600 shadow' : 'text-gray-600 hover:text-purple-600')}>Iniciar Sesión</button>
          <button onClick={() => { setModo('registro'); setError(''); setAceptaPoliticas(false); }} className={'flex-1 py-2 rounded-md font-semibold transition-colors ' + (modo === 'registro' ? 'bg-white text-purple-600 shadow' : 'text-gray-600 hover:text-purple-600')}>Registrarse</button>
        </div>

        {modo === 'login' && (
          <form onSubmit={handleLogin} className='space-y-4'>
            <input type='email' placeholder='Correo electrónico' value={formDataLogin.email} onChange={(e) => { setFormDataLogin({ ...formDataLogin, email: e.target.value }); setError(''); }} required className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500' />
            <input type='password' placeholder='Contraseña' value={formDataLogin.password} onChange={(e) => { setFormDataLogin({ ...formDataLogin, password: e.target.value }); setError(''); }} required className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500' />
            {error && <div className='p-3 bg-red-50 border border-red-200 rounded-lg'><p className='text-red-600 text-sm'>{error}</p></div>}
            <button type='submit' disabled={loading} className='w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300'>{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</button>
            <div className='text-center'><Link to='/recuperar-password' className='text-sm text-purple-600 hover:text-purple-700 font-medium'>¿Olvidaste tu contraseña?</Link></div>
          </form>
        )}

        {modo === 'registro' && (
          <form onSubmit={handleRegistro} className='space-y-4'>
            <input type='email' placeholder='Correo electrónico' value={formDataRegistro.email} onChange={(e) => { setFormDataRegistro({ ...formDataRegistro, email: e.target.value }); setError(''); }} required className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500' />
            <input type='text' placeholder='Nombre completo' value={formDataRegistro.nombreCompleto} onChange={(e) => { setFormDataRegistro({ ...formDataRegistro, nombreCompleto: e.target.value }); setError(''); }} required className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500' />
            <input type='password' placeholder='Contraseña' value={formDataRegistro.password} onChange={(e) => { setFormDataRegistro({ ...formDataRegistro, password: e.target.value }); setError(''); }} required className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500' />
            <p className='text-xs text-gray-500 -mt-2'>Mínimo 8 caracteres</p>
            <input type='password' placeholder='Confirmar contraseña' value={formDataRegistro.confirmarPassword} onChange={(e) => { setFormDataRegistro({ ...formDataRegistro, confirmarPassword: e.target.value }); setError(''); }} required className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500' />
            <div className='flex items-start gap-2'>
              <input type='checkbox' id='aceptaPoliticasDocente' checked={aceptaPoliticas} onChange={(e) => { setAceptaPoliticas(e.target.checked); setError(''); }} className='mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500' />
              <label htmlFor='aceptaPoliticasDocente' className='text-sm text-gray-700'>Acepto las <Link to='/politicas-privacidad' target='_blank' className='text-purple-600 hover:text-purple-700 underline font-medium'>políticas de privacidad y protección de datos</Link></label>
            </div>
            {error && <div className='p-3 bg-red-50 border border-red-200 rounded-lg'><p className='text-red-600 text-sm'>{error}</p></div>}
            <button type='submit' disabled={loading} className='w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300'>{loading ? 'Registrando...' : 'Registrarse'}</button>
          </form>
        )}

        <div className='mt-6 text-center'><Link to='/' className='text-gray-600 hover:text-gray-800 text-sm font-medium'>← Volver al inicio</Link></div>
      </div>
    </div>
  );
}
