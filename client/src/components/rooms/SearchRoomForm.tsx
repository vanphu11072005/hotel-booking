import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Search } from 'lucide-react';
import { toast } from 'react-toastify';

interface SearchRoomFormProps {
  className?: string;
}

const SearchRoomForm: React.FC<SearchRoomFormProps> = ({
  className = '',
}) => {
  const navigate = useNavigate();
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [roomType, setRoomType] = useState('');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [isSearching, setIsSearching] = useState(false);

  // Set minimum date to today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!checkInDate) {
      toast.error('Vui lòng chọn ngày nhận phòng');
      return;
    }

    if (!checkOutDate) {
      toast.error('Vui lòng chọn ngày trả phòng');
      return;
    }

    // Check if check-in is not in the past
    const checkInStart = new Date(checkInDate);
    checkInStart.setHours(0, 0, 0, 0);
    
    if (checkInStart < today) {
      toast.error(
        'Ngày nhận phòng không thể là ngày trong quá khứ'
      );
      return;
    }

    // Check if check-out is after check-in
    if (checkOutDate <= checkInDate) {
      toast.error(
        'Ngày trả phòng phải sau ngày nhận phòng'
      );
      return;
    }

    // Format dates to YYYY-MM-DD using local date (avoid UTC shift)
    const formatDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    // Build search params
    const params = new URLSearchParams({
      from: formatDate(checkInDate),
      to: formatDate(checkOutDate),
    });

    if (roomType.trim()) {
      params.append('type', roomType.trim());
    }

    // Append guest count (capacity)
    if (guestCount && guestCount > 0) {
      params.append('capacity', String(guestCount));
    }

    // Navigate to search results
    setIsSearching(true);
    navigate(`/rooms/search?${params.toString()}`);
  };

  // Reset helper (kept for potential future use)
  // const handleReset = () => {
  //   setCheckInDate(null);
  //   setCheckOutDate(null);
  //   setRoomType('');
  //   setGuestCount(1);
  // };

  return (
    <div className={`w-full bg-gray-100 border border-gray-200 rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex items-center justify-center gap-3 mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          Tìm phòng trống
        </h3>
      </div>

      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-3">
            <label className="sr-only">Ngày nhận phòng</label>
            <DatePicker
              selected={checkInDate}
              onChange={(date) => setCheckInDate(date)}
              selectsStart
              startDate={checkInDate}
              endDate={checkOutDate}
              minDate={today}
              placeholderText="Ngày nhận phòng"
              dateFormat="dd/MM"
              popperPlacement="bottom-start"
              popperClassName="shadow-lg z-50"
              popperModifiers={[
                { name: 'preventOverflow', options: { padding: 8 } },
                { name: 'flip', options: { fallbackPlacements: [] } }
              ] as any}
              withPortal
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div className="md:col-span-3">
            <label className="sr-only">Ngày trả phòng</label>
            <DatePicker
              selected={checkOutDate}
              onChange={(date) => setCheckOutDate(date)}
              selectsEnd
              startDate={checkInDate}
              endDate={checkOutDate}
              minDate={checkInDate || today}
              placeholderText="Ngày trả phòng"
              dateFormat="dd/MM"
              popperPlacement="bottom-start"
              popperClassName="shadow-lg z-50"
              popperModifiers={[
                { name: 'preventOverflow', options: { padding: 8 } },
                { name: 'flip', options: { fallbackPlacements: [] } }
              ] as any}
              withPortal
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div className="md:col-span-2">
            <label className="sr-only">Loại phòng</label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Tất cả loại</option>
                <option value="Phòng Tiêu chuẩn">Phòng Tiêu chuẩn</option>
                <option value="Phòng Cao cấp">Phòng Cao cấp</option>
                <option value="Phòng Hạng sang">Phòng Hạng sang</option>
                <option value="Phòng Gia đình">Phòng Gia đình</option>
                <option value="Phòng 2 giường đơn">Phòng 2 giường đơn</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="sr-only">Số khách</label>
            <select
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {Array.from({ length: 4 }, (_, i) => i + 1).map((v) => (
                <option key={v} value={v}>{v} khách</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex items-center mt-3 md:mt-0">
            <button
              type="submit"
              disabled={isSearching}
              className="w-full bg-indigo-600 text-white px-3 py-2 rounded-md text-sm hover:bg-indigo-700 disabled:bg-gray-400"
            >
              <span className="inline-flex items-center gap-2 justify-center w-full">
                <Search className="w-4 h-4" />
                {isSearching ? 'Đang tìm...' : 'Tìm phòng'}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchRoomForm;
