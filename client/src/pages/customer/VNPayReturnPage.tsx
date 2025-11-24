import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { verifyVNPayReturn } from '../../services/api/paymentService';
import Loading from '../../components/common/Loading';

const VNPayReturnPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'full' | 'deposit' | 'remaining' | null>(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      setVerifying(true);

      // Get all query params
      const queryParams = location.search;
      console.log('=== Trang VNPay Return ===');
      console.log('Tham số query:', queryParams);

      // Verify payment with backend
      console.log('Đang gọi API backend để xác thực thanh toán...');
      const response = await verifyVNPayReturn(queryParams);
      console.log('Phản hồi từ backend:', response);

      if (response.success) {
        setSuccess(true);
        
        // Get payment type and booking_id from response
        const pType = response.data?.payment?.payment_type || 'deposit';
        const bid = response.data?.booking_id?.toString() || null;
        
        setPaymentType(pType);
        setBookingId(bid);
        
        // Set message based on payment type
        if (pType === 'full') {
          setMessage('Đơn đặt phòng của bạn đã được xác nhận và thanh toán đầy đủ.');
          toast.success('✅ Thanh toán 100% thành công!');
        } else {
          setMessage('Đặt cọc của bạn đã được xác nhận.');
          toast.success('✅ Thanh toán đặt cọc thành công!');
        }
        
        console.log('ID Booking:', bid, '| Payment Type:', pType);
      } else {
        setSuccess(false);
        setMessage(
          response.message || 
          'Thanh toán thất bại. Vui lòng thử lại hoặc chọn phương thức khác.'
        );
        toast.error('❌ Thanh toán thất bại!');
      }
    } catch (err: any) {
      console.error('❌ Lỗi xác thực thanh toán VNPay:', err);
      console.error('Chi tiết lỗi:', err.response?.data);
      setSuccess(false);
      
      // Extract booking_id from error response
      const bid = err.response?.data?.data?.booking_id?.toString() || null;
      console.log('ID Booking từ lỗi:', bid);
      setBookingId(bid);
      
      setMessage(
        err.response?.data?.message ||
        'Không thể xác minh thanh toán. Vui lòng liên hệ hỗ trợ.'
      );
      toast.error('❌ Thanh toán thất bại!');
    } finally {
      setVerifying(false);
    }
  };

  const handleBackToBooking = () => {
    if (bookingId) {
      navigate(`/bookings/${bookingId}`);
    } else {
      navigate('/bookings');
    }
  };

  if (verifying) {
    return (
      <Loading 
        fullScreen 
        text="Đang xác minh thanh toán VNPay..." 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Result Icon */}
          <div className="flex justify-center mb-6">
            {success ? (
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            ) : (
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-16 h-16 text-red-600" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className={`text-3xl font-bold text-center mb-4 ${
            success ? 'text-green-900' : 'text-red-900'
          }`}>
            {success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </h1>

          {/* Message */}
          <p className={`text-center mb-8 ${
            success ? 'text-green-700' : 'text-red-700'
          }`}>
            {message}
          </p>

          {/* Success Details */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              {paymentType === 'full' ? (
                <ul className="text-sm text-green-800 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Đã thanh toán toàn bộ 100% giá trị đơn hàng
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Booking của bạn đã được xác nhận
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Bạn có thể nhận phòng vào ngày check-in
                  </li>
                </ul>
              ) : (
                <ul className="text-sm text-green-800 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Tiền đặt cọc đã được thanh toán
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Booking của bạn đã được xác nhận
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Vui lòng thanh toán phần còn lại khi nhận phòng
                  </li>
                </ul>
              )}
            </div>
          )}

          {/* Failed Details */}
          {!success && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 mb-2">
                <strong>Một số lý do có thể xảy ra:</strong>
              </p>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>Số dư tài khoản không đủ</li>
                <li>Thông tin thẻ không hợp lệ</li>
                <li>Giao dịch bị từ chối bởi ngân hàng</li>
                <li>Hết thời gian thanh toán</li>
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleBackToBooking}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại chi tiết booking
            </button>

            {!success && bookingId && (
              <button
                onClick={() => navigate(`/payment/${bookingId}`)}
                className="flex-1 px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-semibold"
              >
                Thử lại
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VNPayReturnPage;
