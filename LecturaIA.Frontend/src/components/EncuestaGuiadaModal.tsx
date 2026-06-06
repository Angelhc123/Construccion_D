import { alertaError } from '../utils/alerts';
import { useState } from 'react';
import type { PreferenciasLectura } from '../types/reading.types';
import { UI_CONFIG } from '../config/constants';

export type { PreferenciasLectura };

interface EncuestaGuiadaProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (preferencias: PreferenciasLectura) => void;
}

export default function EncuestaGuiadaModal({ isOpen, onClose, onComplete }: EncuestaGuiadaProps) {
  const [paso, setPaso] = useState(1);
  const [preferencias, setPreferencias] = useState<PreferenciasLectura>({
    temas: [],
    personajes: [],
    escenario: '',
    longitud: '',
    emocion: '',
    proposito: ''
  });

  const temas = [
    'Animales', 'Ciencia', 'Aventura', 'Misterio', 'Magia', 'Historia',
    'Espacio', 'Deportes', 'Amistad', 'Fantasía', 'Medio ambiente', 'Tecnología', 'Humor'
  ];

  const personajes = [
    'Niños / niñas', 'Animales', 'Robots', 'Aliens', 'Héroes o heroínas', 'Magos o hadas'
  ];


  const escenarios = [
    'En un bosque o naturaleza',
    'En la escuela o ciudad',
    'En el espacio exterior',
    'En un castillo o mundo mágico',
    'En el futuro o un mundo tecnológico',
    'En el mar o bajo el agua'
  ];

  const longitudes = [
    { label: 'Corta (200 palabras)', value: 'Corta' },
    { label: 'Mediana (400 palabras)', value: 'Mediana' },
    { label: 'Larga (700 palabras)', value: 'Larga' }
  ];

  const emociones = [
    'Alegre y divertido',
    'Misteriosa',
    'Inspirador',
    'Emocionante',
    'Tierno'
  ];

  const propositos = [
    'Aprender algo nuevo',
    'Divertirme',
    'Imaginar o soñar',
    'Reflexionar o pensar',
    'Relajarme'
  ];

  const handleToggleSelection = (
    key: keyof Pick<PreferenciasLectura, 'temas' | 'personajes'>,
    value: string
  ) => {
    const list = preferencias[key];
    if (list.includes(value)) {
      setPreferencias({
        ...preferencias,
        [key]: list.filter(item => item !== value)
      });
    } else if (list.length < UI_CONFIG.MAX_SURVEY_SELECTIONS) {
      setPreferencias({
        ...preferencias,
        [key]: [...list, value]
      });
    }
  };

  const handleSiguiente = () => {
    // Validaciones por paso
    if (paso === 1 && preferencias.temas.length === 0) {
      alertaError('Por favor selecciona al menos un tema');
      return;
    }
    if (paso === 2 && preferencias.personajes.length === 0) {
      alertaError('Por favor selecciona al menos un personaje');
      return;
    }
    if (paso === 3 && !preferencias.escenario) {
      alertaError('Por favor selecciona un escenario');
      return;
    }
    if (paso === 4 && !preferencias.longitud) {
      alertaError('Por favor selecciona una longitud');
      return;
    }
    if (paso === 5 && !preferencias.emocion) {
      alertaError('Por favor selecciona una emoción');
      return;
    }

    if (paso < 6) {
      setPaso(paso + 1);
    }
  };

  const handleEnviar = () => {
    if (!preferencias.proposito) {
      alertaError('Por favor selecciona un propósito');
      return;
    }
    onComplete(preferencias);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Encuesta Guiada - Crear tu Lectura</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span>Paso {paso} de 6</span>
            <span>{Math.round((paso / 6) * 100)}% completado</span>
          </div>
          <div className="mt-2 bg-white bg-opacity-30 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${(paso / 6) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Paso 1: Temas */}
          {paso === 1 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                ¿Cuáles son tus temas favoritos?
              </h3>
              <p className="text-gray-600 mb-4">Puedes seleccionar máximo 2 temas</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {temas.map((tema) => (
                  <button
                    key={tema}
                    onClick={() => handleToggleSelection('temas', tema)}
                    className={`p-4 rounded-lg border-2 text-left transition ${
                      preferencias.temas.includes(tema)
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                        : 'border-gray-200 hover:border-blue-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                        preferencias.temas.includes(tema)
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {preferencias.temas.includes(tema) && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      {tema}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSiguiente}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Paso 2: Personajes */}
          {paso === 2 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                ¿Qué tipo de personajes prefieres?
              </h3>
              <p className="text-gray-600 mb-4">Puedes seleccionar máximo 2 personajes</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {personajes.map((personaje) => (
                  <button
                    key={personaje}
                    onClick={() => handleToggleSelection('personajes', personaje)}
                    className={`p-4 rounded-lg border-2 text-left transition ${
                      preferencias.personajes.includes(personaje)
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                        : 'border-gray-200 hover:border-blue-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                        preferencias.personajes.includes(personaje)
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {preferencias.personajes.includes(personaje) && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      {personaje}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setPaso(paso - 1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold transition"
                >
                  Atrás
                </button>
                <button
                  onClick={handleSiguiente}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Paso 3: Escenario */}
          {paso === 3 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                ¿Dónde te gustaría que ocurra la historia?
              </h3>
              <p className="text-gray-600 mb-4">Selecciona una opción</p>
              <div className="space-y-3">
                {escenarios.map((escenario) => (
                  <button
                    key={escenario}
                    onClick={() => setPreferencias({ ...preferencias, escenario })}
                    className={`w-full p-4 rounded-lg border-2 text-left transition ${
                      preferencias.escenario === escenario
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                        : 'border-gray-200 hover:border-blue-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        preferencias.escenario === escenario
                          ? 'border-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {preferencias.escenario === escenario && (
                          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                        )}
                      </div>
                      {escenario}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setPaso(paso - 1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold transition"
                >
                  Atrás
                </button>
                <button
                  onClick={handleSiguiente}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Paso 4: Longitud */}
          {paso === 4 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                ¿Qué tan larga será la lectura?
              </h3>
              <p className="text-gray-600 mb-4">Selecciona una opción</p>
              <div className="space-y-3">
                {longitudes.map((longitud) => (
                  <button
                    key={longitud.value}
                    onClick={() => setPreferencias({ ...preferencias, longitud: longitud.value })}
                    className={`w-full p-4 rounded-lg border-2 text-left transition ${
                      preferencias.longitud === longitud.value
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                        : 'border-gray-200 hover:border-blue-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        preferencias.longitud === longitud.value
                          ? 'border-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {preferencias.longitud === longitud.value && (
                          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                        )}
                      </div>
                      {longitud.label}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setPaso(paso - 1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold transition"
                >
                  Atrás
                </button>
                <button
                  onClick={handleSiguiente}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Paso 5: Emoción */}
          {paso === 5 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                ¿Qué emociones quieres que contenga la lectura?
              </h3>
              <p className="text-gray-600 mb-4">Selecciona una opción</p>
              <div className="space-y-3">
                {emociones.map((emocion) => (
                  <button
                    key={emocion}
                    onClick={() => setPreferencias({ ...preferencias, emocion })}
                    className={`w-full p-4 rounded-lg border-2 text-left transition ${
                      preferencias.emocion === emocion
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                        : 'border-gray-200 hover:border-blue-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        preferencias.emocion === emocion
                          ? 'border-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {preferencias.emocion === emocion && (
                          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                        )}
                      </div>
                      {emocion}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setPaso(paso - 1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold transition"
                >
                  Atrás
                </button>
                <button
                  onClick={handleSiguiente}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Paso 6: Propósito */}
          {paso === 6 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                ¿Para qué te gustaría leer esta historia?
              </h3>
              <p className="text-gray-600 mb-4">Selecciona una opción</p>
              <div className="space-y-3">
                {propositos.map((proposito) => (
                  <button
                    key={proposito}
                    onClick={() => setPreferencias({ ...preferencias, proposito })}
                    className={`w-full p-4 rounded-lg border-2 text-left transition ${
                      preferencias.proposito === proposito
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                        : 'border-gray-200 hover:border-blue-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        preferencias.proposito === proposito
                          ? 'border-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {preferencias.proposito === proposito && (
                          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                        )}
                      </div>
                      {proposito}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setPaso(paso - 1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold transition"
                >
                  Atrás
                </button>
                <button
                  onClick={handleEnviar}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition"
                >
                  Enviar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
