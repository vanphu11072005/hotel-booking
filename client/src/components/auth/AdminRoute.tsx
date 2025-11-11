import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute - Bảo vệ các route chỉ dành cho Admin
 * 
 * Kiểm tra:
 * 1. User đã đăng nhập chưa → nếu chưa, redirect /login
 * 2. User có role admin không → nếu không, redirect /
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children
}) => {
  const location = useLocation();
  const { isAuthenticated, userInfo, isLoading } = useAuthStore();
  
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
            Đang xác thực...
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

  // Đã đăng nhập nhưng không phải admin → redirect về /
  const isAdmin = userInfo?.role === 'admin';
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
