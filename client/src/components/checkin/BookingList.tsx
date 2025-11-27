import React from 'react';
import { Calendar, Hotel, User, CheckCircle } from 'lucide-react';
import { Booking } from '../../services/api';

interface BookingListProps {
  bookings: Booking[];
  loading: boolean;
  selectedBooking: Booking | null;
  onSelectBooking: (booking: Booking) => void | Promise<void>;
}

const BookingList: React.FC<BookingListProps> = ({
  bookings,
  loading,
  selectedBooking,
  onSelectBooking,
}) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">Đang tải danh sách...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">Không có đặt phòng nào cần check-in hôm nay</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bookings.map((bookingItem, index) => (
        <div
          key={`booking-list-${bookingItem.id}-${index}`}
          onClick={() => onSelectBooking(bookingItem)}
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
            selectedBooking?.id === bookingItem.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-semibold text-gray-900">{bookingItem.booking_number}</p>
              <p className="text-sm text-gray-600">
                {bookingItem.user?.full_name || bookingItem.guest_info?.full_name}
              </p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
              Confirmed
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Hotel className="w-4 h-4 text-blue-600" />
              <span>
                {bookingItem.booking_rooms && bookingItem.booking_rooms.length > 0
                  ? `${bookingItem.booking_rooms.length} phòng`
                  : `Phòng: ${bookingItem.room?.room_number || 'Chưa gán'}`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <User className="w-4 h-4 text-purple-600" />
              <span>{bookingItem.guest_count} khách</span>
            </div>
            {bookingItem.room?.room_type?.name && (
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>{bookingItem.room.room_type.name}</span>
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Check-in:{' '}
              {bookingItem.check_in_date
                ? new Date(bookingItem.check_in_date).toLocaleDateString('vi-VN')
                : 'N/A'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookingList;
