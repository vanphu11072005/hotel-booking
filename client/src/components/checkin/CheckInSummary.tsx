import React from 'react';
import { Users, DollarSign, CheckCircle } from 'lucide-react';

interface CheckInSummaryProps {
  bookingInfo: {
    booking_number: string;
    guest_name: string;
    room_info: string;
    total_guests: number;
  };
  surchargeTotal: number;
  serviceTotal: number;
  roomTotal: number;
  onConfirm: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const CheckInSummary: React.FC<CheckInSummaryProps> = ({
  bookingInfo,
  surchargeTotal,
  serviceTotal,
  roomTotal,
  onConfirm,
  isLoading = false,
  disabled = false,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const grandTotal = roomTotal + surchargeTotal + serviceTotal;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-5">
        <CheckCircle className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">Xác nhận Check-in</h2>
      </div>

      {/* Booking Info */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Thông tin đặt phòng</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Mã đặt phòng:</span>
            <span className="font-semibold text-blue-600">{bookingInfo.booking_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Khách hàng:</span>
            <span className="font-semibold">{bookingInfo.guest_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phòng:</span>
            <span className="font-semibold">{bookingInfo.room_info}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tổng số khách:</span>
            <span className="font-semibold flex items-center gap-1">
              <Users className="w-4 h-4" />
              {bookingInfo.total_guests} người
            </span>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white rounded-lg p-4 mb-5 border border-blue-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Chi tiết thanh toán</h3>
        <div className="space-y-3">
          {/* Room Cost */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Tiền phòng</span>
            </div>
            <span className="font-semibold text-gray-900">{formatCurrency(roomTotal)}</span>
          </div>

          {/* Surcharge */}
          {surchargeTotal > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Phụ phí</span>
              </div>
              <span className="font-semibold text-orange-600">{formatCurrency(surchargeTotal)}</span>
            </div>
          )}

          {/* Services */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Dịch vụ</span>
            </div>
            <span className={`font-semibold ${serviceTotal > 0 ? 'text-green-600' : 'text-gray-400'}`}>
              {formatCurrency(serviceTotal)}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-blue-300 my-2"></div>

          {/* Grand Total */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="text-base font-bold text-gray-900">TỔNG CỘNG</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onConfirm}
        disabled={disabled || isLoading}
        className={`w-full py-4 rounded-lg font-bold text-white text-base transition-all flex items-center justify-center gap-2 ${
          disabled || isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl'
        }`}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Đang xử lý...</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            <span>XÁC NHẬN CHECK-IN</span>
          </>
        )}
      </button>

      {/* Note */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800">
          <strong>Lưu ý:</strong> Vui lòng kiểm tra kỹ thông tin trước khi xác nhận. 
          Sau khi check-in, khách hàng sẽ nhận được thông tin phòng và hướng dẫn sử dụng dịch vụ.
        </p>
      </div>
    </div>
  );
};

export default CheckInSummary;
