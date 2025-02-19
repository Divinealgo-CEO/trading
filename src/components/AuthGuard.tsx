import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If roles are specified, check if user has required role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.user_metadata.role)) {
      // Redirect to appropriate dashboard based on role
      const redirectPath = user.user_metadata.role === 'admin' ? '/' : '/customer';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
}