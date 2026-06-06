import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas públicas (carga normal)
import Home from './pages/Home';
import EstudianteAuth from './pages/EstudianteAuth';
import DocenteAuth from './pages/DocenteAuth';
import VerificarEmail from './pages/VerificarEmail';
import RecuperarPassword from './pages/RecuperarPassword';
import PoliticasPrivacidad from './pages/PoliticasPrivacidad';

// Páginas protegidas (carga diferida/lazy)
const EstudianteDashboard = lazy(() => import('./pages/EstudianteDashboard'));
const LecturaDetalle = lazy(() => import('./pages/LecturaDetalle'));
const LecturaVistaLectura = lazy(() => import('./pages/LecturaVistaLectura'));
const CuestionarioGeneracion = lazy(() => import('./pages/CuestionarioGeneracion'));
const CuestionarioRespuesta = lazy(() => import('./pages/CuestionarioRespuesta'));
const CuestionarioResultados = lazy(() => import('./pages/CuestionarioResultados'));
const CuestionarioRevision = lazy(() => import('./pages/CuestionarioRevision'));
const HistorialResultados = lazy(() => import('./pages/HistorialResultados'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Docente
const DocenteDashboard = lazy(() => import('./pages/DocenteDashboard'));
const DocenteAulasPage = lazy(() => import('./pages/DocenteAulasPage'));
const AulaDetalleDocente = lazy(() => import('./pages/AulaDetalleDocente'));
const CrearExamenGrupal = lazy(() => import('./components/docente/CrearExamenGrupal'));
const ResultadosExamenGrupal = lazy(() => import('./components/docente/ResultadosExamenGrupal'));

// Componentes usados como páginas
const ListaExamenesAsignados = lazy(() => import('./components/Estudiante/ListaExamenesAsignados'));
const RealizarExamenGrupal = lazy(() => import('./components/Estudiante/RealizarExamenGrupal'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando...</p>
            </div>
          </div>
        }>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/estudiante" element={<EstudianteAuth />} />
            <Route path="/docente" element={<DocenteAuth />} />
            <Route path="/verificar-email" element={<VerificarEmail />} />
            <Route path="/recuperar-password" element={<RecuperarPassword />} />
            <Route path="/restablecer-password" element={<RecuperarPassword />} />
            <Route path="/politicas-privacidad" element={<PoliticasPrivacidad />} />
            
            {/* Rutas Estudiante */}
            <Route element={<ProtectedRoute allowedRoles={['Estudiante']} redirectPath="/estudiante" />}>
              <Route path="/estudiante/dashboard" element={<EstudianteDashboard />} />
              <Route path="/estudiante/lectura/:id" element={<LecturaDetalle />} />
              <Route path="/estudiante/leer/:id" element={<LecturaVistaLectura />} />
              <Route path="/estudiante/cuestionario/:id" element={<CuestionarioGeneracion />} />
              <Route path="/estudiante/cuestionario/:id/responder" element={<CuestionarioRespuesta />} />
              <Route path="/estudiante/cuestionario/:id/resultados" element={<CuestionarioResultados />} />
              <Route path="/estudiante/cuestionario/:id/revision" element={<CuestionarioRevision />} />
              <Route path="/estudiante/lectura/:id/historial" element={<HistorialResultados />} />
              <Route path="/estudiante/examenes" element={<ListaExamenesAsignados />} />
              <Route path="/estudiante/examen-grupal/:asignacionId" element={<RealizarExamenGrupal />} />
            </Route>
            
            {/* Rutas Docente */}
            <Route element={<ProtectedRoute allowedRoles={['Docente']} redirectPath="/docente" />}>
              <Route path="/docente/dashboard" element={<DocenteDashboard />} />
              <Route path="/docente/aulas" element={<DocenteAulasPage />} />
              <Route path="/docente/aula/:id" element={<AulaDetalleDocente />} />
              <Route path="/docente/aula/:aulaId/examen/crear" element={<CrearExamenGrupal />} />
              <Route path="/docente/examen/:examenId/resultados" element={<ResultadosExamenGrupal />} />
            </Route>
            
            {/* Rutas Admin */}
            <Route element={<ProtectedRoute allowedRoles={['Administrador']} redirectPath="/docente" />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
