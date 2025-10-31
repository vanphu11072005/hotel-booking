import { Link } from 'react-router-dom';
import { Hotel, Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES, ROLES } from '@/constants';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={ROUTES.HOME} 
            className="flex items-center space-x-2">
            <Hotel className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">
              Hotel Booking
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center 
            space-x-6">
            <Link to={ROUTES.HOME} 
              className="text-gray-700 hover:text-primary-600 
                transition-colors">
              Trang chủ
            </Link>
            <Link to={ROUTES.ROOMS} 
              className="text-gray-700 hover:text-primary-600 
                transition-colors">
              Phòng
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to={ROUTES.BOOKINGS} 
                  className="text-gray-700 hover:text-primary-600 
                    transition-colors">
                  Đặt phòng
                </Link>
                
                {user?.role.name === ROLES.ADMIN && (
                  <Link to={ROUTES.ADMIN_DASHBOARD} 
                    className="text-gray-700 
                      hover:text-primary-600 transition-colors">
                    Quản trị
                  </Link>
                )}
                
                {user?.role.name === ROLES.STAFF && (
                  <Link to={ROUTES.STAFF_CHECKIN} 
                    className="text-gray-700 
                      hover:text-primary-600 transition-colors">
                    Vận hành
                  </Link>
                )}
                
                <div className="flex items-center space-x-4">
                  <Link to={ROUTES.PROFILE} 
                    className="flex items-center space-x-2 
                      text-gray-700 hover:text-primary-600 
                      transition-colors">
                    <User className="h-5 w-5" />
                    <span>{user?.full_name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 
                      text-gray-700 hover:text-red-600 
                      transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to={ROUTES.LOGIN} 
                  className="text-gray-700 hover:text-primary-600 
                    transition-colors">
                  Đăng nhập
                </Link>
                <Link to={ROUTES.REGISTER} 
                  className="btn-primary">
                  Đăng ký
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 space-y-2 border-t">
            <Link to={ROUTES.HOME} 
              className="block py-2 text-gray-700 
                hover:text-primary-600">
              Trang chủ
            </Link>
            <Link to={ROUTES.ROOMS} 
              className="block py-2 text-gray-700 
                hover:text-primary-600">
              Phòng
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to={ROUTES.BOOKINGS} 
                  className="block py-2 text-gray-700 
                    hover:text-primary-600">
                  Đặt phòng
                </Link>
                <Link to={ROUTES.PROFILE} 
                  className="block py-2 text-gray-700 
                    hover:text-primary-600">
                  {user?.full_name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 
                    text-gray-700 hover:text-red-600"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to={ROUTES.LOGIN} 
                  className="block py-2 text-gray-700 
                    hover:text-primary-600">
                  Đăng nhập
                </Link>
                <Link to={ROUTES.REGISTER} 
                  className="block py-2 text-gray-700 
                    hover:text-primary-600">
                  Đăng ký
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};
