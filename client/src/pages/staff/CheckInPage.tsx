import React, { useState, useEffect } from 'react';
import { Search, User, Hotel, CheckCircle, AlertCircle, Plus, Trash2, DollarSign, Eye, X, Calendar } from 'lucide-react';
import { bookingService, Booking, serviceService, Service, Payment } from '../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../components/common/Loading';

interface GuestInfo {
  name: string;
  id_number: string;
  phone: string;
}

interface RoomGuestInfo {
  room_id: number;
  room_name: string;
  guests: GuestInfo[];
}

interface SelectedService {
  service_id: number;
  name: string;
  price: number;
  quantity: number;
  room_id?: number; // ID of room this service is for (optional for multi-room bookings)
  room_name?: string; // Name to identify which room
}

const CheckInPage: React.FC = () => {
  const [bookingNumber, setBookingNumber] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [actualRoomNumber, setActualRoomNumber] = useState('');
  const [actualRoomNumbers, setActualRoomNumbers] = useState<{[key: number]: string}>({}); // For multi-room bookings
  const [guests, setGuests] = useState<GuestInfo[]>([{ name: '', id_number: '', phone: '' }]);
  const [roomGuests, setRoomGuests] = useState<RoomGuestInfo[]>([]); // For multi-room bookings
  const [extraPersons, setExtraPersons] = useState(0);
  const [children, setChildren] = useState(0);
  const [roomCharges, setRoomCharges] = useState<{[key: number]: {extraPersons: number, children: number}}>({}); 
  const [additionalFee, setAdditionalFee] = useState(0);
  
  // Service states
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Payment states
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loadingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Bookings list states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Load services and bookings when component mounts
  useEffect(() => {
    fetchServices();
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const today = new Date().toISOString().split('T')[0];
      const response = await bookingService.getAllBookings({
        status: 'confirmed',
        check_in_date: today,
        page: 1,
        limit: 100,
      });
      setBookings(response.data.bookings);
    } catch (error: any) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const response = await serviceService.getServices({ status: 'active' });
      setServices(response.data.services);
    } catch (error: any) {
      console.error('Error loading services:', error);
    } finally {
      setLoadingServices(false);
    }
  };

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
      
      // Don't fetch payment info - will display from booking data instead
      setPayment(null);
      
      toast.success('Tìm thấy đặt phòng');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không tìm thấy đặt phòng');
      setBooking(null);
      setPayment(null);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectBooking = async (selectedBooking: Booking) => {
    setBooking(selectedBooking);
    setBookingNumber(selectedBooking.booking_number);
    setActualRoomNumber(selectedBooking.room?.room_number || '');
    
    // Initialize room guests for multi-room bookings
    if (selectedBooking.booking_rooms && selectedBooking.booking_rooms.length > 0) {
      const initialRoomGuests: RoomGuestInfo[] = selectedBooking.booking_rooms.map((bookingRoom: any) => ({
        room_id: bookingRoom.room.id,
        room_name: `Phòng ${bookingRoom.room.room_number}`,
        guests: [{ name: '', id_number: '', phone: '' }]
      }));
      setRoomGuests(initialRoomGuests);
      
      // Initialize room charges
      const initialCharges: {[key: number]: {extraPersons: number, children: number}} = {};
      selectedBooking.booking_rooms.forEach((bookingRoom: any) => {
        initialCharges[bookingRoom.room.id] = { extraPersons: 0, children: 0 };
      });
      setRoomCharges(initialCharges);
    }
    
    // Don't fetch payment info - will display from booking data instead
    setPayment(null);
    
    // Scroll to booking info section
    window.scrollTo({ top: 300, behavior: 'smooth' });
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

  // Multi-room guest management
  const handleAddRoomGuest = (roomId: number) => {
    setRoomGuests(roomGuests.map(rg => 
      rg.room_id === roomId 
        ? { ...rg, guests: [...rg.guests, { name: '', id_number: '', phone: '' }] }
        : rg
    ));
  };

  const handleRemoveRoomGuest = (roomId: number, guestIndex: number) => {
    setRoomGuests(roomGuests.map(rg => 
      rg.room_id === roomId && rg.guests.length > 1
        ? { ...rg, guests: rg.guests.filter((_, i) => i !== guestIndex) }
        : rg
    ));
  };

  const handleRoomGuestChange = (roomId: number, guestIndex: number, field: keyof GuestInfo, value: string) => {
    setRoomGuests(roomGuests.map(rg => 
      rg.room_id === roomId
        ? {
            ...rg,
            guests: rg.guests.map((g, i) => 
              i === guestIndex ? { ...g, [field]: value } : g
            )
          }
        : rg
    ));
  };

  const handleAddService = (service: Service, roomId?: number, roomName?: string) => {
    // For multi-room bookings, check if service for this specific room already exists
    const existing = selectedServices.find(s => 
      s.service_id === service.id && 
      (roomId ? s.room_id === roomId : !s.room_id)
    );
    
    if (existing) {
      toast.warning(`Dịch vụ "${service.name}" đã được thêm cho ${roomName || 'booking này'}`);
      return;
    }
    
    const parsedPrice = typeof service.price === 'string' ? parseFloat(service.price) : (service.price || 0);
    
    const newService = {
      service_id: service.id,
      name: service.name,
      price: parsedPrice,
      quantity: 1,
      room_id: roomId,
      room_name: roomName
    };
    
    setSelectedServices([...selectedServices, newService]);
  };

  const handleRemoveService = (index: number) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index));
  };

  const handleServiceQuantityChange = (index: number, quantity: number) => {
    if (quantity < 1) return;
    setSelectedServices(selectedServices.map((s, i) => 
      i === index ? { ...s, quantity } : s
    ));
  };

  const calculateServiceTotal = () => {
    if (!selectedServices || selectedServices.length === 0) return 0;
    
    const total = selectedServices.reduce((sum, s) => {
      // Parse price to number safely
      let price = s.price;
      if (typeof price === 'string') {
        price = parseFloat(price);
      }
      // Ensure price and quantity are valid numbers
      const validPrice = (isNaN(price) || price === null || price === undefined) ? 0 : Number(price);
      const validQuantity = (isNaN(s.quantity) || s.quantity === null || s.quantity === undefined) ? 0 : Number(s.quantity);
      
      return sum + (validPrice * validQuantity);
    }, 0);
    
    return isNaN(total) ? 0 : total;
  };

  const calculateAdditionalFee = () => {
    // Logic tính phụ phí: trẻ em và extra person
    let extraPersonFee = 0;
    let childrenFee = 0;
    
    if (booking?.booking_rooms && booking.booking_rooms.length > 0) {
      // Multi-room: sum charges from all rooms
      Object.values(roomCharges).forEach(charge => {
        extraPersonFee += charge.extraPersons * 200000; // 200k/người
        childrenFee += charge.children * 100000; // 100k/trẻ
      });
    } else {
      // Single room
      extraPersonFee = extraPersons * 200000;
      childrenFee = children * 100000;
    }
    
    const serviceFee = calculateServiceTotal();
    return extraPersonFee + childrenFee + serviceFee;
  };

  const handleCheckIn = async () => {
    if (!booking) return;

    // Validate room numbers
    if (booking?.booking_rooms && booking.booking_rooms.length > 0) {
      // Multi-room booking - check if all rooms have numbers (or use default)
      const hasAllRoomNumbers = booking.booking_rooms.every((bookingRoom: any) => 
        actualRoomNumbers[bookingRoom.room.id]?.trim() || bookingRoom.room?.room_number
      );
      if (!hasAllRoomNumbers) {
        toast.error('Vui lòng gán số phòng thực tế cho tất cả các phòng');
        return;
      }

      // Validate all rooms have at least one guest with full info
      if (roomGuests.length === 0) {
        toast.error('Vui lòng nhập thông tin khách cho các phòng');
        return;
      }

      const allRoomsHaveGuests = roomGuests.every(rg => {
        const mainGuest = rg.guests[0];
        return mainGuest && mainGuest.name?.trim() && mainGuest.id_number?.trim() && mainGuest.phone?.trim();
      });
      
      if (!allRoomsHaveGuests) {
        toast.error('Vui lòng nhập đầy đủ thông tin khách chính cho mỗi phòng (Họ tên, CMND/CCCD, Số điện thoại)');
        return;
      }

      // Check if number of room guests matches number of rooms
      if (roomGuests.length !== booking.booking_rooms.length) {
        toast.error(`Cần nhập thông tin khách cho đủ ${booking.booking_rooms.length} phòng`);
        return;
      }
    } else {
      // Single room booking
      if (!actualRoomNumber.trim()) {
        toast.error('Vui lòng nhập số phòng thực tế');
        return;
      }

      const mainGuest = guests[0];
      if (!mainGuest.name || !mainGuest.id_number || !mainGuest.phone) {
        toast.error('Vui lòng nhập đầy đủ thông tin khách chính');
        return;
      }
    }

    try {
      setLoading(true);
      // Calculate additional fee
      const totalAdditionalFee = calculateAdditionalFee();
      setAdditionalFee(totalAdditionalFee);

      // Update booking status to checked_in
      await bookingService.updateBooking(booking.id, {
        status: 'checked_in',
      } as any);

      // Add services if any selected
      if (selectedServices.length > 0) {
        for (const service of selectedServices) {
          try {
            await serviceService.useService({
              booking_id: booking.id,
              service_id: service.service_id,
              quantity: service.quantity
            });
          } catch (error) {
            console.error(`Error adding service ${service.name}:`, error);
          }
        }
      }

      toast.success('Check-in thành công!');
      
      // Refresh bookings list
      fetchBookings();
      
      // Reset form
      setBooking(null);
      setBookingNumber('');
      setActualRoomNumber('');
      setActualRoomNumbers({});
      setGuests([{ name: '', id_number: '', phone: '' }]);
      setRoomGuests([]);
      setExtraPersons(0);
      setChildren(0);
      setRoomCharges({});
      setAdditionalFee(0);
      setSelectedServices([]);
      setPayment(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi check-in');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const validAmount = isNaN(amount) || amount === null || amount === undefined ? 0 : amount;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(validAmount);
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

      {/* Today's Confirmed Bookings */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Đặt phòng cần check-in hôm nay</h2>
        {loadingBookings ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Đang tải danh sách...</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.map((bookingItem, index) => (
              <div
                key={`booking-list-${bookingItem.id}-${index}`}
                onClick={() => handleSelectBooking(bookingItem)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  booking?.id === bookingItem.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{bookingItem.booking_number}</p>
                    <p className="text-sm text-gray-600">{bookingItem.user?.full_name}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                    Confirmed
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Hotel className="w-4 h-4 text-blue-600" />
                    <span>Phòng: {bookingItem.room?.room_number || 'Chưa gán'}</span>
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
                    Check-in: {bookingItem.check_in_date ? new Date(bookingItem.check_in_date).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Không có đặt phòng nào cần check-in hôm nay</p>
          </div>
        )}
      </div>

      {/* Booking Info */}
      {booking && (
        <>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
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
                    <span className="text-sm font-semibold">{booking.guest_info?.full_name || booking.user?.full_name}</span>
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
                      📅 {booking.check_in_date ? new Date(booking.check_in_date).toLocaleDateString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Check-out:</span>
                    <span className="text-sm font-semibold">
                      📅 {booking.check_out_date ? new Date(booking.check_out_date).toLocaleDateString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-green-200">
                    <span className="text-sm text-gray-600">Số đêm:</span>
                    <span className="text-sm font-bold text-green-700">
                      🌙 {booking.check_in_date && booking.check_out_date 
                        ? Math.ceil((new Date(booking.check_out_date).getTime() - new Date(booking.check_in_date).getTime()) / (1000 * 60 * 60 * 24))
                        : 0} đêm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tổng tiền:</span>
                    <span className="text-sm font-bold text-green-600">{formatCurrency(booking.total_price)}</span>
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
                    <div key={`room-${bookingRoom.id}-${index}`} className="bg-white/80 p-3 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          {bookingRoom.room?.room_type?.name ? (
                            <p className="text-sm font-bold text-purple-900">
                              {bookingRoom.room.room_type.name}
                            </p>
                          ) : (
                            <p className="text-sm font-bold text-gray-400 italic">
                              Chưa xác định loại phòng
                            </p>
                          )}
                          <p className="text-xs text-gray-600">
                            🚪 Phòng {bookingRoom.room?.room_number || 'N/A'} - Tầng {bookingRoom.room?.floor || 'N/A'}
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
                    <span className="text-sm font-medium">🚪 Phòng {booking.room?.room_number} - Tầng {booking.room?.floor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Số lượng:</span>
                    <span className="text-sm font-medium">📦 {booking.room_quantity || 1} phòng</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Giá/đêm:</span>
                    <span className="text-sm font-semibold">{formatCurrency(booking.room?.room_type?.base_price || 0)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Services if any */}
            {booking.service_usages && booking.service_usages.length > 0 && (
              <div className="mt-4 bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-100">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Dịch vụ đã đặt
                </h3>
                <div className="space-y-1">
                  {booking.service_usages.map((usage: any, index: number) => (
                    <div key={`usage-${usage.id}-${index}`} className="flex justify-between text-xs bg-white/60 px-3 py-2 rounded">
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
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Ghi chú
                </h3>
                <p className="text-sm text-gray-700">{booking.notes}</p>
              </div>
            )}

            {booking.status !== 'confirmed' && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800 font-medium">Cảnh báo</p>
                  <p className="text-sm text-red-700">
                    Trạng thái đặt phòng: <span className="font-semibold">{booking.status}</span>. 
                    Chỉ check-in cho đặt phòng đã xác nhận.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              2.5. Thông tin thanh toán
            </h2>
            {loadingPayment ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Đang tải thông tin thanh toán...</p>
              </div>
            ) : payment ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Số tiền:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(payment.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Phương thức:</span>
                      <span className="font-medium">
                        {payment.payment_method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Trạng thái:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        payment.payment_status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : payment.payment_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.payment_status === 'completed' ? 'Đã thanh toán' 
                          : payment.payment_status === 'pending' ? 'Chờ xử lý' 
                          : 'Thất bại'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Ngày thanh toán:</span>
                      <span className="text-sm">
                        {payment.payment_date 
                          ? new Date(payment.payment_date).toLocaleDateString('vi-VN')
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-2 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Xem chi tiết thanh toán
                </button>
              </div>
            ) : (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Tổng tiền đặt phòng:</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(booking.total_price || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Phương thức thanh toán:</span>
                    <span className="font-medium">
                      {booking.payment_method === 'cash' ? '💵 Tiền mặt' 
                        : booking.payment_method === 'vnpay' ? '🏦 VNPay'
                        : booking.payment_method === 'bank_transfer' ? '🏦 Chuyển khoản'
                        : 'Chưa rõ'}
                    </span>
                  </div>
                  {booking.payment_method === 'cash' && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Đặt cọc:</span>
                      <span className="font-medium text-orange-600">
                        {formatCurrency((booking.total_price || 0) * 0.3)} (30%)
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2 italic">
                    {booking.payment_method === 'cash' 
                      ? '⚠️ Thanh toán tiền mặt - Thu 30% đặt cọc, còn lại thu khi check-out'
                      : '✅ Đã thanh toán trực tuyến'}
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
            
            {booking?.booking_rooms && booking.booking_rooms.length > 0 ? (
              // Multi-room booking - assign room number for each
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-3">
                  Gán số phòng thực tế cho từng phòng đã đặt:
                </p>
                {booking.booking_rooms.map((bookingRoom: any, index: number) => (
                  <div key={`assign-${bookingRoom.id}-${index}`} className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {bookingRoom.room?.room_type?.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          Phòng đã đặt: {bookingRoom.room?.room_number} - Tầng {bookingRoom.room?.floor}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số phòng thực tế giao cho khách <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={actualRoomNumbers[bookingRoom.room.id] || ''}
                        onChange={(e) => setActualRoomNumbers({
                          ...actualRoomNumbers,
                          [bookingRoom.room.id]: e.target.value
                        })}
                        placeholder={`VD: ${bookingRoom.room?.room_number} hoặc số phòng khác`}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Có thể giữ nguyên hoặc đổi sang phòng khác cùng loại
                      </p>
                    </div>
                  </div>
                ))}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    💡 <strong>Lưu ý:</strong> Nếu để trống, hệ thống sẽ sử dụng số phòng đã đặt làm mặc định.
                  </p>
                </div>
              </div>
            ) : (
              // Single room booking
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
            )}
          </div>

          {/* Guest Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              4. Thông tin khách ở
            </h2>

            {booking?.booking_rooms && booking.booking_rooms.length > 0 ? (
              // Multi-room booking - separate guest info per room
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Nhập thông tin khách cho từng phòng (ít nhất 1 khách chính mỗi phòng):
                </p>
                {roomGuests.map((roomGuest, roomIndex) => (
                  <div key={`guest-room-${roomGuest.room_id}-${roomIndex}`} className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                        #{roomIndex + 1}
                      </span>
                      <div>
                        <h3 className="font-bold text-gray-900">{roomGuest.room_name}</h3>
                        <p className="text-xs text-gray-600">
                          Số khách: {roomGuest.guests.length}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {roomGuest.guests.map((guest, guestIndex) => (
                        <div key={`guest-${roomIndex}-${guestIndex}`} className="p-3 bg-white border border-green-200 rounded-lg">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-medium text-gray-900">
                              {guestIndex === 0 ? '👤 Khách chính' : `👥 Khách ${guestIndex + 1}`}
                              {guestIndex === 0 && <span className="text-red-500 ml-1">*</span>}
                            </h4>
                            {guestIndex > 0 && (
                              <button
                                onClick={() => handleRemoveRoomGuest(roomGuest.room_id, guestIndex)}
                                className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                Xóa
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs text-gray-700 mb-1">
                                Họ tên {guestIndex === 0 && <span className="text-red-500">*</span>}
                              </label>
                              <input
                                type="text"
                                value={guest.name}
                                onChange={(e) => handleRoomGuestChange(roomGuest.room_id, guestIndex, 'name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                                placeholder="Nguyễn Văn A"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-700 mb-1">
                                CMND/CCCD {guestIndex === 0 && <span className="text-red-500">*</span>}
                              </label>
                              <input
                                type="text"
                                value={guest.id_number}
                                onChange={(e) => handleRoomGuestChange(roomGuest.room_id, guestIndex, 'id_number', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                                placeholder="001234567890"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-700 mb-1">
                                Số điện thoại {guestIndex === 0 && <span className="text-red-500">*</span>}
                              </label>
                              <input
                                type="tel"
                                value={guest.phone}
                                onChange={(e) => handleRoomGuestChange(roomGuest.room_id, guestIndex, 'phone', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                                placeholder="0912345678"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddRoomGuest(roomGuest.room_id)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm khách cho {roomGuest.room_name}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Single room booking
              <div className="space-y-4">
                {guests.map((guest, index) => (
                  <div key={`single-guest-${index}`} className="p-4 border border-gray-200 rounded-lg">
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
            )}
          </div>

          {/* Additional Charges */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">5. Phụ phí (nếu có)</h2>

            {booking?.booking_rooms && booking.booking_rooms.length > 0 ? (
              // Multi-room booking - separate charges per room
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Nhập phụ phí cho từng phòng (nếu có người thêm hoặc trẻ em):
                </p>
                {booking.booking_rooms.map((bookingRoom: any, index: number) => (
                  <div key={`charges-${bookingRoom.room.id}-${index}`} className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          Phòng {bookingRoom.room.room_number}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {bookingRoom.room.room_type?.name} - Sức chứa: {bookingRoom.room.room_type?.capacity || 0} người
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số người thêm
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={roomCharges[bookingRoom.room.id]?.extraPersons || 0}
                          onChange={(e) => {
                            setRoomCharges({
                              ...roomCharges,
                              [bookingRoom.room.id]: {
                                ...roomCharges[bookingRoom.room.id],
                                extraPersons: parseInt(e.target.value) || 0
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                          value={roomCharges[bookingRoom.room.id]?.children || 0}
                          onChange={(e) => {
                            setRoomCharges({
                              ...roomCharges,
                              [bookingRoom.room.id]: {
                                ...roomCharges[bookingRoom.room.id],
                                children: parseInt(e.target.value) || 0
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">100.000đ/trẻ</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phụ phí phòng này
                        </label>
                        <div className="px-4 py-2 bg-white border border-orange-300 rounded-lg text-lg font-semibold text-orange-600">
                          {formatCurrency(
                            ((roomCharges[bookingRoom.room.id]?.extraPersons || 0) * 200000) +
                            ((roomCharges[bookingRoom.room.id]?.children || 0) * 100000)
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Total Additional Fee */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Tổng phụ phí tất cả phòng</p>
                      <p className="text-xs text-gray-600 mt-1">
                        (Chưa bao gồm phí dịch vụ)
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatCurrency(
                        Object.values(roomCharges).reduce((sum, charge) => 
                          sum + (charge.extraPersons * 200000) + (charge.children * 100000), 0
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Single room booking
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
            )}
          </div>

          {/* Services */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">6. Dịch vụ đi kèm</h2>
            
            {/* Selected Services */}
            {selectedServices.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Dịch vụ đã chọn:</h3>
                
                {/* Group services by room */}
                {booking?.booking_rooms && booking.booking_rooms.length > 0 ? (
                  // Multi-room booking - group by room
                  <div className="space-y-4">
                    {/* Services without room assignment (general) */}
                    {selectedServices.filter(s => !s.room_id).length > 0 && (
                      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">Dịch vụ chung</p>
                        <div className="space-y-2">
                          {selectedServices
                            .map((service, index) => ({ service, index }))
                            .filter(({ service }) => !service.room_id)
                            .map(({ service, index }) => (
                              <div key={`general-display-${service.service_id}-${index}`} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 text-sm">{service.name}</p>
                                  <p className="text-xs text-gray-600">{formatCurrency(service.price)} x {service.quantity}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleServiceQuantityChange(index, service.quantity - 1)}
                                      className="w-7 h-7 flex items-center justify-center bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-sm"
                                    >
                                      -
                                    </button>
                                    <span className="w-10 text-center font-medium text-sm">{service.quantity}</span>
                                    <button
                                      onClick={() => handleServiceQuantityChange(index, service.quantity + 1)}
                                      className="w-7 h-7 flex items-center justify-center bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-sm"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveService(index)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Services for each room */}
                    {booking.booking_rooms.map((bookingRoom: any, roomIdx: number) => {
                      const roomServices = selectedServices
                        .map((service, index) => ({ service, index }))
                        .filter(({ service }) => service.room_id === bookingRoom.room.id);
                      
                      if (roomServices.length === 0) return null;
                      
                      return (
                        <div key={`selected-${bookingRoom.id}-${roomIdx}`} className="border border-purple-200 rounded-lg p-3 bg-purple-50">
                          <p className="text-xs font-semibold text-purple-800 mb-2 uppercase flex items-center gap-2">
                            <Hotel className="w-3 h-3" />
                            Phòng {bookingRoom.room.room_number} - {bookingRoom.room.room_type?.name}
                          </p>
                          <div className="space-y-2">
                            {roomServices.map(({ service, index }) => (
                              <div key={`room-display-${service.room_id}-${service.service_id}-${index}`} className="flex items-center justify-between p-2 bg-white rounded border border-purple-200">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 text-sm">{service.name}</p>
                                  <p className="text-xs text-gray-600">{formatCurrency(service.price)} x {service.quantity}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleServiceQuantityChange(index, service.quantity - 1)}
                                      className="w-7 h-7 flex items-center justify-center bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-sm"
                                    >
                                      -
                                    </button>
                                    <span className="w-10 text-center font-medium text-sm">{service.quantity}</span>
                                    <button
                                      onClick={() => handleServiceQuantityChange(index, service.quantity + 1)}
                                      className="w-7 h-7 flex items-center justify-center bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-sm"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveService(index)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Single room booking
                  <div className="space-y-2">
                    {selectedServices.map((service, index) => (
                      <div key={`single-service-${service.service_id}-${index}`} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{service.name}</p>
                          <p className="text-sm text-gray-600">{formatCurrency(service.price)} x {service.quantity}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleServiceQuantityChange(index, service.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50"
                            >
                              -
                            </button>
                            <span className="w-12 text-center font-medium">{service.quantity}</span>
                            <button
                              onClick={() => handleServiceQuantityChange(index, service.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveService(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">Tổng tiền dịch vụ:</span>
                    <span className="text-lg font-bold text-green-600">{formatCurrency(calculateServiceTotal())}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Available Services - Show by room for multi-room bookings */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Chọn thêm dịch vụ:</h3>
              
              {booking?.booking_rooms && booking.booking_rooms.length > 0 ? (
                // Multi-room booking - show services for each room
                <div className="space-y-4">
                  {/* General services (no room assignment) */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">Dịch vụ chung (không gắn phòng cụ thể)</p>
                    <p className="text-xs text-gray-500 mb-3 italic">Dịch vụ chung áp dụng cho toàn bộ booking, không tính riêng theo phòng</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {services.map((service) => {
                        // Check if this service is already selected as general service
                        const isSelected = selectedServices.some(s => s.service_id === service.id && !s.room_id);
                        // Check if this service is already booked (in service_usages)
                        const isAlreadyBooked = booking?.service_usages?.some(
                          (usage: any) => usage.service_id === service.id
                        );
                        const isDisabled = isSelected || isAlreadyBooked;
                        
                        return (
                          <button
                            key={`general-${service.id}`}
                            onClick={() => handleAddService(service)}
                            disabled={isDisabled}
                            className={`p-3 border rounded-lg text-left transition-colors ${
                              isDisabled
                                ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
                                : 'bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">{service.name}</p>
                                <p className="text-xs text-gray-600 mt-1">{formatCurrency(service.price)}</p>
                                {isAlreadyBooked && (
                                  <p className="text-xs text-blue-600 mt-1 italic font-medium">✓ Đã đặt trước</p>
                                )}
                              </div>
                              {!isDisabled && (
                                <Plus className="w-5 h-5 text-blue-600 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Services for each room */}
                  {booking.booking_rooms.map((bookingRoom: any, roomIdx: number) => (
                    <div key={`service-room-${bookingRoom.id}-${roomIdx}`} className="border-t pt-4">
                      <p className="text-xs font-semibold text-purple-700 mb-2 uppercase flex items-center gap-2">
                        <Hotel className="w-4 h-4" />
                        Dịch vụ cho Phòng {bookingRoom.room.room_number} - {bookingRoom.room.room_type?.name}
                      </p>
                      <p className="text-xs text-gray-500 mb-3 italic">Các phòng khác có thể chọn cùng dịch vụ này riêng biệt</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {services.map((service) => {
                          // Check if this service is already selected for THIS specific room
                          const isSelectedForThisRoom = selectedServices.some(
                            s => s.service_id === service.id && s.room_id === bookingRoom.room.id
                          );
                          // Check if this service is already selected as general service
                          const isSelectedAsGeneral = selectedServices.some(
                            s => s.service_id === service.id && !s.room_id
                          );
                          // Check if this service is already booked (in service_usages)
                          const isAlreadyBooked = booking?.service_usages?.some(
                            (usage: any) => usage.service_id === service.id
                          );
                          const isDisabled = isSelectedForThisRoom || isSelectedAsGeneral || isAlreadyBooked;
                          
                          return (
                            <button
                              key={`room-${bookingRoom.room.id}-${service.id}`}
                              onClick={() => handleAddService(
                                service, 
                                bookingRoom.room.id, 
                                `Phòng ${bookingRoom.room.room_number}`
                              )}
                              disabled={isDisabled}
                              className={`p-3 border rounded-lg text-left transition-colors relative ${
                                isDisabled
                                  ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
                                  : 'bg-white border-purple-200 hover:border-purple-500 hover:bg-purple-50'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 text-sm">{service.name}</p>
                                  <p className="text-xs text-gray-600 mt-1">{formatCurrency(service.price)}</p>
                                  {isAlreadyBooked && (
                                    <p className="text-xs text-blue-600 mt-1 italic font-medium">✓ Đã đặt trước</p>
                                  )}
                                  {!isAlreadyBooked && isSelectedAsGeneral && (
                                    <p className="text-xs text-orange-600 mt-1 italic">Đã chọn ở dịch vụ chung</p>
                                  )}
                                </div>
                                {!isDisabled && (
                                  <Plus className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Single room booking - simple grid
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {services.map((service, index) => {
                    const isSelected = selectedServices.some(s => s.service_id === service.id);
                    return (
                      <button
                        key={`service-btn-${service.id}-${index}`}
                        onClick={() => handleAddService(service)}
                        disabled={isSelected}
                        className={`p-3 border rounded-lg text-left transition-colors ${
                          isSelected
                            ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                            : 'bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{service.name}</p>
                            <p className="text-xs text-gray-600 mt-1">{formatCurrency(service.price)}</p>
                          </div>
                          {!isSelected && (
                            <Plus className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              
              {services.length === 0 && !loadingServices && (
                <p className="text-sm text-gray-500 text-center py-4">Không có dịch vụ nào</p>
              )}
            </div>
          </div>

          {/* Summary & Action */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Xác nhận check-in</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Khách: <span className="font-medium">{booking.guest_info?.full_name || booking.user?.full_name}</span>
                  {booking?.booking_rooms && booking.booking_rooms.length > 0 ? (
                    <> | Số phòng: <span className="font-medium">{booking.booking_rooms.length} phòng</span></>
                  ) : (
                    <> | Phòng: <span className="font-medium">{actualRoomNumber || 'Chưa gán'}</span></>
                  )}
                  {additionalFee > 0 && (
                    <> | Phụ phí: <span className="font-medium text-red-600">{formatCurrency(additionalFee)}</span></>
                  )}
                </p>
              </div>
              <button
                onClick={handleCheckIn}
                disabled={booking?.status !== 'confirmed'}
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

      {/* Payment Detail Modal */}
      {showPaymentModal && payment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Chi tiết thanh toán</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Payment Status */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Tổng thanh toán</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    payment.payment_status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : payment.payment_status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {payment.payment_status === 'completed' ? 'Đã thanh toán' 
                      : payment.payment_status === 'pending' ? 'Chờ xử lý' 
                      : 'Thất bại'}
                  </span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Thông tin chi tiết</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Mã thanh toán</p>
                      <p className="font-medium">#{payment.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                      <p className="font-medium">
                        {payment.payment_method === 'cash' ? '💵 Tiền mặt' : '🏦 Chuyển khoản'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Mã giao dịch</p>
                      <p className="font-medium">{payment.transaction_id || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Ngày thanh toán</p>
                      <p className="font-medium">
                        {payment.payment_date 
                          ? new Date(payment.payment_date).toLocaleString('vi-VN')
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ngày tạo</p>
                      <p className="font-medium">
                        {new Date(payment.created_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cập nhật lần cuối</p>
                      <p className="font-medium">
                        {new Date(payment.updated_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {payment.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ghi chú</h3>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{payment.notes}</p>
                  </div>
                </div>
              )}

              {/* Booking Info */}
              {booking && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Thông tin đặt phòng</h3>
                  <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Mã đặt phòng:</span>
                      <span className="font-medium">{booking.booking_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Khách hàng:</span>
                      <span className="font-medium">{booking.user?.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tổng tiền phòng:</span>
                      <span className="font-medium">{formatCurrency(booking.total_price)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInPage;
