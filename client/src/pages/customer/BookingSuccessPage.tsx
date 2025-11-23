import React, { useState, useEffect } from 'react';
import { 
  useParams, 
  useNavigate, 
  Link 
} from 'react-router-dom';
import {
  CheckCircle,
  Home,
  ListOrdered,
  Calendar,
  Users,
  CreditCard,
  Mail,
  Phone,
  User,
  FileText,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getBookingById,
  type Booking,
} from '../../services/api/bookingService';
import Loading from '../../components/common/Loading';

const BookingSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedBookingNumber, setCopiedBookingNumber] = 
    useState(false);

  useEffect(() => {
    if (id) {
      fetchBookingDetails(Number(id));
    }
  }, [id]);

  const fetchBookingDetails = async (bookingId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getBookingById(bookingId);

      if (
        response.success && 
        response.data?.booking
      ) {
        const bookingData = response.data.booking;
        
        // Parse guest_info if it's a JSON string
        if (bookingData.guest_info && typeof bookingData.guest_info === 'string') {
          try {
            bookingData.guest_info = JSON.parse(bookingData.guest_info);
          } catch (e) {
            console.error('Error parsing guest_info:', e);
            bookingData.guest_info = undefined;
          }
        }
        
        console.log('📋 Booking data:', bookingData);
        console.log('👤 Guest info:', bookingData.guest_info);
        setBooking(bookingData);

        // Don't redirect on success page - this is the confirmation page
        // User already completed the payment notification
      } else {
        throw new Error(
          'Không thể tải thông tin đặt phòng'
        );
      }
    } catch (err: any) {
      console.error('Error fetching booking:', err);
      const message =
        err.response?.data?.message ||
        'Không thể tải thông tin đặt phòng';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'checked_in':
        return 'bg-blue-100 text-blue-800';
      case 'checked_out':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Chờ xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      case 'checked_in':
        return 'Đã nhận phòng';
      case 'checked_out':
        return 'Đã trả phòng';
      default:
        return status;
    }
  };

  const copyBookingNumber = async () => {
    if (!booking?.booking_number) return;

    try {
      await navigator.clipboard.writeText(
        booking.booking_number
      );
      setCopiedBookingNumber(true);
      toast.success('Đã sao chép mã đặt phòng');
      setTimeout(() => setCopiedBookingNumber(false), 2000);
    } catch (err) {
      toast.error('Không thể sao chép');
    }
  };



  if (loading) {
    return <Loading fullScreen text="Đang tải..." />;
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div
            className="bg-red-50 border border-red-200 
              rounded-lg p-8 text-center"
          >
            <AlertCircle
              className="w-12 h-12 text-red-500 
                mx-auto mb-3"
            />
            <p className="text-red-700 font-medium mb-4">
              {error || 'Không tìm thấy đặt phòng'}
            </p>
            <button
              onClick={() => navigate('/rooms')}
              className="inline-flex items-center gap-2 bg-indigo-600 
            text-white px-3 py-2 rounded-md hover:bg-indigo-700 
            disabled:bg-gray-400 mb-6 transition-colors"
            >
              Quay lại danh sách phòng
            </button>
          </div>
        </div>
      </div>
    );
  }

  const room = booking.room;
  const roomType = room?.room_type;

  // Calculate number of nights
  const numberOfNights = Math.ceil(
    (new Date(booking.check_out_date).getTime() - 
      new Date(booking.check_in_date).getTime()) / 
      (1000 * 60 * 60 * 24)
  );

  // Calculate room price and services price
  const roomPrice = roomType?.base_price || room?.price || 0;
  const roomTotalPrice = numberOfNights * roomPrice;
  const servicesTotal = booking.service_usages?.reduce(
    (sum, usage) => sum + parseFloat(usage.total_price.toString()),
    0
  ) || 0;

  // Resolve room image with SERVER_URL
  const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000')
    .replace(/\/api\/?$/i, '')
    .replace(/\/$/, '');
  
  const PLACEHOLDER = '/images/room-placeholder.jpg';
  
  const resolveRoomImage = (): string => {
    const imagesField = room?.images as any;
    let firstImage: string | undefined;

    if (Array.isArray(imagesField)) {
      firstImage = imagesField[0];
    } else if (typeof imagesField === 'string') {
      try {
        const parsed = JSON.parse(imagesField);
        if (Array.isArray(parsed) && parsed.length > 0) {
          firstImage = parsed[0];
        } else if (typeof parsed === 'string') {
          firstImage = parsed;
        }
      } catch {
        const s = imagesField as string;
        if (s.includes(',')) {
          firstImage = s.split(',')[0].trim();
        } else {
          firstImage = s.trim();
        }
      }
    }

    if (firstImage) {
      if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
        return firstImage;
      } else if (firstImage.startsWith('/uploads')) {
        return `${SERVER_URL}${firstImage}`;
      } else if (firstImage.startsWith('/')) {
        return firstImage;
      } else {
        return `${SERVER_URL}/uploads/rooms/${firstImage}`;
      }
    }
    
    return PLACEHOLDER;
  };

  const roomImageSrc = resolveRoomImage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Success Header with Gradient */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 mb-6 text-center text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="w-14 h-14 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold mb-2">
              🎉 Tạo đơn đặt phòng thành công!
            </h1>
            <p className="text-green-50 text-lg mb-6">
              Cảm ơn bạn đã đặt phòng tại khách sạn của chúng tôi
            </p>

            {/* Booking Number Card */}
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-8 py-4 rounded-xl border-2 border-white/30">
              <div className="text-left">
                <p className="text-green-100 text-sm font-medium">Mã đặt phòng</p>
                <p className="text-2xl font-bold tracking-wider">
                  {booking.booking_number}
                </p>
              </div>
              <button
                onClick={copyBookingNumber}
                className="ml-2 p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Sao chép mã"
              >
                {copiedBookingNumber ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Status Badge */}
            <div className="mt-6">
              <span className={`inline-block px-6 py-2 rounded-full text-sm font-bold shadow-lg ${getStatusColor(booking.status)}`}>
                {getStatusText(booking.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Left Column - Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            
        {/* Booking Details Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              📋 Chi tiết đặt phòng
            </h2>
            <span className="text-sm text-gray-500">
              ID: #{booking.id}
            </span>
          </div>

          <div className="space-y-6">
            {/* Room Information with Image */}
            {roomType && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-start gap-4">
                  <img
                    src={roomImageSrc}
                    alt={roomType?.name || 'Room'}
                    className="w-32 h-32 object-cover rounded-xl shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER;
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 mb-1">
                          {roomType.name}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-bold text-indigo-600">
                        {formatPrice(roomPrice)}
                      </span>
                      <span className="text-sm text-gray-500">/đêm</span>
                    </div>
                    {roomType.capacity && (
                      <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Sức chứa: {roomType.capacity} người
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Check-in/Check-out Timeline */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">Nhận phòng</p>
                      <p className="font-bold text-gray-900">
                        {new Date(booking.check_in_date).toLocaleDateString('vi-VN', { 
                          day: '2-digit', 
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Từ 14:00</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full font-bold text-lg">
                    {numberOfNights} đêm
                  </div>
                  <div className="w-full h-1 bg-gradient-to-r from-green-200 via-indigo-200 to-red-200 rounded-full mt-2"></div>
                </div>

                <div className="text-center md:text-right">
                  <div className="flex items-center justify-center md:justify-end gap-2 mb-2">
                    <div className="md:order-2">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-red-600" />
                      </div>
                    </div>
                    <div className="md:order-1">
                      <p className="text-xs text-gray-500 uppercase font-medium">Trả phòng</p>
                      <p className="font-bold text-gray-900">
                        {new Date(booking.check_out_date).toLocaleDateString('vi-VN', { 
                          day: '2-digit', 
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Trước 12:00</p>
                </div>
              </div>
            </div>

            {/* Guest Info */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-gray-600 font-medium">Số khách</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {booking.num_guests || booking.guest_count}
              </p>
            </div>

            {/* Special Requests */}
            {booking.special_requests && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900 mb-1">
                      Yêu cầu đặc biệt
                    </p>
                    <p className="text-sm text-yellow-800">
                      {booking.special_requests}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Services Used */}
            {booking.service_usages && booking.service_usages.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                  <span>🛎️</span> Dịch vụ đã đặt
                </h3>
                <div className="space-y-2">
                  {booking.service_usages.map((usage: any, index: number) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {usage.service?.name || 'Dịch vụ'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {usage.quantity} x {formatPrice(parseFloat(usage.unit_price.toString()))}
                        </p>
                      </div>
                      <p className="font-bold text-indigo-600">
                        {formatPrice(parseFloat(usage.total_price.toString()))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="border-t pt-4 space-y-3">
              <h3 className="font-bold text-lg text-gray-900 mb-3">
                💰 Chi tiết thanh toán
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Tiền phòng ({numberOfNights} đêm x {formatPrice(roomPrice)})
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(roomTotalPrice)}
                  </span>
                </div>
                
                {booking.service_usages && booking.service_usages.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Dịch vụ bổ sung:</p>
                    {booking.service_usages.map((usage: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm pl-2">
                        <span className="text-gray-600">
                          • {usage.service?.name || 'Dịch vụ'} ({usage.quantity} x {formatPrice(parseFloat(usage.unit_price.toString()))})
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatPrice(parseFloat(usage.total_price.toString()))}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-300">
                      <span className="text-gray-700">Tổng dịch vụ:</span>
                      <span className="text-gray-900">
                        {formatPrice(servicesTotal)}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center bg-indigo-50 rounded-lg p-3">
                  <span className="text-lg font-bold text-gray-900">
                    Tổng thanh toán
                  </span>
                  <span className="text-3xl font-bold text-indigo-600">
                    {formatPrice(booking.total_price)}
                  </span>
                </div>

                {/* Payment Method */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                    <p className="text-base text-gray-700 font-medium">Trạng thái thanh toán</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 mb-2">
                    {booking.payment_method === 'cash'
                      ? 'Thanh toán khi nhận phòng'
                      : booking.payment_method === 'vnpay'
                      ? 'VNPay'
                      : 'Chuyển khoản ngân hàng'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Guest Information */}
            {booking.guest_info && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Thông tin người đặt phòng
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase font-medium mb-1">Họ và tên</p>
                      <p className="font-bold text-gray-900 text-base">
                        {booking.guest_info.full_name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase font-medium mb-1">Email</p>
                      <p className="font-medium text-gray-900 text-sm break-all">
                        {booking.guest_info.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase font-medium mb-1">Số điện thoại</p>
                      <p className="font-bold text-gray-900 text-base">
                        {booking.guest_info.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
        
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/bookings"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <ListOrdered className="w-6 h-6" />
            Xem đơn đặt phòng
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Home className="w-6 h-6" />
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
