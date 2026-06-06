import type { PreferenciasLectura } from './EncuestaGuiadaModal';

interface VistaPreviaPreferenciasProps {
  isOpen: boolean;
  preferencias: PreferenciasLectura;
  onClose: () => void;
  onGenerarLectura: () => void;
  isGenerating?: boolean;
}

export default function VistaPreviaPreferenciasModal({ 
  isOpen, 
  preferencias, 
  onClose, 
  onGenerarLectura,
  isGenerating = false 
}: VistaPreviaPreferenciasProps) {
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Estas son tus preferencias</h2>
            {!isGenerating && (
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            )}
          </div>
          <p className="text-blue-100 mt-2">Revisa tus selecciones antes de generar tu lectura personalizada</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="space-y-6">
            {/* Temas */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Temas Favoritos
              </h3>
              <div className="flex flex-wrap gap-2">
                {preferencias.temas.map((tema) => (
                  <span
                    key={tema}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {tema}
                  </span>
                ))}
              </div>
            </div>

            {/* Personajes */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Personajes
              </h3>
              <div className="flex flex-wrap gap-2">
                {preferencias.personajes.map((personaje) => (
                  <span
                    key={personaje}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {personaje}
                  </span>
                ))}
              </div>
            </div>

            {/* Escenario */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Escenario
              </h3>
              <p className="text-gray-700 bg-purple-50 px-4 py-2 rounded-lg">
                {preferencias.escenario}
              </p>
            </div>

            {/* Longitud */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Longitud de la Lectura
              </h3>
              <p className="text-gray-700 bg-orange-50 px-4 py-2 rounded-lg">
                {preferencias.longitud} ({
                  preferencias.longitud === 'Corta' ? '200 palabras' :
                  preferencias.longitud === 'Mediana' ? '400 palabras' :
                  '700 palabras'
                })
              </p>
            </div>

            {/* Emoción */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <svg className="w-5 h-5 text-pink-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Emoción
              </h3>
              <p className="text-gray-700 bg-pink-50 px-4 py-2 rounded-lg">
                {preferencias.emocion}
              </p>
            </div>

            {/* Propósito */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Propósito
              </h3>
              <p className="text-gray-700 bg-indigo-50 px-4 py-2 rounded-lg">
                {preferencias.proposito}
              </p>
            </div>
          </div>

          {/* Botón Generar */}
          <div className="mt-8">
            <button
              onClick={onGenerarLectura}
              disabled={isGenerating}
              className={`w-full py-4 rounded-lg font-bold text-lg transition flex items-center justify-center ${
                isGenerating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg'
              }`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generando tu lectura mágica...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generar Lectura
                </>
              )}
            </button>
            
            {!isGenerating && (
              <button
                onClick={onClose}
                className="w-full mt-3 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition"
              >
                Cancelar
              </button>
            )}
          </div>

          {isGenerating && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-center">
                🎨 Nuestra IA está creando una historia única para ti... Esto puede tomar unos segundos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
