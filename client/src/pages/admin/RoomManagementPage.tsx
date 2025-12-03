import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';
import { roomService } from '../../services/api';
import type { Room } from '../../types/rooms';
import { toast } from 'react-toastify';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import apiClient from '../../services/api/apiClient';

const RoomManagementPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
  });
  const [roomTypes, setRoomTypes] = useState<{ id: number; name: string }[]>([]);
    // Lấy danh sách loại phòng từ backend
    useEffect(() => {
      const fetchRoomTypes = async () => {
        try {
          const res = await roomService.getRoomTypes?.();
          if (res?.data?.room_types) {
            setRoomTypes(res.data.room_types);
          } else {
            // Fallback: 12 loại phòng từ seeder
            setRoomTypes([
              { id: 1, name: 'Standard Room' },
              { id: 2, name: 'Twin Room' },
              { id: 3, name: 'Deluxe Room' },
              { id: 4, name: 'Family Room' },
              { id: 5, name: 'Premium Room' },
              { id: 6, name: 'Suite' },
              { id: 7, name: 'Executive Suite' },
              { id: 8, name: 'Presidential Suite' },
              { id: 9, name: 'Studio' },
              { id: 10, name: 'Connecting Room' },
              { id: 11, name: 'Accessible Room' },
              { id: 12, name: 'Penthouse' },
            ]);
          }
        } catch (err) {
          setRoomTypes([
            { id: 1, name: 'Standard Room' },
            { id: 2, name: 'Twin Room' },
            { id: 3, name: 'Deluxe Room' },
            { id: 4, name: 'Family Room' },
            { id: 5, name: 'Premium Room' },
            { id: 6, name: 'Suite' },
            { id: 7, name: 'Executive Suite' },
            { id: 8, name: 'Presidential Suite' },
            { id: 9, name: 'Studio' },
            { id: 10, name: 'Connecting Room' },
            { id: 11, name: 'Accessible Room' },
            { id: 12, name: 'Penthouse' },
          ]);
        }
      };
      fetchRoomTypes();
    }, []);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    room_number: '',
    floor: 1,
    room_type_id: 1,
    price: 0,
    status: 'available' as 'available' | 'occupied' | 'maintenance' | 'dirty' | 'cleaning',
  });
  
  // Helper function to parse images (handle both string and array)
  const parseImages = (images: any): string[] => {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.status, filters.type]);

  useEffect(() => {
    fetchRooms();
  }, [filters.search, filters.status, filters.type, currentPage]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params: any = {
        search: filters.search,
        status: filters.status,
        page: currentPage,
        limit: itemsPerPage,
      };
      if (filters.type) {
        params.type = filters.type;
      }
      const response = await roomService.getRooms(params);
      setRooms(response.data.rooms || []);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.total);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách phòng');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Kiểm tra giá phòng
    const priceValue = Number(formData.price);
    if (!priceValue || priceValue <= 0 || isNaN(priceValue)) {
      toast.error('Giá phòng phải lớn hơn 0');
      return;
    }
    try {
      let newRoomId = null;
      if (editingRoom) {
        // Update room
        await roomService.updateRoom(editingRoom.id, formData);
        toast.success('Cập nhật phòng thành công');
        newRoomId = editingRoom.id;
      } else {
        // Create room
        await roomService.createRoom(formData);
        toast.success('Thêm phòng thành công');
      }
      setShowModal(false);
      resetForm();
      fetchRooms();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    // Use safe fallbacks for possibly-undefined fields and
    // normalize status to the form's allowed values.
    const validStatuses = ['available', 'occupied', 'maintenance', 'dirty', 'cleaning'];
    const normalizedStatus = validStatuses.includes(room.status) 
      ? (room.status as any)
      : 'available';

    setFormData({
      room_number: room.room_number ?? '',
      floor: room.floor ?? 1,
      room_type_id: room.room_type_id ?? 1,
      price: room.price ?? 0,
      status: normalizedStatus,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa phòng này?')) return;
    
    try {
      await roomService.deleteRoom(id);
      toast.success('Xóa phòng thành công');
      fetchRooms();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa phòng');
    }
  };

  const resetForm = () => {
    setEditingRoom(null);
    setFormData({
      room_number: '',
      floor: 1,
      room_type_id: 1,
      price: 0,
      status: 'available',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      available: { bg: 'bg-green-100', text: 'text-green-800', label: 'Trống' },
      occupied: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đang sử dụng' },
      maintenance: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Bảo trì' },
      dirty: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cần dọn dẹp' },
      cleaning: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Đang dọn' },
    };
    const badge = badges[status] || badges.available;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý phòng</h1>
          <p className="text-gray-500 mt-1">Quản lý thông tin phòng khách sạn</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm phòng
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm phòng..."
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
            <option value="available">Trống</option>
            <option value="occupied">Đang sử dụng</option>
            <option value="maintenance">Bảo trì</option>
            <option value="dirty">Cần dọn dẹp</option>
            <option value="cleaning">Đang dọn</option>
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả loại phòng</option>
            {roomTypes.map(rt => (
              <option key={rt.id} value={rt.id}>{rt.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số phòng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại phòng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hình ảnh
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tầng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giá
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nổi bật
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rooms.map((room) => (
              <tr key={room.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{room.room_number}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{room.room_type?.name || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const images = parseImages(room.room_type?.images);
                      return images.length > 0 ? (
                        <div className="relative group">
                            <img
                              src={
                                ((): string => {
                                  const img0 = images[0];
                                  if (img0.startsWith('http')) return img0;
                                  if (img0.startsWith('/')) return `http://localhost:3000${img0}`;
                                  return `http://localhost:3000/uploads/room_types/${img0}`;
                                })()
                              }
                              alt={room.room_number}
                              className="w-16 h-16 object-cover rounded-lg"
                              onError={(e) => {
                                console.error('Image load error:', images[0]);
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          {images.length > 1 && (
                            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              +{images.length - 1}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      );
                    })()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Tầng {room.floor}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(room.price || room.room_type?.base_price || 0)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(room.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {room.room_type?.featured ? (
                    <span className="text-yellow-500">⭐</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(room)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingRoom ? 'Cập nhật phòng' : 'Thêm phòng mới'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số phòng
                  </label>
                  <input
                    type="text"
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tầng
                  </label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá phòng (VND)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại phòng
                </label>
                <select
                  value={formData.room_type_id}
                  onChange={(e) => setFormData({ ...formData, room_type_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {roomTypes.map(rt => (
                    <option key={rt.id} value={rt.id}>{rt.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="available">Trống</option>
                  <option value="occupied">Đang sử dụng</option>
                  <option value="maintenance">Bảo trì</option>
                  <option value="dirty">Cần dọn dẹp</option>
                  <option value="cleaning">Đang dọn</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingRoom ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>

            {/* Hiển thị ảnh từ room_type - Only for viewing */}
            {editingRoom && editingRoom.room_type?.images && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Hình ảnh loại phòng
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Ảnh được quản lý tại trang <strong>Quản lý loại phòng</strong>
                </p>
                {(() => {
                  const images = parseImages(editingRoom.room_type?.images);
                  return images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {images.map((img, index) => {
                        const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000')
                          .replace(/\/api\/?$/i, '')
                          .replace(/\/$/, '');
                        
                        let src = '';
                        if (img.startsWith('http')) {
                          src = img;
                        } else if (img.startsWith('/uploads/')) {
                          src = `${SERVER_URL}${img}`;
                        } else if (img.startsWith('/')) {
                          src = `${SERVER_URL}${img}`;
                        } else {
                          src = `${SERVER_URL}/uploads/room_types/${img}`;
                        }
                        
                        return (
                          <div key={index} className="relative">
                            <img
                              src={src}
                              alt={`Room type ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Chưa có ảnh cho loại phòng này</p>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagementPage;
