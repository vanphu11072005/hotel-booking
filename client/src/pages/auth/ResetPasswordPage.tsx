import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Lock,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  KeyRound,
  Hotel,
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import {
  resetPasswordSchema,
  ResetPasswordFormData,
} from '../../utils/validationSchemas';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const { resetPassword, isLoading, error, clearError } =
    useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Watch password để hiển thị password strength
  const password = watch('password');

  // Check if token exists
  useEffect(() => {
    if (!token) {
      navigate('/forgot-password', { replace: true });
    }
  }, [token, navigate]);

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
  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      return;
    }

    try {
      clearError();
      await resetPassword({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      // Show success state
      setIsSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (error) {
      // Error đã được xử lý trong store
      console.error('Reset password error:', error);
    }
  };

  // Invalid token error check
  const isTokenError =
    error?.includes('token') || error?.includes('expired');

  return (
    <div
      className="min-h-screen bg-gradient-to-br 
        from-indigo-50 to-purple-100 flex items-center 
        justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-600 rounded-full">
              <Hotel className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isSuccess ? 'Hoàn tất!' : 'Đặt lại mật khẩu'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSuccess
              ? 'Mật khẩu đã được đặt lại thành công'
              : 'Nhập mật khẩu mới cho tài khoản của bạn'}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {isSuccess ? (
            // Success State
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div
                  className="w-16 h-16 bg-green-100 
                    rounded-full flex items-center 
                    justify-center"
                >
                  <CheckCircle2
                    className="w-10 h-10 text-green-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h3
                  className="text-xl font-semibold 
                    text-gray-900"
                >
                  Đặt lại mật khẩu thành công!
                </h3>
                <p className="text-sm text-gray-600">
                  Mật khẩu của bạn đã được cập nhật.
                </p>
                <p className="text-sm text-gray-600">
                  Bạn có thể đăng nhập bằng mật khẩu mới.
                </p>
              </div>

              <div
                className="bg-blue-50 border border-blue-200 
                  rounded-lg p-4"
              >
                <p className="text-sm text-gray-700">
                  Đang chuyển hướng đến trang đăng nhập...
                </p>
                <div className="mt-2 flex justify-center">
                  <Loader2
                    className="animate-spin h-5 w-5 
                      text-blue-600"
                  />
                </div>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center 
                  justify-center w-full py-3 px-4 
                  border border-transparent rounded-lg 
                  text-sm font-medium text-white 
                  bg-indigo-600 hover:bg-indigo-700 
                  focus:outline-none focus:ring-2 
                  focus:ring-offset-2 
                  focus:ring-indigo-500 
                  transition-colors"
              >
                <KeyRound className="-ml-1 mr-2 h-5 w-5" />
                Đăng nhập ngay
              </Link>
            </div>
          ) : (
            // Form State
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Error Message */}
              {error && (
                <div
                  className={`border px-4 py-3 rounded-lg 
                    text-sm flex items-start gap-2
                    ${
                      isTokenError
                        ? 'bg-yellow-50 border-yellow-200 ' +
                          'text-yellow-800'
                        : 'bg-red-50 border-red-200 ' +
                          'text-red-700'
                    }`}
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{error}</p>
                    {isTokenError && (
                      <Link
                        to="/forgot-password"
                        className="mt-2 inline-block text-sm 
                          font-medium underline 
                          hover:text-yellow-900"
                      >
                        Yêu cầu link mới
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium 
                    text-gray-700 mb-2"
                >
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <div
                    className="absolute inset-y-0 left-0 
                      pl-3 flex items-center 
                      pointer-events-none"
                  >
                    <Lock
                      className="h-5 w-5 text-gray-400"
                    />
                  </div>
                  <input
                    {...register('password')}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    autoFocus
                    className={`block w-full pl-10 pr-10 
                      py-3 border rounded-lg 
                      focus:outline-none focus:ring-2 
                      transition-colors
                      ${
                        errors.password
                          ? 'border-red-300 ' +
                            'focus:ring-red-500'
                          : 'border-gray-300 ' +
                            'focus:ring-indigo-500'
                      }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
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
                      <div
                        className="flex-1 h-2 bg-gray-200 
                          rounded-full overflow-hidden"
                      >
                        <div
                          className={`h-full transition-all 
                            duration-300 
                            ${passwordStrength.color}`}
                          style={{
                            width: `${
                              (passwordStrength.strength / 5) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-medium 
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
                    <Lock
                      className="h-5 w-5 text-gray-400"
                    />
                  </div>
                  <input
                    {...register('confirmPassword')}
                    id="confirmPassword"
                    type={
                      showConfirmPassword ? 'text' : 'password'
                    }
                    autoComplete="new-password"
                    className={`block w-full pl-10 pr-10 
                      py-3 border rounded-lg 
                      focus:outline-none focus:ring-2 
                      transition-colors
                      ${
                        errors.confirmPassword
                          ? 'border-red-300 ' +
                            'focus:ring-red-500'
                          : 'border-gray-300 ' +
                            'focus:ring-indigo-500'
                      }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
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
                  border-transparent rounded-lg 
                  shadow-sm text-sm font-medium 
                  text-white bg-indigo-600 
                  hover:bg-indigo-700 
                  focus:outline-none focus:ring-2 
                  focus:ring-offset-2 
                  focus:ring-indigo-500 
                  disabled:opacity-50 
                  disabled:cursor-not-allowed 
                  transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2
                      className="animate-spin -ml-1 mr-2 
                        h-5 w-5"
                    />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <KeyRound
                      className="-ml-1 mr-2 h-5 w-5"
                    />
                    Đặt lại mật khẩu
                  </>
                )}
              </button>

              {/* Back to Login Link */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm font-medium 
                    text-indigo-600 hover:text-indigo-500 
                    transition-colors"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Security Info */}
        {!isSuccess && (
          <div
            className="bg-white rounded-lg shadow-sm 
              border border-gray-200 p-4"
          >
            <h3
              className="text-sm font-semibold 
                text-gray-900 mb-2 flex items-center 
                gap-2"
            >
              <Lock className="h-4 w-4" />
              Bảo mật
            </h3>
            <ul
              className="text-xs text-gray-600 space-y-1 
                list-disc list-inside"
            >
              <li>Link đặt lại chỉ có hiệu lực trong 1 giờ</li>
              <li>Mật khẩu được mã hóa an toàn</li>
              <li>
                Nếu link hết hạn, hãy yêu cầu link mới
              </li>
            </ul>
          </div>
        )}
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

export default ResetPasswordPage;
