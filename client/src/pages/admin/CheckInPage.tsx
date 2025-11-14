import React, { useState } from 'react';
import { Search, User, Hotel, CheckCircle, AlertCircle } from 'lucide-react';
import { bookingService, Booking } from '../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../components/common/Loading';

interface GuestInfo {
  name: string;
  id_number: string;
  phone: string;
}

const CheckInPage: React.FC = () => {
  const [bookingNumber, setBookingNumber] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [actualRoomNumber, setActualRoomNumber] = useState('');
  const [guests, setGuests] = useState<GuestInfo[]>([{ name: '', id_number: '', phone: '' }]);
  const [extraPersons, setExtraPersons] = useState(0);
  const [children, setChildren] = useState(0);
  const [additionalFee, setAdditionalFee] = useState(0);

  const handleSearch = async () => {
    if (!bookingNumber.trim()) {
      toast.error('Vui lòng nhập mã đặt phòng');
      return;
    }

    try {
      setSearching(true);
      const response = await bookingService.checkBookingByNumber(bookingNumber);
      setBooking(response.data.booking);
      setActualRoomNumber(response.data.booking.room?.room_number || '');
      toast.success('Tìm thấy đặt phòng');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không tìm thấy đặt phòng');
      setBooking(null);
    } finally {
      setSearching(false);
    }
  };

  const handleAddGuest = () => {
    setGuests([...guests, { name: '', id_number: '', phone: '' }]);
  };

  const handleRemoveGuest = (index: number) => {
    if (guests.length > 1) {
      setGuests(guests.filter((_, i) => i !== index));
    }
  };

  const handleGuestChange = (index: number, field: keyof GuestInfo, value: string) => {
    const newGuests = [...guests];
    newGuests[index][field] = value;
    setGuests(newGuests);
  };

  const calculateAdditionalFee = () => {
    // Logic tính phụ phí: trẻ em và extra person
    const extraPersonFee = extraPersons * 200000; // 200k/người
    const childrenFee = children * 100000; // 100k/trẻ
    const total = extraPersonFee + childrenFee;
    setAdditionalFee(total);
    return total;
  };

  const handleCheckIn = async () => {
    if (!booking) return;

    // Validate
    if (!actualRoomNumber.trim()) {
      toast.error('Vui lòng nhập số phòng thực tế');
      return;
    }

    const mainGuest = guests[0];
    if (!mainGuest.name || !mainGuest.id_number || !mainGuest.phone) {
      toast.error('Vui lòng nhập đầy đủ thông tin khách chính');
      return;
    }

    try {
      setLoading(true);
      // Calculate additional fee
      calculateAdditionalFee();

      await bookingService.updateBooking(booking.id, {
        status: 'checked_in',
        // Có thể gửi thêm data về guests, room_number, additional_fee
      } as any);

      toast.success('Check-in thành công');
      
      // Reset form
      setBooking(null);
      setBookingNumber('');
      setActualRoomNumber('');
      setGuests([{ name: '', id_number: '', phone: '' }]);
      setExtraPersons(0);
      setChildren(0);
      setAdditionalFee(0);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi check-in');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Check-in</h1>
          <p className="text-gray-500 mt-1">Quy trình check-in khách hàng</p>
        </div>
      </div>

      {/* Search Booking */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">1. Tìm kiếm đặt phòng</h2>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={bookingNumber}
              onChange={(e) => setBookingNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Nhập mã đặt phòng (Booking Number)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {searching ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </div>
      </div>

      {/* Booking Info */}
      {booking && (
        <>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              2. Thông tin đặt phòng
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã đặt phòng:</span>
                    <span className="font-semibold">{booking.booking_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Khách hàng:</span>
                    <span className="font-semibold">{booking.user?.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span>{booking.user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SĐT:</span>
                    <span>{booking.user?.phone_number || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loại phòng:</span>
                    <span className="font-semibold">{booking.room?.room_type?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span>{booking.check_in_date ? new Date(booking.check_in_date).toLocaleDateString('vi-VN') : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span>{booking.check_out_date ? new Date(booking.check_out_date).toLocaleDateString('vi-VN') : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số khách:</span>
                    <span>{booking.guest_count} người</span>
                  </div>
                </div>
              </div>
            </div>

            {booking.status !== 'confirmed' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">Cảnh báo</p>
                  <p className="text-sm text-yellow-700">
                    Trạng thái đặt phòng: <span className="font-semibold">{booking.status}</span>. 
                    Chỉ check-in cho đặt phòng đã xác nhận.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Assign Room */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Hotel className="w-5 h-5 text-blue-600" />
              3. Gán số phòng thực tế
            </h2>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số phòng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={actualRoomNumber}
                onChange={(e) => setActualRoomNumber(e.target.value)}
                placeholder="VD: 101, 202, 305"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nhập số phòng thực tế sẽ giao cho khách
              </p>
            </div>
          </div>

          {/* Guest Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              4. Thông tin khách ở
            </h2>
            <div className="space-y-4">
              {guests.map((guest, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">
                      {index === 0 ? 'Khách chính' : `Khách ${index + 1}`}
                      {index === 0 && <span className="text-red-500 ml-1">*</span>}
                    </h3>
                    {index > 0 && (
                      <button
                        onClick={() => handleRemoveGuest(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Họ tên {index === 0 && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        value={guest.name}
                        onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        CMND/CCCD {index === 0 && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        value={guest.id_number}
                        onChange={(e) => handleGuestChange(index, 'id_number', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="001234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Số điện thoại {index === 0 && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="tel"
                        value={guest.phone}
                        onChange={(e) => handleGuestChange(index, 'phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0912345678"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={handleAddGuest}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Thêm khách
              </button>
            </div>
          </div>

          {/* Additional Charges */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">5. Phụ phí (nếu có)</h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số người thêm
                </label>
                <input
                  type="number"
                  min="0"
                  value={extraPersons}
                  onChange={(e) => {
                    setExtraPersons(parseInt(e.target.value) || 0);
                    calculateAdditionalFee();
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">200.000đ/người</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số trẻ em
                </label>
                <input
                  type="number"
                  min="0"
                  value={children}
                  onChange={(e) => {
                    setChildren(parseInt(e.target.value) || 0);
                    calculateAdditionalFee();
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">100.000đ/trẻ</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tổng phụ phí
                </label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-lg font-semibold text-blue-600">
                  {formatCurrency(calculateAdditionalFee())}
                </div>
              </div>
            </div>
          </div>

          {/* Summary & Action */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Xác nhận check-in</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Khách: <span className="font-medium">{booking.user?.full_name}</span> | 
                  Phòng: <span className="font-medium">{actualRoomNumber || 'Chưa gán'}</span>
                  {additionalFee > 0 && (
                    <> | Phụ phí: <span className="font-medium text-red-600">{formatCurrency(additionalFee)}</span></>
                  )}
                </p>
              </div>
              <button
                onClick={handleCheckIn}
                disabled={!actualRoomNumber || !guests[0].name || booking.status !== 'confirmed'}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Xác nhận check-in
              </button>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!booking && !searching && (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có đặt phòng nào được chọn
          </h3>
          <p className="text-gray-600">
            Vui lòng nhập mã đặt phòng ở trên để bắt đầu quy trình check-in
          </p>
        </div>
      )}
    </div>
  );
};

export default CheckInPage;
