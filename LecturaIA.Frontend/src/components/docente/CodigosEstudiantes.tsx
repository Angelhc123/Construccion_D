import { useState, useEffect } from 'react';
import api from '../../config/api';

interface CodigoEstudiante {
  id: number;
  codigo: string;
  activo: boolean;
  usado: boolean;
  fechaGeneracion: string;
  fechaUso?: string;
  nombreEstudiante?: string;
}

export default function CodigosEstudiantes() {
  const [codigos, setCodigos] = useState<CodigoEstudiante[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cargarCodigos = async () => {
    try {
      const response = await api.get('/docente/codigos-estudiantes');
      setCodigos(response.data.data);
    } catch (err: any) {
      console.error('Error al cargar códigos:', err);
      setError(`Error al cargar los códigos: ${err.response?.data?.mensaje || err.message}`);
    }
  };

  useEffect(() => {
    cargarCodigos();
  }, []);

  const generarCodigo = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post(
        '/docente/codigos-estudiantes/generar',
        {}
      );
      setCodigos([response.data.data, ...codigos]);
    } catch (err: any) {
      console.error('Error al generar código:', err);
      setError(`Error al generar el código: ${err.response?.data?.mensaje || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleActivo = async (id: number) => {
    try {
      await api.put(
        `/docente/codigos-estudiantes/${id}/toggle-activo`,
        {}
      );
      await cargarCodigos();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setError('Error al cambiar el estado del código');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Códigos de Estudiantes</h2>
        <button
          onClick={generarCodigo}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Generando...' : 'Generar Nuevo Código'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estudiantes Registrados
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Generación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {codigos.map((codigo) => (
              <tr key={codigo.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-sm font-semibold text-gray-900">
                    {codigo.activo ? codigo.codigo : '••••••••••'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {codigo.activo ? (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      ✓ Activo
                    </span>
                  ) : (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      ✗ Inactivo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {codigo.nombreEstudiante || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(codigo.fechaGeneracion).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => toggleActivo(codigo.id)}
                    className={`px-3 py-1 rounded-md transition ${
                      codigo.activo
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {codigo.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
            {codigos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No hay códigos generados. Haz clic en "Generar Nuevo Código" para crear uno.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">ℹ️ Información sobre los códigos</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li><strong>✓ Activo:</strong> El código está visible y <strong>múltiples estudiantes</strong> pueden usarlo para registrarse</li>
          <li><strong>✗ Inactivo:</strong> El código está desactivado y <strong>nadie puede usarlo</strong> para registrarse</li>
          <li>Puedes <strong>activar/desactivar</strong> códigos en cualquier momento</li>
          <li>Un mismo código puede ser usado por <strong>muchos estudiantes</strong> mientras esté activo</li>
          <li>Cuando desactivas un código, los estudiantes ya registrados no se ven afectados</li>
        </ul>
      </div>
    </div>
  );
}
