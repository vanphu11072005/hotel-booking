import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute - Bảo vệ các route yêu cầu authentication
 * 
 * Nếu user chưa đăng nhập, redirect về /login
 * và lưu location hiện tại để redirect về sau khi login
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuthStore();

  // Đang loading auth state → hiển thị loading
  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center 
          justify-center bg-gray-50"
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 
              border-b-2 border-indigo-600 mx-auto"
          />
          <p className="mt-4 text-gray-600">
            Đang tải...
          </p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập → redirect về /login
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
