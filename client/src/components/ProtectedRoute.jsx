import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', fontSize: 14, color: '#6B7280',
      fontFamily: 'Inter, sans-serif'
    }}>
      Loading...
    </div>
  );

  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;