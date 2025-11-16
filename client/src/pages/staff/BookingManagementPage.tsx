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
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chi tiết đặt phòng</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Mã đặt phòng</label>
                  <p className="text-lg font-semibold">{selectedBooking.booking_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                  <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Thông tin khách hàng</label>
                <p className="text-gray-900">{selectedBooking.guest_info?.full_name || selectedBooking.user?.name}</p>
                <p className="text-gray-600">{selectedBooking.guest_info?.email || selectedBooking.user?.email}</p>
                <p className="text-gray-600">{selectedBooking.guest_info?.phone || selectedBooking.user?.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Thông tin phòng</label>
                <p className="text-gray-900">Phòng {selectedBooking.room?.room_number} - {selectedBooking.room?.room_type?.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày nhận phòng</label>
                  <p className="text-gray-900">{new Date(selectedBooking.check_in_date).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày trả phòng</label>
                  <p className="text-gray-900">{new Date(selectedBooking.check_out_date).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Số khách</label>
                <p className="text-gray-900">{selectedBooking.guest_count} người</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tổng tiền</label>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedBooking.total_price)}</p>
              </div>
              {selectedBooking.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Ghi chú</label>
                  <p className="text-gray-900">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagementPage;
