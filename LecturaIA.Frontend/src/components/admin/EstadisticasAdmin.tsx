import { useState, useEffect } from 'react';
import { adminService, type EstadisticasGenerales as Estadisticas } from '../../services/adminService';

export default function EstadisticasAdmin() {
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const data = await adminService.obtenerEstadisticas();
      setEstadisticas(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return <div className="text-center py-8">Cargando estadísticas...</div>;
  }

  if (!estadisticas) {
    return <div className="text-center py-8 text-red-600">Error al cargar estadísticas</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Estadísticas Generales del Sistema</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="text-3xl font-bold text-blue-600">{estadisticas.totalUsuarios}</div>
          <div className="text-gray-600 mt-2">Total de Usuarios</div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="text-3xl font-bold text-green-600">{estadisticas.totalDocentes}</div>
          <div className="text-gray-600 mt-2">Docentes Registrados</div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="text-3xl font-bold text-purple-600">{estadisticas.totalEstudiantes}</div>
          <div className="text-gray-600 mt-2">Estudiantes Registrados</div>
        </div>

        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <div className="text-3xl font-bold text-red-600">{estadisticas.usuariosSuspendidos}</div>
          <div className="text-gray-600 mt-2">Usuarios Suspendidos</div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <div className="text-3xl font-bold text-yellow-600">{estadisticas.codigosDocentesActivos}</div>
          <div className="text-gray-600 mt-2">Códigos Docentes Activos</div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="text-3xl font-bold text-gray-600">{estadisticas.codigosDocentesUsados}</div>
          <div className="text-gray-600 mt-2">Códigos Docentes Usados</div>
        </div>
      </div>
    </div>
  );
}
