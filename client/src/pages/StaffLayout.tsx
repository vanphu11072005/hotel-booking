import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import SidebarStaff from '../components/layout/SidebarStaff';
import useAuthStore from '../store/useAuthStore';

const StaffLayout: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarStaff />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              Nhân viên lễ tân
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-5 h-5" />
                <span className="font-medium">{userInfo?.name}</span>
                <span className="text-sm text-gray-500">({userInfo?.role})</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
