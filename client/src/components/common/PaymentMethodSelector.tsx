import React from 'react';
import { CreditCard, Building2 } from 'lucide-react';

interface PaymentMethodSelectorProps {
  value: 'cash' | 'bank_transfer';
  onChange: (value: 'cash' | 'bank_transfer') => void;
  error?: string;
  disabled?: boolean;
}

const PaymentMethodSelector: React.FC<
  PaymentMethodSelectorProps
> = ({ value, onChange, error, disabled = false }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Phương thức thanh toán
        <span className="text-red-500 ml-1">*</span>
      </h3>

      <div className="space-y-3">
        {/* Cash Payment */}
        <label
          className={`flex items-start p-4 border-2 
            rounded-lg cursor-pointer transition-all
            ${
              value === 'cash'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            type="radio"
            name="payment_method"
            value="cash"
            checked={value === 'cash'}
            onChange={(e) => 
              onChange(e.target.value as 'cash')
            }
            disabled={disabled}
            className="mt-1 mr-3"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard 
                className="w-5 h-5 text-gray-600" 
              />
              <span className="font-medium text-gray-900">
                Thanh toán tại chỗ
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Thanh toán trực tiếp tại khách sạn khi 
              nhận phòng. Chấp nhận tiền mặt và thẻ.
            </p>
            <div className="mt-2 text-xs text-gray-500 
              bg-white rounded px-2 py-1 inline-block"
            >
              ⏱️ Thanh toán khi check-in
            </div>
          </div>
        </label>

        {/* Bank Transfer */}
        <label
          className={`flex items-start p-4 border-2 
            rounded-lg cursor-pointer transition-all
            ${
              value === 'bank_transfer'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            type="radio"
            name="payment_method"
            value="bank_transfer"
            checked={value === 'bank_transfer'}
            onChange={(e) =>
              onChange(e.target.value as 'bank_transfer')
            }
            disabled={disabled}
            className="mt-1 mr-3"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Building2 
                className="w-5 h-5 text-gray-600" 
              />
              <span className="font-medium text-gray-900">
                Chuyển khoản ngân hàng
              </span>
              <span className="text-xs bg-green-100 
                text-green-700 px-2 py-0.5 rounded-full 
                font-medium"
              >
                Khuyến nghị
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Chuyển khoản qua QR code hoặc số tài khoản. 
              Xác nhận nhanh chóng trong 24h.
            </p>
            <div className="mt-2 text-xs text-gray-500 
              bg-white rounded px-2 py-1 inline-block"
            >
              💳 Xác nhận sau khi đặt phòng
            </div>
          </div>
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-2">
          {error}
        </p>
      )}

      {/* Additional Info */}
      <div className="mt-4 p-3 bg-blue-50 border 
        border-blue-200 rounded-lg"
      >
        <p className="text-xs text-blue-800">
          💡 <strong>Lưu ý:</strong> Bạn sẽ không bị 
          tính phí ngay. {' '}
          {value === 'cash'
            ? 'Thanh toán khi nhận phòng.'
            : 'Chuyển khoản sau khi xác nhận đặt phòng.'}
        </p>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
