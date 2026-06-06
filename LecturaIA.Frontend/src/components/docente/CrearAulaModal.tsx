import { useState } from 'react';
import { aulasService, type CrearAulaDto } from '../../services/aulasService';

interface CrearAulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAulaCreada: () => void;
}

// Grados disponibles según el enum del backend
const GRADOS_DISPONIBLES = [
  { value: 'Cuarto', label: '4to Grado' },
  { value: 'Quinto', label: '5to Grado' },
  { value: 'Sexto', label: '6to Grado' }
];

export default function CrearAulaModal({ isOpen, onClose, onAulaCreada }: CrearAulaModalProps) {
  const [grado, setGrado] = useState('');
  const [seccion, setSeccion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!grado) {
      setError('Debes seleccionar un grado');
      return;
    }

    if (!seccion.trim()) {
      setError('La sección es requerida (ej: A, B, C)');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      // Construir el nombre del aula: "4to Grado - A"
      const gradoLabel = GRADOS_DISPONIBLES.find(g => g.value === grado)?.label || grado;
      const nombreAula = `${gradoLabel} - ${seccion.trim().toUpperCase()}`;

      const dto: CrearAulaDto = {
        nombre: nombreAula,
        descripcion: descripcion.trim() || undefined
      };

      await aulasService.crearAula(dto);
      
      // Resetear formulario
      setGrado('');
      setSeccion('');
      setDescripcion('');
      
      // Notificar creación exitosa
      onAulaCreada();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al crear el aula');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setGrado('');
    setSeccion('');
    setDescripcion('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h2 className="text-2xl font-bold">Crear Clase</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-red-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Selector de Grado */}
            <div>
              <label htmlFor="grado" className="block text-sm font-medium text-gray-700 mb-2">
                Grado <span className="text-red-500">*</span>
              </label>
              <select
                id="grado"
                value={grado}
                onChange={(e) => setGrado(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isCreating}
                required
              >
                <option value="">Seleccionar grado...</option>
                {GRADOS_DISPONIBLES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Campo de Sección */}
            <div>
              <label htmlFor="seccion" className="block text-sm font-medium text-gray-700 mb-2">
                Sección <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="seccion"
                value={seccion}
                onChange={(e) => setSeccion(e.target.value)}
                placeholder="Ej: A, B, C"
                maxLength={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isCreating}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Ingresa la sección del aula (ejemplo: A, B, C, D)</p>
            </div>

            {/* Descripción (opcional) */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Aula para estudiantes de cuarto grado, turno mañana"
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                disabled={isCreating}
              />
              <p className="text-xs text-gray-500 mt-1">Máximo 500 caracteres</p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCreating || !grado || !seccion.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Crear</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
