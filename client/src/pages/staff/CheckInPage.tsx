// CheckInPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  User,
  Hotel,
  Plus,
  Trash2,
  DollarSign,
  X,
  Users,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { bookingService, Booking, serviceService, Service, Payment } from '../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../components/common/Loading';
import { CheckInSummary, BookingList, BookingInfoCard } from '../../components/checkin';

/**
 * CheckInPage - Refactor full
 * - Thêm surcharge UI per-room
 * - Thêm upload giấy tờ cho từng guest
 * - Thêm ghi chú check-in
 * - Modal xác nhận trước khi check-in
 * - Tính toán payment summary (paid / remaining)
 * - Service selector dạng list với checkbox + quantity
 * - Alerts cho trạng thái bất thường
 *
 * NOTE: Các API gọi giữ nguyên tên như file gốc.
 */

/* -------------------------- Types -------------------------- */
interface GuestInfoLocal {
  id: string;
  name: string;
  id_number?: string;
  phone?: string;
  guest_type?: 'adult' | 'child';
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  nationality?: string;
  address?: string;
  is_main?: boolean;
  // file uploads
  id_front_url?: string | null;
  id_back_url?: string | null;
  passport_url?: string | null;
}

interface RoomGuestInfo {
  room_id: number;
  room_name: string;
  guests: GuestInfoLocal[];
  surcharges: {
    early_checkin: boolean;
    late_checkout: boolean;
    extra_bed: number;
  };
}

interface SelectedServiceLocal {
  service_id: number;
  name: string;
  price: number;
  quantity: number;
  room_id?: number | null;
  room_name?: string | null;
}

/* -------------------------- Constants -------------------------- */
// các rate có thể lấy từ config / api sau này
const SURCHARGE_RATES = {
  extra_adult: 200000,
  extra_child: 100000,
  early_checkin: 150000,
  late_checkout: 150000,
  extra_bed: 100000,
};

const ADULT_PRICE = 500000;
const CHILD_PRICE = 300000;

/* -------------------------- Small reusable components -------------------------- */

/** GuestCard - hiển thị input cho 1 guest (dùng cho single-room / multi-room) */
const GuestCard: React.FC<{
  guest: GuestInfoLocal;
  required?: boolean;
  onChange: (field: keyof GuestInfoLocal, value: any) => void;
  onRemove?: () => void;
}> = ({ guest, required, onChange, onRemove }) => {
  return (
    <div className="p-3 bg-white border rounded-lg">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {guest.is_main ? '👤 Khách chính' : '👥 Khách'}
            {required && <span className="text-red-500 ml-1">*</span>}
          </div>
          <div className="text-xs text-gray-500 mt-1">{guest.guest_type === 'child' ? 'Trẻ em' : 'Người lớn'}</div>
        </div>
        {!guest.is_main && onRemove && (
          <button onClick={onRemove} className="text-red-600 text-xs flex items-center gap-1">
            <Trash2 className="w-4 h-4" /> Xóa
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-gray-700 mb-1">Họ tên {required && <span className="text-red-500">*</span>}</label>
          <input
            className="w-full px-3 py-2 border rounded text-sm"
            value={guest.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Nguyễn Văn A"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">Ngày sinh {required && <span className="text-red-500">*</span>}</label>
          <input
            type="date"
            className="w-full px-3 py-2 border rounded text-sm"
            value={guest.birthday || ''}
            onChange={(e) => onChange('birthday', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">CMND/CCCD {required && <span className="text-red-500">*</span>}</label>
          <input
            className="w-full px-3 py-2 border rounded text-sm"
            value={guest.id_number || ''}
            onChange={(e) => onChange('id_number', e.target.value)}
            placeholder="001234567890"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">Số điện thoại {required && <span className="text-red-500">*</span>}</label>
          <input
            className="w-full px-3 py-2 border rounded text-sm"
            value={guest.phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="0912345678"
          />
        </div>
      </div>

      {/* Upload giấy tờ */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <FileUpload label="CCCD/CMND (mặt trước)" fileUrl={guest.id_front_url} onChange={(url) => onChange('id_front_url', url)} />
        <FileUpload label="CCCD/CMND (mặt sau)" fileUrl={guest.id_back_url} onChange={(url) => onChange('id_back_url', url)} />
        <FileUpload label="Passport (nếu có)" fileUrl={guest.passport_url} onChange={(url) => onChange('passport_url', url)} />
      </div>
    </div>
  );
};

/** FileUpload - input upload file đơn giản, lưu URL obj */
const FileUpload: React.FC<{ label: string; fileUrl?: string | null; onChange: (url: string | null) => void }> = ({ label, fileUrl, onChange }) => {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return onChange(null);
    // tạo preview URL; trong production có thể upload lên server
    const url = URL.createObjectURL(f);
    onChange(url);
  };

  return (
    <div>
      <label className="block text-xs text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 px-3 py-2 bg-white border rounded cursor-pointer text-sm">
          <Upload className="w-4 h-4" />
          <span>Upload</span>
          <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />
        </label>
        {fileUrl ? (
          <a href={fileUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">Xem</a>
        ) : (
          <span className="text-xs text-gray-500">Chưa có</span>
        )}
      </div>
    </div>
  );
};

/** RoomSection - hiển thị khách & surcharge cho 1 phòng */
const RoomSection: React.FC<{
  roomGuest: RoomGuestInfo;
  capacity?: number;
  onAddGuest: () => void;
  onRemoveGuest: (guestId: string) => void;
  onGuestChange: (guestId: string, field: keyof GuestInfoLocal, value: any) => void;
  onSurchargeChange: (surcharges: RoomGuestInfo['surcharges']) => void;
}> = ({ roomGuest, capacity, onAddGuest, onRemoveGuest, onGuestChange, onSurchargeChange }) => {
  const breakdown = {
    adults: roomGuest.guests.filter((g) => g.guest_type !== 'child').length,
    children: roomGuest.guests.filter((g) => g.guest_type === 'child').length,
    total: roomGuest.guests.length,
  };

  return (
    <div className="border rounded-lg p-4 bg-green-50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-gray-900">{roomGuest.room_name}</h4>
          <p className="text-xs text-gray-600">Sức chứa: {capacity ?? '—'} người</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600">Tổng:</p>
          <p className={`text-lg font-bold ${breakdown.total > (capacity ?? 999) ? 'text-red-600' : 'text-green-700'}`}>
            {breakdown.total}/{capacity ?? '—'}
          </p>
          <p className="text-xs text-gray-600 mt-1">👨 {breakdown.adults} • 👶 {breakdown.children}</p>
        </div>
      </div>

      <div className="space-y-3 mb-3">
        {roomGuest.guests.map((guest) => (
          <GuestCard
            key={guest.id}
            guest={guest}
            required={guest.is_main}
            onChange={(field, value) => onGuestChange(guest.id, field as keyof GuestInfoLocal, value)}
            onRemove={() => onRemoveGuest(guest.id)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onAddGuest}
          className={`px-3 py-2 rounded flex items-center gap-2 text-sm ${breakdown.total >= (capacity ?? 999) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white'}`}
          disabled={breakdown.total >= (capacity ?? 999)}
          title={breakdown.total >= (capacity ?? 999) ? 'Đã đủ sức chứa phòng' : ''}
        >
          <Plus className="w-4 h-4" /> Thêm khách
        </button>

        {/* Surcharge inputs */}
        <div className="w-1/2 bg-white p-3 border rounded">
          <p className="text-xs font-semibold text-gray-700 mb-2">Phụ thu & lựa chọn</p>
          <div className="space-y-2 text-sm">
            {breakdown.total > (capacity ?? 999) && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-800 font-medium">⚠️ Vượt sức chứa: {breakdown.total - (capacity ?? 0)} khách</p>
                <p className="text-xs text-yellow-700">Phụ thu: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((breakdown.total - (capacity ?? 0)) * SURCHARGE_RATES.extra_adult)}</p>
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Giường phụ (số)</label>
              <input
                type="number"
                min={0}
                className="w-full px-2 py-1 border rounded text-sm"
                value={roomGuest.surcharges.extra_bed}
                onChange={(e) => onSurchargeChange({ ...roomGuest.surcharges, extra_bed: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id={`early-${roomGuest.room_id}`}
                type="checkbox"
                checked={roomGuest.surcharges.early_checkin}
                onChange={(e) => onSurchargeChange({ ...roomGuest.surcharges, early_checkin: e.target.checked })}
              />
              <label htmlFor={`early-${roomGuest.room_id}`} className="text-sm text-gray-600">Early check-in (150k)</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id={`late-${roomGuest.room_id}`}
                type="checkbox"
                checked={roomGuest.surcharges.late_checkout}
                onChange={(e) => onSurchargeChange({ ...roomGuest.surcharges, late_checkout: e.target.checked })}
              />
              <label htmlFor={`late-${roomGuest.room_id}`} className="text-sm text-gray-600">Late checkout (150k)</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** ServiceSelector - danh sách dịch vụ với checkbox + quantity */
const ServiceSelector: React.FC<{
  services: Service[];
  selected: SelectedServiceLocal[];
  onToggle: (service: Service, roomId?: number | null, roomName?: string | null) => void;
  onQuantityChange: (serviceIndex: number, quantity: number) => void;
  booking?: Booking | null;
  multiRoom?: boolean;
}> = ({ services, selected, onToggle, onQuantityChange, booking, multiRoom }) => {
  // map selected by service_id + room_id for quick lookup
  const isSelected = (svc: Service, roomId?: number | null) =>
    selected.some((s) => s.service_id === svc.id && (roomId ? s.room_id === roomId : !s.room_id));

  return (
    <div className="space-y-4">
      {/* general */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">Dịch vụ chung</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {services.map((svc) => {
            const alreadyBooked = booking?.service_usages?.some((u: any) => u.service_id === svc.id);
            return (
              <div key={`svc-general-${svc.id}`} className={`p-3 border rounded ${alreadyBooked ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-sm">{svc.name}</div>
                    <div className="text-xs text-gray-500">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(svc.price || 0))}</div>
                    {alreadyBooked && <div className="text-xs text-blue-600 mt-1">✓ Đã đặt trước (có thể tăng thêm)</div>}
                  </div>
                  <div className="text-right">
                    <input
                      type="checkbox"
                      checked={isSelected(svc, null)}
                      onChange={() => onToggle(svc, null, null)}
                    />
                  </div>
                </div>
                {/* quantity */}
                {isSelected(svc, null) && (
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => {
                      const idx = selected.findIndex(s => s.service_id === svc.id && !s.room_id);
                      if (idx >= 0) onQuantityChange(idx, Math.max(1, selected[idx].quantity - 1));
                    }} className="px-2 border rounded">-</button>
                    <div className="px-3">{selected.find(s => s.service_id === svc.id && !s.room_id)?.quantity || 1}</div>
                    <button onClick={() => {
                      const idx = selected.findIndex(s => s.service_id === svc.id && !s.room_id);
                      if (idx >= 0) onQuantityChange(idx, (selected[idx].quantity || 1) + 1);
                    }} className="px-2 border rounded">+</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* per-room services if multiRoom */}
      {multiRoom && booking?.booking_rooms?.map((br: any) => (
        <div key={`svc-room-${br.id}`} className="pt-3 border-t">
          <p className="text-xs font-semibold text-purple-700 mb-2">Dịch vụ cho phòng {br.room.room_number}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {services.map((svc) => {
              const alreadyBooked = booking?.service_usages?.some((u: any) => u.service_id === svc.id);
              return (
                <div key={`svc-room-${br.room.id}-${svc.id}`} className={`p-3 border rounded ${alreadyBooked ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-sm">{svc.name}</div>
                      <div className="text-xs text-gray-500">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(svc.price || 0))}</div>
                      {alreadyBooked && <div className="text-xs text-blue-600 mt-1">✓ Đã đặt trước (có thể tăng thêm)</div>}
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        checked={isSelected(svc, br.room.id)}
                        onChange={() => onToggle(svc, br.room.id, `Phòng ${br.room.room_number}`)}
                      />
                    </div>
                  </div>
                  {isSelected(svc, br.room.id) && (
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => {
                        const idx = selected.findIndex(s => s.service_id === svc.id && s.room_id === br.room.id);
                        if (idx >= 0) onQuantityChange(idx, Math.max(1, selected[idx].quantity - 1));
                      }} className="px-2 border rounded">-</button>
                      <div className="px-3">{selected.find(s => s.service_id === svc.id && s.room_id === br.room.id)?.quantity || 1}</div>
                      <button onClick={() => {
                        const idx = selected.findIndex(s => s.service_id === svc.id && s.room_id === br.room.id);
                        if (idx >= 0) onQuantityChange(idx, (selected[idx].quantity || 1) + 1);
                      }} className="px-2 border rounded">+</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

/** ConfirmModal - modal xác nhận check-in */
const ConfirmModal: React.FC<{
  open: boolean;
  onClose: () => void;
  summary: {
    booking_number: string;
    rooms: string;
    totalGuests: number;
    surchargeTotal: number;
    serviceTotal: number;
    roomTotal: number;
    amountPaid: number;
    amountToCollect: number;
  };
  onConfirm: () => void;
}> = ({ open, onClose, summary, onConfirm }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold">Xác nhận Check-in</h3>
          <button onClick={onClose} className="text-gray-600"><X /></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><strong>Mã đặt phòng:</strong> {summary.booking_number}</div>
            <div><strong>Phòng:</strong> {summary.rooms}</div>
            <div><strong>Tổng khách:</strong> {summary.totalGuests}</div>
            <div><strong>Tổng phụ thu:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary.surchargeTotal)}</div>
            <div><strong>Tổng dịch vụ:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary.serviceTotal)}</div>
            <div><strong>Tổng phòng:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary.roomTotal)}</div>
            <div><strong>Đã thanh toán:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary.amountPaid)}</div>
            <div className="text-red-600"><strong>Cần thu lúc check-in:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary.amountToCollect)}</div>
          </div>
          <p className="text-xs text-gray-500">Kiểm tra thông tin trên trước khi xác nhận. Hành động này sẽ cập nhật trạng thái booking sang "checked_in".</p>
        </div>
        <div className="p-4 border-t flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 border rounded">Hủy</button>
          <button onClick={onConfirm} className="flex-1 py-2 bg-blue-600 text-white rounded">Xác nhận check-in</button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------- Main Component -------------------------- */

const CheckInPage: React.FC = () => {
  // states cơ bản
  const [bookingNumber, setBookingNumber] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [searching, setSearching] = useState(false);

  // single-room vs multi-room
  const [actualRoomNumber, setActualRoomNumber] = useState('');
  const [actualRoomNumbers, setActualRoomNumbers] = useState<{ [k: number]: string }>({});

  // guests & rooms local
  const [guests, setGuests] = useState<GuestInfoLocal[]>([{
    id: `g-${Date.now()}`,
    name: '',
    id_number: '',
    phone: '',
    nationality: 'Việt Nam',
    is_main: true,
  }]);

  const [roomGuests, setRoomGuests] = useState<RoomGuestInfo[]>([]);

  // services
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedServiceLocal[]>([]);
  // const [loadingServices, setLoadingServices] = useState(false); // Removed unused state

  // payment & notes
  const [payment, setPayment] = useState<Payment | null>(null);
  const [checkinNotes, setCheckinNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // alerts
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    fetchServices();
    fetchBookingsToday();
  }, []);

  /* -------------------------- Fetchers -------------------------- */
  const fetchBookingsToday = async () => {
    try {
      setLoadingBookings(true);
      const today = (new Date()).toISOString().slice(0, 10);
      const res = await bookingService.getAllBookings({
        status: 'confirmed',
        check_in_date: today,
        page: 1,
        limit: 100,
      });
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await serviceService.getServices({ status: 'active' });
      setServices(res.data.services || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* -------------------------- Helpers -------------------------- */
  const generateGuestId = () => `guest-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const getGuestTypeByBirthday = (birthday?: string) => {
    if (!birthday) return 'adult';
    const bd = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - bd.getFullYear();
    const m = today.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
    return age >= 12 ? 'adult' : 'child';
  };

  /* -------------------------- Search & Select booking -------------------------- */
  const handleSearch = async () => {
    if (!bookingNumber.trim()) {
      toast.error('Vui lòng nhập mã đặt phòng');
      return;
    }
    try {
      setSearching(true);
      const res = await bookingService.checkBookingByNumber(bookingNumber);
      const found = res.data.booking;
      if (!found) throw new Error('Không tìm thấy booking');
      setBooking(found);
      setActualRoomNumber(found.room?.room_number || '');
      setPayment(found.payments?.[0] || null);
      initGuestsFromBooking(found);
      toast.success('Tìm thấy đặt phòng');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không tìm thấy đặt phòng');
      setBooking(null);
      setPayment(null);
      setRoomGuests([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectBooking = (b: Booking) => {
    setBooking(b);
    setBookingNumber(b.booking_number);
    setActualRoomNumber(b.room?.room_number || '');
    setPayment(b.payments?.[0] || null);
    initGuestsFromBooking(b);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const initGuestsFromBooking = (b: Booking) => {
    const customer = b.guest_info || b.user;
    // multi-room
    if (b.booking_rooms && b.booking_rooms.length > 0) {
      const roomInit: RoomGuestInfo[] = b.booking_rooms.map((br: any) => ({
        room_id: br.room.id,
        room_name: `Phòng ${br.room.room_number}`,
        guests: [{
          id: generateGuestId(),
          name: customer?.full_name || '',
          id_number: '',
          phone: customer?.phone || '',
          guest_type: 'adult',
          is_main: true,
          nationality: 'Việt Nam',
        }],
        surcharges: {
          early_checkin: false,
          late_checkout: false,
          extra_bed: 0,
        }
      }));
      setRoomGuests(roomInit);
      setGuests([]); // clear single-room
    } else {
      // single room
      setGuests([{
        id: generateGuestId(),
        name: customer?.full_name || '',
        id_number: '',
        phone: customer?.phone || '',
        guest_type: 'adult',
        is_main: true,
        nationality: 'Việt Nam',
      }]);
      setRoomGuests([]);
    }
    // Load pre-booked services into selectedServices
    const preBookedServices: SelectedServiceLocal[] = [];
    if (b.service_usages && b.service_usages.length > 0) {
      b.service_usages.forEach((usage: any) => {
        preBookedServices.push({
          service_id: usage.service_id,
          name: usage.service?.name || 'Dịch vụ',
          price: usage.unit_price || usage.service?.price || 0,
          quantity: usage.quantity || 1,
          room_id: null,
          room_name: null,
        });
      });
    }
    setSelectedServices(preBookedServices);
    setCheckinNotes('');
    setActualRoomNumbers({});
  };

  /* -------------------------- Guest handlers (single room) -------------------------- */
  const addGuestSingle = () => {
    const max = booking?.room?.room_type?.capacity || 0;
    if (guests.length >= max) {
      toast.error('Đã đủ sức chứa phòng');
      return;
    }
    setGuests([...guests, {
      id: generateGuestId(),
      name: '',
      id_number: '',
      phone: '',
      guest_type: 'adult',
      is_main: false,
      nationality: 'Việt Nam',
    }]);
  };

  const removeGuestSingle = (id: string) => {
    const target = guests.find(g => g.id === id);
    if (target?.is_main) { toast.error('Không thể xóa khách chính'); return; }
    setGuests(guests.filter(g => g.id !== id));
  };

  const updateGuestSingle = (id: string, field: keyof GuestInfoLocal, value: any) => {
    setGuests(guests.map(g => g.id === id ? { ...g, [field]: value, ...(field === 'birthday' ? { guest_type: getGuestTypeByBirthday(value) } : {}) } : g));
  };

  /* -------------------------- Room (multi-room) handlers -------------------------- */
  const addRoomGuest = (roomId: number) => {
    const br = booking?.booking_rooms?.find((b: any) => b.room.id === roomId);
    const max = br?.room?.room_type?.capacity || 0;
    const room = roomGuests.find(r => r.room_id === roomId);
    if (room && room.guests.length >= max) { toast.error('Đã đủ sức chứa phòng'); return; }
    setRoomGuests(roomGuests.map(r => r.room_id === roomId ? { ...r, guests: [...r.guests, {
      id: generateGuestId(),
      name: '',
      id_number: '',
      phone: '',
      guest_type: 'adult',
      is_main: false,
      nationality: 'Việt Nam',
    }] } : r));
  };

  const removeRoomGuest = (roomId: number, guestId: string) => {
    setRoomGuests(roomGuests.map(r => {
      if (r.room_id === roomId) {
        const g = r.guests.find(x => x.id === guestId);
        if (g?.is_main) { toast.error('Không thể xóa khách chính'); return r; }
        return { ...r, guests: r.guests.filter(x => x.id !== guestId) };
      }
      return r;
    }));
  };

  const updateRoomGuest = (roomId: number, guestId: string, field: keyof GuestInfoLocal, value: any) => {
    setRoomGuests(roomGuests.map(r => {
      if (r.room_id === roomId) {
        return { ...r, guests: r.guests.map(g => g.id === guestId ? { ...g, [field]: value, ...(field === 'birthday' ? { guest_type: getGuestTypeByBirthday(value) } : {}) } : g) };
      }
      return r;
    }));
  };

  const updateRoomSurcharge = (roomId: number, surcharges: RoomGuestInfo['surcharges']) => {
    setRoomGuests(roomGuests.map(r => r.room_id === roomId ? { ...r, surcharges } : r));
  };

  /* -------------------------- Service handlers -------------------------- */
  const handleToggleService = (svc: Service, roomId?: number | null, roomName?: string | null) => {
    // check existing
    const idx = selectedServices.findIndex(s => s.service_id === svc.id && ((s.room_id ?? null) === (roomId ?? null)));
    if (idx >= 0) {
      // remove
      setSelectedServices(selectedServices.filter((_, i) => i !== idx));
      return;
    }
    // add new
    const price = typeof svc.price === 'string' ? parseFloat(svc.price as string) : (svc.price as any) || 0;
    setSelectedServices([...selectedServices, {
      service_id: svc.id,
      name: svc.name,
      price: Number(isNaN(price) ? 0 : price),
      quantity: 1,
      room_id: roomId ?? null,
      room_name: roomName ?? null,
    }]);
  };

  const handleServiceQuantityChange = (index: number, quantity: number) => {
    if (quantity < 1) return;
    setSelectedServices(selectedServices.map((s, i) => i === index ? { ...s, quantity } : s));
  };

  /* -------------------------- Calculations -------------------------- */
  const calculateRoomTotal = () => {
    if (!booking) return 0;
    // room price: base per guest? In original code used ADULT_PRICE/CHILD_PRICE (placeholder)
    if (booking.booking_rooms && booking.booking_rooms.length > 0) {
      // sum per room from local roomGuests
      return roomGuests.reduce((sum, rg) => {
        const breakdown = rg.guests.reduce((acc, g) => {
          if (g.guest_type === 'child') acc.children++; else acc.adults++;
          return acc;
        }, { adults: 0, children: 0 });
        return sum + (breakdown.adults * ADULT_PRICE) + (breakdown.children * CHILD_PRICE);
      }, 0);
    } else {
      const breakdown = guests.reduce((acc, g) => {
        if (g.guest_type === 'child') acc.children++; else acc.adults++;
        return acc;
      }, { adults: 0, children: 0 });
      return (breakdown.adults * ADULT_PRICE) + (breakdown.children * CHILD_PRICE);
    }
  };

  const calculateSurchargeForRoom = (s: RoomGuestInfo['surcharges'], guests: GuestInfoLocal[], capacity: number) => {
    let total = 0;
    // Auto-calculate extra guests beyond capacity
    const breakdown = guests.reduce((acc, g) => {
      if (g.guest_type === 'child') acc.children++; else acc.adults++;
      return acc;
    }, { adults: 0, children: 0 });
    const totalGuests = breakdown.adults + breakdown.children;
    if (totalGuests > capacity) {
      const extra = totalGuests - capacity;
      // Charge for extra guests (prioritize adults rate)
      total += extra * SURCHARGE_RATES.extra_adult;
    }
    total += s.early_checkin ? SURCHARGE_RATES.early_checkin : 0;
    total += s.late_checkout ? SURCHARGE_RATES.late_checkout : 0;
    total += (s.extra_bed || 0) * SURCHARGE_RATES.extra_bed;
    return total;
  };

  const calculateTotalSurcharge = () => {
    if (booking?.booking_rooms && booking.booking_rooms.length > 0) {
      return roomGuests.reduce((sum, rg) => {
        const br = booking.booking_rooms?.find((b: any) => b.room.id === rg.room_id);
        const cap = br?.room?.room_type?.capacity || 999;
        return sum + calculateSurchargeForRoom(rg.surcharges, rg.guests, cap);
      }, 0);
    }
    // single room - no surcharge UI for single room in current implementation
    return 0;
  };

  const calculateServiceTotal = () => {
    return selectedServices.reduce((sum, s) => sum + (Number(s.price || 0) * Number(s.quantity || 1)), 0);
  };

  const calculateAmountPaid = () => {
    // prefer payment object else booking.deposit/paid info
    const p = payment || (booking?.payments?.[0] ?? null);
    if (p && typeof (p as any).amount === 'number') return (p as any).amount;
    // fallback: if booking.total_price and booking.payment_method === 'cash' use deposit 30%
    if (booking) {
      if (booking.payment_method === 'cash') return (booking.total_price || 0) * 0.3;
      if (booking.payment_status === 'paid') return booking.total_price || 0;
    }
    return 0;
  };

  const amountPaid = useMemo(() => calculateAmountPaid(), [payment, booking]);
  const roomTotal = useMemo(() => calculateRoomTotal(), [booking, guests, roomGuests]);
  const surchargeTotal = useMemo(() => calculateTotalSurcharge(), [roomGuests, booking]);
  const serviceTotal = useMemo(() => calculateServiceTotal(), [selectedServices]);
  const grandTotal = useMemo(() => (roomTotal + surchargeTotal + serviceTotal), [roomTotal, surchargeTotal, serviceTotal]);
  const amountToCollect = Math.max(0, grandTotal - amountPaid);

  /* -------------------------- Alerts & validations -------------------------- */
  useEffect(() => {
    const list: string[] = [];
    if (booking) {
      // Only valid statuses: 'unpaid', 'paid', 'refunded'
      if (booking.payment_status === 'unpaid') list.push('Thanh toán chưa hoàn tất (chờ xử lý)');
      if (booking.payment_status === 'refunded') list.push('Thanh toán thất bại');
      // giả sử booking có check_in_from/check_in_to: kiểm tra giờ (placeholder)
      if (booking.status !== 'confirmed') list.push(`Booking trạng thái: ${booking.status}`);
    }
    setAlerts(list);
  }, [booking]);

  /* -------------------------- Final check-in flow -------------------------- */
  const validateBeforeConfirm = (): boolean => {
    if (!booking) { toast.error('Chưa chọn booking'); return false; }

    // room number assigned?
    if (booking.booking_rooms && booking.booking_rooms.length > 0) {
      const hasAll = booking.booking_rooms.every((br: any) => (actualRoomNumbers[br.room.id]?.trim() || br.room?.room_number));
      if (!hasAll) { toast.error('Vui lòng gán số phòng thực tế cho từng phòng'); return false; }
      // each room has main guest info
      const allRoomsHaveMain = roomGuests.length === booking.booking_rooms.length && roomGuests.every(rg => {
        const mg = rg.guests.find(g => g.is_main);
        return mg && mg.name?.trim() && mg.id_number?.trim() && mg.phone?.trim();
      });
      if (!allRoomsHaveMain) { toast.error('Vui lòng nhập đầy đủ thông tin khách chính cho mỗi phòng'); return false; }
    } else {
      if (!actualRoomNumber.trim()) { toast.error('Vui lòng nhập số phòng thực tế'); return false; }
      const mg = guests.find(g => g.is_main);
      if (!mg || !mg.name || !mg.id_number || !mg.phone) { toast.error('Vui lòng nhập đầy đủ thông tin khách chính'); return false; }
    }

    // optionally check payment (e.g., if no prepayment and policy requires deposit)
    // ... thêm rule nếu cần

    return true;
  };

  const handleOpenConfirm = () => {
    if (!validateBeforeConfirm()) return;
    setShowConfirm(true);
  };

  const handleDoCheckin = async () => {
    if (!booking) return;
    setShowConfirm(false);
    setLoading(true);
    try {
      // 1) update booking status
      await bookingService.updateBooking(booking.id, { status: 'checked_in' } as any);

      // 2) use services selected
      if (selectedServices.length > 0) {
        for (const s of selectedServices) {
          try {
            await serviceService.useService({
              booking_id: booking.id,
              service_id: s.service_id,
              quantity: s.quantity,
            });
          } catch (err) {
            console.error('use service error', err);
          }
        }
      }

      // 3) optionally save checkin notes and guest docs - depends on backend
      // TODO: implement API to upload guest documents and notes

      toast.success('Check-in thành công!');
      // refresh list & reset local state
      fetchBookingsToday();
      setBooking(null);
      setGuests([{
        id: generateGuestId(),
        name: '',
        id_number: '',
        phone: '',
        nationality: 'Việt Nam',
        is_main: true,
      }]);
      setRoomGuests([]);
      setSelectedServices([]);
      setPayment(null);
      setActualRoomNumber('');
      setActualRoomNumbers({});
      setCheckinNotes('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi check-in');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------- Render -------------------------- */
  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Check-in</h1>
          <p className="text-gray-500 mt-1">Quy trình check-in (refactor Pro)</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded shadow-sm">
        <h2 className="text-lg font-semibold mb-3">1. Tìm kiếm đặt phòng</h2>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={bookingNumber}
              onChange={(e) => setBookingNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Nhập mã đặt phòng (Booking Number)"
              className="w-full pl-10 pr-4 py-3 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button onClick={handleSearch} disabled={searching} className="px-5 py-3 bg-blue-600 text-white rounded">
            {searching ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </div>
      </div>

      {/* Today bookings */}
      <BookingList bookings={bookings} loading={loadingBookings} selectedBooking={booking} onSelectBooking={handleSelectBooking} />

      {/* Booking info */}
      {booking && (
        <>
          <BookingInfoCard booking={booking} formatCurrency={(a: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(a)} />

          {/* Payment summary */}
          <div className="bg-white p-6 rounded shadow-sm">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-600" /> Thông tin thanh toán</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-600">Tổng phòng</div>
                <div className="text-lg font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(roomTotal)}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-600">Tổng dịch vụ</div>
                <div className="text-lg font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(serviceTotal)}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-600">Phụ thu</div>
                <div className="text-lg font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(surchargeTotal)}</div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Đã thanh toán</div>
                <div className="text-lg font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amountPaid)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Cần thu lúc check-in</div>
                <div className="text-lg font-bold text-red-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amountToCollect)}</div>
              </div>
              <div>
                <button onClick={() => setShowConfirm(true)} className="px-4 py-2 bg-blue-600 text-white rounded">Xem chi tiết / Xác nhận</button>
              </div>
            </div>
          </div>

          {/* Assign room(s) */}
          <div className="bg-white p-6 rounded shadow-sm">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Hotel className="w-5 h-5 text-blue-600" /> 2. Gán số phòng thực tế</h3>
            {booking.booking_rooms && booking.booking_rooms.length > 0 ? (
              <div className="space-y-3">
                {booking.booking_rooms.map((br: any) => (
                  <div key={`assign-${br.id}`} className="p-3 border rounded bg-purple-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">Phòng đã đặt: {br.room.room_number} - {br.room.room_type?.name}</div>
                        <div className="text-xs text-gray-600">Tầng {br.room.floor}</div>
                      </div>
                      <div className="w-1/3">
                        <input
                          className="w-full px-3 py-2 border rounded"
                          placeholder={`VD: ${br.room.room_number}`}
                          value={actualRoomNumbers[br.room.id] || ''}
                          onChange={(e) => setActualRoomNumbers({ ...actualRoomNumbers, [br.room.id]: e.target.value })}
                        />
                        <div className="text-xs text-gray-500 mt-1">Có thể giữ hoặc đổi phòng cùng loại</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="max-w-md">
                <input
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Nhập số phòng thực tế"
                  value={actualRoomNumber}
                  onChange={(e) => setActualRoomNumber(e.target.value)}
                />
                <div className="text-xs text-gray-500 mt-1">Số phòng sẽ giao cho khách</div>
              </div>
            )}
          </div>

          {/* Guest info + surcharge per room */}
          <div className="bg-white p-6 rounded shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"><User className="w-5 h-5 text-purple-600" /> 3. Thông tin khách & Phụ thu</h3>
              <div className="text-xs text-gray-500">Nhập thông tin chi tiết và tải lên giấy tờ</div>
            </div>

            {booking.booking_rooms && booking.booking_rooms.length > 0 ? (
              <div className="space-y-4">
                {roomGuests.map((rg) => {
                  const br = booking.booking_rooms?.find((b: any) => b.room.id === rg.room_id);
                  const cap = br?.room?.room_type?.capacity || 0;
                  return (
                    <RoomSection
                      key={`roomsec-${rg.room_id}`}
                      roomGuest={rg}
                      capacity={cap}
                      onAddGuest={() => addRoomGuest(rg.room_id)}
                      onRemoveGuest={(gid) => removeRoomGuest(rg.room_id, gid)}
                      onGuestChange={(gid, field, val) => updateRoomGuest(rg.room_id, gid, field, val)}
                      onSurchargeChange={(s) => updateRoomSurcharge(rg.room_id, s)}
                    />
                  );
                })}
              </div>
            ) : (
              // single room UI
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Sức chứa: {booking.room?.room_type?.capacity || '—'}</div>
                      <div className="text-xs text-gray-600">Loại: {booking.room?.room_type?.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600">Tổng hiện tại</div>
                      <div className="text-xl font-bold">{guests.length}/{booking.room?.room_type?.capacity}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><User /> Khách chính</h4>
                  {guests.filter(g => g.is_main).map(g => (
                    <GuestCard key={g.id} guest={g} required onChange={(f, v) => updateGuestSingle(g.id, f, v)} />
                  ))}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold flex items-center gap-2"><Users /> Khách đi kèm</h4>
                    <button onClick={addGuestSingle} className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-2"><Plus /> Thêm</button>
                  </div>

                  {guests.filter(g => !g.is_main).length > 0 ? (
                    <div className="space-y-3">
                      {guests.filter(g => !g.is_main).map((g) => (
                        <div key={g.id} className="p-3 bg-white border rounded">
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-medium">Khách</div>
                            <button onClick={() => removeGuestSingle(g.id)} className="text-red-600 text-sm flex items-center gap-1"><Trash2 /> Xóa</button>
                          </div>
                          <GuestCard guest={g} onChange={(f, v) => updateGuestSingle(g.id, f, v)} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-sm text-gray-500 border-dashed border rounded">Chưa có khách đi kèm</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Services */}
          <div className="bg-white p-6 rounded shadow-sm">
            <h3 className="text-lg font-semibold mb-3">4. Dịch vụ</h3>
            <ServiceSelector
              services={services}
              selected={selectedServices}
              onToggle={handleToggleService}
              onQuantityChange={handleServiceQuantityChange}
              booking={booking}
              multiRoom={!!(booking.booking_rooms && booking.booking_rooms.length > 0)}
            />
            <div className="mt-3 p-3 bg-green-50 rounded flex justify-between items-center">
              <div className="text-sm">Tổng tiền dịch vụ</div>
              <div className="text-lg font-bold text-green-700">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(serviceTotal)}</div>
            </div>
          </div>

          {/* Check-in notes & alerts */}
          <div className="bg-white p-6 rounded shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold flex items-center gap-2"><Users /> Khách đi kèm</h4>
                    <button
                      onClick={addGuestSingle}
                      className={`px-3 py-1 rounded flex items-center gap-2 ${guests.length >= (booking?.room?.room_type?.capacity || 999) ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-blue-600 text-white'}`}
                      disabled={guests.length >= (booking?.room?.room_type?.capacity || 999)}
                      title={guests.length >= (booking?.room?.room_type?.capacity || 999) ? 'Đã đủ sức chứa phòng' : ''}
                    >
                      <Plus /> Thêm
                    </button>
                  </div>
            <textarea
              className="w-full p-3 border rounded h-28"
              placeholder="Ghi chú cho lễ tân / yêu cầu đặc biệt..."
              value={checkinNotes}
              onChange={(e) => setCheckinNotes(e.target.value)}
            />
            {alerts.length > 0 && (
              <div className="mt-3 space-y-2">
                {alerts.map((a, i) => <div key={i} className="text-xs text-yellow-800 bg-yellow-50 p-2 rounded">{a}</div>)}
              </div>
            )}
          </div>

          {/* Summary + Confirm */}
          <div className="bg-white p-6 rounded shadow-sm">
            <CheckInSummary
              bookingInfo={{
                booking_number: booking.booking_number,
                guest_name: booking.guest_info?.full_name || booking.user?.full_name || 'N/A',
                room_info: booking.booking_rooms && booking.booking_rooms.length > 0 ? `${booking.booking_rooms.length} phòng` : `Phòng ${actualRoomNumber || booking.room?.room_number || 'N/A'}`,
                total_guests: booking.booking_rooms && booking.booking_rooms.length > 0 ? roomGuests.reduce((s, rg) => s + rg.guests.length, 0) : guests.length,
              }}
              surchargeTotal={surchargeTotal}
              serviceTotal={serviceTotal}
              roomTotal={roomTotal}
              onConfirm={handleOpenConfirm}
              isLoading={loading}
              disabled={booking?.status !== 'confirmed'}
            />
          </div>
        </>
      )}

      {/* Empty state */}
      {!booking && !searching && (
        <div className="bg-gray-50 rounded p-8 text-center">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Chưa có đặt phòng nào được chọn</h3>
          <p className="text-sm text-gray-600">Vui lòng nhập mã đặt phòng ở trên để bắt đầu quy trình check-in</p>
        </div>
      )}

      {/* Confirm modal */}
      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDoCheckin}
        summary={{
          booking_number: booking?.booking_number || '',
          rooms: booking?.booking_rooms && booking.booking_rooms.length > 0 ? `${booking.booking_rooms.length} phòng` : (actualRoomNumber || booking?.room?.room_number || 'N/A'),
          totalGuests: booking?.booking_rooms && booking.booking_rooms.length > 0 ? roomGuests.reduce((s, rg) => s + rg.guests.length, 0) : guests.length,
          surchargeTotal,
          serviceTotal,
          roomTotal,
          amountPaid,
          amountToCollect,
        }}
      />
    </div>
  );
};

export default CheckInPage;
