// frontend/src/components/PrivateRoute.jsx
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ roles, children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    // Muestra una pantalla de carga o nada mientras se verifica la sesión
    return <div className="pt-24 text-center">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}