import React from 'react';
import { Edit2, Save, Trash2, User } from 'lucide-react';

interface GuestInfo {
  id?: string;
  name: string;
  id_number: string;
  phone: string;
  guest_type?: 'adult' | 'child';
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  nationality?: string;
  address?: string;
  is_main?: boolean;
}

interface GuestInfoFormProps {
  guest: GuestInfo;
  isEditing: boolean;
  isMain: boolean;
  index: number;
  onEdit: () => void;
  onSave: () => void;
  onRemove: () => void;
  onChange: (field: keyof GuestInfo, value: any) => void;
}

const GuestInfoForm: React.FC<GuestInfoFormProps> = ({
  guest,
  isEditing,
  isMain,
  index,
  onEdit,
  onSave,
  onRemove,
  onChange,
}) => {
  return (
    <div className="p-4 border-2 border-gray-200 rounded-lg bg-white hover:border-blue-300 transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <User className={`w-5 h-5 ${isMain ? 'text-blue-600' : 'text-gray-500'}`} />
          <h3 className="font-semibold text-gray-900">
            {isMain ? '👤 Khách chính' : `👥 Khách ${index + 1}`}
            {isMain && <span className="text-red-500 ml-1">*</span>}
          </h3>
          {isMain && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              Bắt buộc
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <button
              onClick={onSave}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Lưu"
            >
              <Save className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Chỉnh sửa"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {!isMain && (
            <button
              onClick={onRemove}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Xóa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Row 1: Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên {isMain && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={guest.name}
              onChange={(e) => onChange('name', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
              }`}
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại khách {isMain && <span className="text-red-500">*</span>}
            </label>
            <select
              value={guest.guest_type || 'adult'}
              onChange={(e) => onChange('guest_type', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <option value="adult">👨 Người lớn</option>
              <option value="child">👶 Trẻ em</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CMND/CCCD {isMain && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={guest.id_number}
              onChange={(e) => onChange('id_number', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
              }`}
              placeholder="001234567890"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại {isMain && <span className="text-red-500">*</span>}
            </label>
            <input
              type="tel"
              value={guest.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
              }`}
              placeholder="0912345678"
            />
          </div>
        </div>

        {/* Row 2: Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giới tính
            </label>
            <select
              value={guest.gender || ''}
              onChange={(e) => onChange('gender', e.target.value || undefined)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày sinh
            </label>
            <input
              type="date"
              value={guest.birthday || ''}
              onChange={(e) => onChange('birthday', e.target.value || undefined)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quốc tịch
            </label>
            <input
              type="text"
              value={guest.nationality || ''}
              onChange={(e) => onChange('nationality', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
              }`}
              placeholder="Việt Nam"
            />
          </div>
        </div>

        {/* Row 3: Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Địa chỉ
          </label>
          <input
            type="text"
            value={guest.address || ''}
            onChange={(e) => onChange('address', e.target.value)}
            disabled={!isEditing}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
            }`}
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
          />
        </div>
      </div>

      {/* Info Note */}
      {!isEditing && (
        <div className="mt-3 text-xs text-gray-500 italic">
          💡 Nhấn nút <Edit2 className="w-3 h-3 inline" /> để chỉnh sửa thông tin
        </div>
      )}
    </div>
  );
};

export default GuestInfoForm;
