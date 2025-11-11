import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
  Mail,
  Lock,
  User,
  Phone,
  Hotel,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import {
  registerSchema,
  RegisterFormData,
} from '../../utils/validationSchemas';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError } =
    useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = 
    useState(false);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
    },
  });

  // Watch password để hiển thị password strength
  const password = watch('password');

  // Password strength checker
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[@$!%*?&]/.test(pwd)) strength++;

    const labels = [
      { label: 'Rất yếu', color: 'bg-red-500' },
      { label: 'Yếu', color: 'bg-orange-500' },
      { label: 'Trung bình', color: 'bg-yellow-500' },
      { label: 'Mạnh', color: 'bg-blue-500' },
      { label: 'Rất mạnh', color: 'bg-green-500' },
    ];

    return { strength, ...labels[strength] };
  };

  const passwordStrength = getPasswordStrength(password || '');

  // Handle form submission
  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });

      // Redirect to login page
      navigate('/login', { replace: true });
    } catch (error) {
      // Error đã được xử lý trong store
      console.error('Register error:', error);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br 
        from-purple-50 to-pink-100 flex items-center 
        justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-purple-600 rounded-full">
              <Hotel className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Đăng ký tài khoản
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Tạo tài khoản mới để đặt phòng khách sạn
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {/* Error Message */}
            {error && (
              <div
                className="bg-red-50 border border-red-200 
                  text-red-700 px-4 py-3 rounded-lg 
                  text-sm"
              >
                {error}
              </div>
            )}

            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium 
                  text-gray-700 mb-2"
              >
                Họ và tên
              </label>
              <div className="relative">
                <div
                  className="absolute inset-y-0 left-0 
                    pl-3 flex items-center 
                    pointer-events-none"
                >
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('name')}
                  id="name"
                  type="text"
                  autoComplete="name"
                  className={`block w-full pl-10 pr-3 py-3 
                    border rounded-lg focus:outline-none 
                    focus:ring-2 transition-colors
                    ${
                      errors.name
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 ' +
                          'focus:ring-purple-500'
                    }`}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

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
                <div
                  className="absolute inset-y-0 left-0 
                    pl-3 flex items-center 
                    pointer-events-none"
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
                    ${
                      errors.email
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 ' +
                          'focus:ring-purple-500'
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

            {/* Phone Field */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium 
                  text-gray-700 mb-2"
              >
                Số điện thoại (Tùy chọn)
              </label>
              <div className="relative">
                <div
                  className="absolute inset-y-0 left-0 
                    pl-3 flex items-center 
                    pointer-events-none"
                >
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('phone')}
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  className={`block w-full pl-10 pr-3 py-3 
                    border rounded-lg focus:outline-none 
                    focus:ring-2 transition-colors
                    ${
                      errors.phone
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 ' +
                          'focus:ring-purple-500'
                    }`}
                  placeholder="0123456789"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phone.message}
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
                <div
                  className="absolute inset-y-0 left-0 
                    pl-3 flex items-center 
                    pointer-events-none"
                >
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`block w-full pl-10 pr-10 py-3 
                    border rounded-lg focus:outline-none 
                    focus:ring-2 transition-colors
                    ${
                      errors.password
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 ' +
                          'focus:ring-purple-500'
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
                    <EyeOff
                      className="h-5 w-5 text-gray-400 
                        hover:text-gray-600"
                    />
                  ) : (
                    <Eye
                      className="h-5 w-5 text-gray-400 
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

              {/* Password Strength Indicator */}
              {password && password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 
                      rounded-full overflow-hidden"
                    >
                      <div
                        className={`h-full transition-all 
                          duration-300 ${passwordStrength.color}`}
                        style={{
                          width: `${
                            (passwordStrength.strength / 5) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium 
                      text-gray-600"
                    >
                      {passwordStrength.label}
                    </span>
                  </div>

                  {/* Password Requirements */}
                  <div className="mt-2 space-y-1">
                    <PasswordRequirement
                      met={password.length >= 8}
                      text="Ít nhất 8 ký tự"
                    />
                    <PasswordRequirement
                      met={/[a-z]/.test(password)}
                      text="Chữ thường (a-z)"
                    />
                    <PasswordRequirement
                      met={/[A-Z]/.test(password)}
                      text="Chữ hoa (A-Z)"
                    />
                    <PasswordRequirement
                      met={/\d/.test(password)}
                      text="Số (0-9)"
                    />
                    <PasswordRequirement
                      met={/[@$!%*?&]/.test(password)}
                      text="Ký tự đặc biệt (@$!%*?&)"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium 
                  text-gray-700 mb-2"
              >
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div
                  className="absolute inset-y-0 left-0 
                    pl-3 flex items-center 
                    pointer-events-none"
                >
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type={
                    showConfirmPassword ? 'text' : 'password'
                  }
                  autoComplete="new-password"
                  className={`block w-full pl-10 pr-10 py-3 
                    border rounded-lg focus:outline-none 
                    focus:ring-2 transition-colors
                    ${
                      errors.confirmPassword
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 ' +
                          'focus:ring-purple-500'
                    }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute inset-y-0 right-0 
                    pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff
                      className="h-5 w-5 text-gray-400 
                        hover:text-gray-600"
                    />
                  ) : (
                    <Eye
                      className="h-5 w-5 text-gray-400 
                        hover:text-gray-600"
                    />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center 
                justify-center py-3 px-4 border 
                border-transparent rounded-lg shadow-sm 
                text-sm font-medium text-white 
                bg-purple-600 hover:bg-purple-700 
                focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-purple-500 
                disabled:opacity-50 
                disabled:cursor-not-allowed 
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
                  <UserPlus className="-ml-1 mr-2 h-5 w-5" />
                  Đăng ký
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <Link
                to="/login"
                className="font-medium text-purple-600 
                  hover:text-purple-500 transition-colors"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Bằng việc đăng ký, bạn đồng ý với{' '}
            <Link
              to="/terms"
              className="text-purple-600 hover:underline"
            >
              Điều khoản dịch vụ
            </Link>{' '}
            và{' '}
            <Link
              to="/privacy"
              className="text-purple-600 hover:underline"
            >
              Chính sách bảo mật
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper component for password requirements
const PasswordRequirement: React.FC<{
  met: boolean;
  text: string;
}> = ({ met, text }) => (
  <div className="flex items-center gap-2 text-xs">
    {met ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-gray-300" />
    )}
    <span className={met ? 'text-green-600' : 'text-gray-500'}>
      {text}
    </span>
  </div>
);

export default RegisterPage;
