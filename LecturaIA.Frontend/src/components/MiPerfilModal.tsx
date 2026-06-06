import { useEffect, useState } from 'react';
import { perfilService } from '../services/perfilService';
import type { PerfilUsuario } from '../types/user.types';

interface MiPerfilModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MiPerfilModal({ isOpen, onClose }: MiPerfilModalProps) {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      cargarPerfil();
    }
  }, [isOpen]);

  const cargarPerfil = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await perfilService.obtenerPerfil();
      setPerfil(data);
    } catch (err: any) {
      console.error('Error al cargar perfil:', err);
      //console.error('Response:', err.response);
      setError(err.response?.data?.mensaje || 'Error al cargar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-2xl font-bold">Mi Perfil</h2>
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
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          ) : perfil ? (
            <div className="space-y-6">
              {/* Información General */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Información General
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm text-gray-600 font-medium">Nombre Completo</label>
                    <p className="text-gray-900 mt-1">{perfil.nombreCompleto}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm text-gray-600 font-medium">Correo Electrónico</label>
                    <p className="text-gray-900 mt-1">{perfil.email}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm text-gray-600 font-medium">Tipo de Usuario</label>
                    <p className="text-gray-900 mt-1">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        perfil.tipoUsuario === 'Estudiante' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {perfil.tipoUsuario}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Información de Estudiante */}
              {perfil.tipoUsuario === 'Estudiante' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Información Académica
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {perfil.grado && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <label className="text-sm text-blue-600 font-medium">Grado</label>
                        <p className="text-gray-900 mt-1">{perfil.grado}</p>
                      </div>
                    )}
                    {perfil.edad && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <label className="text-sm text-blue-600 font-medium">Edad</label>
                        <p className="text-gray-900 mt-1">{perfil.edad} años</p>
                      </div>
                    )}
                    {perfil.nivelDificultad && (
                      <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                        <label className="text-sm text-blue-600 font-medium flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Nivel de Dificultad
                        </label>
                        <p className="text-gray-900 mt-1 font-semibold">{perfil.nivelDificultad}</p>
                        <p className="text-xs text-gray-500 mt-1">Solo lectura</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Clase Actual (solo estudiantes) */}
              {perfil.tipoUsuario === 'Estudiante' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Mi Clase
                  </h3>
                  {perfil.claseActual ? (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-green-600 font-medium">Clase Actual</p>
                          <p className="text-lg font-semibold text-gray-900 mt-1">{perfil.claseActual.nombre}</p>
                          {perfil.claseActual.descripcion && (
                            <p className="text-sm text-gray-600 mt-1">{perfil.claseActual.descripcion}</p>
                          )}
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">Docente:</span> {perfil.claseActual.nombreDocente}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Vinculado desde: {new Date(perfil.claseActual.fechaVinculacion).toLocaleDateString()}
                          </p>
                        </div>
                        <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-yellow-800">No estás vinculado a ninguna clase</p>
                      </div>
                      <p className="text-sm text-yellow-700 mt-2">
                        Ve a la sección "Mi Clase" para unirte usando un código de vinculación.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
