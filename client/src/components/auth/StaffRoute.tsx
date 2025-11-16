import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import Loading from '../common/Loading';

interface StaffRouteProps {
  children: React.ReactNode;
}

/**
 * StaffRoute Component
 * Bảo vệ route chỉ cho phép staff và admin truy cập
 */
const StaffRoute: React.FC<StaffRouteProps> = ({ children }) => {
  const { isAuthenticated, userInfo, isLoading } = useAuthStore();

  // Đang load thông tin xác thực
  if (isLoading) {
    return <Loading />;
  }

  // Chưa đăng nhập -> redirect về login
  if (!isAuthenticated || !userInfo) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role: chỉ cho phép staff và admin
  const allowedRoles = ['staff', 'admin'];
  if (!allowedRoles.includes(userInfo.role.toLowerCase())) {
    return <Navigate to="/" replace />;
  }

  // Đã xác thực và có quyền -> render children
  return <>{children}</>;
};

export default StaffRoute;
