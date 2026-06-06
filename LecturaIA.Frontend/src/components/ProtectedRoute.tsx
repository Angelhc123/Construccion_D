import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  redirectPath?: string;
}

export const ProtectedRoute = ({ allowedRoles, redirectPath = '/' }: ProtectedRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.tipoUsuario)) {
    // Si es docente intentando acceder a estudiante o viceversa, redireccionar al dashboard correspondiente
    if (user.tipoUsuario === 'Docente') return <Navigate to="/docente/dashboard" replace />;
    if (user.tipoUsuario === 'Estudiante') return <Navigate to="/estudiante/dashboard" replace />;
    if (user.tipoUsuario === 'Administrador') return <Navigate to="/admin" replace />;
    
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;