import React, { useState, useEffect } from 'react';
import { 
  useParams, 
  useNavigate, 
  Link 
} from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Users,
  CreditCard,
  User,
  Mail,
  Phone,
  FileText,
  Building2,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  DoorOpen,
  DoorClosed,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getBookingById, cancelBooking } from '../../services/api/bookingService';
import type { Booking } from '../../types/booking';
import useAuthStore from '../../store/useAuthStore';
import Loading from '../../components/common/Loading';
import PaymentStatusBadge from 
  '../../components/common/PaymentStatusBadge';
import SlideOver from '../../components/common/SlideOver';
import CancelBookingPanel from '../../components/booking/CancelBookingPanel';

const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [booking, setBooking] = useState<Booking | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [copiedBookingNumber, setCopiedBookingNumber] = 
    useState(false);
  const [showCancelPanel, setShowCancelPanel] = 
    useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error(
        'Vui lòng đăng nhập để xem chi tiết đặt phòng'
      );
      navigate('/login', { 
        state: { from: `/bookings/${id}` } 
      });
    }
  }, [isAuthenticated, navigate, id]);

  // Fetch booking details
  useEffect(() => {
    if (id && isAuthenticated) {
      fetchBookingDetails(Number(id));
    }
  }, [id, isAuthenticated]);

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

  const handleOpenCancelPanel = () => {
    setShowCancelPanel(true);
  };

  const handleCloseCancelPanel = () => {
    setShowCancelPanel(false);
  };

  const handleCancelBooking = async (
    reason: string,
    details?: string
  ) => {
    if (!booking) return;

    try {
      setCancelling(true);

      const response = await cancelBooking(
        booking.id,
        reason,
        details
      );

      if (response.success) {
        toast.success(
          `✅ Đã hủy đặt phòng ${booking.booking_number} ` +
          `thành công!`
        );
        
        // Update local state with cancellation info
        setBooking((prev) =>
          prev
            ? { 
                ...prev, 
                status: 'cancelled',
                cancellation_reason: reason,
                cancellation_details: details,
                cancelled_at: new Date().toISOString()
              }
            : null
        );

        // Close panel
        handleCloseCancelPanel();
      } else {
        throw new Error(
          response.message || 
          'Không thể hủy đặt phòng'
        );
      }
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      const message =
        err.response?.data?.message ||
        'Không thể hủy đặt phòng. Vui lòng thử lại.';
      toast.error(message);
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800',
          text: 'Đang chờ xác nhận',
          description: 'Đơn đặt phòng đang chờ được xác nhận'
        };
      case 'confirmed':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800',
          text: 'Đã xác nhận',
          description: 'Đặt phòng thành công'
        };
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'bg-red-100 text-red-800',
          text: 'Đã hủy',
          description: 'Đơn đặt phòng đã bị hủy'
        };
      case 'checked_in':
        return {
          icon: DoorOpen,
          color: 'bg-blue-100 text-blue-800',
          text: 'Đã nhận phòng',
          description: 'Khách đã nhận phòng'
        };
      case 'checked_out':
        return {
          icon: DoorClosed,
          color: 'bg-gray-100 text-gray-800',
          text: 'Đã trả phòng',
          description: 'Khách đã trả phòng'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'bg-gray-100 text-gray-800',
          text: status,
          description: ''
        };
    }
  };

  const canCancelBooking = (booking: Booking) => {
    return (
      booking.status === 'pending' || 
      booking.status === 'confirmed'
    );
  };

  // Move hooks above early returns
  const room = booking?.room;
  const roomType = room?.room_type;
  
  // Get all rooms (from booking_rooms if available, fallback to single room)
  const bookingRooms = React.useMemo(() => {
    if (!booking) return [];
    return booking.booking_rooms && booking.booking_rooms.length > 0
      ? booking.booking_rooms
      : room ? [{ room, quantity: booking.room_quantity || 1 }] : [];
  }, [booking, room]);

  // Group rooms by room type
  const groupedRooms = React.useMemo(() => {
    if (!booking) return [];
    const groups: Record<string, { room: any, count: number }> = {};
    
    bookingRooms.forEach((br: any) => {
      const roomData = br.room || room;
      const roomTypeData = roomData?.room_type || roomType;
      const typeId = roomTypeData?.id || 'unknown';
      
      if (!groups[typeId]) {
        groups[typeId] = {
          room: roomData,
          count: 0
        };
      }
      // If quantity exists (fallback), use it. Otherwise count as 1 per entry.
      // Note: Backend removed quantity column, so for new bookings each entry is 1 room.
      const qty = br.quantity || 1; 
      groups[typeId].count += qty;
    });
    
    return Object.values(groups);
  }, [bookingRooms, room, roomType, booking]);

  if (loading) {
    return <Loading fullScreen text="Đang tải..." />;
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div
            className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700
              rounded-lg p-8 text-center"
          >
            <AlertCircle
              className="w-12 h-12 text-red-500 
                mx-auto mb-3"
            />
            <p className="text-red-700 dark:text-red-200 font-medium mb-4">
              {error || 'Không tìm thấy đặt phòng'}
            </p>
            <button
              onClick={() => navigate('/bookings')}
              className="inline-flex items-center gap-2 bg-indigo-600 
                text-white px-3 py-2 rounded-md hover:bg-indigo-700 
                disabled:bg-gray-400 mb-6 transition-colors"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;

  // Calculate number of nights
  const numberOfNights = Math.ceil(
    (new Date(booking.check_out_date).getTime() - 
      new Date(booking.check_in_date).getTime()) / 
      (1000 * 60 * 60 * 24)
  );

  // Calculate total room count
  const totalRoomCount = groupedRooms.reduce(
    (sum, group) => sum + group.count, 
    0
  );

  // Calculate room price and services price
  const roomTotalPrice = booking.total_price - (booking.service_usages?.reduce(
    (sum, usage) => sum + parseFloat(usage.total_price.toString()),
    0
  ) || 0); // Total price minus services
  const servicesTotal = booking.service_usages?.reduce(
    (sum, usage) => sum + parseFloat(usage.total_price.toString()),
    0
  ) || 0;

  // Server URL and placeholder for images
  const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000')
    .replace(/\/api\/?$/i, '')
    .replace(/\/$/, '');
  
  const PLACEHOLDER = '/images/room-placeholder.jpg';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 
      dark:bg-gradient-to-br dark:from-indigo-900 dark:via-indigo-800 dark:to-purple-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <Link
          to="/bookings"
          className="inline-flex items-center gap-2 bg-indigo-600 
            text-white px-4 py-2 rounded-lg hover:bg-indigo-700 
            mb-6 transition-colors shadow-md font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại danh sách</span>
        </Link>

        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 mb-6 text-center text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <StatusIcon className="w-11 h-11 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold mb-2">
              Chi tiết đặt phòng
            </h1>
            <p className="text-indigo-50 text-lg mb-6">
              Xem thông tin đầy đủ về đơn đặt phòng của bạn
            </p>

            {/* Booking Number Card */}
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-8 py-4 rounded-xl border-2 border-white/30 dark:bg-white/5">
              <div className="text-left">
                <p className="text-indigo-100 text-sm font-medium">Mã đặt phòng</p>
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
              <div className="inline-flex flex-col items-center">
                <span className={`inline-block px-6 py-2 rounded-full 
                  text-sm font-bold shadow-lg ${statusConfig.color}`}>
                  {statusConfig.text}
                </span>
                {statusConfig.description && (
                  <p className="text-sm text-white mt-1">
                    {statusConfig.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Left Column - Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            
        {/* Booking Details Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              📋 Chi tiết đặt phòng
            </h2>
            <span className="text-sm text-gray-500 dark:text-white">
              ID: #{booking.id}
            </span>
          </div>

          <div className="space-y-6">
            {/* Rooms Information */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 rounded-xl p-5 border border-indigo-100 dark:border-indigo-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                  Phòng đã đặt
                </h3>
                <div className="bg-indigo-600 text-white px-4 py-2 rounded-full font-bold">
                  {totalRoomCount} phòng
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-indigo-50">
                {groupedRooms.map((group: any, index: number) => {
                  const roomData = group.room;
                  const roomTypeData = roomData?.room_type || roomType;
                  const quantity = group.count;
                  
                  // Resolve image
                  const imagesField = roomTypeData?.images || roomData?.images as any;
                  let firstImage: string | undefined;
                  if (Array.isArray(imagesField)) {
                    firstImage = imagesField[0];
                  } else if (typeof imagesField === 'string') {
                    try {
                      const parsed = JSON.parse(imagesField);
                      if (Array.isArray(parsed) && parsed.length > 0) {
                        firstImage = parsed[0];
                      }
                    } catch {
                      firstImage = imagesField.split(',')[0]?.trim();
                    }
                  }
                  
                  let imageSrc = PLACEHOLDER;
                  if (firstImage) {
                    if (firstImage.startsWith('http')) {
                      imageSrc = firstImage;
                    } else if (firstImage.startsWith('/uploads')) {
                      imageSrc = `${SERVER_URL}${firstImage}`;
                    } else {
                      imageSrc = `${SERVER_URL}/uploads/rooms/${firstImage}`;
                    }
                  }

                  return (
                    <div key={index} className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start gap-4">
                        <img
                          src={imageSrc}
                          alt={roomTypeData?.name || 'Room'}
                          className="w-24 h-24 object-cover rounded-lg shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = PLACEHOLDER;
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                                {roomTypeData?.name || 'Phòng'}
                              </h4>
                            </div>
                            <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold text-sm">
                              × {quantity}
                            </div>
                          </div>
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-xl font-bold text-indigo-600">
                              {formatPrice(roomTypeData?.base_price || 0)}
                            </span>
                            <span className="text-xs text-gray-500">/đêm</span>
                          </div>
                          {roomTypeData?.capacity && (
                            <p className="text-sm text-gray-600 dark:text-white mt-1 flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              Tối đa {roomTypeData.capacity} người
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Check-in/Check-out Timeline */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white uppercase font-medium">Nhận phòng</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {new Date(booking.check_in_date).toLocaleDateString('vi-VN', { 
                          day: '2-digit', 
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-white">Từ 14:00</p>
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
                      <p className="text-xs text-gray-500 dark:text-white uppercase font-medium">Trả phòng</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {new Date(booking.check_out_date).toLocaleDateString('vi-VN', { 
                          day: '2-digit', 
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-white">Trước 12:00</p>
                </div>
              </div>
            </div>

            {/* Guest Info */}
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-100 dark:border-blue-800 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-gray-600 font-medium">Số khách</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {booking.num_guests || booking.guest_count}
              </p>
            </div>

            {/* Special Requests */}
            {(booking.special_requests || booking.notes) && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900 mb-1">
                      Yêu cầu đặc biệt
                    </p>
                    <p className="text-sm text-yellow-800">
                      {booking.special_requests || booking.notes}
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
                    <div key={index} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {usage.service?.name || 'Dịch vụ'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-white">
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
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">
                💰 Chi tiết thanh toán
              </h3>
              
              <div className="space-y-2">
                {/* Room breakdown by type */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  <p className="text-sm font-semibold text-gray-700 dark:text-white mb-2">
                    Tiền phòng ({numberOfNights} đêm):
                  </p>
                  <div className="space-y-2 pl-2">
                    {bookingRooms.map((bookingRoom: any, index: number) => {
                      const roomData = bookingRoom.room || room;
                      const roomTypeData = roomData?.room_type || roomType;
                      const quantity = bookingRoom.quantity || 1;
                      const pricePerNight = roomTypeData?.base_price || 0;
                      const subtotal = numberOfNights * pricePerNight * quantity;
                      
                      return (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-white">
                            • {roomTypeData?.name || 'Phòng'} × {quantity} × {numberOfNights} đêm
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatPrice(subtotal)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-300 mt-2">
                    <span className="text-gray-700">Tổng tiền phòng:</span>
                    <span className="text-gray-900">
                      {formatPrice(roomTotalPrice)}
                    </span>
                  </div>
                </div>
                
                {booking.service_usages && booking.service_usages.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2 border border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-semibold text-gray-700 dark:text-white mb-2">Dịch vụ bổ sung:</p>
                    {booking.service_usages.map((usage: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm pl-2">
                        <span className="text-gray-600 dark:text-white">
                          • {usage.service?.name || 'Dịch vụ'} ({usage.quantity} x {formatPrice(parseFloat(usage.unit_price.toString()))})
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
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
                
                  <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900 rounded-lg p-3 dark:border-indigo-800">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Tổng thanh toán
                  </span>
                  <span className="text-3xl font-bold text-indigo-600 dark:text-white">
                    {formatPrice(booking.total_price)}
                  </span>
                </div>

                {/* Payment Status and Details */}
                <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                    <p className="text-base text-gray-600 dark:text-white font-medium">Trạng thái thanh toán</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {booking.payment_method === 'cash'
                      ? 'Thanh toán khi nhận phòng'
                      : booking.payment_method === 'vnpay'
                      ? 'VNPay'
                      : 'Chuyển khoản ngân hàng'}
                  </p>
                  <div className="mb-2">
                    <PaymentStatusBadge 
                      status={booking.payment_status}
                      size="sm"
                    />
                  </div>
                  {/* Hiển thị thông tin thanh toán nếu có */}
                  {booking.deposit_paid && booking.payments && 
                    booking.payments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
                      {booking.payments
                        .filter(p => p.payment_status === 'completed')
                        .map((payment) => (
                          <div key={payment.id} 
                            className="flex items-start gap-2 mb-2 last:mb-0">
                            <CheckCircle 
                              className="w-4 h-4 text-green-600 mt-0.5 
                                flex-shrink-0" 
                            />
                            <div>
                              <p className="text-sm text-gray-700 dark:text-white font-semibold">
                                {payment.payment_type === 'deposit' 
                                  ? `Đã đặt cọc ${
                                      payment.deposit_percentage || 20
                                    }%`
                                  : payment.payment_type === 'full' && 
                                    booking.payment_method === 'vnpay'
                                  ? 'Đã thanh toán 100% qua VNPay'
                                  : 'Đã thanh toán toàn bộ'
                                }
                              </p>
                              <p className="text-sm text-gray-600 dark:text-white font-medium">
                                Qua {
                                  payment.payment_method === 'e_wallet'
                                    ? 'VNPay' 
                                    : payment.payment_method === 'bank_transfer' && payment.payment_type === 'deposit' && booking.payment_method === 'cash'
                                    ? 'Tiền mặt'
                                    : payment.payment_method === 'bank_transfer'
                                    ? 'Chuyển khoản'
                                    : payment.payment_method === 'cash'
                                    ? 'Tiền mặt'
                                    : payment.payment_method === 'credit_card'
                                    ? 'Thẻ tín dụng'
                                    : payment.payment_method === 'debit_card'
                                    ? 'Thẻ ghi nợ'
                                    : 'Khác'
                                } - {
                                  new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                  }).format(payment.amount)
                                }
                              </p>
                              {payment.payment_type === 'deposit' && (
                                <p className="text-sm text-orange-600 font-semibold mt-1">
                                  Vui lòng thanh toán phần còn lại khi nhận phòng
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Booking Timeline */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Trạng thái đơn hàng
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      booking.status === 'confirmed' || booking.status === 'checked_in' || booking.status === 'checked_out'
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      {booking.status === 'confirmed' || booking.status === 'checked_in' || booking.status === 'checked_out' ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className={`w-0.5 h-full my-1 ${
                      booking.status === 'confirmed' || booking.status === 'checked_in' || booking.status === 'checked_out'
                        ? 'bg-green-200 dark:bg-green-700'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}></div>
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-semibold text-gray-900 dark:text-white">Xác nhận đặt phòng</p>
                    <p className="text-sm text-gray-500 dark:text-white">
                      {booking.status === 'pending' ? 'Đang chờ xác nhận' : 'Đã xác nhận'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      booking.status === 'confirmed' || booking.status === 'checked_in' || booking.status === 'checked_out'
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      {booking.status === 'confirmed' || booking.status === 'checked_in' || booking.status === 'checked_out' ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className={`w-0.5 h-full my-1 ${
                      booking.status === 'confirmed' || booking.status === 'checked_in' || booking.status === 'checked_out'
                        ? 'bg-green-200 dark:bg-green-700'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}></div>
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-semibold text-gray-900 dark:text-white">Đặt phòng thành công</p>
                    <p className="text-sm text-gray-500 dark:text-white">
                      {booking.status === 'confirmed' || booking.status === 'checked_in' || booking.status === 'checked_out'
                        ? new Date(booking.created_at).toLocaleString('vi-VN')
                        : 'Chờ thanh toán'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      booking.status === 'checked_in' || booking.status === 'checked_out'
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      {booking.status === 'checked_in' || booking.status === 'checked_out' ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className={`w-0.5 h-full my-1 ${
                      booking.status === 'checked_in' || booking.status === 'checked_out'
                        ? 'bg-green-200 dark:bg-green-700'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}></div>
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-semibold text-gray-900 dark:text-white">Nhận phòng</p>
                    <p className="text-sm text-gray-500 dark:text-white">
                      {formatDate(booking.check_in_date)}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      booking.status === 'checked_out'
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      {booking.status === 'checked_out' ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">Trả phòng</p>
                    <p className="text-sm text-gray-500 dark:text-white">
                      {formatDate(booking.check_out_date)}
                    </p>
                  </div>
                </div>

                {/* Cancellation Status */}
                {booking.status === 'cancelled' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-red-200">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-red-900 dark:text-white">Đã hủy đặt phòng</p>
                        {booking.cancelled_at && (
                          <p className="text-sm text-gray-500 dark:text-white">
                            {new Date(booking.cancelled_at).toLocaleString('vi-VN')}
                          </p>
                        )}
                      {booking.cancellation_reason && (
                        <div className="mt-2 bg-red-50 dark:bg-red-900 rounded-lg p-3 border border-red-200 dark:border-red-700">
                          <p className="text-xs text-red-600 dark:text-white font-medium mb-1">Lý do hủy:</p>
                          <p className="text-sm text-red-900 dark:text-white font-medium">
                            {booking.cancellation_reason === 'change_plans' && '📅 Thay đổi kế hoạch'}
                            {booking.cancellation_reason === 'found_better' && '🏨 Tìm được nơi tốt hơn'}
                            {booking.cancellation_reason === 'personal_emergency' && '🚨 Có việc gấp'}
                            {booking.cancellation_reason === 'price_issue' && '💰 Vấn đề về giá'}
                            {booking.cancellation_reason === 'wrong_booking' && '❌ Đặt nhầm'}
                            {booking.cancellation_reason === 'other' && '📝 Lý do khác'}
                            {!['change_plans', 'found_better', 'personal_emergency', 'price_issue', 'wrong_booking', 'other'].includes(booking.cancellation_reason) && booking.cancellation_reason}
                          </p>
                          {booking.cancellation_details && (
                            <>
                              <p className="text-xs text-red-600 dark:text-white font-medium mt-2 mb-1">Chi tiết:</p>
                              <p className="text-sm text-red-800 dark:text-white">
                                {booking.cancellation_details}
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Guest Information */}
            {booking.guest_info && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600 dark:text-indigo-200" />
                  Thông tin người đặt phòng
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-indigo-600 dark:text-indigo-200" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-white uppercase font-medium mb-1">Họ và tên</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {booking.guest_info.full_name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-green-600 dark:text-green-200" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-white uppercase font-medium mb-1">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white break-all text-sm">
                        {booking.guest_info.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-blue-600 dark:text-blue-200" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-white uppercase font-medium mb-1">Số điện thoại</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {booking.guest_info.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Important Notice */}
            <div className="bg-yellow-50 dark:bg-yellow-900 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-300 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-yellow-900 dark:text-yellow-200 mb-2">
                    ⚠️ Lưu ý quan trọng
                  </p>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 dark:text-yellow-300 mt-1">•</span>
                      <span>Mang theo CMND/CCCD khi nhận phòng</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 dark:text-yellow-300 mt-1">•</span>
                      <span>Check-in: 14:00 | Check-out: 12:00</span>
                    </li>
                    {canCancelBooking(booking) && (
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">•</span>
                        <span>
                          {booking.deposit_paid 
                            ? 'Hủy phòng sẽ bị mất tiền cọc đã thanh toán'
                            : 'Hủy phòng sẽ bị giữ 20% tổng giá trị'
                          }
                        </span>
                      </li>
                    )}
                    {booking.payment_method === 'bank_transfer' && booking.payment_status === 'unpaid' && (
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">•</span>
                        <span>Chuyển khoản trong 24h để giữ phòng</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
        
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Payment Button for unpaid bank transfer */}
          {booking.payment_method === 'bank_transfer' && 
           booking.payment_status === 'unpaid' && (
            <Link
              to={`/payment/${booking.id}`}
              className="flex-1 flex items-center 
                justify-center gap-2 px-6 py-4 
                bg-gradient-to-r from-green-600 to-emerald-600 
                text-white rounded-xl hover:from-green-700 
                hover:to-emerald-700 transition-all 
                font-bold text-lg shadow-lg hover:shadow-xl 
                transform hover:-translate-y-0.5"
            >
              <CreditCard className="w-6 h-6" />
              Xác nhận thanh toán
            </Link>
          )}

          {canCancelBooking(booking) && (
            <button
              onClick={handleOpenCancelPanel}
              disabled={cancelling}
              className="flex-1 flex items-center 
                justify-center gap-2 px-6 py-4 
                bg-gradient-to-r from-red-600 to-red-700 
                text-white rounded-xl hover:from-red-700 
                hover:to-red-800 transition-all 
                font-bold text-lg shadow-lg hover:shadow-xl 
                transform hover:-translate-y-0.5 
                disabled:from-gray-400 disabled:to-gray-400 
                disabled:cursor-not-allowed 
                disabled:transform-none"
            >
              <XCircle className="w-6 h-6" />
              Hủy đặt phòng
            </button>
          )}

          <Link
            to="/bookings"
            className="flex-1 flex items-center 
              justify-center gap-2 px-6 py-4 
              bg-gradient-to-r from-indigo-600 to-purple-600 
              text-white rounded-xl hover:from-indigo-700 
              hover:to-purple-700 transition-all 
              font-bold text-lg shadow-lg hover:shadow-xl 
              transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-6 h-6" />
            Quay lại danh sách
          </Link>
        </div>
      </div>

      {/* Cancel Booking Slide-over Panel */}
      <SlideOver
        isOpen={showCancelPanel}
        onClose={handleCloseCancelPanel}
        title="Hủy đặt phòng"
      >
        {booking && (
          <CancelBookingPanel
            bookingNumber={booking.booking_number}
            onCancel={handleCancelBooking}
            onClose={handleCloseCancelPanel}
            isLoading={cancelling}
          />
        )}
      </SlideOver>
    </div>
  );
};

export default BookingDetailPage;
