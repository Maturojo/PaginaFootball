import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';

export default function PrivateRoute({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/admin" replace />;
}
