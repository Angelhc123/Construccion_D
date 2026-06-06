import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, type RegistroEstudianteDto, type GradoOption } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { useAsync } from '../hooks/useAsync';
import { HTTP_STATUS, ROLES, GRADOS, TIMEOUTS, VALIDATION, DEFAULT_VALUES } from '../config/constants';

export default function EstudianteAuth() {
  const { login } = useAuth();
  const [modo, setModo] = useState<'login' | 'registro'>('login');
  const [grados, setGrados] = useState<GradoOption[]>([]);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [emailRegistrado, setEmailRegistrado] = useState('');
  const [aceptaPoliticas, setAceptaPoliticas] = useState(false);
  
  const [formDataLogin, setFormDataLogin] = useState({ email: '', password: '' });
  const [formDataRegistro, setFormDataRegistro] = useState<RegistroEstudianteDto>({
    email: '', 
    password: '', 
    confirmarPassword: '', 
    nombreCompleto: '', 
    grado: DEFAULT_VALUES.ESTUDIANTE_GRADO, 
    edad: DEFAULT_VALUES.ESTUDIANTE_EDAD
  });

  const [error, setError] = useState('');
  const { loading, execute } = useAsync();
  const navigate = useNavigate();

  useEffect(() => { if (modo === 'registro') cargarGrados(); }, [modo]);

  const cargarGrados = async () => {
    try {
      const gradosData = await authService.obtenerGrados();
      setGrados(gradosData);
    } catch { 
      setGrados([
        { value: GRADOS.CUARTO, label: '4to Grado' }, 
        { value: GRADOS.QUINTO, label: '5to Grado' }, 
        { value: GRADOS.SEXTO, label: '6to Grado' }
      ]); 
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await execute(async () => {
        const resultado = await authService.login(formDataLogin);
        if ('requiereVerificacion' in resultado) { throw new Error('Este acceso es solo para estudiantes'); }
        if (resultado.tipoUsuario !== ROLES.ESTUDIANTE) { throw new Error('Este acceso es solo para estudiantes'); }
        
        // Adaptar respuesta del backend al formato esperado por el frontend
        // El backend devuelve 'fechaExpiracion' pero el frontend espera 'expiracion'
        const usuarioAdaptado = {
          ...resultado,
          // @ts-ignore - Propiedad dinámica
          expiracion: resultado.fechaExpiracion || (resultado as any).expiracion || '' // Fallback
        };
        
        login(usuarioAdaptado as any); // Usa el contexto para guardar sesión
        
        // Aseguramos que la navegación espere un frame para que el contexto se actualice
        setTimeout(() => navigate('/estudiante/dashboard'), TIMEOUTS.LOGIN_REDIRECT_DELAY);
        return resultado;
      });
    } catch (err: any) {
      if (err.message === 'Este acceso es solo para estudiantes') {
        setError(err.message);
      } else if (err.response?.status === HTTP_STATUS.FORBIDDEN && err.response?.data?.cuentaSuspendida) {
        setError('Tu cuenta ha sido suspendida. Contacta al administrador para más información.');
      } else {
        setError(err.response?.data?.mensaje || 'Correo o contraseña incorrectos');
      }
    }
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aceptaPoliticas) { setError('Debes aceptar las políticas de privacidad para continuar'); return; }
    if (formDataRegistro.password !== formDataRegistro.confirmarPassword) { setError('Las contraseñas no coinciden'); return; }
    if (formDataRegistro.password.length < VALIDATION.MIN_PASSWORD_LENGTH) { setError(`La contraseña debe tener al menos ${VALIDATION.MIN_PASSWORD_LENGTH} caracteres`); return; }
    setError('');
    
    try {
      await execute(async () => {
        await authService.registrarEstudiante(formDataRegistro);
        setEmailRegistrado(formDataRegistro.email);
        setRegistroExitoso(true);
      });
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error en el registro');
    }
  };

  if (registroExitoso) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center p-4'>
        <div className='bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center'>
          <div className='bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6'>
            <svg className='w-10 h-10 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
            </svg>
          </div>
          <h2 className='text-2xl font-bold text-gray-800 mb-4'>¡Registro Exitoso!</h2>
          <p className='text-gray-600 mb-2'>Hemos enviado un email de verificación a:</p>
          <p className='text-blue-600 font-semibold mb-6'>{emailRegistrado}</p>
          <p className='text-gray-600 text-sm mb-8'>Por favor revisa tu correo y haz clic en el enlace para activar tu cuenta.</p>
          <button onClick={() => { setRegistroExitoso(false); setModo('login'); }} className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700'>Ir a Iniciar Sesión</button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md'>
        <div className='text-center mb-8'>
          <div className='bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg className='w-8 h-8 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
            </svg>
          </div>
          <h2 className='text-3xl font-bold text-gray-800'>Estudiantes</h2>
          <p className='text-gray-600 mt-2'>LecturaIA - Comprensión Lectora</p>
        </div>

        <div className='flex mb-6 bg-gray-100 rounded-lg p-1'>
          <button onClick={() => { setModo('login'); setError(''); }} className={'flex-1 py-2 rounded-md font-semibold transition-colors ' + (modo === 'login' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-blue-600')}>Iniciar Sesión</button>
          <button onClick={() => { setModo('registro'); setError(''); setAceptaPoliticas(false); }} className={'flex-1 py-2 rounded-md font-semibold transition-colors ' + (modo === 'registro' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-blue-600')}>Registrarse</button>
        </div>

        {modo === 'login' && (
          <form onSubmit={handleLogin} className='space-y-4'>
            <input type='email' placeholder='Correo electrónico' value={formDataLogin.email} onChange={(e) => { setFormDataLogin({ ...formDataLogin, email: e.target.value }); setError(''); }} required className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500' />
            <input type='password' placeholder='Contraseña' value={formDataLogin.password} onChange={(e) => { setFormDataLogin({ ...formDataLogin, password: e.target.value }); setError(''); }} required className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500' />
            {error && <div className='p-3 bg-red-50 border border-red-200 rounded-lg'><p className='text-red-600 text-sm'>{error}</p></div>}
            <button type='submit' disabled={loading} className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300'>{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</button>
            <div className='text-center'><Link to='/recuperar-password' className='text-sm text-blue-600 hover:text-blue-700 font-medium'>¿Olvidaste tu contraseña?</Link></div>
          </form>
        )}

        {modo === 'registro' && (
          <form onSubmit={handleRegistro} className='space-y-4'>
            <input type='email' placeholder='Correo electrónico' value={formDataRegistro.email} onChange={(e) => { setFormDataRegistro({ ...formDataRegistro, email: e.target.value }); setError(''); }} required className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500' />
            <input type='text' placeholder='Nombre completo' value={formDataRegistro.nombreCompleto} onChange={(e) => { setFormDataRegistro({ ...formDataRegistro, nombreCompleto: e.target.value }); setError(''); }} required className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500' />
            <div className='grid grid-cols-2 gap-4'>
              <select value={formDataRegistro.grado} onChange={(e) => { setFormDataRegistro({ ...formDataRegistro, grado: Number(e.target.value) }); }} required className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'>{grados.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}</select>
              <input type='number' placeholder='Edad' value={formDataRegistro.edad} min='5' max='100' required onChange={(e) => { setFormDataRegistro({ ...formDataRegistro, edad: Number(e.target.value) }); }} className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500' />
            </div>
            <input type='password' placeholder='Contraseña' value={formDataRegistro.password} onChange={(e) => { setFormDataRegistro({ ...formDataRegistro, password: e.target.value }); setError(''); }} required className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500' />
            <p className='text-xs text-gray-500 -mt-2'>Mínimo 8 caracteres</p>
            <input type='password' placeholder='Confirmar contraseña' value={formDataRegistro.confirmarPassword} onChange={(e) => { setFormDataRegistro({ ...formDataRegistro, confirmarPassword: e.target.value }); setError(''); }} required className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500' />
            <div className='flex items-start gap-2'>
              <input type='checkbox' id='aceptaPoliticas' checked={aceptaPoliticas} onChange={(e) => { setAceptaPoliticas(e.target.checked); setError(''); }} className='mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500' />
              <label htmlFor='aceptaPoliticas' className='text-sm text-gray-700'>Acepto las <Link to='/politicas-privacidad' target='_blank' className='text-blue-600 hover:text-blue-700 underline font-medium'>políticas de privacidad y protección de datos</Link></label>
            </div>
            {error && <div className='p-3 bg-red-50 border border-red-200 rounded-lg'><p className='text-red-600 text-sm'>{error}</p></div>}
            <button type='submit' disabled={loading} className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300'>{loading ? 'Registrando...' : 'Registrarse'}</button>
          </form>
        )}

        <div className='mt-6 text-center'><Link to='/' className='text-gray-600 hover:text-gray-800 text-sm font-medium'>← Volver al inicio</Link></div>
      </div>
    </div>
  );
}
