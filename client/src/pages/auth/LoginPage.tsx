import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  LogIn, 
  Loader2,
  Mail,
  Lock,
  Hotel,
  Clock
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { 
  loginSchema, 
  LoginFormData 
} from '../../utils/validationSchemas';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = 
    useAuthStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState<string>('');
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);
  const [rememberMeChecked, setRememberMeChecked] = useState<boolean>(
    localStorage.getItem('rememberMe') === 'true'
  );

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: localStorage.getItem('rememberMe') === 'true',
    },
  });

  // Extract locked_until timestamp from error message
  useEffect(() => {
    if (error && error.includes('|')) {
      const [, timestamp] = error.split('|');
      if (timestamp) {
        setLockedUntil(new Date(timestamp));
      }
    } else {
      setLockedUntil(null);
    }
  }, [error]);

  // Countdown timer
  useEffect(() => {
    if (!lockedUntil) {
      setCountdown('');
      return;
    }

    const timer = setInterval(() => {
      const now = new Date();
      const diff = lockedUntil.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown('');
        setLockedUntil(null);
        clearError();
        clearInterval(timer);
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [lockedUntil, clearError]);

  // Handle form submission
  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      // Chỉ navigate khi login thành công (không có error)
      const { userInfo, error: loginError } = useAuthStore.getState();
      
      if (!loginError && userInfo) {
        // Redirect dựa trên role
        let redirectPath = '/';
        if (userInfo.role === 'admin') {
          redirectPath = '/admin/dashboard';
        } else if (userInfo.role === 'staff') {
          redirectPath = '/staff/dashboard';
        }
        
        // Nếu có location.state.from thì ưu tiên redirect về đó
        const from = location.state?.from?.pathname || redirectPath;
        navigate(from, { replace: true });
      }
    } catch (error) {
      // Error đã được set vào store, không làm gì thêm
      // Chỉ log để debug
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br 
      from-blue-50 via-indigo-50 to-purple-50 
      flex items-center justify-center py-12 px-4 
      sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 
          bg-blue-400 rounded-full mix-blend-multiply 
          filter blur-xl opacity-30 animate-blob"
        />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 
          bg-purple-400 rounded-full mix-blend-multiply 
          filter blur-xl opacity-30 animate-blob animation-delay-2000"
        />
        <div className="absolute top-40 left-40 w-80 h-80 
          bg-pink-400 rounded-full mix-blend-multiply 
          filter blur-xl opacity-30 animate-blob animation-delay-4000"
        />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center transform hover:scale-105 
          transition-transform duration-300"
        >
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-600 
              to-indigo-700 rounded-2xl shadow-2xl 
              transform hover:rotate-6 transition-all 
              duration-300 hover:shadow-blue-500/50"
              style={{
                boxShadow: '0 20px 60px -15px rgba(59, 130, 246, 0.5)'
              }}
            >
              <Hotel className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-transparent 
            bg-clip-text bg-gradient-to-r from-blue-600 
            to-indigo-600 animate-gradient"
          >
            Đăng nhập
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Chào mừng bạn trở lại với Hotel Booking
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl 
          shadow-2xl p-8 border border-white/20
          transform hover:scale-[1.02] transition-all duration-300"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)} 
            className="space-y-6"
          >
            {/* Error Message */}
            {error && (
              <div className={`border px-4 py-3 rounded-xl 
                text-sm backdrop-blur-sm
                transform animate-shake ${
                  error.includes('Tài khoản đã bị khóa') ||
                  error.includes('lần thử')
                    ? 'bg-orange-50/80 border-orange-200 text-orange-700 shadow-orange-200/50'
                    : 'bg-red-50/80 border-red-200 text-red-700 shadow-red-200/50'
                } shadow-lg`}
              >
                <div className="flex items-start gap-2">
                  <span className="flex-1">
                    {error.split('|')[0]}
                  </span>
                </div>
                {countdown && (
                  <div className="mt-2 pt-2 border-t border-orange-300
                    flex items-center gap-2 text-orange-800 font-semibold"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Thời gian còn lại: {countdown}</span>
                  </div>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium 
                  text-gray-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 
                  pl-3 flex items-center pointer-events-none"
                >
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`block w-full pl-10 pr-3 py-3 
                    border rounded-xl focus:outline-none 
                    focus:ring-2 transition-all duration-300
                    bg-gray-50/50 backdrop-blur-sm
                    hover:bg-white hover:shadow-md
                    ${errors.email
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  placeholder="email@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium 
                  text-gray-700 mb-2"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 
                  pl-3 flex items-center pointer-events-none"
                >
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`block w-full pl-10 pr-10 py-3 
                    border rounded-xl focus:outline-none 
                    focus:ring-2 transition-all duration-300
                    bg-gray-50/50 backdrop-blur-sm
                    hover:bg-white hover:shadow-md
                    ${errors.password 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 
                    pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 
                      text-gray-400 hover:text-gray-600" 
                    />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 
                      hover:text-gray-600" 
                    />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  {...register('rememberMe')}
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMeChecked}
                  onChange={(e) => setRememberMeChecked(e.target.checked)}
                  className="h-4 w-4 text-blue-600 
                    focus:ring-blue-500 border-gray-300 
                    rounded cursor-pointer"
                />
                <label 
                  htmlFor="rememberMe" 
                  className="ml-2 block text-sm 
                    text-gray-700 cursor-pointer"
                >
                  Nhớ đăng nhập
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm font-medium 
                  text-blue-600 hover:text-blue-700 
                  transition-all duration-200
                  hover:underline hover:scale-105 inline-block"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                isLoading || 
                (!!error && error.includes('Tài khoản đã bị khóa'))
              }
              className="w-full flex items-center 
                justify-center py-3 px-4 border 
                border-transparent rounded-xl shadow-lg 
                text-sm font-medium text-white 
                bg-gradient-to-r from-blue-600 to-indigo-600
                hover:from-blue-700 hover:to-indigo-700
                focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-blue-500 
                disabled:opacity-50 disabled:cursor-not-allowed 
                transform hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-200
                shadow-blue-500/50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 
                    mr-2 h-5 w-5" 
                  />
                  Đang xử lý...
                </>
              ) : error && error.includes('Tài khoản đã bị khóa') ? (
                <>
                  Tài khoản đã bị khóa
                </>
              ) : (
                <>
                  <LogIn className="-ml-1 mr-2 h-5 w-5" />
                  Đăng nhập
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="font-medium text-transparent 
                  bg-clip-text bg-gradient-to-r 
                  from-blue-600 to-indigo-600
                  hover:from-blue-700 hover:to-indigo-700
                  transition-all duration-200
                  hover:scale-105 inline-block"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Bằng việc đăng nhập, bạn đồng ý với{' '}
            <Link 
              to="/terms" 
              className="text-blue-600 hover:underline"
            >
              Điều khoản dịch vụ
            </Link>{' '}
            và{' '}
            <Link 
              to="/privacy" 
              className="text-blue-600 hover:underline"
            >
              Chính sách bảo mật
            </Link>
          </p>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-2px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(2px);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
