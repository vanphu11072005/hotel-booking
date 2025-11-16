import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Home,
  Receipt,
  Loader2,
} from 'lucide-react';

const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  const status = searchParams.get('status');
  const bookingId = searchParams.get('bookingId');
  const transactionId = searchParams.get('transactionId');
  const message = searchParams.get('message');

  useEffect(() => {
    if (status === 'success' && bookingId) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate(`/bookings/${bookingId}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, bookingId, navigate]);

  const getStatusContent = () => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle className="w-20 h-20 text-green-500" />,
          title: 'Thanh toán thành công!',
          description: 
            'Cảm ơn bạn đã thanh toán. Đặt phòng của bạn đã được xác nhận.',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
        };
      case 'failed':
        return {
          icon: <XCircle className="w-20 h-20 text-red-500" />,
          title: 'Thanh toán thất bại',
          description: message || 
            'Giao dịch không thành công. Vui lòng thử lại.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
        };
      case 'invalid_signature':
        return {
          icon: <AlertCircle className="w-20 h-20 text-orange-500" />,
          title: 'Lỗi xác thực',
          description: 
            'Không thể xác thực giao dịch. Vui lòng liên hệ hỗ trợ.',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-800',
        };
      case 'payment_not_found':
        return {
          icon: <AlertCircle className="w-20 h-20 text-gray-500" />,
          title: 'Không tìm thấy thanh toán',
          description: 
            'Không tìm thấy thông tin thanh toán. ' +
            'Vui lòng kiểm tra lại.',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
        };
      default:
        return {
          icon: <AlertCircle className="w-20 h-20 text-gray-500" />,
          title: 'Lỗi không xác định',
          description: message || 
            'Đã xảy ra lỗi. Vui lòng thử lại sau.',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div
          className={`${content.bgColor} border-2 
            ${content.borderColor} rounded-lg p-8`}
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {content.icon}
          </div>

          {/* Title */}
          <h1
            className={`text-3xl font-bold text-center 
              mb-4 ${content.textColor}`}
          >
            {content.title}
          </h1>

          {/* Description */}
          <p className="text-center text-gray-700 mb-6">
            {content.description}
          </p>

          {/* Transaction Details */}
          {status === 'success' && transactionId && (
            <div
              className="bg-white border border-gray-200 
                rounded-lg p-4 mb-6"
            >
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Mã giao dịch
                  </span>
                  <span className="font-medium font-mono">
                    {transactionId}
                  </span>
                </div>
                {bookingId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Booking ID
                    </span>
                    <span className="font-medium">
                      #{bookingId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Auto redirect notice for success */}
          {status === 'success' && bookingId && countdown > 0 && (
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 
                text-gray-600"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  Tự động chuyển đến chi tiết booking trong {countdown}s...
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {status === 'success' && bookingId ? (
              <>
                <Link
                  to={`/bookings/${bookingId}`}
                  className="flex-1 flex items-center justify-center 
                    gap-2 px-6 py-3 bg-green-600 text-white 
                    rounded-lg hover:bg-green-700 
                    transition-colors font-medium"
                >
                  <Receipt className="w-5 h-5" />
                  Xem chi tiết booking
                </Link>
                <Link
                  to="/"
                  className="flex-1 flex items-center justify-center 
                    gap-2 px-6 py-3 bg-white text-gray-700 
                    border-2 border-gray-300 rounded-lg 
                    hover:bg-gray-50 transition-colors 
                    font-medium"
                >
                  <Home className="w-5 h-5" />
                  Về trang chủ
                </Link>
              </>
            ) : status === 'failed' && bookingId ? (
              <>
                <Link
                  to={`/deposit-payment/${bookingId}`}
                  className="flex-1 px-6 py-3 bg-indigo-600 
                    text-white rounded-lg hover:bg-indigo-700 
                    transition-colors font-medium text-center"
                >
                  Thử lại thanh toán
                </Link>
                <Link
                  to="/bookings"
                  className="flex-1 px-6 py-3 bg-white 
                    text-gray-700 border-2 border-gray-300 
                    rounded-lg hover:bg-gray-50 
                    transition-colors font-medium text-center"
                >
                  Danh sách booking
                </Link>
              </>
            ) : (
              <Link
                to="/"
                className="w-full flex items-center 
                  justify-center gap-2 px-6 py-3 
                  bg-indigo-600 text-white rounded-lg 
                  hover:bg-indigo-700 transition-colors 
                  font-medium"
              >
                <Home className="w-5 h-5" />
                Về trang chủ
              </Link>
            )}
          </div>
        </div>

        {/* Support Notice */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Nếu có bất kỳ vấn đề gì, vui lòng liên hệ{' '}
            <a
              href="mailto:support@hotel.com"
              className="text-indigo-600 hover:underline"
            >
              support@hotel.com
            </a>{' '}
            hoặc gọi{' '}
            <a
              href="tel:1900xxxx"
              className="text-indigo-600 hover:underline"
            >
              1900 xxxx
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
