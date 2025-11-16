import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  LogIn,
  LogOut as LogOutIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarStaffProps {
  className?: string;
}

const SidebarStaff: React.FC<SidebarStaffProps> = ({ className = '' }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      path: '/staff/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      path: '/staff/bookings',
      icon: Calendar,
      label: 'Đặt phòng',
    },
    {
      path: '/staff/check-in',
      icon: LogIn,
      label: 'Check-in',
    },
    {
      path: '/staff/check-out',
      icon: LogOutIcon,
      label: 'Check-out',
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div
      className={`bg-gray-800 text-white h-screen sticky top-0 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${className}`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h2 className="text-xl font-bold">Staff Panel</h2>
                <p className="text-xs text-gray-400">Nhân viên lễ tân</p>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors ml-auto"
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          {!isCollapsed && (
            <div className="text-xs text-gray-400">
              <p>Hotel Booking System</p>
              <p className="mt-1">Staff v1.0</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarStaff;
