import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES, ROLES } from '@/constants';

interface PrivateRouteProps {
  allowedRoles?: string[];
}

export const PrivateRoute = ({ 
  allowedRoles 
}: PrivateRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles && user) {
    const hasPermission = allowedRoles.includes(
      user.role.name
    );
    
    if (!hasPermission) {
      return <Navigate to={ROUTES.HOME} replace />;
    }
  }

  return <Outlet />;
};
