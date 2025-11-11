import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Hotel, 
  Calendar, 
  CreditCard, 
  Settings, 
  FileText, 
  BarChart3,
  Tag,
  Image,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarAdminProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const SidebarAdmin: React.FC<SidebarAdminProps> = ({ 
  isCollapsed: controlledCollapsed,
  onToggle 
}) => {
  const [internalCollapsed, setInternalCollapsed] = 
    useState(false);
  const location = useLocation();
  
  const isCollapsed = 
    controlledCollapsed !== undefined 
      ? controlledCollapsed 
      : internalCollapsed;
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  const menuItems = [
    { 
      path: '/admin/dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard' 
    },
    { 
      path: '/admin/users', 
      icon: Users, 
      label: 'Người dùng' 
    },
    { 
      path: '/admin/rooms', 
      icon: Hotel, 
      label: 'Phòng' 
    },
    { 
      path: '/admin/bookings', 
      icon: Calendar, 
      label: 'Đặt phòng' 
    },
    { 
      path: '/admin/payments', 
      icon: CreditCard, 
      label: 'Thanh toán' 
    },
    { 
      path: '/admin/services', 
      icon: Settings, 
      label: 'Dịch vụ' 
    },
    { 
      path: '/admin/promotions', 
      icon: Tag, 
      label: 'Khuyến mãi' 
    },
    { 
      path: '/admin/banners', 
      icon: Image, 
      label: 'Banner' 
    },
    { 
      path: '/admin/reports', 
      icon: BarChart3, 
      label: 'Báo cáo' 
    },
    { 
      path: '/admin/settings', 
      icon: FileText, 
      label: 'Cài đặt' 
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || 
      location.pathname.startsWith(`${path}/`);
  };

  return (
    <aside 
      className={`bg-gray-900 text-white 
        transition-all duration-300 flex flex-col 
        ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-800 
        flex items-center justify-between"
      >
        {!isCollapsed && (
          <h2 className="text-xl font-bold">
            Admin Panel
          </h2>
        )}
        <button
          onClick={handleToggle}
          className="p-2 rounded-lg hover:bg-gray-800 
            transition-colors ml-auto"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center 
                    space-x-3 px-3 py-3 rounded-lg 
                    transition-colors group 
                    ${active 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`flex-shrink-0 
                    ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} 
                  />
                  {!isCollapsed && (
                    <span className="font-medium">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-800">
        {!isCollapsed ? (
          <div className="text-xs text-gray-400 text-center">
            <p>Admin Dashboard v1.0</p>
            <p className="mt-1">
              © {new Date().getFullYear()}
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-green-500 
              rounded-full"
            ></div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SidebarAdmin;
