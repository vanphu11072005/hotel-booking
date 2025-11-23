import React, { useEffect, useState } from 'react';
import { Search, Eye, XCircle, CheckCircle } from 'lucide-react';
import { bookingService, Booking } from '../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';

const BookingManagementPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    fetchBookings();
  }, [filters, currentPage]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getAllBookings({
        ...filters,
        page: currentPage,
        limit: itemsPerPage,
      });
      setBookings(response.data.bookings);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.total);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách đặt phòng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await bookingService.updateBooking(id, { status } as any);
      toast.success('Cập nhật trạng thái thành công');
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleCancelBooking = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn hủy đặt phòng này?')) return;
    
    try {
      await bookingService.cancelBooking(id);
      toast.success('Hủy đặt phòng thành công');
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể hủy đặt phòng');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xác nhận' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã xác nhận' },
      checked_in: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã nhận phòng' },
      checked_out: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Đã trả phòng' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý đặt phòng</h1>
        <p className="text-gray-500 mt-1">Quản lý các đơn đặt phòng</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đặt phòng, tên khách..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="checked_in">Đã nhận phòng</option>
            <option value="checked_out">Đã trả phòng</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Mã đặt phòng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phòng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ngày nhận/trả
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-blue-600">{booking.booking_number}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.guest_info?.full_name || booking.user?.name}</div>
                  <div className="text-xs text-gray-500">{booking.guest_info?.email || booking.user?.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    Phòng {booking.room?.room_number} - {booking.room?.room_type?.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(booking.check_in_date).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="text-xs text-gray-500">
                    đến {new Date(booking.check_out_date).toLocaleDateString('vi-VN')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrency(booking.total_price)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(booking.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowDetailModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-2"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                        className="text-green-600 hover:text-green-900 mr-2"
                        title="Xác nhận"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Hủy"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'checked_in')}
                      className="text-green-600 hover:text-green-900"
                      title="Check-in"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (() => {
        const checkInDate = new Date(selectedBooking.check_in_date);
        const checkOutDate = new Date(selectedBooking.check_out_date);
        const numberOfNights = Math.ceil(
          (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Calculate room price (base price)
        const roomBasePrice = selectedBooking.room?.room_type?.base_price || 0;
        const roomQuantity = selectedBooking.room_quantity || 1;
        
        // Calculate total for multi-room bookings
        let roomTotalPrice = 0;
        let totalRoomCount = 0;
        
        if (selectedBooking.booking_rooms && selectedBooking.booking_rooms.length > 0) {
          // Multi-room type booking
          roomTotalPrice = selectedBooking.booking_rooms.reduce((sum: number, bookingRoom: any) => {
            const price = bookingRoom.room?.room_type?.base_price || 0;
            return sum + (numberOfNights * price);
          }, 0);
          totalRoomCount = selectedBooking.booking_rooms.length;
        } else {
          // Single room type booking (may have multiple quantity)
          roomTotalPrice = numberOfNights * roomBasePrice * roomQuantity;
          totalRoomCount = roomQuantity;
        }
        
        // Calculate services total
        const servicesTotalPrice = selectedBooking.service_usages?.reduce(
          (sum, usage) => {
            const price = typeof usage.total_price === 'string' 
              ? parseFloat(usage.total_price) 
              : (usage.total_price || 0);
            return sum + (isNaN(price) ? 0 : price);
          },
          0
        ) || 0;

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Chi tiết đặt phòng</h2>
                    <p className="text-indigo-100 text-sm mt-1">
                      Mã: {selectedBooking.booking_number}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Status and Booking Number */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-indigo-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase mb-1">Trạng thái đặt phòng</p>
                      <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-medium uppercase mb-1">Phương thức thanh toán</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedBooking.payment_method === 'cash' && '💵 Tiền mặt'}
                        {selectedBooking.payment_method === 'bank_transfer' && '🏦 Chuyển khoản'}
                        {selectedBooking.payment_method === 'vnpay' && '💳 VNPay'}
                        {!selectedBooking.payment_method && 'Chưa xác định'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Guest & Room Info */}
                  <div className="space-y-6">
                    {/* Guest Information */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Thông tin khách hàng
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Họ tên</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedBooking.guest_info?.full_name || selectedBooking.user?.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Email</p>
                          <p className="text-sm text-gray-700">
                            {selectedBooking.guest_info?.email || selectedBooking.user?.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Số điện thoại</p>
                          <p className="text-sm text-gray-700">
                            {selectedBooking.guest_info?.phone || selectedBooking.user?.phone}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Số khách</p>
                          <p className="text-sm text-gray-700">
                            👥 {selectedBooking.guest_count} người
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Room Information */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Thông tin phòng
                      </h3>
                      <div className="space-y-3">
                        {/* Check if there are multiple rooms (booking_rooms) */}
                        {selectedBooking.booking_rooms && selectedBooking.booking_rooms.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-500 font-medium mb-2">Danh sách phòng đã đặt</p>
                            {selectedBooking.booking_rooms.map((bookingRoom: any, index: number) => (
                              <div key={bookingRoom.id} className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <p className="text-sm font-bold text-indigo-900">
                                      {bookingRoom.room?.room_type?.name || 'N/A'}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      🚪 Phòng {bookingRoom.room?.room_number} - Tầng {bookingRoom.room?.floor}
                                    </p>
                                  </div>
                                  <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">
                                    #{index + 1}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-gray-500">Giá/đêm:</span>
                                    <span className="font-semibold text-gray-900 ml-1">
                                      {formatCurrency(bookingRoom.room?.room_type?.base_price || 0)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Sức chứa:</span>
                                    <span className="font-semibold text-gray-900 ml-1">
                                      {bookingRoom.room?.room_type?.capacity || 0} người
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div className="bg-indigo-100 rounded-lg px-3 py-2 text-center mt-2">
                              <p className="text-sm font-bold text-indigo-800">
                                📦 Tổng: {selectedBooking.booking_rooms.length} phòng
                              </p>
                            </div>
                          </div>
                        ) : (
                          // Single room booking
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Loại phòng</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {selectedBooking.room?.room_type?.name}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Số phòng</p>
                              <p className="text-sm text-gray-700">
                                🚪 Phòng {selectedBooking.room?.room_number} - Tầng {selectedBooking.room?.floor}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Số lượng phòng</p>
                              <p className="text-sm text-gray-700">
                                📦 {roomQuantity} phòng
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Giá phòng/đêm</p>
                              <p className="text-sm text-gray-700">
                                {formatCurrency(roomBasePrice)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Booking Dates */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Thời gian lưu trú
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Ngày nhận phòng</p>
                            <p className="text-sm font-semibold text-gray-900">
                              📅 {checkInDate.toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 font-medium">Ngày trả phòng</p>
                            <p className="text-sm font-semibold text-gray-900">
                              📅 {checkOutDate.toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        <div className="bg-indigo-50 rounded-lg px-3 py-2 text-center">
                          <p className="text-sm font-bold text-indigo-700">
                            🌙 {numberOfNights} đêm
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Pricing & Services */}
                  <div className="space-y-6">
                    {/* Pricing Breakdown */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Chi phí
                      </h3>
                      <div className="space-y-3">
                        {/* Room Cost */}
                        <div className="space-y-1">
                          {selectedBooking.booking_rooms && selectedBooking.booking_rooms.length > 0 ? (
                            // Multi-room type booking breakdown
                            <>
                              <p className="text-sm font-semibold text-gray-700 mb-2">Chi tiết phòng</p>
                              {selectedBooking.booking_rooms.map((bookingRoom: any) => (
                                <div key={bookingRoom.id} className="ml-2 space-y-1 mb-2 pb-2 border-b border-green-100">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600 font-medium">
                                      Phòng {bookingRoom.room?.room_number} - {bookingRoom.room?.room_type?.name}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-500 ml-2">
                                      {formatCurrency(bookingRoom.room?.room_type?.base_price || 0)}/đêm × {numberOfNights} đêm
                                    </span>
                                    <span className="text-gray-700">
                                      {formatCurrency((bookingRoom.room?.room_type?.base_price || 0) * numberOfNights)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              <div className="flex justify-between text-sm pt-2 border-t border-green-200">
                                <span className="font-semibold text-gray-700">
                                  Tổng tiền phòng ({totalRoomCount} phòng)
                                </span>
                                <span className="font-bold text-green-700">{formatCurrency(roomTotalPrice)}</span>
                              </div>
                            </>
                          ) : (
                            // Single room type booking
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Loại phòng</span>
                                <span className="font-medium text-gray-900">
                                  {selectedBooking.room?.room_type?.name}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Số đêm</span>
                                <span className="font-medium text-gray-900">{numberOfNights} đêm</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Số phòng</span>
                                <span className="font-medium text-gray-900">{totalRoomCount} phòng</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Đơn giá</span>
                                <span className="font-medium text-gray-900">{formatCurrency(roomBasePrice)}/đêm</span>
                              </div>
                              <div className="flex justify-between text-sm pt-2 border-t border-green-200">
                                <span className="font-semibold text-gray-700">Tổng tiền phòng</span>
                                <span className="font-bold text-green-700">{formatCurrency(roomTotalPrice)}</span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Services Cost */}
                        {selectedBooking.service_usages && selectedBooking.service_usages.length > 0 && (
                          <div className="pt-3 border-t border-green-200 space-y-1">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Dịch vụ bổ sung</p>
                            {selectedBooking.service_usages.map((usage) => (
                              <div key={usage.id} className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  {usage.service?.name || 'Không rõ'} × {usage.quantity}
                                </span>
                                <span className="text-gray-900">{formatCurrency(usage.total_price)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between text-sm pt-2 border-t border-green-200">
                              <span className="font-semibold text-gray-700">Tổng tiền dịch vụ</span>
                              <span className="font-bold text-green-700">{formatCurrency(servicesTotalPrice)}</span>
                            </div>
                          </div>
                        )}

                        {/* Total */}
                        <div className="pt-3 border-t-2 border-green-300">
                          <div className="flex justify-between items-center">
                            <span className="text-base font-bold text-gray-900">TỔNG CỘNG</span>
                            <span className="text-2xl font-extrabold text-green-600">
                              {formatCurrency(selectedBooking.total_price)}
                            </span>
                          </div>
                        </div>

                        {/* Deposit Info for Cash Payment */}
                        {selectedBooking.payment_method === 'cash' && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                            <p className="text-xs font-semibold text-orange-900 mb-1">Tiền cọc (20%)</p>
                            <p className="text-lg font-bold text-orange-700">
                              {formatCurrency(selectedBooking.total_price * 0.2)}
                            </p>
                            <p className="text-xs text-orange-600 mt-1">
                              Còn lại: {formatCurrency(selectedBooking.total_price * 0.8)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Services Detail Table */}
                    {selectedBooking.service_usages && selectedBooking.service_usages.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                          Chi tiết dịch vụ
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dịch vụ</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">SL</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {selectedBooking.service_usages.map((usage) => (
                                <tr key={usage.id} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 text-sm text-gray-900">{usage.service?.name || 'Không rõ'}</td>
                                  <td className="px-3 py-2 text-sm text-center text-gray-700">{usage.quantity}</td>
                                  <td className="px-3 py-2 text-sm text-right text-gray-700">{formatCurrency(usage.unit_price)}</td>
                                  <td className="px-3 py-2 text-sm text-right font-semibold text-gray-900">{formatCurrency(usage.total_price)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedBooking.notes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Ghi chú
                        </h3>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedBooking.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200 sticky bottom-0">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default BookingManagementPage;
