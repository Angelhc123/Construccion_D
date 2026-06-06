import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import examenGrupalService from '../../services/examenGrupalService';
import type { AsignacionExamenDto } from '../../services/examenGrupalService';
import './ListaExamenesAsignados.css';

const ListaExamenesAsignados: React.FC = () => {
  const navigate = useNavigate();
  const [examenes, setExamenes] = useState<AsignacionExamenDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarExamenes();
  }, []);

  const cargarExamenes = async () => {
    try {
      setLoading(true);
      const data = await examenGrupalService.obtenerExamenesAsignados();
      setExamenes(data);
    } catch (err: any) {
      console.error('Error al cargar exámenes:', err);
      setError('Error al cargar los exámenes asignados');
    } finally {
      setLoading(false);
    }
  };

  const handleIniciarExamen = (examen: AsignacionExamenDto) => {
    // Redirigir al componente de examen grupal
    navigate(`/estudiante/examen-grupal/${examen.id}`);
  };

  const handleVolver = () => {
    navigate('/estudiante/dashboard');
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calcularTiempoRestante = (fechaLimite?: string) => {
    if (!fechaLimite) return null;
    
    const ahora = new Date();
    const limite = new Date(fechaLimite);
    const diff = limite.getTime() - ahora.getTime();
    
    if (diff < 0) return 'Vencido';
    
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (dias > 0) return `${dias} día${dias > 1 ? 's' : ''}`;
    if (horas > 0) return `${horas} hora${horas > 1 ? 's' : ''}`;
    return 'Menos de 1 hora';
  };

  const obtenerClaseEstado = (estado: string) => {
    return estado === 'Completado' ? 'estado-completado' : 'estado-pendiente';
  };

  const obtenerClasePrioridad = (fechaLimite?: string) => {
    if (!fechaLimite) return '';
    
    const tiempo = calcularTiempoRestante(fechaLimite);
    if (tiempo === 'Vencido') return 'prioridad-vencido';
    if (tiempo && (tiempo.includes('hora') || tiempo === 'Menos de 1 hora')) return 'prioridad-urgente';
    if (tiempo && parseInt(tiempo) <= 2) return 'prioridad-alta';
    return '';
  };

  const examenesPendientes = examenes.filter(e => e.estado === 'Pendiente');
  const examenesCompletados = examenes.filter(e => e.estado === 'Completado');

  if (loading) {
    return (
      <div className="lista-examenes-container">
        <div className="loading">
          <div className="spinner-large"></div>
          <p>Cargando exámenes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lista-examenes-container">
        <div className="error-message">
          <span>⚠️</span>
          <p>{error}</p>
          <button onClick={cargarExamenes} className="btn btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lista-examenes-container">
      {/* Barra de navegación superior */}
      <div className="navigation-bar">
        <button 
          onClick={handleVolver}
          className="btn-volver"
          title="Volver al dashboard"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Volver</span>
        </button>
        
        <button 
          onClick={cargarExamenes}
          className="btn-refrescar"
          title="Actualizar exámenes"
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          <span>Actualizar</span>
        </button>
      </div>

      <div className="lista-examenes-header">
        <h2>📝 Mis Exámenes Grupales</h2>
        <p className="subtitle">
          Exámenes asignados por tus docentes
        </p>
      </div>

      {examenes.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <h3>No hay exámenes asignados</h3>
          <p>Tus docentes aún no han creado exámenes grupales</p>
        </div>
      ) : (
        <>
          {/* Exámenes Pendientes */}
          {examenesPendientes.length > 0 && (
            <div className="examenes-section">
              <div className="section-header">
                <h3>📌 Pendientes ({examenesPendientes.length})</h3>
              </div>
              
              <div className="examenes-grid">
                {examenesPendientes.map(examen => (
                  <div 
                    key={examen.id} 
                    className={`examen-card ${obtenerClasePrioridad(examen.fechaLimite)}`}
                  >
                    {examen.fechaLimite && calcularTiempoRestante(examen.fechaLimite) === 'Vencido' && (
                      <div className="badge-vencido">⏰ Vencido</div>
                    )}
                    
                    <div className="examen-card-header">
                      <h4>{examen.tituloExamen}</h4>
                      <span className={`badge ${obtenerClaseEstado(examen.estado)}`}>
                        {examen.estado}
                      </span>
                    </div>

                    {examen.descripcionExamen && (
                      <p className="examen-descripcion">{examen.descripcionExamen}</p>
                    )}

                    <div className="examen-info">
                      <div className="info-item">
                        <span className="info-label">👨‍🏫 Docente:</span>
                        <span>{examen.nombreDocente}</span>
                      </div>
                      
                      <div className="info-item">
                        <span className="info-label">📖 Lectura:</span>
                        <span>{examen.tituloLectura}</span>
                      </div>

                      <div className="info-item">
                        <span className="info-label">📏 Longitud:</span>
                        <span>{examen.longitudTexto}</span>
                      </div>

                      <div className="info-item">
                        <span className="info-label">❓ Preguntas:</span>
                        <span>{examen.cantidadPreguntas}</span>
                      </div>

                      <div className="info-item">
                        <span className="info-label">📅 Asignado:</span>
                        <span>{formatearFecha(examen.fechaAsignacion)}</span>
                      </div>

                      {examen.fechaLimite && (
                        <div className="info-item info-limite">
                          <span className="info-label">⏰ Fecha límite:</span>
                          <span className="fecha-limite">
                            {formatearFecha(examen.fechaLimite)}
                            <span className="tiempo-restante">
                              ({calcularTiempoRestante(examen.fechaLimite)})
                            </span>
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleIniciarExamen(examen)}
                      className="btn btn-primary btn-iniciar"
                    >
                      🚀 Iniciar Examen
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exámenes Completados */}
          {examenesCompletados.length > 0 && (
            <div className="examenes-section">
              <div className="section-header">
                <h3>✅ Completados ({examenesCompletados.length})</h3>
              </div>
              
              <div className="examenes-grid">
                {examenesCompletados.map(examen => (
                  <div key={examen.id} className="examen-card examen-completado">
                    <div className="examen-card-header">
                      <h4>{examen.tituloExamen}</h4>
                      <span className={`badge ${obtenerClaseEstado(examen.estado)}`}>
                        ✓ Completado
                      </span>
                    </div>

                    {examen.descripcionExamen && (
                      <p className="examen-descripcion">{examen.descripcionExamen}</p>
                    )}

                    <div className="examen-info">
                      <div className="info-item">
                        <span className="info-label">👨‍🏫 Docente:</span>
                        <span>{examen.nombreDocente}</span>
                      </div>

                      <div className="info-item">
                        <span className="info-label">📅 Completado:</span>
                        <span>{examen.fechaCompletado ? formatearFecha(examen.fechaCompletado) : '-'}</span>
                      </div>

                      {examen.calificacion !== null && examen.calificacion !== undefined && (
                        <div className="info-item info-calificacion">
                          <span className="info-label">📊 Calificación:</span>
                          <span className="calificacion">
                            {examen.calificacion.toFixed(1)} / 10
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleIniciarExamen(examen)}
                      className="btn btn-secondary btn-ver"
                    >
                      👁️ Ver Examen
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListaExamenesAsignados;
