import React, { useState, useEffect } from 'react';
import { Search, FileText, DollarSign, CreditCard, Printer, CheckCircle, Users, Phone, Mail, User, Hotel, Calendar } from 'lucide-react';
import { bookingService, Booking } from '../../services/api';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import Loading from '../../components/common/Loading';

const CheckOutPage: React.FC = () => {
  const location = useLocation();
  const [bookingNumber, setBookingNumber] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'credit_card'>('cash');
  const [discount, setDiscount] = useState(0);
  const [showInvoice, setShowInvoice] = useState(false);

  // Bookings list states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Load bookings when component mounts
  useEffect(() => {
    fetchBookings();
  }, []);

  // Auto-load booking from check-in page
  useEffect(() => {
    if (location.state?.booking) {
      const checkedInBooking = location.state.booking;
      setBooking(checkedInBooking);
      setBookingNumber(checkedInBooking.booking_number);
      toast.success('Đã tải thông tin đặt phòng từ check-in');
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  }, [location.state]);

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const today = new Date().toISOString().split('T')[0];
      const response = await bookingService.getAllBookings({
        status: 'checked_in',
        check_out_date: today,
        page: 1,
        limit: 100,
      });
      setBookings(response.data.bookings);
    } catch (error: any) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleSelectBooking = async (selectedBooking: Booking) => {
    try {
      // Use selected booking data directly (already has service_usages from getAllBookings)
      setBooking(selectedBooking);
      setBookingNumber(selectedBooking.booking_number);
      
      // Scroll to booking info section
      window.scrollTo({ top: 300, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Error loading booking details:', error);
      toast.error('Không thể tải thông tin đặt phòng');
    }
  };

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
    
    // For multi-room bookings, calculate total from all rooms
    if (booking.booking_rooms && booking.booking_rooms.length > 0) {
      const nights = booking.check_in_date && booking.check_out_date
        ? Math.ceil((new Date(booking.check_out_date).getTime() - new Date(booking.check_in_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      return booking.booking_rooms.reduce((sum: number, bookingRoom: any) => {
        const roomPrice = bookingRoom.room.room_type?.base_price || 0;
        return sum + (roomPrice * nights);
      }, 0);
    }
    
    return booking.total_price || 0;
  };

  const calculateServiceFee = () => {
    if (!booking?.service_usages) return 0;
    return booking.service_usages.reduce((sum, usage) => {
      const price = typeof usage.total_price === 'string' 
        ? parseFloat(usage.total_price) 
        : (usage.total_price || 0);
      return sum + price;
    }, 0);
  };

  const calculateAdditionalFee = () => {
    // Phụ phí từ check-in (trẻ em, extra person)
    return 0; // Trong thực tế sẽ lấy từ booking data
  };

  const calculateDeposit = () => {
    // Tiền đặt cọc đã thanh toán
    if (!booking) return 0;
    
    // Nếu thanh toán tiền mặt thì chỉ đặt cọc 30%
    if (booking.payment_method === 'cash') {
      return booking.total_price ? booking.total_price * 0.3 : 0;
    }
    
    // Nếu thanh toán online thì đã thanh toán toàn bộ
    return booking.total_price || 0;
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
    
    // Validation: Check if total is valid
    const total = calculateTotal();
    if (total < 0 || isNaN(total)) {
      toast.error('Số tiền không hợp lệ. Vui lòng kiểm tra lại.');
      return;
    }

    try {
      setLoading(true);
      
      // Cập nhật trạng thái booking sang checked_out
      try {
        await bookingService.updateBooking(booking.id, {
          status: 'checked_out',
        } as any);
      } catch (updateError: any) {
        // Handle specific errors
        const status = updateError.response?.status;
        const message = updateError.response?.data?.message;
        
        if (status === 404) {
          throw new Error('Không tìm thấy booking hoặc endpoint không tồn tại. Vui lòng liên hệ admin.');
        } else if (status === 403) {
          throw new Error('Bạn không có quyền thực hiện check-out. Vui lòng đăng nhập với tài khoản staff.');
        } else if (status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (message) {
          throw new Error(message);
        } else {
          throw updateError;
        }
      }

      toast.success('Check-out thành công!');
      setShowInvoice(true);
      
      // Reload bookings list to remove checked-out booking
      fetchBookings();
    } catch (error: any) {
      console.error('Check-out error:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Có lỗi xảy ra khi check-out';
      toast.error(errorMessage);
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

      {/* Today's Checked-In Bookings */}
      {!showInvoice && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Đặt phòng cần check-out hôm nay</h2>
          {loadingBookings ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Đang tải danh sách...</p>
            </div>
          ) : bookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map((bookingItem, index) => (
                <div
                  key={`checkout-booking-${bookingItem.id}-${index}`}
                  onClick={() => handleSelectBooking(bookingItem)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    booking?.id === bookingItem.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{bookingItem.booking_number}</p>
                      <p className="text-sm text-gray-600">{bookingItem.user?.full_name}</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      Checked In
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Hotel className="w-4 h-4 text-blue-600" />
                      <span>Phòng: {bookingItem.room?.room_number || 'Chưa gán'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <User className="w-4 h-4 text-purple-600" />
                      <span>{bookingItem.guest_count} khách</span>
                    </div>
                    {bookingItem.room?.room_type?.name && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>{bookingItem.room.room_type.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Check-out: {bookingItem.check_out_date ? new Date(bookingItem.check_out_date).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Không có đặt phòng nào cần check-out hôm nay</p>
            </div>
          )}
        </div>
      )}

      {/* Invoice */}
      {booking && !showInvoice && (
        <>
          {/* Booking Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">2. Thông tin đặt phòng</h2>
            
            {/* General Information */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đặt phòng:</span>
                  <span className="font-semibold">{booking.booking_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Khách hàng:</span>
                  <span className="font-semibold">{booking.guest_info?.full_name || booking.user?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số điện thoại:</span>
                  <span className="font-semibold">{booking.guest_info?.phone || booking.user?.phone || 'N/A'}</span>
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

            {/* Multi-room Information */}
            {booking?.booking_rooms && booking.booking_rooms.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700 mb-3">Thông tin các phòng:</h3>
                {booking.booking_rooms.map((bookingRoom: any, index: number) => (
                  <div key={`booking-room-${bookingRoom.room.id}-${index}`} className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          Phòng {bookingRoom.room.room_number}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {bookingRoom.room.room_type?.name} - {formatCurrency(bookingRoom.room.room_type?.base_price || 0)}/đêm
                        </p>
                      </div>
                    </div>
                    
                    {bookingRoom.services && bookingRoom.services.length > 0 && (
                      <div className="mt-2 text-sm">
                        <p className="text-gray-600">Dịch vụ đặt trước:</p>
                        <ul className="list-disc list-inside text-gray-700 ml-2">
                          {bookingRoom.services.map((service: any, sIdx: number) => (
                            <li key={`service-${bookingRoom.room.id}-${service.id}-${sIdx}`}>{service.service_name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {bookingRoom.notes && (
                      <div className="mt-2 text-sm">
                        <p className="text-gray-600">Ghi chú:</p>
                        <p className="text-gray-700 italic">{bookingRoom.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center gap-3">
                  <div>
                    <h4 className="font-bold text-gray-900">
                      Phòng {booking.room?.room_number}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {booking.room?.room_type?.name} - {formatCurrency(booking.room?.room_type?.base_price || 0)}/đêm
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Special requests */}
            {booking.special_requests && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Yêu cầu đặc biệt:</p>
                <p className="text-sm text-gray-600 mt-1">{booking.special_requests}</p>
              </div>
            )}
          </div>

          {/* Guest Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Thông tin khách ở
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Họ tên khách chính</p>
                  <p className="font-semibold text-gray-900">{booking.guest_info?.full_name || booking.user?.full_name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Số điện thoại</p>
                  <p className="font-semibold text-gray-900">{booking.guest_info?.phone || booking.user?.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{booking.guest_info?.email || booking.user?.email || 'N/A'}</p>
                </div>
              </div>
              {booking?.booking_rooms && booking.booking_rooms.length > 0 && (
                <div className="col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Số lượng phòng:</p>
                  <p className="font-semibold text-gray-900">{booking.booking_rooms.length} phòng</p>
                </div>
              )}
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
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                {booking?.booking_rooms && booking.booking_rooms.length > 0 ? (
                  // Multi-room display
                  <>
                    {booking.booking_rooms.map((bookingRoom: any, index: number) => {
                      const nights = booking.check_in_date && booking.check_out_date
                        ? Math.ceil((new Date(booking.check_out_date).getTime() - new Date(booking.check_in_date).getTime()) / (1000 * 60 * 60 * 24))
                        : 0;
                      const roomPrice = bookingRoom.room.room_type?.base_price || 0;
                      const totalPrice = roomPrice * nights;
                      
                      return (
                        <div key={`room-price-${bookingRoom.room.id}-${index}`} className="flex justify-between text-sm">
                          <span>
                            Phòng {bookingRoom.room.room_number} - {bookingRoom.room.room_type?.name} ({nights} đêm)
                          </span>
                          <span>{formatCurrency(totalPrice)}</span>
                        </div>
                      );
                    })}
                    <div className="pt-2 border-t border-gray-200 flex justify-between font-semibold">
                      <span>Tổng phí phòng:</span>
                      <span>{formatCurrency(calculateRoomFee())}</span>
                    </div>
                  </>
                ) : (
                  // Single room display
                  <div className="flex justify-between">
                    <span>{booking.room?.room_type?.name || 'Phòng'}</span>
                    <span className="font-semibold">{formatCurrency(calculateRoomFee())}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Service Fee */}
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Dịch vụ sử dụng</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {booking?.service_usages && booking.service_usages.length > 0 ? (
                  <div className="space-y-2">
                    {booking.service_usages.map((usage, index) => (
                      <div key={`usage-${usage.id || index}-${index}`} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{usage.service?.name || 'Dịch vụ'}</p>
                          <p className="text-xs text-gray-500">Số lượng: {usage.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(usage.total_price)}</p>
                      </div>
                    ))}
                    <div className="pt-3 mt-2 border-t-2 border-gray-300 flex justify-between font-semibold text-base">
                      <span className="text-gray-900">Tổng dịch vụ:</span>
                      <span className="text-blue-600">{formatCurrency(calculateServiceFee())}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="inline-block p-3 bg-gray-100 rounded-full mb-2">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Chưa có dịch vụ nào được sử dụng</p>
                    <p className="text-xs text-gray-400 mt-1">Dịch vụ được thêm trong quá trình check-in</p>
                  </div>
                )}
              </div>
            </div>

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
                <span>
                  {booking?.payment_method === 'cash' ? 'Đã đặt cọc (30%):' : 'Đã thanh toán online:'}
                </span>
                <span>-{formatCurrency(calculateDeposit())}</span>
              </div>
              <div className={`flex justify-between text-2xl font-bold pt-2 border-t border-gray-200 ${
                calculateRemaining() > 0 ? 'text-green-600' : 'text-blue-600'
              }`}>
                <span>{calculateRemaining() > 0 ? 'Còn thanh toán:' : 'Đã thanh toán đủ'}</span>
                <span>{formatCurrency(Math.max(0, calculateRemaining()))}</span>
              </div>
              {booking?.payment_method === 'cash' && calculateRemaining() > 0 && (
                <p className="text-sm text-orange-600 italic">
                  ⚠️ Khách hàng cần thanh toán thêm số tiền còn lại khi check-out
                </p>
              )}
              {booking?.payment_method !== 'cash' && (
                <p className="text-sm text-green-600 italic">
                  ✅ Khách hàng đã thanh toán toàn bộ qua {booking?.payment_method === 'vnpay' ? 'VNPay' : 'chuyển khoản'}
                </p>
              )}
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
        <div className="bg-white p-8 rounded-lg shadow-lg print:shadow-none">
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-gray-200">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">KHÁCH SẠN</h1>
            <p className="text-sm text-gray-600">Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</p>
            <p className="text-sm text-gray-600">Điện thoại: (028) 1234 5678 | Email: info@hotel.com</p>
            <h2 className="text-2xl font-bold text-gray-900 mt-4">HÓA ĐƠN THANH TOÁN</h2>
            <p className="text-sm text-green-600 font-medium mt-1">✓ Check-out thành công</p>
          </div>

          {/* Customer & Booking Info */}
          <div className="grid grid-cols-2 gap-8 mb-6 pb-6 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Thông tin khách hàng</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Họ và tên:</p>
                  <p className="font-semibold text-gray-900">{booking.user?.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email:</p>
                  <p className="text-sm text-gray-700">{booking.user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Số điện thoại:</p>
                  <p className="text-sm text-gray-700">{booking.user?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Thông tin đặt phòng</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Mã đặt phòng:</p>
                  <p className="font-semibold text-blue-600">{booking.booking_number}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Check-in:</p>
                    <p className="text-sm text-gray-700">
                      {booking.check_in_date ? new Date(booking.check_in_date).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Check-out:</p>
                    <p className="text-sm text-gray-700">
                      {new Date().toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Số đêm:</p>
                  <p className="text-sm font-medium text-gray-900">
                    {booking.check_in_date && booking.check_out_date
                      ? Math.ceil((new Date(booking.check_out_date).getTime() - new Date(booking.check_in_date).getTime()) / (1000 * 60 * 60 * 24))
                      : 0} đêm
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Room Details */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Chi tiết phòng</h3>
            {booking.booking_rooms && booking.booking_rooms.length > 0 ? (
              <div className="space-y-3">
                {booking.booking_rooms.map((bookingRoom: any, index: number) => {
                  const nights = booking.check_in_date && booking.check_out_date
                    ? Math.ceil((new Date(booking.check_out_date).getTime() - new Date(booking.check_in_date).getTime()) / (1000 * 60 * 60 * 24))
                    : 0;
                  const roomPrice = bookingRoom.room.room_type?.base_price || 0;
                  const totalPrice = roomPrice * nights;
                  
                  return (
                    <div key={`invoice-room-${index}`} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            Phòng {bookingRoom.room.room_number} - {bookingRoom.room.room_type?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(roomPrice)} × {nights} đêm
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">{formatCurrency(totalPrice)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Phòng {booking.room?.room_number} - {booking.room?.room_type?.name}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatCurrency(calculateRoomFee())}</p>
                </div>
              </div>
            )}
          </div>

          {/* Services */}
          {booking.service_usages && booking.service_usages.length > 0 && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Dịch vụ sử dụng</h3>
              <div className="space-y-2">
                {booking.service_usages.map((usage: any, index: number) => (
                  <div key={`invoice-service-${index}`} className="flex justify-between items-center py-2">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{usage.service?.name || 'Dịch vụ'}</p>
                      <p className="text-xs text-gray-500">Số lượng: {usage.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(usage.total_price)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="mb-6 pb-6 border-b-2 border-gray-300">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tổng phí phòng:</span>
                <span className="font-medium text-gray-900">{formatCurrency(calculateRoomFee())}</span>
              </div>
              {calculateServiceFee() > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tổng phí dịch vụ:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(calculateServiceFee())}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium text-gray-900">{formatCurrency(calculateSubtotal())}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Giảm giá:</span>
                  <span className="font-medium">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Tổng cộng:</span>
                <span className="text-gray-900">{formatCurrency(calculateTotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Đã thanh toán (đặt cọc):</span>
                <span className="font-medium text-gray-900">{formatCurrency(calculateDeposit())}</span>
              </div>
            </div>
          </div>

          {/* Total to Pay */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {calculateRemaining() > 0 ? 'Số tiền cần thanh toán:' : calculateRemaining() < 0 ? 'Số tiền hoàn lại:' : 'Đã thanh toán đủ'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Phương thức: {paymentMethod === 'cash' ? 'Tiền mặt' : paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : 'Thẻ tín dụng'}
                  </p>
                </div>
                <p className={`text-3xl font-bold ${calculateRemaining() > 0 ? 'text-green-600' : calculateRemaining() < 0 ? 'text-blue-600' : 'text-gray-900'}`}>
                  {formatCurrency(Math.abs(calculateRemaining()))}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 mb-6 pb-6 border-b border-gray-200">
            <p>Cảm ơn quý khách đã sử dụng dịch vụ của khách sạn!</p>
            <p className="mt-1">Hẹn gặp lại quý khách trong những lần tiếp theo.</p>
            <p className="mt-2 text-gray-400">
              In lúc: {new Date().toLocaleString('vi-VN')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 print:hidden">
            <button
              onClick={handlePrintInvoice}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-5 h-5" />
              In hóa đơn
            </button>
            <button
              onClick={resetForm}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              Hoàn tất - Quay lại
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
