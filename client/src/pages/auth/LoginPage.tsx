import React, { useState } from 'react';
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
  Hotel
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
      rememberMe: false,
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      // Redirect về trang trước đó hoặc dashboard
      const from = location.state?.from?.pathname || 
        '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      // Error đã được xử lý trong store
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br 
      from-blue-50 to-indigo-100 flex items-center 
      justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Hotel className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Đăng nhập
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Chào mừng bạn trở lại với Hotel Booking
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} 
            className="space-y-6"
          >
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 
                text-red-700 px-4 py-3 rounded-lg 
                text-sm"
              >
                {error}
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
                    border rounded-lg focus:outline-none 
                    focus:ring-2 transition-colors
                    ${errors.email 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
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
                    border rounded-lg focus:outline-none 
                    focus:ring-2 transition-colors
                    ${errors.password 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
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
                  text-blue-600 hover:text-blue-500 
                  transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center 
                justify-center py-3 px-4 border 
                border-transparent rounded-lg shadow-sm 
                text-sm font-medium text-white 
                bg-blue-600 hover:bg-blue-700 
                focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-blue-500 
                disabled:opacity-50 disabled:cursor-not-allowed 
                transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 
                    mr-2 h-5 w-5" 
                  />
                  Đang xử lý...
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
                className="font-medium text-blue-600 
                  hover:text-blue-500 transition-colors"
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
    </div>
  );
};

export default LoginPage;
