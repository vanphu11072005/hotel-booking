import React, { useState } from 'react';
import { Search, FileText, DollarSign, CreditCard, Printer, CheckCircle } from 'lucide-react';
import { bookingService, Booking } from '../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../components/common/Loading';

interface ServiceItem {
  service_name: string;
  quantity: number;
  price: number;
  total: number;
}

const CheckOutPage: React.FC = () => {
  const [bookingNumber, setBookingNumber] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'credit_card'>('cash');
  const [discount, setDiscount] = useState(0);
  const [showInvoice, setShowInvoice] = useState(false);

  const handleSearch = async () => {
    if (!bookingNumber.trim()) {
      toast.error('Vui lòng nhập mã đặt phòng');
      return;
    }

    try {
      setSearching(true);
      const response = await bookingService.checkBookingByNumber(bookingNumber);
      const foundBooking = response.data.booking;
      
      if (foundBooking.status !== 'checked_in') {
        toast.warning('Chỉ check-out được cho đặt phòng đã check-in');
      }
      
      setBooking(foundBooking);
      
      // Mock services data - trong thực tế sẽ fetch từ API
      setServices([
        { service_name: 'Giặt ủi', quantity: 2, price: 50000, total: 100000 },
        { service_name: 'Minibar', quantity: 1, price: 150000, total: 150000 },
      ]);
      
      toast.success('Tìm thấy đặt phòng');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không tìm thấy đặt phòng');
      setBooking(null);
    } finally {
      setSearching(false);
    }
  };

  const calculateRoomFee = () => {
    if (!booking) return 0;
    return booking.total_price || 0;
  };

  const calculateServiceFee = () => {
    return services.reduce((sum, service) => sum + service.total, 0);
  };

  const calculateAdditionalFee = () => {
    // Phụ phí từ check-in (trẻ em, extra person)
    return 0; // Trong thực tế sẽ lấy từ booking data
  };

  const calculateDeposit = () => {
    // Tiền đặt cọc đã thanh toán
    return booking?.total_price ? booking.total_price * 0.3 : 0;
  };

  const calculateSubtotal = () => {
    return calculateRoomFee() + calculateServiceFee() + calculateAdditionalFee();
  };

  const calculateDiscount = () => {
    return discount;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const calculateRemaining = () => {
    return calculateTotal() - calculateDeposit();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleCheckOut = async () => {
    if (!booking) return;

    if (calculateRemaining() < 0) {
      toast.error('Số tiền hoàn lại không hợp lệ');
      return;
    }

    try {
      setLoading(true);
      
      // Cập nhật trạng thái booking
      await bookingService.updateBooking(booking.id, {
        status: 'checked_out',
      } as any);

      // Tạo payment record (nếu cần)
      // await paymentService.createPayment({...});

      toast.success('Check-out thành công');
      setShowInvoice(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi check-out');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const resetForm = () => {
    setBooking(null);
    setBookingNumber('');
    setServices([]);
    setDiscount(0);
    setPaymentMethod('cash');
    setShowInvoice(false);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Check-out</h1>
          <p className="text-gray-500 mt-1">Quy trình thanh toán và trả phòng</p>
        </div>
      </div>

      {/* Search Booking */}
      {!showInvoice && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">1. Tìm kiếm đặt phòng</h2>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={bookingNumber}
                onChange={(e) => setBookingNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Nhập mã đặt phòng hoặc số phòng"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              {searching ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>
          </div>
        </div>
      )}

      {/* Invoice */}
      {booking && !showInvoice && (
        <>
          {/* Booking Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">2. Thông tin đặt phòng</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đặt phòng:</span>
                  <span className="font-semibold">{booking.booking_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Khách hàng:</span>
                  <span className="font-semibold">{booking.user?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số phòng:</span>
                  <span className="font-semibold">{booking.room?.room_number}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span>{booking.check_in_date ? new Date(booking.check_in_date).toLocaleDateString('vi-VN') : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span>{booking.check_out_date ? new Date(booking.check_out_date).toLocaleDateString('vi-VN') : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số đêm:</span>
                  <span>
                    {booking.check_in_date && booking.check_out_date
                      ? Math.ceil((new Date(booking.check_out_date).getTime() - new Date(booking.check_in_date).getTime()) / (1000 * 60 * 60 * 24))
                      : 0} đêm
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bill Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              3. Chi tiết hóa đơn
            </h2>
            
            {/* Room Fee */}
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Phí phòng</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span>{booking.room?.room_type?.name || 'Phòng'}</span>
                  <span className="font-semibold">{formatCurrency(calculateRoomFee())}</span>
                </div>
              </div>
            </div>

            {/* Service Fee */}
            {services.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Dịch vụ sử dụng</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  {services.map((service, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {service.service_name} (x{service.quantity})
                      </span>
                      <span>{formatCurrency(service.total)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-200 flex justify-between font-medium">
                    <span>Tổng dịch vụ:</span>
                    <span>{formatCurrency(calculateServiceFee())}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Fee */}
            {calculateAdditionalFee() > 0 && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Phụ phí</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span>Phụ phí thêm người/trẻ em</span>
                    <span className="font-semibold">{formatCurrency(calculateAdditionalFee())}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Discount */}
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Giảm giá</h3>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  placeholder="Nhập số tiền giảm"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="border-t-2 border-gray-300 pt-4 space-y-2">
              <div className="flex justify-between text-lg">
                <span>Tạm tính:</span>
                <span className="font-semibold">{formatCurrency(calculateSubtotal())}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Giảm giá:</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-blue-600">
                <span>Tổng cộng:</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Đã đặt cọc:</span>
                <span>-{formatCurrency(calculateDeposit())}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-green-600 pt-2 border-t border-gray-200">
                <span>Còn thanh toán:</span>
                <span>{formatCurrency(calculateRemaining())}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              4. Phương thức thanh toán
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <DollarSign className="w-8 h-8 mx-auto mb-2" />
                <div className="font-medium">Tiền mặt</div>
              </button>
              <button
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <CreditCard className="w-8 h-8 mx-auto mb-2" />
                <div className="font-medium">Chuyển khoản</div>
              </button>
              <button
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  paymentMethod === 'credit_card'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <CreditCard className="w-8 h-8 mx-auto mb-2" />
                <div className="font-medium">Thẻ tín dụng</div>
              </button>
            </div>
          </div>

          {/* Action */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Xác nhận check-out</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Tổng thanh toán: <span className="font-bold text-green-600 text-lg">{formatCurrency(calculateRemaining())}</span>
                </p>
              </div>
              <button
                onClick={handleCheckOut}
                disabled={booking.status !== 'checked_in'}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Xác nhận thanh toán & Check-out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Invoice Display */}
      {showInvoice && booking && (
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">HÓA ĐƠN THANH TOÁN</h2>
            <p className="text-gray-600 mt-1">Check-out thành công</p>
          </div>

          <div className="border-t-2 border-b-2 border-gray-300 py-6 mb-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Mã đặt phòng:</p>
                <p className="font-semibold">{booking.booking_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày check-out:</p>
                <p className="font-semibold">{new Date().toLocaleString('vi-VN')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Khách hàng:</p>
                <p className="font-semibold">{booking.user?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phương thức:</p>
                <p className="font-semibold">
                  {paymentMethod === 'cash' ? 'Tiền mặt' : paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : 'Thẻ tín dụng'}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-xl font-bold text-green-600 mb-4">
              <span>Tổng thanh toán:</span>
              <span>{formatCurrency(calculateRemaining())}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handlePrintInvoice}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              In hóa đơn
            </button>
            <button
              onClick={resetForm}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Hoàn tất
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!booking && !searching && !showInvoice && (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có đặt phòng nào được chọn
          </h3>
          <p className="text-gray-600">
            Vui lòng nhập mã đặt phòng để bắt đầu quy trình check-out
          </p>
        </div>
      )}
    </div>
  );
};

export default CheckOutPage;
