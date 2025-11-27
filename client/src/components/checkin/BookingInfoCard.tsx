import React from 'react';
import { Hotel, DollarSign, Calendar, User, Package, AlertCircle } from 'lucide-react';
import { Booking } from '../../services/api';

interface BookingInfoCardProps {
  booking: Booking;
  formatCurrency: (amount: number) => string;
}

const BookingInfoCard: React.FC<BookingInfoCardProps> = ({ booking, formatCurrency }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-green-600" />
        2. Thông tin đặt phòng
      </h2>

      {/* Guest and Booking Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Guest Info */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-indigo-100">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            Thông tin khách hàng
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Mã đặt phòng:</span>
              <span className="text-sm font-semibold text-indigo-900">{booking.booking_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Khách hàng:</span>
              <span className="text-sm font-semibold">
                {booking.guest_info?.full_name || booking.user?.full_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Email:</span>
              <span className="text-sm">{booking.guest_info?.email || booking.user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">SĐT:</span>
              <span className="text-sm">{booking.guest_info?.phone || booking.user?.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Số khách:</span>
              <span className="text-sm font-medium">👥 {booking.guest_count} người</span>
            </div>
          </div>
        </div>

        {/* Dates Info */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-600" />
            Thời gian lưu trú
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Check-in:</span>
              <span className="text-sm font-semibold">
                📅{' '}
                {booking.check_in_date
                  ? new Date(booking.check_in_date).toLocaleDateString('vi-VN')
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Check-out:</span>
              <span className="text-sm font-semibold">
                📅{' '}
                {booking.check_out_date
                  ? new Date(booking.check_out_date).toLocaleDateString('vi-VN')
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-green-200">
              <span className="text-sm text-gray-600">Số đêm:</span>
              <span className="text-sm font-bold text-green-700">
                🌙{' '}
                {booking.check_in_date && booking.check_out_date
                  ? Math.ceil(
                      (new Date(booking.check_out_date).getTime() -
                        new Date(booking.check_in_date).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : 0}{' '}
                đêm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tổng tiền:</span>
              <span className="text-sm font-bold text-green-600">
                {formatCurrency(booking.total_price)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Room Information */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Hotel className="w-4 h-4 text-purple-600" />
          Thông tin phòng đã đặt
          {booking.booking_rooms && booking.booking_rooms.length > 0 && (
            <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
              {booking.booking_rooms.length} phòng
            </span>
          )}
        </h3>

        {/* Check if multiple rooms */}
        {booking.booking_rooms && booking.booking_rooms.length > 0 ? (
          <div className="space-y-2">
            {booking.booking_rooms.map((bookingRoom: any, index: number) => (
              <div
                key={`room-${bookingRoom.id}-${index}`}
                className="bg-white/80 p-3 rounded-lg border border-purple-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    {bookingRoom.room?.room_type?.name ? (
                      <p className="text-sm font-bold text-purple-900">
                        {bookingRoom.room.room_type.name}
                      </p>
                    ) : (
                      <p className="text-sm font-bold text-gray-400 italic">Chưa xác định loại phòng</p>
                    )}
                    <p className="text-xs text-gray-600">
                      🚪 Phòng {bookingRoom.room?.room_number || 'N/A'} - Tầng{' '}
                      {bookingRoom.room?.floor || 'N/A'}
                    </p>
                  </div>
                  <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Giá/đêm:</span>
                    <span className="font-semibold text-gray-900 ml-1">
                      {bookingRoom.room?.room_type?.base_price
                        ? formatCurrency(bookingRoom.room.room_type.base_price)
                        : 'Chưa có'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Sức chứa:</span>
                    <span className="font-semibold text-gray-900 ml-1">
                      {bookingRoom.room?.room_type?.capacity || 'N/A'} người
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div className="bg-purple-100 rounded-lg px-3 py-2 text-center mt-2">
              <p className="text-sm font-bold text-purple-800">
                📦 Tổng: {booking.booking_rooms.length} phòng
              </p>
            </div>
          </div>
        ) : (
          // Single room booking
          <div className="space-y-2">
            {booking.room?.room_type?.name && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Loại phòng:</span>
                <span className="text-sm font-semibold">{booking.room.room_type.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Số phòng:</span>
              <span className="text-sm font-medium">
                🚪 Phòng {booking.room?.room_number} - Tầng {booking.room?.floor}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Số lượng:</span>
              <span className="text-sm font-medium">📦 {booking.room_quantity || 1} phòng</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Giá/đêm:</span>
              <span className="text-sm font-semibold">
                {formatCurrency(booking.room?.room_type?.base_price || 0)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Services if any */}
      {booking.service_usages && booking.service_usages.length > 0 && (
        <div className="mt-4 bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-100">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-orange-600" />
            Dịch vụ đã đặt
          </h3>
          <div className="space-y-1">
            {booking.service_usages.map((usage: any, index: number) => (
              <div
                key={`usage-${usage.id}-${index}`}
                className="flex justify-between text-xs bg-white/60 px-3 py-2 rounded"
              >
                <span className="text-gray-700">
                  {usage.service?.name || 'N/A'} × {usage.quantity}
                </span>
                <span className="font-semibold text-gray-900">{formatCurrency(usage.total_price)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes if any */}
      {booking.notes && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Ghi chú
          </h3>
          <p className="text-sm text-gray-700">{booking.notes}</p>
        </div>
      )}

      {/* Status Warning */}
      {booking.status !== 'confirmed' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm text-red-800 font-medium">Cảnh báo</p>
            <p className="text-sm text-red-700">
              Trạng thái đặt phòng: <span className="font-semibold">{booking.status}</span>. Chỉ
              check-in cho đặt phòng đã xác nhận.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingInfoCard;
