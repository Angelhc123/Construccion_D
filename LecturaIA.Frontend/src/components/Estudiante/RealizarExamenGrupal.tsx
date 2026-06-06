import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { PlayArrow, Send, ChevronLeft } from '@mui/icons-material';

interface AsignacionExamen {
  id: number;
  estado: string;
  fechaAsignacion: string;
  examen: {
    id: number;
    titulo: string;
    descripcion?: string;
    fechaCreacion: string;
    fechaLimite?: string;
  };
  lectura: {
    id: number;
    titulo: string;
    contenido: string;
  };
  cuestionario: {
    id: string;
    cantidadPreguntas: number;
  };
}

export default function RealizarExamenGrupal() {
  const { asignacionId } = useParams<{ asignacionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [asignacion, setAsignacion] = useState<AsignacionExamen | null>(null);
  const [sesionLecturaId, setSesionLecturaId] = useState<string | null>(null);
  const [cuestionarioId, setCuestionarioId] = useState<string | null>(null);
  const [vistaActual, setVistaActual] = useState<'inicio' | 'lectura' | 'cuestionario'>('inicio');
  const [tiempoLectura, setTiempoLectura] = useState(0); // Timer en segundos

  useEffect(() => {
    cargarDatosExamen();
  }, [asignacionId]);

  // Timer de lectura
  useEffect(() => {
    if (vistaActual !== 'lectura') return;

    const intervalo = setInterval(() => {
      setTiempoLectura(prev => prev + 1);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [vistaActual]);

  const cargarDatosExamen = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/examengrupales/asignacion/${asignacionId}`);
      setAsignacion(response.data);

      // Si ya está en progreso, cargar el cuestionario personal del estudiante
      if (response.data.estado === 'En Progreso' && response.data.sesionLecturaId) {
        setSesionLecturaId(response.data.sesionLecturaId);
        setCuestionarioId(response.data.cuestionario.id);
        setVistaActual('cuestionario');
      }
    } catch (err: any) {
      console.error('Error al cargar examen:', err);
      setError(err.response?.data?.mensaje || 'Error al cargar el examen');
    } finally {
      setLoading(false);
    }
  };

  const iniciarExamen = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post(`/examengrupales/iniciar/${asignacionId}`, {});
      setSesionLecturaId(response.data.sesionLecturaId);
      setCuestionarioId(response.data.cuestionarioId);
      setVistaActual('lectura');
    } catch (err: any) {
      console.error('Error al iniciar examen:', err);
      setError(err.response?.data?.mensaje || 'Error al iniciar el examen');
    } finally {
      setLoading(false);
    }
  };

  const irACuestionario = async () => {
    if (cuestionarioId && sesionLecturaId && asignacion) {
      try {
        // Actualizar tiempo de lectura en la sesión
        const tiempoMinutos = tiempoLectura / 60;
        await api.patch(
          `/sesioneslectura/${sesionLecturaId}/tiempo`,
          { tiempoLecturaMinutos: tiempoMinutos }
        );
      } catch (error) {
        console.error('Error al actualizar tiempo de lectura:', error);
        // Continuar de todas formas
      }
      
      // Redirigir al cuestionario normal usando la sesión creada
      // La ruta espera lecturaId como parámetro de ruta y cuestionarioId como query param
      navigate(`/estudiante/cuestionario/${asignacion.lectura.id}/responder?cuestionarioId=${cuestionarioId}`);
    }
  };

  const formatearTiempo = (segundos: number): string => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const volverAExamenes = () => {
    navigate('/estudiante/examenes');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
        <Box mt={2}>
          <Button variant="outlined" onClick={volverAExamenes} startIcon={<ChevronLeft />}>
            Volver a Exámenes
          </Button>
        </Box>
      </Container>
    );
  }

  if (!asignacion) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">No se encontró el examen</Alert>
      </Container>
    );
  }

  // Vista de inicio
  if (vistaActual === 'inicio') {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom color="primary">
            {asignacion.examen.titulo}
          </Typography>

          {asignacion.examen.descripcion && (
            <Typography variant="body1" color="text.secondary" paragraph>
              {asignacion.examen.descripcion}
            </Typography>
          )}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              📖 Lectura: {asignacion.lectura.titulo}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preguntas: {asignacion.cuestionario.cantidadPreguntas}
            </Typography>
            {asignacion.examen.fechaLimite && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                Fecha límite: {new Date(asignacion.examen.fechaLimite).toLocaleString()}
              </Typography>
            )}
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>Instrucciones:</strong>
            <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>Lee el texto con atención</li>
              <li>Responde todas las preguntas del cuestionario</li>
              <li>Tus respuestas serán evaluadas al finalizar</li>
            </ul>
          </Alert>

          <Box display="flex" gap={2} justifyContent="space-between">
            <Button
              variant="outlined"
              onClick={volverAExamenes}
              startIcon={<ChevronLeft />}
            >
              Volver
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={iniciarExamen}
              startIcon={<PlayArrow />}
              disabled={loading}
            >
              {loading ? 'Iniciando...' : 'Iniciar Examen'}
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  // Vista de lectura
  if (vistaActual === 'lectura') {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Timer de lectura */}
          <Box 
            sx={{ 
              mb: 3, 
              p: 2, 
              bgcolor: '#1976d2', 
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="body1" sx={{ color: 'white' }} fontWeight="bold">
              ⏱️ Tiempo de lectura
            </Typography>
            <Typography variant="h5" sx={{ color: 'white', fontFamily: 'monospace' }} fontWeight="bold">
              {formatearTiempo(tiempoLectura)}
            </Typography>
          </Box>

          <Typography variant="h5" gutterBottom color="primary">
            {asignacion.lectura.titulo}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-line',
              lineHeight: 1.8,
              fontSize: '1.1rem'
            }}
          >
            {asignacion.lectura.contenido}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              size="large"
              onClick={irACuestionario}
              endIcon={<Send />}
            >
              Ir al Cuestionario
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  // Vista de cuestionario - redirige automáticamente
  if (vistaActual === 'cuestionario' && cuestionarioId && asignacion) {
    // Este efecto se ejecutará cuando tengamos el cuestionarioId
    setTimeout(() => {
      navigate(`/estudiante/cuestionario/${asignacion.lectura.id}/responder?cuestionarioId=${cuestionarioId}`);
    }, 100);

    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography ml={2}>Cargando cuestionario...</Typography>
      </Box>
    );
  }

  return null;
}
