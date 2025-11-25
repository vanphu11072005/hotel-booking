import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';
import { roomService, Room } from '../../services/api';
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
          }
        } catch (err) {
          // Nếu không có API getRoomTypes thì giữ nguyên option cứng
          setRoomTypes([
            { id: 1, name: 'Phòng Tiêu chuẩn' },
            { id: 2, name: 'Phòng 2 giường đơn' },
            { id: 3, name: 'Phòng Cao cấp' },
            { id: 4, name: 'Phòng Gia đình' },
            { id: 5, name: 'Phòng Hạng sang' },
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
    featured: false,
  });
  
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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
      console.log('=== ROOM DEBUG ===');
      console.log('First room:', response.data.rooms[0]);
      console.log('Room type:', response.data.rooms[0]?.room_type);
      console.log('Images (room-level):', response.data.rooms[0]?.images);
      console.log('==================');
      setRooms(response.data.rooms);
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
        const res = await roomService.createRoom(formData);
        toast.success('Thêm phòng thành công');
        newRoomId = res.data?.room?.id;
      }
      // Nếu có file ảnh, upload luôn sau khi tạo phòng
      if (selectedFiles.length > 0 && newRoomId) {
        const formImg = new FormData();
        selectedFiles.forEach(file => {
          formImg.append('images', file);
        });
        await apiClient.post(`/rooms/${newRoomId}/images`, formImg, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
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
    setFormData({
      room_number: room.room_number,
      floor: room.floor,
      room_type_id: room.room_type_id,
      price: room.price || 0,
      status: room.status,
      featured: room.featured,
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
      featured: false,
    });
    setSelectedFiles([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  };

  const handleUploadImages = async () => {
    if (!editingRoom || selectedFiles.length === 0) return;

    try {
      setUploadingImages(true);
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });


      // Upload ảnh, backend sẽ trả về mảng đường dẫn tương đối
      const uploadRes = await apiClient.post(`/rooms/${editingRoom.id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Nếu backend trả về images, cập nhật lại editingRoom.images
      if (uploadRes.data?.data?.images) {
        // Chuyển tất cả images về đường dẫn tương đối
        const fixedImages = uploadRes.data.data.images.map((img: string) =>
          img.startsWith('http') ? img.replace('http://localhost:3000', '') : img
        );
        setEditingRoom(prev => prev ? { ...prev, images: fixedImages } : prev);
      }

      toast.success('Upload ảnh thành công');
      setSelectedFiles([]);
      fetchRooms();
      
      // Refresh editing room data
      const response = await roomService.getRoomById(editingRoom.id);
      setEditingRoom(response.data.room);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể upload ảnh');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    // Luôn chuyển về đường dẫn tương đối
    const relativeUrl = imageUrl.startsWith('http') ? imageUrl.replace('http://localhost:3000', '') : imageUrl;
    if (!editingRoom) return;
    if (!window.confirm('Bạn có chắc muốn xóa ảnh này?')) return;

    try {
      await apiClient.delete(`/rooms/${editingRoom.id}/images`, {
        data: { imageUrl: relativeUrl },
      });

      toast.success('Xóa ảnh thành công');
      fetchRooms();
      
      // Refresh editing room data
      const response = await roomService.getRoomById(editingRoom.id);
      setEditingRoom(response.data.room);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa ảnh');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      available: { bg: 'bg-green-100', text: 'text-green-800', label: 'Trống' },
      occupied: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đang sử dụng' },
      maintenance: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Bảo trì' },
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
                      const images = parseImages(room.images);
                      return images.length > 0 ? (
                        <div className="relative group">
                            <img
                              src={
                                images[0].startsWith('http')
                                  ? images[0]
                                  : `http://localhost:3000${images[0].startsWith('/') ? images[0] : '/' + images[0]}`
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
                    }).format(room.room_type?.base_price || 0)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(room.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {room.featured ? (
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
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                  Phòng nổi bật
                </label>
              </div>

              {/* Thêm mục upload ảnh khi thêm phòng */}
              {!editingRoom && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thêm ảnh phòng (tối đa 5 ảnh):
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  {selectedFiles.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      {selectedFiles.length} file đã chọn
                    </p>
                  )}
                </div>
              )}

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

            {/* Image Upload Section - Only for editing */}
            {editingRoom && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Hình ảnh phòng
                </h3>
                
                {/* Current Images */}
                {(() => {
                  const images = parseImages(editingRoom.images);
                  return images.length > 0 ? (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Ảnh hiện tại:</p>
                      <div className="grid grid-cols-3 gap-3">
                        {images.map((img, index) => {
                          // Xử lý đường dẫn tuyệt đối và tương đối
                          let src = '';
                          if (img.startsWith('http')) {
                            src = img;
                          } else if (img.startsWith('/')) {
                            src = `http://localhost:3000${img}`;
                          } else {
                            src = `http://localhost:3000/uploads/rooms/${img}`;
                          }
                          return (
                            <div key={index} className="relative group">
                              <img
                                src={src}
                                alt={`Room ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  const errorDiv = document.createElement('div');
                                  errorDiv.innerText = 'Không load được ảnh';
                                  errorDiv.className = 'text-xs text-red-500 mt-1';
                                  (e.target as HTMLImageElement).parentElement?.appendChild(errorDiv);
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleDeleteImage(img)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Upload New Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thêm ảnh mới (tối đa 5 ảnh):
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <button
                      type="button"
                      onClick={handleUploadImages}
                      disabled={selectedFiles.length === 0 || uploadingImages}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingImages ? 'Đang tải...' : 'Upload'}
                    </button>
                  </div>
                  {selectedFiles.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      {selectedFiles.length} file đã chọn
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagementPage;
