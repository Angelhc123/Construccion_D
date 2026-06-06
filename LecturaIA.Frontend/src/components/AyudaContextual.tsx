import { useState } from 'react';

interface AyudaContextualProps {
  pantalla: string;
  contenido: {
    titulo: string;
    instrucciones: string[];
  };
  onVerTutorial?: () => void;
}

export default function AyudaContextual({ pantalla, contenido, onVerTutorial }: AyudaContextualProps) {
  const [mostrarAyuda, setMostrarAyuda] = useState(false);

  return (
    <>
      {/* Icono de ayuda */}
      <button
        onClick={() => setMostrarAyuda(true)}
        className="fixed top-4 right-4 z-40 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
        title="Ayuda"
      >
        <span className="text-xl font-bold">?</span>
      </button>

      {/* Modal de ayuda */}
      {mostrarAyuda && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-2xl font-bold">Ayuda - {contenido.titulo}</h2>
              <p className="text-blue-100 text-sm mt-1">Pantalla: {pantalla}</p>
            </div>

            {/* Contenido */}
            <div className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Instrucciones:</h3>
                <ul className="space-y-3">
                  {contenido.instrucciones.map((instruccion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                        {index + 1}
                      </span>
                      <p className="text-gray-700 leading-relaxed">{instruccion}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Opción de ver tutorial */}
              {onVerTutorial && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setMostrarAyuda(false);
                      onVerTutorial();
                    }}
                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">🎓</span>
                    Ver Tutorial Nuevamente
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
              <button
                onClick={() => setMostrarAyuda(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
