import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import examenGrupalService from '../../services/examenGrupalService';
import type { ResultadosExamenGrupalDto } from '../../services/examenGrupalService';
import './ResultadosExamenGrupal.css';

const ResultadosExamenGrupal: React.FC = () => {
  const { examenId } = useParams<{ examenId: string }>();
  const navigate = useNavigate();
  const [resultados, setResultados] = useState<ResultadosExamenGrupalDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ordenColumna, setOrdenColumna] = useState<'nombre' | 'calificacion' | 'tiempo'>('calificacion');
  const [ordenAscendente, setOrdenAscendente] = useState(false);

  useEffect(() => {
    if (examenId) {
      cargarResultados();
    }
  }, [examenId]);

  const cargarResultados = async () => {
    try {
      setLoading(true);
      const data = await examenGrupalService.obtenerResultadosConsolidados(parseInt(examenId!));
      setResultados(data);
    } catch (err: any) {
      console.error('Error al cargar resultados:', err);
      setError(err.response?.data?.mensaje || 'Error al cargar los resultados');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const ordenarResultados = (columna: typeof ordenColumna) => {
    if (ordenColumna === columna) {
      setOrdenAscendente(!ordenAscendente);
    } else {
      setOrdenColumna(columna);
      setOrdenAscendente(false);
    }
  };

  const resultadosOrdenados = React.useMemo(() => {
    if (!resultados) return [];
    
    const datos = [...resultados.resultados];
    
    datos.sort((a, b) => {
      let compareValue = 0;
      
      switch (ordenColumna) {
        case 'nombre':
          compareValue = a.nombreCompleto.localeCompare(b.nombreCompleto);
          break;
        case 'calificacion':
          compareValue = (b.calificacion || 0) - (a.calificacion || 0);
          break;
        case 'tiempo':
          compareValue = (a.tiempoTotalMinutos || 0) - (b.tiempoTotalMinutos || 0);
          break;
      }
      
      return ordenAscendente ? -compareValue : compareValue;
    });
    
    return datos;
  }, [resultados, ordenColumna, ordenAscendente]);

  const obtenerClaseCalificacion = (calificacion?: number) => {
    if (!calificacion) return '';
    if (calificacion >= 9) return 'calificacion-excelente';
    if (calificacion >= 7) return 'calificacion-buena';
    return 'calificacion-baja';
  };

  if (loading) {
    return (
      <div className="resultados-container">
        <div className="loading">
          <div className="spinner-large"></div>
          <p>Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (error || !resultados) {
    return (
      <div className="resultados-container">
        <div className="error-message">
          <span>⚠️</span>
          <p>{error || 'No se encontraron resultados'}</p>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            Volver
          </button>
        </div>
      </div>
    );
  }

  const { examenInfo, estadisticas } = resultados;

  return (
    <div className="resultados-container">
      <div className="resultados-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Volver
        </button>
        <div className="header-content">
          <h2>📊 Resultados del Examen Grupal</h2>
          <h3>{examenInfo.titulo}</h3>
          <p className="examen-info-line">
            <span>📚 {examenInfo.nombreAula}</span>
            <span>•</span>
            <span>📅 {formatearFecha(examenInfo.fechaCreacion)}</span>
            <span>•</span>
            <span>📖 {examenInfo.tituloLectura}</span>
          </p>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="estadisticas-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{estadisticas.totalEstudiantes}</div>
            <div className="stat-label">Total Estudiantes</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">
              {estadisticas.completados}
              <span className="stat-secondary"> / {estadisticas.totalEstudiantes}</span>
            </div>
            <div className="stat-label">Completados</div>
            <div className="stat-percentage">{estadisticas.porcentajeCompletado.toFixed(0)}%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{estadisticas.pendientes}</div>
            <div className="stat-label">Pendientes</div>
          </div>
        </div>

        {estadisticas.promedioGrupal !== null && (
          <div className="stat-card stat-destacada">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
                            <div className="stat-value">{resultados.estadisticas.promedioGrupal?.toFixed(2) || 'N/A'}</div>
              <div className="stat-label">Promedio Grupal</div>
              <div className="stat-range">
                Min: {estadisticas.calificacionMinima?.toFixed(1)} | Max: {estadisticas.calificacionMaxima?.toFixed(1)}
              </div>
            </div>
          </div>
        )}

        {estadisticas.tiempoPromedioMinutos !== null && (
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
                            <div className="stat-value">{resultados.estadisticas.tiempoPromedioMinutos?.toFixed(1) || 'N/A'} min</div>
              <div className="stat-label">Tiempo Promedio</div>
            </div>
          </div>
        )}
      </div>

      {/* Alertas */}
      {(estadisticas.estudiantesPendientes.length > 0 || 
        estadisticas.estudiantesConDificultad.length > 0 ||
        estadisticas.estudiantesDestacados.length > 0) && (
        <div className="alertas-section">
          <h3>🔔 Alertas y Destacados</h3>
          
          <div className="alertas-grid">
            {estadisticas.estudiantesPendientes.length > 0 && (
              <div className="alerta-card alerta-pendiente">
                <div className="alerta-header">
                  <span className="alerta-icon">⏳</span>
                  <h4>Estudiantes Pendientes ({estadisticas.estudiantesPendientes.length})</h4>
                </div>
                <ul className="alerta-lista">
                  {estadisticas.estudiantesPendientes.map((nombre, idx) => (
                    <li key={idx}>{nombre}</li>
                  ))}
                </ul>
              </div>
            )}

            {estadisticas.estudiantesConDificultad.length > 0 && (
              <div className="alerta-card alerta-dificultad">
                <div className="alerta-header">
                  <span className="alerta-icon">⚠️</span>
                  <h4>Requieren Atención ({estadisticas.estudiantesConDificultad.length})</h4>
                </div>
                <ul className="alerta-lista">
                  {estadisticas.estudiantesConDificultad.map((info, idx) => (
                    <li key={idx}>{info}</li>
                  ))}
                </ul>
              </div>
            )}

            {estadisticas.estudiantesDestacados.length > 0 && (
              <div className="alerta-card alerta-destacado">
                <div className="alerta-header">
                  <span className="alerta-icon">⭐</span>
                  <h4>Estudiantes Destacados ({estadisticas.estudiantesDestacados.length})</h4>
                </div>
                <ul className="alerta-lista">
                  {estadisticas.estudiantesDestacados.map((info, idx) => (
                    <li key={idx}>{info}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabla de Resultados */}
      <div className="resultados-tabla-section">
        <h3>📋 Resultados Individuales</h3>
        
        <div className="tabla-container">
          <table className="resultados-tabla">
            <thead>
              <tr>
                <th>#</th>
                <th 
                  className={`sortable ${ordenColumna === 'nombre' ? 'sorted' : ''}`}
                  onClick={() => ordenarResultados('nombre')}
                >
                  Estudiante {ordenColumna === 'nombre' && (ordenAscendente ? '↑' : '↓')}
                </th>
                <th>Estado</th>
                <th 
                  className={`sortable ${ordenColumna === 'calificacion' ? 'sorted' : ''}`}
                  onClick={() => ordenarResultados('calificacion')}
                >
                  Calificación {ordenColumna === 'calificacion' && (ordenAscendente ? '↑' : '↓')}
                </th>
                <th 
                  className={`sortable ${ordenColumna === 'tiempo' ? 'sorted' : ''}`}
                  onClick={() => ordenarResultados('tiempo')}
                >
                  Tiempo {ordenColumna === 'tiempo' && (ordenAscendente ? '↑' : '↓')}
                </th>
                <th>Fecha Completado</th>
              </tr>
            </thead>
            <tbody>
              {resultadosOrdenados.map((resultado, idx) => (
                <tr key={resultado.estudianteId}>
                  <td>{idx + 1}</td>
                  <td className="estudiante-nombre">{resultado.nombreCompleto}</td>
                  <td>
                    <span className={`badge ${resultado.estado === 'Completado' ? 'badge-completado' : 'badge-pendiente'}`}>
                      {resultado.estado}
                    </span>
                  </td>
                  <td>
                    {resultado.calificacion !== null && resultado.calificacion !== undefined ? (
                      <span className={`calificacion ${obtenerClaseCalificacion(resultado.calificacion)}`}>
                        {resultado.calificacion.toFixed(1)} / 10
                      </span>
                    ) : (
                      <span className="no-disponible">-</span>
                    )}
                  </td>
                  <td>
                    {resultado.tiempoTotalMinutos ? (
                      <span className="tiempo">
                        {resultado.tiempoTotalMinutos.toFixed(1)} min
                      </span>
                    ) : (
                      <span className="no-disponible">-</span>
                    )}
                  </td>
                  <td>
                    {resultado.fechaCompletado ? (
                      formatearFecha(resultado.fechaCompletado)
                    ) : (
                      <span className="no-disponible">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultadosExamenGrupal;
