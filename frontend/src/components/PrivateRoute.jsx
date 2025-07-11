import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
export default function PrivateRoute({ roles, children }){
  const { user,loading } = useContext(AuthContext);
  if(loading) return null;
  if(!user) return <Navigate to="/login" replace />;
  if(roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
