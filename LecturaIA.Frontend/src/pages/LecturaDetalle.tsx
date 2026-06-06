import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lecturaService, getImageUrl } from '../services/lecturaService';
import type { LecturaGenerada } from '../services/lecturaService';

const LecturaDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lectura, setLectura] = useState<LecturaGenerada | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarLectura = async () => {
      if (!id) {
        setError('ID de lectura no proporcionado');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const lecturaData = await lecturaService.obtenerLectura(parseInt(id, 10));
        setLectura(lecturaData);
      } catch (error: any) {
        setError(error.message || 'Error al cargar la lectura');
      } finally {
        setIsLoading(false);
      }
    };

    cargarLectura();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando lectura...</p>
        </div>
      </div>
    );
  }

  if (error || !lectura) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error al cargar</h2>
          <p className="text-gray-600 mb-6">{error || 'No se pudo encontrar la lectura'}</p>
          <button
            onClick={() => navigate('/estudiante/dashboard')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Botón de regreso */}
        <button
          onClick={() => navigate('/estudiante/dashboard')}
          className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 font-semibold transition-colors group"
        >
          <svg
            className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al dashboard
        </button>

        {/* Contenedor principal de la lectura */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Encabezado decorativo */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 h-3"></div>

          {/* Contenido */}
          <div className="p-8 md:p-12">
            {/* Título */}
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              {lectura.titulo}
            </h1>

            {/* Badge de tipo de lectura */}
            <div className="flex justify-center mb-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                {lectura.tipoLectura}
              </span>
            </div>

            {/* Imagen */}
            {lectura.urlImagen && (
              <div className="mb-10 flex justify-center">
                <div className="relative group">
                  <img
                    src={getImageUrl(lectura.urlImagen)}
                    alt={lectura.titulo}
                    className="max-w-full md:max-w-2xl rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e0e7ff" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236366f1" font-size="20" font-family="Arial"%3EImagen no disponible%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            )}

            {/* Contenido de la lectura */}
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-justify">
                {lectura.contenido}
              </div>
            </div>

            {/* Footer con información adicional */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Fecha de creación */}
                <div className="text-center">
                  <div className="text-gray-500 text-sm font-semibold mb-2">Creada el</div>
                  <div className="text-gray-800 font-medium">
                    {new Date(lectura.fechaCreacion).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                {/* Longitud */}
                {lectura.preferencias?.longitud && (
                  <div className="text-center">
                    <div className="text-gray-500 text-sm font-semibold mb-2">Longitud</div>
                    <div className="text-gray-800 font-medium">{lectura.preferencias.longitud}</div>
                  </div>
                )}

                {/* Emoción */}
                {lectura.preferencias?.emocion && (
                  <div className="text-center">
                    <div className="text-gray-500 text-sm font-semibold mb-2">Emoción</div>
                    <div className="text-gray-800 font-medium">{lectura.preferencias.emocion}</div>
                  </div>
                )}
              </div>

              {/* Preferencias detalladas */}
              {lectura.preferencias && (
                <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                    </svg>
                    Preferencias de esta lectura
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lectura.preferencias.temas && lectura.preferencias.temas.length > 0 && (
                      <div>
                        <span className="text-gray-600 font-semibold">Temas:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {lectura.preferencias.temas.map((tema) => (
                            <span key={tema} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                              {tema}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {lectura.preferencias.personajes && lectura.preferencias.personajes.length > 0 && (
                      <div>
                        <span className="text-gray-600 font-semibold">Personajes:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {lectura.preferencias.personajes.map((personaje) => (
                            <span key={personaje} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                              {personaje}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {lectura.preferencias.escenario && (
                      <div>
                        <span className="text-gray-600 font-semibold">Escenario:</span>
                        <span className="ml-2 text-gray-800">{lectura.preferencias.escenario}</span>
                      </div>
                    )}
                    {lectura.preferencias.proposito && (
                      <div>
                        <span className="text-gray-600 font-semibold">Propósito:</span>
                        <span className="ml-2 text-gray-800">{lectura.preferencias.proposito}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturaDetalle;
