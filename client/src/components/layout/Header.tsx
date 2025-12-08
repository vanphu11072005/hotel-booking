import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { 
  Hotel, 
  User, 
  LogOut, 
  Menu, 
  X, 
  LogIn, 
  UserPlus,
  Heart,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../common/LanguageSwitcher';
import DarkModeToggle from '../common/DarkModeToggle';

interface HeaderProps {
  isAuthenticated?: boolean;
  userInfo?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  } | null;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isAuthenticated = false, 
  userInfo = null,
  onLogout 
}) => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = 
    useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [hiddenOnScroll, setHiddenOnScroll] = useState(false);
  const lastScrollY = useRef(0);

  const toggleMobileMenu = () => {
    const next = !isMobileMenuOpen;
    setIsMobileMenuOpen(next);
    if (next) setHiddenOnScroll(false);
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

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY || window.pageYOffset;

      // If mobile menu is open, keep header visible
      if (isMobileMenuOpen) {
        lastScrollY.current = currentY;
        setHiddenOnScroll(false);
        return;
      }

      // Scrolling down -> hide, scrolling up -> show
      if (currentY > lastScrollY.current && currentY > 60) {
        setHiddenOnScroll(true);
      } else if (currentY < lastScrollY.current) {
        setHiddenOnScroll(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);

  return (
    <header
      className={`bg-[#0F2F2F] dark:bg-gray-900 shadow-md 
        sticky top-0 z-50 transition-transform duration-300 
        ease-in-out
        ${hiddenOnScroll ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 
              hover:opacity-80 transition-opacity"
          >
            <Hotel className="w-8 h-8 text-blue-600 
              dark:text-blue-400" />
              <span className="text-2xl font-bold text-white 
                dark:text-gray-100">
              Hotel Booking
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-white dark:text-gray-200 hover:text-blue-400 
                dark:hover:text-blue-300 transition-colors 
                font-medium ${
                  isActive ? 'bg-blue-900 dark:bg-gray-700 rounded-md px-2 py-1' : ''
                }`
              }
            >
              {t('header.home')}
            </NavLink>
            <NavLink
              to="/room-types"
              className={({ isActive }) =>
                `text-white dark:text-gray-200 hover:text-blue-400 
                dark:hover:text-blue-300 transition-colors 
                font-medium ${
                  isActive ? 'bg-blue-900 dark:bg-gray-700 rounded-md px-2 py-1' : ''
                }`
              }
            >
              {t('header.rooms')}
            </NavLink>
            <NavLink
              to="/bookings"
              className={({ isActive }) =>
                `text-white dark:text-gray-200 hover:text-blue-400 
                dark:hover:text-blue-300 transition-colors 
                font-medium ${
                  isActive ? 'bg-blue-900 dark:bg-gray-700 rounded-md px-2 py-1' : ''
                }`
              }
            >
              {t('header.bookings')}
            </NavLink>
            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                `text-white dark:text-gray-200 hover:text-blue-400 
                dark:hover:text-blue-300 transition-colors 
                font-medium flex items-center gap-1 ${
                  isActive ? 'bg-blue-900 dark:bg-gray-700 rounded-md px-2 py-1' : ''
                }`
              }
            >
              <Heart className="w-4 h-4" />
              {t('header.favorites')}
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `text-white dark:text-gray-200 hover:text-blue-400 
                dark:hover:text-blue-300 transition-colors 
                font-medium ${
                  isActive ? 'bg-blue-900 dark:bg-gray-700 rounded-md px-2 py-1' : ''
                }`
              }
            >
              {t('header.about')}
            </NavLink>
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center 
            space-x-4"
          >
            {!isAuthenticated ? (
              <>
                  <NavLink 
                    to="/login"
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-4 py-2 
                      text-white dark:text-gray-200 
                      hover:text-blue-700 dark:hover:text-blue-300 
                      transition-colors font-medium ${
                        isActive ? 'text-blue-300 dark:text-blue-400' : ''
                      }`
                    }
                  >
                  <LogIn className="w-4 h-4" />
                  <span>{t('header.login')}</span>
                  </NavLink>
                <Link 
                  to="/register"
                  className="flex items-center space-x-2 
                    px-4 py-2 bg-blue-600 dark:bg-blue-700 
                    text-white rounded-lg hover:bg-blue-700 
                    dark:hover:bg-blue-800 transition-colors 
                    font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t('header.register')}</span>
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-3 
                    px-3 py-2 rounded-lg hover:bg-gray-800 
                    dark:hover:bg-gray-700 transition-colors"
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
                      dark:bg-blue-600 rounded-full 
                      flex items-center justify-center"
                    >
                      <span className="text-white 
                        font-semibold text-sm"
                      >
                        {userInfo?.name?.charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="font-medium text-white 
                    dark:text-gray-100">
                    {userInfo?.name}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 
                    w-48 bg-white dark:bg-gray-800 rounded-lg 
                    shadow-lg py-2 border border-gray-200 
                    dark:border-gray-700 z-50"
                  >
                    <NavLink
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center space-x-2 px-4 py-2 
                        text-gray-700 dark:text-gray-200 
                        hover:bg-gray-100 dark:hover:bg-gray-700 
                        transition-colors ${
                          isActive ? 'font-semibold' : ''
                        }`
                      }
                    >
                      <User className="w-4 h-4" />
                      <span>{t('header.profile')}</span>
                    </NavLink>
                    {userInfo?.role === 'admin' && (
                      <NavLink
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-2 px-4 py-2 
                          text-gray-700 dark:text-gray-200 
                          hover:bg-gray-100 dark:hover:bg-gray-700 
                          transition-colors ${
                            isActive ? 'font-semibold' : ''
                          }`
                        }
                      >
                        <User className="w-4 h-4" />
                        <span>{t('header.admin')}</span>
                      </NavLink>
                    )}
                    {userInfo?.role === 'staff' && (
                      <NavLink
                        to="/staff"
                        onClick={() => setIsUserMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-2 px-4 py-2 
                          text-gray-700 dark:text-gray-200 
                          hover:bg-gray-100 dark:hover:bg-gray-700 
                          transition-colors ${
                            isActive ? 'font-semibold' : ''
                          }`
                        }
                      >
                        <User className="w-4 h-4" />
                        <span>{t('header.staff')}</span>
                      </NavLink>
                    )}
                    <LanguageSwitcher />
                    <DarkModeToggle />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center 
                        space-x-2 px-4 py-2 text-red-600 
                        dark:text-red-400 hover:bg-gray-100 
                        dark:hover:bg-gray-700 transition-colors 
                        text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('header.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-white 
              dark:text-gray-200 hover:bg-gray-800 
              dark:hover:bg-gray-700 transition-colors"
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
            border-gray-200 dark:border-gray-700 mt-4"
          >
            <div className="flex flex-col space-y-2">
              <NavLink
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2 text-white dark:text-gray-200 
                  hover:bg-gray-800 dark:hover:bg-gray-700 
                  rounded-lg transition-colors ${
                    isActive ? 'bg-blue-900 dark:bg-gray-700' : ''
                  }`
                }
              >
                {t('header.home')}
              </NavLink>
              <NavLink
                to="/room-types"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2 text-white dark:text-gray-200 
                  hover:bg-gray-800 dark:hover:bg-gray-700 
                  rounded-lg transition-colors ${
                    isActive ? 'bg-blue-900 dark:bg-gray-700' : ''
                  }`
                }
              >
                {t('header.rooms')}
              </NavLink>
              <NavLink
                to="/bookings"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2 text-white dark:text-gray-200 
                  hover:bg-gray-800 dark:hover:bg-gray-700 
                  rounded-lg transition-colors ${
                    isActive ? 'bg-blue-900 dark:bg-gray-700' : ''
                  }`
                }
              >
                {t('header.bookings')}
              </NavLink>
              <NavLink
                to="/favorites"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2 text-white dark:text-gray-200 
                  hover:bg-gray-800 dark:hover:bg-gray-700 
                  rounded-lg transition-colors flex 
                  items-center gap-2 ${
                    isActive ? 'bg-blue-900 dark:bg-gray-700' : ''
                  }`
                }
              >
                <Heart className="w-4 h-4" />
                {t('header.favorites')}
              </NavLink>
              <NavLink
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2 text-white dark:text-gray-200 
                  hover:bg-gray-800 dark:hover:bg-gray-700 
                  rounded-lg transition-colors ${
                    isActive ? 'bg-blue-900 dark:bg-gray-700' : ''
                  }`
                }
              >
                {t('header.about')}
              </NavLink>
              
              <div className="border-t border-gray-200 
                dark:border-gray-700 pt-2 mt-2"
              >
                {!isAuthenticated ? (
                  <>
                    <Link 
                      to="/login"
                      onClick={() => 
                        setIsMobileMenuOpen(false)
                      }
                      className="flex items-center 
                        space-x-2 px-4 py-2 text-blue-600 
                        dark:text-blue-400 hover:bg-gray-800 
                        dark:hover:bg-gray-700 rounded-lg 
                        transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{t('header.login')}</span>
                    </Link>
                    <Link 
                      to="/register"
                      onClick={() => 
                        setIsMobileMenuOpen(false)
                      }
                      className="flex items-center 
                        space-x-2 px-4 py-2 text-blue-600 
                        dark:text-blue-400 hover:bg-gray-800 
                        dark:hover:bg-gray-700 rounded-lg 
                        transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{t('header.register')}</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2 text-sm 
                        text-white dark:text-gray-200"
                    >
                      Xin chào, {userInfo?.name}
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => 
                        setIsMobileMenuOpen(false)
                      }
                      className="flex items-center 
                        space-x-2 px-4 py-2 text-gray-700 
                        dark:text-gray-200 hover:bg-gray-800 
                        dark:hover:bg-gray-700 rounded-lg 
                        transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>{t('header.profile')}</span>
                    </Link>
                    {userInfo?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => 
                          setIsMobileMenuOpen(false)
                        }
                        className="flex items-center 
                          space-x-2 px-4 py-2 
                          text-gray-700 dark:text-gray-200 
                          hover:bg-gray-800 dark:hover:bg-gray-700 
                          rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>{t('header.admin')}</span>
                      </Link>
                    )}
                    {userInfo?.role === 'staff' && (
                      <Link
                        to="/staff"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center 
                          space-x-2 px-4 py-2 
                          text-gray-700 dark:text-gray-200 
                          hover:bg-gray-800 dark:hover:bg-gray-700 
                          rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>{t('header.staff')}</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center 
                        space-x-2 px-4 py-2 text-red-600 
                        dark:text-red-400 hover:bg-gray-800 
                        dark:hover:bg-gray-700 rounded-lg 
                        transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('header.logout')}</span>
                    </button>
                    {userInfo?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => 
                          setIsMobileMenuOpen(false)
                        }
                        className="flex items-center 
                          space-x-2 px-4 py-2 text-white 
                          dark:text-gray-200 hover:bg-gray-800 
                          dark:hover:bg-gray-700 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Quản trị</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center 
                        space-x-2 px-4 py-2 text-red-600 
                        dark:text-red-400 hover:bg-gray-800 
                        dark:hover:bg-gray-700 rounded-lg 
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
    </header>
  );
};

export default Header;
