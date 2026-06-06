import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import examenGrupalService from '../../services/examenGrupalService';
import type { CrearExamenGrupalDto } from '../../services/examenGrupalService';
import { TipoTexto, LongitudTexto, GradoEscolar, ComplejidadTexto } from '../../types/enums';
import './CrearExamenGrupal.css';

const CrearExamenGrupal: React.FC = () => {
  const navigate = useNavigate();
  const { aulaId } = useParams<{ aulaId: string }>();
  
  const [formData, setFormData] = useState<CrearExamenGrupalDto>({
    aulaId: parseInt(aulaId || '0'),
    titulo: '',
    descripcion: '',
    temaConcepto: '',
    tipoTexto: TipoTexto.NARRATIVO,
    longitudTexto: LongitudTexto.MEDIO,
    gradoEscolar: `${GradoEscolar.CUARTO}to`,
    complejidad: ComplejidadTexto.BASICA,
    cantidadPreguntas: 10,
    fechaLimite: '',
    publicado: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const tiposTexto = Object.values(TipoTexto);
  const longitudesTexto = Object.values(LongitudTexto);
  const gradosEscolares = Object.values(GradoEscolar).filter(val => typeof val === 'number').map(val => `${val}to`);
  const complejidades = Object.values(ComplejidadTexto);
  const cantidadesPreguntas = [5, 8, 10, 12, 15];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'cantidadPreguntas') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validaciones
    if (!formData.titulo.trim()) {
      setError('El título es obligatorio');
      return;
    }
    
    if (!formData.temaConcepto.trim()) {
      setError('El tema/concepto es obligatorio');
      return;
    }

    setLoading(true);
    
    try {
      const result = await examenGrupalService.crearExamenConIA(formData);
      setSuccess(result.mensaje || 'Examen creado exitosamente');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate(`/docente/aula/${aulaId}`);
      }, 2000);
      
    } catch (err: any) {
      console.error('Error al crear examen:', err);
      setError(err.response?.data?.mensaje || 'Error al crear el examen. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/docente/aula/${aulaId}`);
  };

  return (
    <div className="crear-examen-grupal-container">
      <div className="crear-examen-header">
        <h2>📝 Crear Examen Grupal con IA</h2>
        <p className="subtitle">El examen se generará automáticamente y se asignará a todos los estudiantes del salón</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>✅ {success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="crear-examen-form">
        {/* Información General */}
        <div className="form-section">
          <h3>📋 Información General</h3>
          
          <div className="form-group">
            <label htmlFor="titulo">
              Título del Examen <span className="required">*</span>
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ej: Evaluación de Comprensión Lectora - Marzo"
              maxLength={300}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción (opcional)</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Descripción o instrucciones adicionales para el examen..."
              rows={3}
              maxLength={1000}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fechaLimite">Fecha Límite (opcional)</label>
            <input
              type="datetime-local"
              id="fechaLimite"
              name="fechaLimite"
              value={formData.fechaLimite}
              onChange={handleChange}
            />
            <small>Si no se establece, el examen no tendrá fecha de vencimiento</small>
          </div>
        </div>

        {/* Parámetros de Generación con IA */}
        <div className="form-section">
          <h3>🤖 Parámetros de Generación con IA</h3>
          
          <div className="form-group">
            <label htmlFor="temaConcepto">
              Tema o Concepto <span className="required">*</span>
            </label>
            <input
              type="text"
              id="temaConcepto"
              name="temaConcepto"
              value={formData.temaConcepto}
              onChange={handleChange}
              placeholder="Ej: La fotosíntesis, El sistema solar, Animales vertebrados..."
              required
            />
            <small>La IA generará una lectura sobre este tema</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tipoTexto">Tipo de Texto</label>
              <select
                id="tipoTexto"
                name="tipoTexto"
                value={formData.tipoTexto}
                onChange={handleChange}
              >
                {tiposTexto.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="longitudTexto">Longitud del Texto</label>
              <select
                id="longitudTexto"
                name="longitudTexto"
                value={formData.longitudTexto}
                onChange={handleChange}
              >
                {longitudesTexto.map(longitud => (
                  <option key={longitud} value={longitud}>
                    {longitud} {longitud === 'Corto' ? '(200-400 palabras)' : longitud === 'Medio' ? '(400-600 palabras)' : '(600-800 palabras)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="gradoEscolar">Grado Escolar</label>
              <select
                id="gradoEscolar"
                name="gradoEscolar"
                value={formData.gradoEscolar}
                onChange={handleChange}
              >
                {gradosEscolares.map(grado => (
                  <option key={grado} value={grado}>{grado} Grado</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="complejidad">Complejidad</label>
              <select
                id="complejidad"
                name="complejidad"
                value={formData.complejidad}
                onChange={handleChange}
              >
                {complejidades.map(comp => (
                  <option key={comp} value={comp}>{comp}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cantidadPreguntas">Cantidad de Preguntas</label>
            <select
              id="cantidadPreguntas"
              name="cantidadPreguntas"
              value={formData.cantidadPreguntas}
              onChange={handleChange}
            >
              {cantidadesPreguntas.map(cantidad => (
                <option key={cantidad} value={cantidad}>{cantidad} preguntas</option>
              ))}
            </select>
            <small>40% literales, 40% inferenciales, 20% críticas</small>
          </div>
        </div>

        {/* Opciones de Publicación */}
        <div className="form-section">
          <h3>📢 Opciones de Publicación</h3>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="publicado"
                checked={formData.publicado}
                onChange={handleChange}
              />
              <span>Publicar inmediatamente (los estudiantes podrán verlo)</span>
            </label>
            <small>Si no se publica, quedará como borrador y deberá publicarse manualmente después</small>
          </div>
        </div>

        {/* Botones */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Generando con IA...
              </>
            ) : (
              <>
                <span>🤖</span>
                Crear Examen
              </>
            )}
          </button>
        </div>

        {loading && (
          <div className="loading-message">
            <p>⏳ Generando lectura y preguntas con Inteligencia Artificial...</p>
            <p>Esto puede tomar entre 10-30 segundos.</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default CrearExamenGrupal;
