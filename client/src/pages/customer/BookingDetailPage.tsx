import React, { useState, useEffect } from 'react';
import { 
  useParams, 
  useNavigate, 
  Link 
} from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
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
  Loader2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getBookingById,
  cancelBooking,
  type Booking,
} from '../../services/api/bookingService';
import useAuthStore from '../../store/useAuthStore';
import Loading from '../../components/common/Loading';
import PaymentStatusBadge from 
  '../../components/common/PaymentStatusBadge';

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
        setBooking(response.data.booking);
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

  const handleCancelBooking = async () => {
    if (!booking) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn hủy đặt phòng ` +
      `${booking.booking_number}?\n\n` +
      `⚠️ Lưu ý:\n` +
      `- Bạn sẽ bị giữ 20% giá trị đơn\n` +
      `- 80% còn lại sẽ được hoàn trả\n` +
      `- Trạng thái phòng sẽ được cập nhật về "available"`
    );

    if (!confirmed) return;

    try {
      setCancelling(true);

      const response = await cancelBooking(booking.id);

      if (response.success) {
        toast.success(
          `✅ Đã hủy đặt phòng ${booking.booking_number} ` +
          `thành công!`
        );
        
        // Update local state
        setBooking((prev) =>
          prev
            ? { ...prev, status: 'cancelled' }
            : null
        );
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800',
          text: 'Chờ xác nhận',
        };
      case 'confirmed':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800',
          text: 'Đã xác nhận',
        };
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'bg-red-100 text-red-800',
          text: 'Đã hủy',
        };
      case 'checked_in':
        return {
          icon: DoorOpen,
          color: 'bg-blue-100 text-blue-800',
          text: 'Đã nhận phòng',
        };
      case 'checked_out':
        return {
          icon: DoorClosed,
          color: 'bg-gray-100 text-gray-800',
          text: 'Đã trả phòng',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'bg-gray-100 text-gray-800',
          text: status,
        };
    }
  };

  const canCancelBooking = (booking: Booking) => {
    return (
      booking.status === 'pending' || 
      booking.status === 'confirmed'
    );
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
              onClick={() => navigate('/bookings')}
              className="px-6 py-2 bg-red-600 
                text-white rounded-lg 
                hover:bg-red-700 transition-colors"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  const room = booking.room;
  const roomType = room?.room_type;
  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link
          to="/bookings"
          className="inline-flex items-center gap-2 
            text-gray-600 hover:text-gray-900 
            mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại danh sách</span>
        </Link>

        {/* Page Title */}
        <div className="flex items-center justify-between 
          mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Chi tiết đặt phòng
          </h1>

          {/* Status Badge */}
          <div
            className={`flex items-center gap-2 px-4 
              py-2 rounded-full font-medium 
              ${statusConfig.color}`}
          >
            <StatusIcon className="w-5 h-5" />
            {statusConfig.text}
          </div>
        </div>

        {/* Booking Number */}
        <div className="bg-indigo-50 border 
          border-indigo-200 rounded-lg p-4 mb-6"
        >
          <p className="text-sm text-indigo-600 
            font-medium mb-1"
          >
            Mã đặt phòng
          </p>
          <p className="text-2xl font-bold text-indigo-900 
            font-mono"
          >
            {booking.booking_number}
          </p>
        </div>

        {/* Room Information */}
        <div className="bg-white rounded-lg shadow-md 
          p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 
            mb-4"
          >
            Thông tin phòng
          </h2>

          {roomType && (
            <div className="flex flex-col md:flex-row 
              gap-6"
            >
              {/* Room Image */}
              {room?.images?.[0] && (
                <div className="md:w-64 flex-shrink-0">
                  <img
                    src={room.images[0]}
                    alt={roomType?.name}
                    className="w-full h-48 md:h-full 
                      object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Room Details */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold 
                  text-gray-900 mb-2"
                >
                  {roomType.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Phòng {room?.room_number} - 
                  Tầng {room?.floor}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Sức chứa
                    </p>
                    <p className="font-medium text-gray-900">
                      Tối đa {roomType.capacity} người
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Giá phòng
                    </p>
                    <p className="font-medium text-indigo-600">
                      {formatPrice(roomType.base_price)}/đêm
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-lg shadow-md 
          p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 
            mb-4"
          >
            Chi tiết đặt phòng
          </h2>

          <div className="space-y-4">
            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 
              gap-4"
            >
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Ngày nhận phòng
                </p>
                <p className="font-medium text-gray-900">
                  {formatDate(booking.check_in_date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Ngày trả phòng
                </p>
                <p className="font-medium text-gray-900">
                  {formatDate(booking.check_out_date)}
                </p>
              </div>
            </div>

            {/* Guest Count */}
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <Users className="w-4 h-4 inline mr-1" />
                Số người
              </p>
              <p className="font-medium text-gray-900">
                {booking.guest_count} người
              </p>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Ghi chú
                </p>
                <p className="font-medium text-gray-900">
                  {booking.notes}
                </p>
              </div>
            )}

            {/* Payment Method */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-1">
                <CreditCard className="w-4 h-4 inline mr-1" />
                Phương thức thanh toán
              </p>
              <p className="font-medium text-gray-900 mb-2">
                {booking.payment_method === 'cash'
                  ? '💵 Thanh toán tại chỗ'
                  : '🏦 Chuyển khoản ngân hàng'}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Trạng thái:
                </span>
                <PaymentStatusBadge 
                  status={booking.payment_status}
                  size="sm"
                />
              </div>
            </div>

            {/* Total Price */}
            <div className="border-t pt-4">
              <div className="flex justify-between 
                items-center"
              >
                <span className="text-lg font-semibold 
                  text-gray-900"
                >
                  Tổng thanh toán
                </span>
                <span className="text-2xl font-bold 
                  text-indigo-600"
                >
                  {formatPrice(booking.total_price)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Information */}
        {booking.guest_info && (
          <div className="bg-white rounded-lg shadow-md 
            p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-900 
              mb-4"
            >
              Thông tin khách hàng
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">
                  <User className="w-4 h-4 inline mr-1" />
                  Họ và tên
                </p>
                <p className="font-medium text-gray-900">
                  {booking.guest_info.full_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </p>
                <p className="font-medium text-gray-900">
                  {booking.guest_info.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Số điện thoại
                </p>
                <p className="font-medium text-gray-900">
                  {booking.guest_info.phone}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bank Transfer Info */}
        {booking.payment_method === 'bank_transfer' && 
         booking.payment_status === 'unpaid' && (
          <div
            className="bg-blue-50 border border-blue-200 
              rounded-lg p-6 mb-6"
          >
            <div className="flex items-start gap-3">
              <Building2
                className="w-6 h-6 text-blue-600 
                  mt-1 flex-shrink-0"
              />
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-2">
                  Thông tin chuyển khoản
                </h3>
                <div className="bg-white rounded p-4 
                  space-y-2 text-sm"
                >
                  <p>
                    <strong>Ngân hàng:</strong> 
                    Vietcombank (VCB)
                  </p>
                  <p>
                    <strong>Số tài khoản:</strong> 
                    0123456789
                  </p>
                  <p>
                    <strong>Chủ tài khoản:</strong> 
                    KHACH SAN ABC
                  </p>
                  <p>
                    <strong>Số tiền:</strong>{' '}
                    <span className="text-indigo-600 
                      font-bold"
                    >
                      {formatPrice(booking.total_price)}
                    </span>
                  </p>
                  <p>
                    <strong>Nội dung:</strong>{' '}
                    <span className="font-mono 
                      text-indigo-600"
                    >
                      {booking.booking_number}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Important Notes */}
        <div
          className="bg-yellow-50 border border-yellow-200 
            rounded-lg p-4 mb-6"
        >
          <p className="text-sm text-yellow-800 font-medium 
            mb-2"
          >
            ⚠️ Lưu ý quan trọng
          </p>
          <ul className="text-sm text-yellow-700 space-y-1 
            ml-4 list-disc"
          >
            <li>
              Vui lòng mang theo CMND/CCCD khi nhận phòng
            </li>
            <li>
              Thời gian nhận phòng: 14:00 / 
              Thời gian trả phòng: 12:00
            </li>
            {canCancelBooking(booking) && (
              <li>
                Nếu hủy đặt phòng, bạn sẽ bị giữ 20% 
                tổng giá trị đơn
              </li>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Payment Button for unpaid bank transfer */}
          {booking.payment_method === 'bank_transfer' && 
           booking.payment_status === 'unpaid' && (
            <Link
              to={`/payment/${booking.id}`}
              className="flex-1 flex items-center 
                justify-center gap-2 px-6 py-3 
                bg-green-600 text-white rounded-lg 
                hover:bg-green-700 transition-colors 
                font-semibold"
            >
              <CreditCard className="w-5 h-5" />
              Xác nhận thanh toán
            </Link>
          )}

          {canCancelBooking(booking) && (
            <button
              onClick={handleCancelBooking}
              disabled={cancelling}
              className="flex-1 flex items-center 
                justify-center gap-2 px-6 py-3 
                bg-red-600 text-white rounded-lg 
                hover:bg-red-700 transition-colors 
                font-semibold disabled:bg-gray-400 
                disabled:cursor-not-allowed"
            >
              {cancelling ? (
                <>
                  <Loader2 
                    className="w-5 h-5 animate-spin" 
                  />
                  Đang hủy...
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  Hủy đặt phòng
                </>
              )}
            </button>
          )}

          <Link
            to="/bookings"
            className="flex-1 flex items-center 
              justify-center gap-2 px-6 py-3 
              bg-gray-600 text-white rounded-lg 
              hover:bg-gray-700 transition-colors 
              font-semibold"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;
