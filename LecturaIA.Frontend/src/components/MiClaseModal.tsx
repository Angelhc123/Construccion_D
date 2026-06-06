import { confirmacionAccion } from '../utils/alerts';
import { useEffect, useState } from 'react';
import { perfilService, type AulaDetalle } from '../services/perfilService';

interface MiClaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MiClaseModal({ isOpen, onClose }: MiClaseModalProps) {
  const [codigoVinculacion, setCodigoVinculacion] = useState('');
  const [claseActual, setClaseActual] = useState<AulaDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClase, setIsLoadingClase] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      cargarClaseActual();
    }
  }, [isOpen]);

  const cargarClaseActual = async () => {
    try {
      setIsLoadingClase(true);
      const clase = await perfilService.obtenerMiClase();
      setClaseActual(clase);
    } catch (err: any) {
      console.error('Error al cargar clase:', err);
    } finally {
      setIsLoadingClase(false);
    }
  };

  const handleUnirse = async () => {
    if (!codigoVinculacion.trim()) {
      setError('Por favor ingresa un código de vinculación');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const clase = await perfilService.unirseAClase(codigoVinculacion.trim().toUpperCase());
      
      setSuccess(`¡Te has unido a "${clase.nombre}" exitosamente! 🎉`);
      setCodigoVinculacion('');
      setClaseActual(clase);
      
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err: any) {
      const mensaje = err.response?.data?.mensaje || 'Error al unirse a la clase';
      setError(mensaje);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalir = async () => {
    if (!(await confirmacionAccion('¿Estás seguro de que deseas salir de esta clase?'))) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await perfilService.salirDeClase();
      setClaseActual(null);
      setSuccess('Has salido de la clase exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al salir de la clase');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleUnirse();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h2 className="text-2xl font-bold">Mi Clase</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Mensajes de éxito/error */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-green-800">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{success}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-800">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Estado de Vinculación */}
          {isLoadingClase ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : claseActual ? (
            <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 rounded-full p-2">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">Clase Actual</p>
                    <p className="text-xl font-bold text-gray-900">{claseActual.nombre}</p>
                  </div>
                </div>
              </div>

              {claseActual.descripcion && (
                <p className="text-gray-700 mb-4">{claseActual.descripcion}</p>
              )}

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span><strong>Docente:</strong> {claseActual.nombreDocente}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span><strong>Estudiantes:</strong> {claseActual.cantidadEstudiantes}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span><strong>Creada:</strong>
                      {claseActual.fechaCreacion
                        ? new Date(claseActual.fechaCreacion).toLocaleDateString()
                        : 'No disponible'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-green-200">
                <button
                  onClick={handleSalir}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Salir de la Clase</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-yellow-800 font-medium">No estás vinculado a ninguna clase</p>
                    <p className="text-yellow-700 text-sm mt-1">
                      Ingresa el código de vinculación que te proporcionó tu docente para unirte.
                    </p>
                  </div>
                </div>
              </div>

              {/* Formulario de unirse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Vinculación
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={codigoVinculacion}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      if (value.length <= 6) {
                        setCodigoVinculacion(value);
                      }
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Ej: BCH47X"
                    maxLength={6}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-bold tracking-wider uppercase"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  El código debe tener 6 caracteres (letras y números)
                </p>

                <button
                  onClick={handleUnirse}
                  disabled={isLoading || codigoVinculacion.length !== 6}
                  className="w-full mt-4 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Verificando código...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      <span>Unirse a Clase</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
