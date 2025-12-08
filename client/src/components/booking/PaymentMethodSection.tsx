import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { CreditCard, Building2 } from 'lucide-react';
import type { BookingFormData } from '../../validators/bookingValidator';

interface PaymentMethodSectionProps {
  register: UseFormRegister<BookingFormData>;
  errors: FieldErrors<BookingFormData>;
  totalPrice: number;
  formatPrice: (price: number) => string;
}

const PaymentMethodSection: React.FC<PaymentMethodSectionProps> = ({
  register,
  errors,
  totalPrice,
  formatPrice,
}) => {
  return (
    <div className="border-t pt-6">
      <h2
        className="text-xl font-bold
          text-gray-900 dark:text-white mb-4"
      >
        Phương thức thanh toán
      </h2>

      <div className="space-y-3">
        {/* Cash */}
        <label
          className="flex items-start p-4
            border-2 border-gray-200 dark:border-gray-600
            rounded-lg cursor-pointer
            hover:border-indigo-500 dark:hover:border-indigo-400
            transition-colors"
        >
          <input
            {...register('paymentMethod')}
            type="radio"
            value="cash"
            className="mt-1 mr-3"
          />
          <div className="flex-1">
            <div className="flex items-center
              gap-2 mb-1"
            >
              <CreditCard
                className="w-5 h-5
                  text-gray-600 dark:text-white"
              />
              <span className="font-medium
                text-gray-900 dark:text-white"
              >
                Thanh toán khi nhận phòng
              </span>
              <span className="text-xs bg-orange-100 dark:bg-orange-900/30
                text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded"
              >
                Cần đặt cọc 20%
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-white mb-2">
              Thanh toán phần còn lại khi nhận phòng
            </p>
            <div className="bg-orange-50 dark:bg-orange-900/20 border
              border-orange-200 dark:border-orange-800 rounded p-2"
            >
              <p className="text-xs text-orange-800 dark:text-orange-200">
                Bạn cần thanh toán
                <strong className="text-orange-900 dark:text-orange-100">
                  {formatPrice(totalPrice * 0.2)}
                </strong>
                qua
                chuyển khoản ngay sau khi đặt phòng để
                giữ phòng. Phần còn lại thanh toán
                khi nhận phòng.
              </p>
            </div>
          </div>
        </label>

        {/* Bank Transfer */}
        <label
          className="flex items-start p-4
            border-2 border-gray-200 dark:border-gray-600
            rounded-lg cursor-pointer
            hover:border-indigo-500 dark:hover:border-indigo-400
            transition-colors"
        >
          <input
            {...register('paymentMethod')}
            type="radio"
            value="bank_transfer"
            className="mt-1 mr-3"
          />
          <div className="flex-1">
            <div className="flex items-center
              gap-2 mb-1"
            >
              <Building2
                className="w-5 h-5
                  text-gray-600 dark:text-white"
              />
              <span className="font-medium
                text-gray-900 dark:text-white"
              >
                Chuyển khoản ngân hàng
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-white">
              Chuyển khoản qua QR code hoặc
              số tài khoản
            </p>
          </div>
        </label>

        {/* VNPay */}
        <label
          className="flex items-start p-4
            border-2 border-gray-200 dark:border-gray-600
            rounded-lg cursor-pointer
            hover:border-indigo-500 dark:hover:border-indigo-400
            transition-colors"
        >
          <input
            {...register('paymentMethod')}
            type="radio"
            value="vnpay"
            className="mt-1 mr-3"
          />
          <div className="flex-1">
            <div className="flex items-center
              gap-2 mb-1"
            >
              <CreditCard
                className="w-5 h-5
                  text-blue-600 dark:text-blue-400"
              />
              <span className="font-medium
                text-gray-900 dark:text-white"
              >
                Thanh toán qua VNPay
              </span>
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30
                text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded"
              >
                Nhanh chóng & An toàn
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-white">
              Thanh toán bằng thẻ ATM, Visa,
              Mastercard qua cổng VNPay
            </p>
          </div>
        </label>

        {errors.paymentMethod && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.paymentMethod.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodSection;