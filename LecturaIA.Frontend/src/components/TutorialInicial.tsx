import { useState } from 'react';
import { ayudaService } from '../services/ayudaService';

interface PasoTutorial {
  numero: number;
  titulo: string;
  descripcion: string;
  imagen?: string;
}

interface TutorialInicialProps {
  pasos: PasoTutorial[];
  onCompletar: () => void;
  onOmitir: () => void;
  tipoUsuario: 'Estudiante' | 'Docente' | 'Administrador';
}

export default function TutorialInicial({ pasos, onCompletar, onOmitir, tipoUsuario }: TutorialInicialProps) {
  const [pasoActual, setPasoActual] = useState(0);
  const [mostrarBienvenida, setMostrarBienvenida] = useState(true);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const avanzarPaso = () => {
    if (pasoActual < pasos.length - 1) {
      setPasoActual(pasoActual + 1);
    } else {
      completarTutorial();
    }
  };

  const completarTutorial = async () => {
    try {
      await ayudaService.marcarTutorialVisto();
      onCompletar();
    } catch (error) {
      console.error('Error al marcar tutorial como visto:', error);
      onCompletar(); // Completar de todos modos
    }
  };

  const confirmarOmitir = () => {
    setMostrarConfirmacion(true);
  };

  const omitirTutorial = async () => {
    try {
      await ayudaService.marcarTutorialVisto();
      onOmitir();
    } catch (error) {
      console.error('Error al omitir tutorial:', error);
      onOmitir(); // Omitir de todos modos
    }
  };

  const comenzarTutorial = () => {
    setMostrarBienvenida(false);
  };

  // Modal de bienvenida
  if (mostrarBienvenida) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-6 rounded-t-lg">
            <h2 className="text-3xl font-bold mb-2">¡Bienvenido al Sistema! 🎉</h2>
            <p className="text-blue-100">
              {tipoUsuario === 'Estudiante' && 'Plataforma de Comprensión Lectora'}
              {tipoUsuario === 'Docente' && 'Panel de Gestión Docente'}
              {tipoUsuario === 'Administrador' && 'Panel de Administración'}
            </p>
          </div>

          {/* Contenido */}
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-700 text-lg leading-relaxed">
                Te mostraremos cómo usar la plataforma en {pasos.length} pasos sencillos.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                💡 <strong>Tip:</strong> Puedes ver este tutorial nuevamente desde el botón de ayuda (?) en cualquier momento.
              </p>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="bg-gray-50 px-8 py-4 rounded-b-lg flex justify-between">
            <button
              onClick={confirmarOmitir}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Omitir tutorial
            </button>
            <button
              onClick={comenzarTutorial}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all shadow-lg"
            >
              Comenzar Tutorial →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modal de confirmación de omitir
  if (mostrarConfirmacion) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¿Seguro que deseas saltar el tutorial?
              </h3>
              <p className="text-gray-600">
                Puedes verlo después desde el botón de Ayuda (?) en cualquier pantalla.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-center space-x-3">
            <button
              onClick={() => setMostrarConfirmacion(false)}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Ver Tutorial
            </button>
            <button
              onClick={omitirTutorial}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Saltar Tutorial
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tutorial paso a paso
  const paso = pasos[pasoActual];
  const progreso = ((pasoActual + 1) / pasos.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Barra de progreso */}
        <div className="h-2 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
            style={{ width: `${progreso}%` }}
          />
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold bg-white bg-opacity-20 px-3 py-1 rounded-full">
              Paso {paso.numero} de {pasos.length}
            </span>
            <button
              onClick={confirmarOmitir}
              className="text-white hover:text-gray-200 text-sm font-medium transition-colors"
            >
              Saltar Tutorial
            </button>
          </div>
          <h2 className="text-2xl font-bold">{paso.titulo}</h2>
        </div>

        {/* Contenido */}
        <div className="p-8">
          {paso.imagen && (
            <div className="mb-6 rounded-lg overflow-hidden border border-gray-200 shadow-md">
              <img src={paso.imagen} alt={paso.titulo} className="w-full" />
            </div>
          )}

          <p className="text-gray-700 text-lg leading-relaxed">
            {paso.descripcion}
          </p>

          {/* Mensaje final */}
          {pasoActual === pasos.length - 1 && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold flex items-center">
                <span className="text-2xl mr-2">🎉</span>
                ¡Tutorial completado! Ya puedes comenzar a usar el sistema
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 rounded-b-lg flex justify-between items-center">
          <div className="flex space-x-2">
            {pasos.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= pasoActual ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={avanzarPaso}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all shadow-lg"
          >
            {pasoActual === pasos.length - 1 ? 'Entendido ✓' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
  );
}
