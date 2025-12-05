import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface SearchRoomFormProps {
  className?: string;
}

const SearchRoomForm: React.FC<SearchRoomFormProps> = ({
  className = '',
}) => {
  const { t } = useTranslation();
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
      toast.error(t('search.errorCheckIn'));
      return;
    }

    if (!checkOutDate) {
      toast.error(t('search.errorCheckOut'));
      return;
    }

    // Check if check-in is not in the past
    const checkInStart = new Date(checkInDate);
    checkInStart.setHours(0, 0, 0, 0);
    
    if (checkInStart < today) {
      toast.error(t('search.errorPastDate'));
      return;
    }

    // Check if check-out is after check-in
    if (checkOutDate <= checkInDate) {
      toast.error(t('search.errorDateOrder'));
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

  return (
    <div className={`w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex items-center justify-center gap-3 mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {t('search.title')}
        </h3>
      </div>

      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-3">
            <label className="sr-only">{t('search.checkInDate')}</label>
            <DatePicker
              selected={checkInDate}
              onChange={(date) => setCheckInDate(date)}
              selectsStart
              startDate={checkInDate}
              endDate={checkOutDate}
              minDate={today}
              placeholderText={t('search.checkInDate')}
              dateFormat="dd/MM"
              popperPlacement="bottom-start"
              popperClassName="shadow-lg z-50"
              popperModifiers={[
                { name: 'preventOverflow', options: { padding: 8 } },
                { name: 'flip', options: { fallbackPlacements: [] } }
              ] as any}
              withPortal
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div className="md:col-span-3">
            <label className="sr-only">{t('search.checkOutDate')}</label>
            <DatePicker
              selected={checkOutDate}
              onChange={(date) => setCheckOutDate(date)}
              selectsEnd
              startDate={checkInDate}
              endDate={checkOutDate}
              minDate={checkInDate || today}
              placeholderText={t('search.checkOutDate')}
              dateFormat="dd/MM"
              popperPlacement="bottom-start"
              popperClassName="shadow-lg z-50"
              popperModifiers={[
                { name: 'preventOverflow', options: { padding: 8 } },
                { name: 'flip', options: { fallbackPlacements: [] } }
              ] as any}
              withPortal
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div className="md:col-span-2">
            <label className="sr-only">{t('search.roomType')}</label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">{t('search.allRooms')}</option>
              <option value="Standard Room">Standard Room</option>
              <option value="Superior Room">Superior Room</option>
              <option value="Deluxe Room">Deluxe Room</option>
              <option value="Executive Room">Executive Room</option>
              <option value="Junior Suite">Junior Suite</option>
              <option value="Suite">Suite</option>
              <option value="Presidential Suite">Presidential Suite</option>
              <option value="Family Room">Family Room</option>
              <option value="Twin Room">Twin Room</option>
              <option value="Double Room">Double Room</option>
              <option value="Accessible Room">Accessible Room</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="sr-only">{t('search.guestCount')}</label>
            <select
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {Array.from({ length: 6 }, (_, i) => i + 1).map((v) => (
                <option key={v} value={v}>{v} {t('search.guests')}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex items-center mt-3 md:mt-0">
            <button
              type="submit"
              disabled={isSearching}
              className="w-full bg-indigo-600 dark:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm hover:bg-indigo-700 dark:hover:bg-indigo-800 disabled:bg-gray-400 dark:disabled:bg-gray-600"
            >
              <span className="inline-flex items-center gap-2 justify-center w-full">
                <Search className="w-4 h-4" />
                {isSearching ? t('search.searching') : t('search.searchButton')}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchRoomForm;
