import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  CreditCard,
  Eye,
  XCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  DoorOpen,
  DoorClosed,
  Loader2,
  Search,
  Filter,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getMyBookings,
  cancelBooking,
  type Booking,
} from '../../services/api/bookingService';
import useAuthStore from '../../store/useAuthStore';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

const MyBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = 
    useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = 
    useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = 
    useState<string>('all');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để xem đơn đặt phòng');
      navigate('/login', { 
        state: { from: '/bookings' } 
      });
    }
  }, [isAuthenticated, navigate]);

  // Fetch bookings
  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  // Filter bookings
  useEffect(() => {
    let filtered = [...bookings];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (b) => b.status === statusFilter
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.booking_number.toLowerCase().includes(query) ||
          b.room?.room_type?.name
            .toLowerCase()
            .includes(query) ||
          b.room?.room_number
            .toString()
            .includes(query)
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, statusFilter, searchQuery]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getMyBookings();

      if (
        response.success && 
        response.data?.bookings
      ) {
        setBookings(response.data.bookings);
      } else {
        throw new Error(
          'Không thể tải danh sách đặt phòng'
        );
      }
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      const message =
        err.response?.data?.message ||
        'Không thể tải danh sách đặt phòng';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (
    bookingId: number,
    bookingNumber: string
  ) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn hủy đặt phòng ${bookingNumber}?\n\n` +
      `⚠️ Lưu ý:\n` +
      `- Bạn sẽ bị giữ 20% giá trị đơn\n` +
      `- 80% còn lại sẽ được hoàn trả\n` +
      `- Trạng thái phòng sẽ được cập nhật về "available"`
    );

    if (!confirmed) return;

    try {
      setCancellingId(bookingId);

      const response = await cancelBooking(bookingId);

      if (response.success) {
        toast.success(
          `✅ Đã hủy đặt phòng ${bookingNumber} thành công!`
        );
        
        // Update local state
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? { ...b, status: 'cancelled' }
              : b
          )
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
      setCancellingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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
    // Can only cancel pending or confirmed bookings
    return (
      booking.status === 'pending' || 
      booking.status === 'confirmed'
    );
  };

  if (loading) {
    return <Loading fullScreen text="Đang tải..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 
            mb-2"
          >
            Đơn đặt phòng của tôi
          </h1>
          <p className="text-gray-600">
            Quản lý và theo dõi các đơn đặt phòng của bạn
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md 
          p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search 
                  className="absolute left-3 top-1/2 
                    -translate-y-1/2 w-5 h-5 
                    text-gray-400" 
                />
                <input
                  type="text"
                  placeholder="Tìm theo mã đặt phòng, tên phòng..."
                  value={searchQuery}
                  onChange={(e) => 
                    setSearchQuery(e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2 border 
                    border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-indigo-500 
                    focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="md:w-64">
              <div className="relative">
                <Filter 
                  className="absolute left-3 top-1/2 
                    -translate-y-1/2 w-5 h-5 
                    text-gray-400" 
                />
                <select
                  value={statusFilter}
                  onChange={(e) => 
                    setStatusFilter(e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2 border 
                    border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-indigo-500 
                    focus:border-indigo-500 
                    appearance-none bg-white"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="checked_in">
                    Đã nhận phòng
                  </option>
                  <option value="checked_out">
                    Đã trả phòng
                  </option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 text-sm text-gray-600">
            Hiển thị {filteredBookings.length} / 
            {bookings.length} đơn đặt phòng
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 
              rounded-lg p-6 mb-6 flex items-start gap-3"
          >
            <AlertCircle 
              className="w-6 h-6 text-red-500 
                flex-shrink-0 mt-0.5" 
            />
            <div>
              <p className="text-red-700 font-medium">
                {error}
              </p>
              <button
                onClick={fetchBookings}
                className="mt-2 text-sm text-red-600 
                  hover:text-red-800 underline"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={
              searchQuery || statusFilter !== 'all'
                ? 'Không tìm thấy đơn đặt phòng'
                : 'Chưa có đơn đặt phòng'
            }
            description={
              searchQuery || statusFilter !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Bắt đầu đặt phòng để tận hưởng kỳ nghỉ của bạn'
            }
          >
            {!searchQuery && statusFilter === 'all' ? (
              <Link
                to="/rooms"
                className="inline-flex items-center 
                  gap-2 px-6 py-3 bg-indigo-600 
                  text-white rounded-lg 
                  hover:bg-indigo-700 
                  transition-colors font-semibold"
              >
                Xem danh sách phòng
              </Link>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="px-6 py-3 bg-gray-600 
                  text-white rounded-lg 
                  hover:bg-gray-700 transition-colors 
                  font-semibold"
              >
                Xóa bộ lọc
              </button>
            )}
          </EmptyState>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const statusConfig = getStatusConfig(
                booking.status
              );
              const StatusIcon = statusConfig.icon;
              const room = booking.room;
              const roomType = room?.room_type;

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-lg shadow-md 
                    hover:shadow-lg transition-shadow 
                    overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col 
                      lg:flex-row gap-6"
                    >
                      {/* Room Image */}
                      {roomType?.images?.[0] && (
                        <div className="lg:w-48 flex-shrink-0">
                          <img
                            src={roomType.images[0]}
                            alt={roomType.name}
                            className="w-full h-48 lg:h-full 
                              object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {/* Booking Info */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start 
                          justify-between gap-4 mb-3"
                        >
                          <div>
                            <h3 className="text-xl font-bold 
                              text-gray-900 mb-1"
                            >
                              {roomType?.name || 'N/A'}
                            </h3>
                            <p className="text-sm 
                              text-gray-600"
                            >
                              <MapPin 
                                className="w-4 h-4 inline 
                                  mr-1" 
                              />
                              Phòng {room?.room_number} - 
                              Tầng {room?.floor}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <div
                            className={`flex items-center 
                              gap-2 px-3 py-1.5 rounded-full 
                              text-sm font-medium 
                              ${statusConfig.color}`}
                          >
                            <StatusIcon 
                              className="w-4 h-4" 
                            />
                            {statusConfig.text}
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 
                          sm:grid-cols-2 gap-3 mb-4"
                        >
                          {/* Booking Number */}
                          <div>
                            <p className="text-xs text-gray-500 
                              mb-1"
                            >
                              Mã đặt phòng
                            </p>
                            <p className="font-medium 
                              text-gray-900 font-mono"
                            >
                              {booking.booking_number}
                            </p>
                          </div>

                          {/* Check-in */}
                          <div>
                            <p className="text-xs text-gray-500 
                              mb-1"
                            >
                              <Calendar 
                                className="w-3 h-3 inline 
                                  mr-1" 
                              />
                              Ngày nhận phòng
                            </p>
                            <p className="font-medium 
                              text-gray-900"
                            >
                              {formatDate(
                                booking.check_in_date
                              )}
                            </p>
                          </div>

                          {/* Check-out */}
                          <div>
                            <p className="text-xs text-gray-500 
                              mb-1"
                            >
                              <Calendar 
                                className="w-3 h-3 inline 
                                  mr-1" 
                              />
                              Ngày trả phòng
                            </p>
                            <p className="font-medium 
                              text-gray-900"
                            >
                              {formatDate(
                                booking.check_out_date
                              )}
                            </p>
                          </div>

                          {/* Guest Count */}
                          <div>
                            <p className="text-xs text-gray-500 
                              mb-1"
                            >
                              <Users 
                                className="w-3 h-3 inline 
                                  mr-1" 
                              />
                              Số người
                            </p>
                            <p className="font-medium 
                              text-gray-900"
                            >
                              {booking.guest_count} người
                            </p>
                          </div>

                          {/* Payment Method */}
                          <div>
                            <p className="text-xs text-gray-500 
                              mb-1"
                            >
                              <CreditCard 
                                className="w-3 h-3 inline 
                                  mr-1" 
                              />
                              Thanh toán
                            </p>
                            <p className="font-medium 
                              text-gray-900"
                            >
                              {booking.payment_method === 'cash'
                                ? 'Tại chỗ'
                                : 'Chuyển khoản'}
                            </p>
                          </div>

                          {/* Total Price */}
                          <div>
                            <p className="text-xs text-gray-500 
                              mb-1"
                            >
                              Tổng tiền
                            </p>
                            <p className="font-bold 
                              text-indigo-600 text-lg"
                            >
                              {formatPrice(booking.total_price)}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3 
                          pt-4 border-t"
                        >
                          {/* View Details */}
                          <Link
                            to={`/bookings/${booking.id}`}
                            className="inline-flex items-center 
                              gap-2 px-4 py-2 
                              bg-indigo-600 text-white 
                              rounded-lg hover:bg-indigo-700 
                              transition-colors font-medium 
                              text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            Xem chi tiết
                          </Link>

                          {/* Cancel Booking */}
                          {canCancelBooking(booking) && (
                            <button
                              onClick={() =>
                                handleCancelBooking(
                                  booking.id,
                                  booking.booking_number
                                )
                              }
                              disabled={
                                cancellingId === booking.id
                              }
                              className="inline-flex 
                                items-center gap-2 px-4 py-2 
                                bg-red-600 text-white 
                                rounded-lg hover:bg-red-700 
                                transition-colors font-medium 
                                text-sm disabled:bg-gray-400 
                                disabled:cursor-not-allowed"
                            >
                              {cancellingId === booking.id ? (
                                <>
                                  <Loader2 
                                    className="w-4 h-4 
                                      animate-spin" 
                                  />
                                  Đang hủy...
                                </>
                              ) : (
                                <>
                                  <XCircle 
                                    className="w-4 h-4" 
                                  />
                                  Hủy đặt phòng
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
