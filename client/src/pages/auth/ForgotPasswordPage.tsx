import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from 'react-router-dom';
import {
  Mail,
  ArrowLeft,
  Send,
  Loader2,
  CheckCircle,
  Hotel,
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
} from '../../utils/validationSchemas';

const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword, isLoading, error, clearError } =
    useAuthStore();
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      clearError();
      setSubmittedEmail(data.email);
      await forgotPassword({ email: data.email });
      
      // Show success state
      setIsSuccess(true);
    } catch (error) {
      // Error đã được xử lý trong store
      console.error('Forgot password error:', error);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br 
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
            Quên mật khẩu?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Nhập email của bạn để nhận link đặt lại mật khẩu
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
                  <CheckCircle
                    className="w-10 h-10 text-green-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h3
                  className="text-xl font-semibold 
                    text-gray-900"
                >
                  Email đã được gửi!
                </h3>
                <p className="text-sm text-gray-600">
                  Chúng tôi đã gửi link đặt lại mật khẩu đến
                </p>
                <p className="text-sm font-medium text-blue-600">
                  {submittedEmail}
                </p>
              </div>

              <div
                className="bg-blue-50 border border-blue-200 
                  rounded-lg p-4 text-left"
              >
                <p className="text-sm text-gray-700">
                  <strong>Lưu ý:</strong>
                </p>
                <ul
                  className="mt-2 space-y-1 text-sm 
                    text-gray-600 list-disc list-inside"
                >
                  <li>Link có hiệu lực trong 1 giờ</li>
                  <li>Kiểm tra cả thư mục Spam/Junk</li>
                  <li>
                    Nếu không nhận được email, hãy thử lại
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    clearError();
                  }}
                  className="w-full flex items-center 
                    justify-center py-3 px-4 border 
                    border-gray-300 rounded-lg 
                    text-sm font-medium text-gray-700 
                    bg-white hover:bg-gray-50 
                    focus:outline-none focus:ring-2 
                    focus:ring-offset-2 
                    focus:ring-blue-500 
                    transition-colors"
                >
                  <Mail className="-ml-1 mr-2 h-5 w-5" />
                  Gửi lại email
                </button>

                <Link
                  to="/login"
                  className="w-full flex items-center 
                    justify-center py-3 px-4 border 
                    border-transparent rounded-lg 
                    text-sm font-medium text-white 
                    bg-blue-600 hover:bg-blue-700 
                    focus:outline-none focus:ring-2 
                    focus:ring-offset-2 
                    focus:ring-blue-500 
                    transition-colors"
                >
                  <ArrowLeft
                    className="-ml-1 mr-2 h-5 w-5"
                  />
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          ) : (
            // Form State
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* Error Message */}
              {error && (
                <div
                  className="bg-red-50 border 
                    border-red-200 text-red-700 
                    px-4 py-3 rounded-lg text-sm"
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
                  <div
                    className="absolute inset-y-0 left-0 
                      pl-3 flex items-center 
                      pointer-events-none"
                  >
                    <Mail
                      className="h-5 w-5 text-gray-400"
                    />
                  </div>
                  <input
                    {...register('email')}
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    className={`block w-full pl-10 pr-3 
                      py-3 border rounded-lg 
                      focus:outline-none focus:ring-2 
                      transition-colors
                      ${
                        errors.email
                          ? 'border-red-300 ' +
                            'focus:ring-red-500'
                          : 'border-gray-300 ' +
                            'focus:ring-blue-500'
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center 
                  justify-center py-3 px-4 border 
                  border-transparent rounded-lg 
                  shadow-sm text-sm font-medium 
                  text-white bg-blue-600 
                  hover:bg-blue-700 focus:outline-none 
                  focus:ring-2 focus:ring-offset-2 
                  focus:ring-blue-500 
                  disabled:opacity-50 
                  disabled:cursor-not-allowed 
                  transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2
                      className="animate-spin -ml-1 
                        mr-2 h-5 w-5"
                    />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Send className="-ml-1 mr-2 h-5 w-5" />
                    Gửi link đặt lại mật khẩu
                  </>
                )}
              </button>

              {/* Back to Login Link */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center 
                    text-sm font-medium text-blue-600 
                    hover:text-blue-500 transition-colors"
                >
                  <ArrowLeft
                    className="mr-1 h-4 w-4"
                  />
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Footer Info */}
        {!isSuccess && (
          <div className="text-center text-sm text-gray-500">
            <p>
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 
                  hover:underline"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        )}

        {/* Help Section */}
        <div
          className="bg-white rounded-lg shadow-sm 
            border border-gray-200 p-4"
        >
          <h3
            className="text-sm font-semibold text-gray-900 
              mb-2"
          >
            Cần trợ giúp?
          </h3>
          <p className="text-xs text-gray-600">
            Nếu bạn gặp vấn đề khi đặt lại mật khẩu, vui 
            lòng liên hệ với bộ phận hỗ trợ của chúng tôi 
            qua email{' '}
            <a
              href="mailto:support@hotel.com"
              className="text-blue-600 hover:underline"
            >
              support@hotel.com
            </a>{' '}
            hoặc hotline{' '}
            <a
              href="tel:1900-xxxx"
              className="text-blue-600 hover:underline"
            >
              1900-xxxx
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
