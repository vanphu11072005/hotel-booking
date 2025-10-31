import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { UserPlus } from 'lucide-react';
import { registerSchema } from '@/utils/validationSchemas';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES } from '@/constants';
import type { RegisterData } from '@/types/auth.types';

interface RegisterFormData extends RegisterData {
  confirmPassword: string;
}

export const RegisterForm = () => {
  const navigate = useNavigate();
  const register_action = useAuthStore((state) => state.register);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      await register_action(registerData);
      toast.success('Đăng ký thành công!');
      navigate(ROUTES.DASHBOARD);
    } catch (error: any) {
      const message = 
        error.response?.data?.message || 
        'Đăng ký thất bại. Vui lòng thử lại.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center 
      justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center 
            justify-center rounded-full bg-primary-100">
            <UserPlus className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold 
            text-gray-900">
            Đăng ký tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link
              to={ROUTES.LOGIN}
              className="font-medium text-primary-600 
                hover:text-primary-500"
            >
              Đăng nhập
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" 
          onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="full_name" 
                className="block text-sm font-medium 
                  text-gray-700">
                Họ và tên
              </label>
              <input
                id="full_name"
                type="text"
                className={`input-field ${
                  errors.full_name ? 'border-red-500' : ''
                }`}
                placeholder="Nguyễn Văn A"
                {...register('full_name')}
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" 
                className="block text-sm font-medium 
                  text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`input-field ${
                  errors.email ? 'border-red-500' : ''
                }`}
                placeholder="email@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" 
                className="block text-sm font-medium 
                  text-gray-700">
                Số điện thoại (Không bắt buộc)
              </label>
              <input
                id="phone"
                type="tel"
                className={`input-field ${
                  errors.phone ? 'border-red-500' : ''
                }`}
                placeholder="0901234567"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="address" 
                className="block text-sm font-medium 
                  text-gray-700">
                Địa chỉ (Không bắt buộc)
              </label>
              <input
                id="address"
                type="text"
                className="input-field"
                placeholder="123 Street, District, City"
                {...register('address')}
              />
            </div>

            <div>
              <label htmlFor="password" 
                className="block text-sm font-medium 
                  text-gray-700">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className={`input-field ${
                  errors.password ? 'border-red-500' : ''
                }`}
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" 
                className="block text-sm font-medium 
                  text-gray-700">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className={`input-field ${
                  errors.confirmPassword ? 'border-red-500' : ''
                }`}
                placeholder="••••••••"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex justify-center 
                py-3"
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
