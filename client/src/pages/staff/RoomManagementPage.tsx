import React, { useEffect, useState } from 'react';
import { Search, Eye, AlertCircle, Loader } from 'lucide-react';
import { roomService, Room } from '../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../components/common/Loading';

interface RoomWithBooking extends Room {
  bookings?: Array<{
    id: number;
    booking_number: string;
    user: {
      id: number;
      full_name: string;
      email: string;
      phone: string;
    };
  }>;
}

const RoomManagementPage: React.FC = () => {
  const [rooms, setRooms] = useState<RoomWithBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });
  const [selectedRoom, setSelectedRoom] = useState<RoomWithBooking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomService.getRooms({});
      setRooms(response.data.rooms || []);
    } catch (error: any) {
      toast.error('Không thể tải danh sách phòng');
      console.error('Fetch rooms error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string; icon: string }> = {
      available: { bg: 'bg-green-100', text: 'text-green-800', label: 'Trống', icon: '🟢' },
      occupied: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đang ở', icon: '🔴' },
      dirty: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Bẩn', icon: '🟡' },
      cleaning: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đang dọn', icon: '🔵' },
      maintenance: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Bảo trì', icon: '🔧' },
    };
    const badge = badges[status] || badges.available;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
        <span>{badge.icon}</span>
        {badge.label}
      </span>
    );
  };

  const handleStatusChange = async (roomId: number, newStatus: string) => {
    try {
      setUpdatingStatus(true);
      await roomService.updateRoomStatus(roomId, newStatus);
      toast.success('Cập nhật trạng thái phòng thành công');
      fetchRooms();
      setShowDetailModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái phòng');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getAvailableStatusTransitions = (currentStatus: string) => {
    // Normalize status: trim whitespace and convert to lowercase
    const normalizedStatus = (currentStatus || '').trim().toLowerCase();
    
    const transitions: Record<string, { status: string; label: string }[]> = {
      available: [
        { status: 'maintenance', label: 'Báo bảo trì' },
      ],
      // occupied: Không cho phép chuyển thủ công, phải check-out qua booking
      occupied: [],
      // dirty: Tự động sau check-out, chỉ cho phép báo dọn
      dirty: [
        { status: 'cleaning', label: 'Bắt đầu dọn phòng' },
      ],
      cleaning: [
        { status: 'available', label: 'Hoàn tất dọn phòng' },
      ],
      maintenance: [
        { status: 'available', label: 'Hoàn tất bảo trì' },
      ],
    };
    
    return transitions[normalizedStatus] || [];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const filteredRooms = rooms.filter((room) => {
    const matchSearch = 
      room.room_number.toLowerCase().includes(filters.search.toLowerCase()) ||
      (room.room_type?.name || '').toLowerCase().includes(filters.search.toLowerCase());
    const matchStatus = !filters.status || room.status === filters.status;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    all: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    dirty: rooms.filter(r => r.status === 'dirty').length,
    cleaning: rooms.filter(r => r.status === 'cleaning').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Phòng</h1>
        <p className="text-gray-600">Theo dõi và cập nhật trạng thái phòng</p>
      </div>

      {/* Status Filter Pills */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => setFilters({ ...filters, status: '' })}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filters.status === '' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Tất cả ({statusCounts.all})
        </button>
        <button
          onClick={() => setFilters({ ...filters, status: 'available' })}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filters.status === 'available' 
              ? 'bg-green-600 text-white shadow-md' 
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          🟢 Trống ({statusCounts.available})
        </button>
        <button
          onClick={() => setFilters({ ...filters, status: 'occupied' })}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filters.status === 'occupied' 
              ? 'bg-red-600 text-white shadow-md' 
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          🔴 Đang ở ({statusCounts.occupied})
        </button>
        <button
          onClick={() => setFilters({ ...filters, status: 'dirty' })}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filters.status === 'dirty' 
              ? 'bg-yellow-600 text-white shadow-md' 
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          🟡 Bẩn ({statusCounts.dirty})
        </button>
        <button
          onClick={() => setFilters({ ...filters, status: 'cleaning' })}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filters.status === 'cleaning' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          🔵 Đang dọn ({statusCounts.cleaning})
        </button>
        <button
          onClick={() => setFilters({ ...filters, status: 'maintenance' })}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filters.status === 'maintenance' 
              ? 'bg-gray-600 text-white shadow-md' 
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          🔧 Bảo trì ({statusCounts.maintenance})
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo số phòng hoặc loại phòng..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Số phòng</th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Loại phòng</th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Tầng</th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Trạng thái</th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Khách đang ở</th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Booking</th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-lg">Không tìm thấy phòng nào</p>
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-900">{room.room_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{room.room_type?.name}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(room.room_type?.base_price || 0)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">Tầng {room.floor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(room.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {room.bookings && room.bookings.length > 0 ? (
                        <div className="text-sm text-gray-900">{room.bookings[0].user.full_name}</div>
                      ) : (
                        <span className="text-gray-400">–</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {room.bookings && room.bookings.length > 0 ? (
                        <div className="text-sm font-medium text-blue-600">
                          {room.bookings[0].booking_number}
                        </div>
                      ) : (
                        <span className="text-gray-400">–</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedRoom(room);
                          setShowDetailModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Chi tiết</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold">Chi tiết Phòng {selectedRoom.room_number}</h2>
              <p className="text-blue-100 mt-1">Thông tin và cập nhật trạng thái</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Room Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Số phòng</p>
                  <p className="text-xl font-bold text-gray-900">{selectedRoom.room_number}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Tầng</p>
                  <p className="text-xl font-bold text-gray-900">Tầng {selectedRoom.floor}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Loại phòng</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedRoom.room_type?.name || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Giá phòng</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(selectedRoom.room_type?.base_price || 0)}
                  </p>
                </div>
              </div>

              {/* Current Status */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Trạng thái hiện tại</p>
                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedRoom.status)}
                </div>
              </div>

              {/* Current Booking Info */}
              {selectedRoom.bookings && selectedRoom.bookings.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-3">Thông tin khách đang ở</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Tên khách:</span>
                      <span className="font-semibold text-gray-900">{selectedRoom.bookings[0].user.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Email:</span>
                      <span className="font-medium text-gray-900">{selectedRoom.bookings[0].user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Điện thoại:</span>
                      <span className="font-medium text-gray-900">{selectedRoom.bookings[0].user.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Mã booking:</span>
                      <span className="font-semibold text-blue-600">{selectedRoom.bookings[0].booking_number}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Change Actions */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-600 mb-3">Thay đổi trạng thái phòng</p>
                
                {/* Thông báo cho phòng occupied */}
                {selectedRoom.status === 'occupied' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                    <p className="text-sm text-blue-800">
                      ℹ️ Phòng đang có khách. Trạng thái sẽ tự động chuyển sang <strong>"Bẩn"</strong> khi check-out.
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  {getAvailableStatusTransitions(selectedRoom.status).map((transition) => (
                    <button
                      key={transition.status}
                      onClick={() => handleStatusChange(selectedRoom.id, transition.status)}
                      disabled={updatingStatus}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingStatus ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader className="w-4 h-4 animate-spin" />
                          Đang cập nhật...
                        </span>
                      ) : (
                        transition.label
                      )}
                    </button>
                  ))}
                  {getAvailableStatusTransitions(selectedRoom.status).length === 0 && selectedRoom.status !== 'occupied' && (
                    <div className="text-center py-4 text-gray-500">
                      Không có thao tác nào khả dụng cho trạng thái hiện tại
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
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

export default RoomManagementPage;
