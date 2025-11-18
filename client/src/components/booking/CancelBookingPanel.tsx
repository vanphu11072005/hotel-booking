import React, { useState } from 'react';
import { XCircle, AlertCircle } from 'lucide-react';

interface CancelBookingPanelProps {
  bookingNumber: string;
  onCancel: (reason: string, details?: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const CANCEL_REASONS = [
  {
    value: 'change_plans',
    label: 'Thay đổi kế hoạch du lịch',
  },
  {
    value: 'found_better',
    label: 'Tìm được nơi khác phù hợp hơn',
  },
  {
    value: 'personal_emergency',
    label: 'Có việc khẩn cấp đột xuất',
  },
  {
    value: 'price_issue',
    label: 'Giá không phù hợp',
  },
  {
    value: 'wrong_booking',
    label: 'Đặt nhầm phòng/ngày',
  },
  {
    value: 'other',
    label: 'Lý do khác',
  },
];

const CancelBookingPanel: React.FC<CancelBookingPanelProps> = ({
  bookingNumber,
  onCancel,
  onClose,
  isLoading = false,
}) => {
  const [selectedReason, setSelectedReason] = 
    useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReason) {
      setError('Vui lòng chọn lý do hủy đặt phòng');
      return;
    }

    if (selectedReason === 'other' && !details.trim()) {
      setError('Vui lòng nhập lý do cụ thể');
      return;
    }

    setError('');
    onCancel(selectedReason, details.trim() || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Warning Notice */}
      <div className="bg-yellow-50 border-2 border-yellow-200 
        rounded-lg p-4"
      >
        <div className="flex items-start gap-3">
          <AlertCircle 
            className="w-5 h-5 text-yellow-600 
              flex-shrink-0 mt-0.5" 
          />
          <div>
            <p className="font-semibold text-yellow-900 mb-2">
              ⚠️ Lưu ý quan trọng
            </p>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Bạn sẽ bị giữ lại 20% giá trị đơn</li>
              <li>• 80% còn lại sẽ được hoàn trả</li>
              <li>• Phòng sẽ được mở lại để cho thuê</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Booking Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-1">
          Mã đặt phòng
        </p>
        <p className="text-lg font-bold text-gray-900 font-mono">
          {bookingNumber}
        </p>
      </div>

      {/* Reason Selection */}
      <div>
        <label className="block text-sm font-medium 
          text-gray-700 mb-3"
        >
          Lý do hủy đặt phòng <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {CANCEL_REASONS.map((reason) => (
            <label
              key={reason.value}
              className={`flex items-center gap-3 p-4 
                border-2 rounded-lg cursor-pointer 
                transition-colors ${
                  selectedReason === reason.value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <input
                type="radio"
                name="cancel_reason"
                value={reason.value}
                checked={selectedReason === reason.value}
                onChange={(e) => {
                  setSelectedReason(e.target.value);
                  setError('');
                }}
                className="w-4 h-4 text-indigo-600 
                  focus:ring-indigo-500"
              />
              <span className="text-sm font-medium 
                text-gray-900"
              >
                {reason.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Details Text Area (shown when "other" is selected) */}
      {selectedReason === 'other' && (
        <div>
          <label className="block text-sm font-medium 
            text-gray-700 mb-2"
          >
            Chi tiết lý do <span className="text-red-500">*</span>
          </label>
          <textarea
            value={details}
            onChange={(e) => {
              setDetails(e.target.value);
              setError('');
            }}
            rows={4}
            placeholder="Vui lòng mô tả chi tiết lý do bạn muốn hủy đặt phòng..."
            className="w-full px-4 py-3 border border-gray-300 
              rounded-lg focus:ring-2 focus:ring-indigo-500 
              focus:border-indigo-500 resize-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            Tối thiểu 10 ký tự
          </p>
        </div>
      )}

      {/* Optional Details (for other reasons) */}
      {selectedReason && selectedReason !== 'other' && (
        <div>
          <label className="block text-sm font-medium 
            text-gray-700 mb-2"
          >
            Ghi chú thêm (không bắt buộc)
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            placeholder="Bạn có thể chia sẻ thêm thông tin nếu muốn..."
            className="w-full px-4 py-3 border border-gray-300 
              rounded-lg focus:ring-2 focus:ring-indigo-500 
              focus:border-indigo-500 resize-none"
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 
          rounded-lg p-3 flex items-start gap-2"
        >
          <AlertCircle 
            className="w-5 h-5 text-red-500 
              flex-shrink-0 mt-0.5" 
          />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 
        pt-4 border-t"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="flex-1 px-6 py-3 border-2 
            border-gray-300 text-gray-700 rounded-lg 
            hover:bg-gray-50 transition-colors 
            font-semibold disabled:opacity-50 
            disabled:cursor-not-allowed"
        >
          Đóng
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-red-600 
            text-white rounded-lg hover:bg-red-700 
            transition-colors font-semibold 
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 
                border-white border-t-transparent 
                rounded-full animate-spin"
              />
              Đang xử lý...
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5" />
              Xác nhận hủy
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CancelBookingPanel;
