import { alertaError, alertaInformativa } from '../../utils/alerts';
import { useState, useEffect } from 'react';
import { adminService, type CodigoDocente } from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';

export default function CodigosDocentes() {
  const { user } = useAuth();
  const [codigos, setCodigos] = useState<CodigoDocente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [codigoGenerado, setCodigoGenerado] = useState('');

  useEffect(() => {
    cargarCodigos();
  }, []);

  const cargarCodigos = async () => {
    try {
      const data = await adminService.obtenerCodigosDocentes();
      setCodigos(data);
    } catch (error) {
      console.error('Error al cargar códigos:', error);
      alertaError('Error al cargar códigos de registro');
    } finally {
      setCargando(false);
    }
  };

  const generarNuevoCodigo = async () => {
    try {
      if (!user || user.id === undefined) return; // Validación de seguridad
      const adminId = user.id;

      const data = await adminService.generarCodigoDocente(adminId);

      if (data.exito) {
        setCodigoGenerado(data.codigo);
        alertaInformativa(data.mensaje);
        cargarCodigos();
      }
    } catch (error) {
      console.error('Error al generar código:', error);
      alertaError('Error al generar código de registro');
    }
  };

  const copiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    alertaInformativa(`Código ${codigo} copiado al portapapeles`);
  };

  if (cargando) {
    return <div className="text-center py-8">Cargando códigos...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Códigos de Registro para Docentes</h2>
        <button
          onClick={generarNuevoCodigo}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
        >
          Generar Nuevo Código Docente
        </button>
      </div>

      {codigoGenerado && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">
            Código generado: <span className="font-bold text-lg">{codigoGenerado}</span>
          </p>
          <p className="text-green-600 text-sm mt-1">Estado: Activo (no usado)</p>
          <button
            onClick={() => copiarCodigo(codigoGenerado)}
            className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            Copiar Código
          </button>
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
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Generado Por
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Creación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usado Por
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {codigos.map((codigo) => (
              <tr key={codigo.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {codigo.codigo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Docente</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      codigo.estado === 'Activo'
                        ? 'bg-green-100 text-green-800'
                        : codigo.estado === 'Usado'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {codigo.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{codigo.generadoPor}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(codigo.fechaCreacion).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {codigo.usadoPor || '-'}
                  {codigo.fechaUso && (
                    <div className="text-xs text-gray-400">{new Date(codigo.fechaUso).toLocaleString()}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {codigo.estado === 'Activo' && (
                    <button
                      onClick={() => copiarCodigo(codigo.codigo)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Copiar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {codigos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay códigos de registro generados. Haga clic en "Generar Nuevo Código Docente" para crear uno.
          </div>
        )}
      </div>
    </div>
  );
}
