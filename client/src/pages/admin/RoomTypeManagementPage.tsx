import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Loading from '../../components/common/Loading';
import { Plus, Search, Edit, Trash2, X, Image as ImageIcon, Upload } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import apiClient from '../../services/api/apiClient';
import useRoomTypeStore, { RoomType } from '../../store/useRoomTypeStore';

const initialForm: RoomType = {
  name: '',
  base_price: 0,
  capacity: 1,
  description: '',
  images: [],
  amenities: [],
};

const RoomTypeManagementPage: React.FC = () => {
  const { 
    roomTypes: allRoomTypes, 
    isLoading, 
    fetchRoomTypes, 
    createRoomType, 
    updateRoomType, 
    deleteRoomType 
  } = useRoomTypeStore();

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [form, setForm] = useState<RoomType>(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ 
    search: '', 
    minPrice: '', 
    maxPrice: '', 
    capacity: '' 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 5;
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [amenityInput, setAmenityInput] = useState('');

  useEffect(() => {
    fetchRoomTypes();
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Filter and paginate
    let types = [...allRoomTypes];
    
    console.log('All room types from store:', allRoomTypes);
    
    // Filter by search
    if (filters.search) {
      types = types.filter((t) => t.name.toLowerCase().includes(filters.search.toLowerCase()));
    }
    
    // Filter by min price
    if (filters.minPrice) {
      const minPrice = Number(filters.minPrice);
      types = types.filter((t) => t.base_price >= minPrice);
    }
    
    // Filter by max price
    if (filters.maxPrice) {
      const maxPrice = Number(filters.maxPrice);
      types = types.filter((t) => t.base_price <= maxPrice);
    }
    
    // Filter by capacity
    if (filters.capacity) {
      const capacity = Number(filters.capacity);
      types = types.filter((t) => t.capacity >= capacity);
    }
    
    setTotalItems(types.length);
    setTotalPages(Math.max(1, Math.ceil(types.length / itemsPerPage)));
    setRoomTypes(types.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage));
  }, [allRoomTypes, filters, currentPage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      const urls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Upload ảnh trước nếu có
      let uploadedImages: string[] = [];
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach(file => {
          formData.append('images', file);
        });
        
        try {
          const uploadRes = await apiClient.post('/api/room-types/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          uploadedImages = uploadRes.data?.data?.images || [];
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error('Không thể upload ảnh');
          return;
        }
      }

      // Kết hợp ảnh cũ (nếu edit) và ảnh mới
      let finalImages = [...uploadedImages];
      if (editId && Array.isArray(form.images)) {
        finalImages = [...form.images, ...uploadedImages];
      }

      const roomTypeData = {
        ...form,
        base_price: Number(form.base_price),
        capacity: Number(form.capacity),
        images: finalImages,
      };

      console.log('Submitting room type data:', roomTypeData);
      console.log('Final images to save:', finalImages);

      let success = false;
      if (editId) {
        success = await updateRoomType(editId, roomTypeData);
      } else {
        success = await createRoomType(roomTypeData);
      }

      if (success) {
        setShowModal(false);
        setForm(initialForm);
        setEditId(null);
        setSelectedFiles([]);
        setPreviewUrls([]);
        fetchRoomTypes();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể lưu loại phòng');
    }
  };

  const handleEdit = (type: RoomType) => {
    setForm({
      name: type.name,
      base_price: type.base_price,
      capacity: type.capacity,
      description: type.description || '',
      images: Array.isArray(type.images) ? type.images : [],
      amenities: Array.isArray(type.amenities) ? type.amenities : [],
    });
    setEditId(type.id ?? null);
    setSelectedFiles([]);
    setPreviewUrls([]);
    setAmenityInput('');
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa loại phòng này?')) return;
    const success = await deleteRoomType(id);
    if (success) {
      fetchRoomTypes();
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (!editId) return;
    if (!window.confirm('Bạn có chắc muốn xóa ảnh này?')) return;

    // Xóa ảnh khỏi mảng form.images
    const updatedImages = Array.isArray(form.images) 
      ? form.images.filter(img => img !== imageUrl)
      : [];
    
    // Cập nhật loại phòng với mảng ảnh mới
    const success = await updateRoomType(editId, {
      ...form,
      base_price: Number(form.base_price),
      capacity: Number(form.capacity),
      images: updatedImages,
    });

    if (success) {
      // Cập nhật form local
      setForm({ ...form, images: updatedImages });
      fetchRoomTypes();
    }
  };

  const handleUploadMoreImages = async () => {
    if (!editId || selectedFiles.length === 0) return;

    try {
      setUploadingImages(true);
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      const uploadRes = await apiClient.post('/api/room-types/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newImages = uploadRes.data?.data?.images || [];
      const updatedImages = [...(Array.isArray(form.images) ? form.images : []), ...newImages];

      // Cập nhật vào database
      const success = await updateRoomType(editId, {
        ...form,
        base_price: Number(form.base_price),
        capacity: Number(form.capacity),
        images: updatedImages,
      });

      if (success) {
        setForm({ ...form, images: updatedImages });
        setSelectedFiles([]);
        setPreviewUrls([]);
        fetchRoomTypes();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể upload ảnh');
    } finally {
      setUploadingImages(false);
    }
  };

  if (isLoading && allRoomTypes.length === 0) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý loại phòng</h1>
          <p className="text-gray-500 mt-1">Quản lý thông tin loại phòng khách sạn</p>
        </div>
        <button
          onClick={() => {
            setForm(initialForm);
            setEditId(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm loại phòng
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm loại phòng..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Giá từ (₫)..."
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min={0}
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Giá đến (₫)..."
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min={0}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.capacity}
              onChange={(e) => setFilters({ ...filters, capacity: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả sức chứa</option>
              <option value="1">1+ người</option>
              <option value="2">2+ người</option>
              <option value="3">3+ người</option>
              <option value="4">4+ người</option>
            </select>
            <button
              onClick={() => setFilters({ search: '', minPrice: '', maxPrice: '', capacity: '' })}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              title="Xóa bộ lọc"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên loại phòng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình ảnh</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá cơ bản</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sức chứa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiện nghi</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roomTypes.map((type) => {
              const images: string[] = Array.isArray(type.images) ? type.images.filter(Boolean) : [];
              const amenities: string[] = Array.isArray(type.amenities) ? type.amenities : [];
              return (
                <tr key={type.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{type.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {images.length > 0 ? (
                        <div className="relative group">
                          <img
                            src={
                              (() => {
                                const img0 = images[0];
                                if (img0.startsWith('http')) return img0;
                                if (img0.startsWith('/')) return `http://localhost:3000${img0}`;
                                return `http://localhost:3000/uploads/room_types/${img0}`;
                              })()
                            }
                            alt={type.name}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
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
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">{type.base_price?.toLocaleString('vi-VN')} ₫</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">{type.capacity} người</td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="text-sm text-gray-600 truncate" title={type.description || ''}>
                      {type.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {amenities.length > 0 ? (
                        amenities.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {amenity}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                      {amenities.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          +{amenities.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        onClick={() => handleEdit(type)}
                        title="Sửa"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => type.id && handleDelete(type.id)}
                        title="Xóa"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editId ? 'Cập nhật loại phòng' : 'Thêm loại phòng mới'}</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên loại phòng</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá cơ bản (VND)</label>
                  <input
                    type="number"
                    name="base_price"
                    value={form.base_price}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    min={0}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
                <input
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mô tả loại phòng..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiện nghi</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (amenityInput.trim()) {
                          setForm({ ...form, amenities: [...(form.amenities || []), amenityInput.trim()] });
                          setAmenityInput('');
                        }
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tiện nghi và nhấn Enter..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (amenityInput.trim()) {
                        setForm({ ...form, amenities: [...(form.amenities || []), amenityInput.trim()] });
                        setAmenityInput('');
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Thêm
                  </button>
                </div>
                {form.amenities && form.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {amenity}
                        <button
                          type="button"
                          onClick={() => {
                            const newAmenities = form.amenities?.filter((_, i) => i !== index) || [];
                            setForm({ ...form, amenities: newAmenities });
                          }}
                          className="hover:text-red-600"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {/* Hiển thị ảnh hiện tại khi chỉnh sửa */}
              {editId && form.images && form.images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh hiện tại:</label>
                  <div className="grid grid-cols-3 gap-3">
                    {form.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={`http://localhost:3000${image}`}
                          alt={`Room type ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(image)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Xóa ảnh"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload ảnh mới */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editId ? 'Thêm ảnh mới:' : 'Thêm ảnh loại phòng (tối đa 5 ảnh):'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">{selectedFiles.length} file đã chọn - Preview:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-gray-200"
                          />
                          <span className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">
                            {selectedFiles[index].name.substring(0, 15)}...
                          </span>
                        </div>
                      ))}
                    </div>
                    {editId && (
                      <button
                        type="button"
                        onClick={handleUploadMoreImages}
                        disabled={uploadingImages}
                        className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                      >
                        {uploadingImages ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Đang tải lên...
                          </>
                        ) : (
                          <>
                            <Upload size={18} />
                            Tải ảnh lên
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-4">
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
                  {editId ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomTypeManagementPage;
