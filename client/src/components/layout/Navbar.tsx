import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Menu, 
  X, 
  LogIn, 
  UserPlus 
} from 'lucide-react';

interface NavbarProps {
  isAuthenticated?: boolean;
  userInfo?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  } | null;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  isAuthenticated = false, 
  userInfo = null,
  onLogout 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 
                transition-colors font-medium"
            >
              Trang chủ
            </Link>
            <Link 
              to="/rooms" 
              className="text-gray-700 hover:text-blue-600 
                transition-colors font-medium"
            >
              Phòng
            </Link>
            <Link 
              to="/bookings" 
              className="text-gray-700 hover:text-blue-600 
                transition-colors font-medium"
            >
              Đặt phòng
            </Link>
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-blue-600 
                transition-colors font-medium"
            >
              Giới thiệu
            </Link>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link 
                  to="/login"
                  className="flex items-center space-x-2 
                    px-4 py-2 text-blue-600 hover:text-blue-700 
                    transition-colors font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </Link>
                <Link 
                  to="/register"
                  className="flex items-center space-x-2 
                    px-4 py-2 bg-blue-600 text-white 
                    rounded-lg hover:bg-blue-700 
                    transition-colors font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Đăng ký</span>
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-3 
                    px-3 py-2 rounded-lg hover:bg-gray-100 
                    transition-colors"
                >
                  {userInfo?.avatar ? (
                    <img 
                      src={userInfo.avatar} 
                      alt={userInfo.name}
                      className="w-8 h-8 rounded-full 
                        object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-500 
                      rounded-full flex items-center 
                      justify-center"
                    >
                      <span className="text-white font-semibold 
                        text-sm"
                      >
                        {userInfo?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="font-medium text-gray-700">
                    {userInfo?.name}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 
                    bg-white rounded-lg shadow-lg py-2 
                    border border-gray-200 z-50"
                  >
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center space-x-2 
                        px-4 py-2 text-gray-700 
                        hover:bg-gray-100 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Hồ sơ</span>
                    </Link>
                    {userInfo?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2 
                          px-4 py-2 text-gray-700 
                          hover:bg-gray-100 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Quản trị</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center 
                        space-x-2 px-4 py-2 text-red-600 
                        hover:bg-gray-100 transition-colors 
                        text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg 
              hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t 
            border-gray-200"
          >
            <div className="flex flex-col space-y-2">
              <Link 
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 text-gray-700 
                  hover:bg-gray-100 rounded-lg 
                  transition-colors"
              >
                Trang chủ
              </Link>
              <Link 
                to="/rooms"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 text-gray-700 
                  hover:bg-gray-100 rounded-lg 
                  transition-colors"
              >
                Phòng
              </Link>
              <Link 
                to="/bookings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 text-gray-700 
                  hover:bg-gray-100 rounded-lg 
                  transition-colors"
              >
                Đặt phòng
              </Link>
              <Link 
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 text-gray-700 
                  hover:bg-gray-100 rounded-lg 
                  transition-colors"
              >
                Giới thiệu
              </Link>
              
              <div className="border-t border-gray-200 
                pt-2 mt-2"
              >
                {!isAuthenticated ? (
                  <>
                    <Link 
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-2 
                        px-4 py-2 text-blue-600 
                        hover:bg-gray-100 rounded-lg 
                        transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Đăng nhập</span>
                    </Link>
                    <Link 
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-2 
                        px-4 py-2 text-blue-600 
                        hover:bg-gray-100 rounded-lg 
                        transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Đăng ký</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2 text-sm 
                      text-gray-500"
                    >
                      Xin chào, {userInfo?.name}
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-2 
                        px-4 py-2 text-gray-700 
                        hover:bg-gray-100 rounded-lg 
                        transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Hồ sơ</span>
                    </Link>
                    {userInfo?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-2 
                          px-4 py-2 text-gray-700 
                          hover:bg-gray-100 rounded-lg 
                          transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Quản trị</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center 
                        space-x-2 px-4 py-2 text-red-600 
                        hover:bg-gray-100 rounded-lg 
                        transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
