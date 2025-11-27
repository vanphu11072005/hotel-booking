import React, { useState, useEffect } from 'react';
import { 
  useParams, 
  useNavigate, 
  Link,
  useLocation,
} from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import DatePicker from 'react-datepicker';
import { addDays } from 'date-fns';
import QRCode from 'qrcode';
import { 
  Calendar,
  Users,
  CreditCard,
  Building2,
  FileText,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getRoomById,
  getRooms,
  getAvailableRoomCount,
} from '../../services/api/roomService';
import type { Room } from '../../types/rooms';
import { 
  createBooking,
  createMultiRoomTypeBooking,
  type BookingData,
  type MultiRoomTypeBookingData,
} from '../../services/api/bookingService';
import { getServices, type Service } from 
  '../../services/api/serviceService';
import { createVNPayPayment } from '../../services/api/paymentService';
import useAuthStore from '../../store/useAuthStore';
import { 
  bookingValidationSchema, 
  type BookingFormData 
} from '../../validators/bookingValidator';
import Loading from '../../components/common/Loading';

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userInfo } = useAuthStore();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<
    Record<number, number>
  >({});
  const [recentBooking, setRecentBooking] = useState<
    { id: number; booking_number: string } | null
  >(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [pendingBookingData, setPendingBookingData] = useState<BookingData | MultiRoomTypeBookingData | null>(null);
  
  // Multi-room type booking state
  interface SelectedRoomType {
    id: string; // unique ID for each selection
    room: Room;
    quantity: number;
    availableCount: number | null;
    loading: boolean;
  }
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<SelectedRoomType[]>([]);
  const [showRoomTypeSelector, setShowRoomTypeSelector] = useState(false);
  const [availableRoomTypes, setAvailableRoomTypes] = useState<Room[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error(
        'Vui lòng đăng nhập để đặt phòng'
      );
      navigate('/login', { 
        state: { from: `/booking/${id}` } 
      });
    }
  }, [isAuthenticated, navigate, id]);

  // Fetch room details and services
  useEffect(() => {
    if (id && isAuthenticated) {
      fetchRoomDetails(Number(id));
      fetchServices();
    }
  }, [id, isAuthenticated]);

  // Initialize first room type when room is loaded
  useEffect(() => {
    if (room && selectedRoomTypes.length === 0) {
      setSelectedRoomTypes([{
        id: `room-${Date.now()}`,
        room: room,
        quantity: 1,
        availableCount: null,
        loading: false
      }]);
    }
  }, [room]);
  const fetchRoomDetails = async (roomId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRoomById(roomId);

      if (
        (response as any).success ||
        (response as any).status === 'success'
      ) {
        if (response.data && response.data.room) {
          setRoom(response.data.room);
        } else {
          throw new Error('Không thể tải thông tin phòng');
        }
      } else {
        throw new Error('Không thể tải thông tin phòng');
      }
    } catch (err: any) {
      console.error('Error fetching room:', err);
      const message =
        err.response?.data?.message || 'Không thể tải thông tin phòng';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRoomTypes = async () => {
    try {
      const response = await getRooms({ limit: 100 });
      if (response.data && response.data.rooms) {
        setAvailableRoomTypes(response.data.rooms);
      }
    } catch (err) {
      console.error('Error fetching available rooms:', err);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await getServices({ status: 'active', limit: 100 });
      const servicesFromResponse: Service[] =
        (response as any)?.data?.services ?? (response as any)?.services ?? [];
      if (Array.isArray(servicesFromResponse) && servicesFromResponse.length > 0) {
        setServices(servicesFromResponse);
        return;
      }

      const fallback = await getServices({ limit: 100 });
      const fallbackServices: Service[] =
        (fallback as any)?.data?.services ?? (fallback as any)?.services ?? [];
      if (Array.isArray(fallbackServices) && fallbackServices.length > 0) {
        setServices(fallbackServices);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const { control, register, handleSubmit, watch, formState: { errors } } =
    useForm<BookingFormData>({
      resolver: yupResolver(bookingValidationSchema),
      defaultValues: {
        checkInDate: undefined,
        checkOutDate: undefined,
        guestCount: 1,
        notes: '',
        paymentMethod: 'cash',
        fullName: userInfo?.name || '',
        email: userInfo?.email || '',
        phone: userInfo?.phone || '',
        services: [],
      },
    });

  // Watch form values for calculations
  const checkInDate = watch('checkInDate');
  const checkOutDate = watch('checkOutDate');
  const paymentMethod = watch('paymentMethod');

  const formatLocalDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Fetch available count for each room type when dates change
  useEffect(() => {
    const updateAvailability = async () => {
      if (!checkInDate || !checkOutDate || 
        selectedRoomTypes.length === 0
      ) {
        return;
      }

      const checkInStr = formatLocalDate(checkInDate);
      const checkOutStr = formatLocalDate(checkOutDate);

      // Update each room type's availability
      const updatedRoomTypes = await Promise.all(
        selectedRoomTypes.map(async (roomType) => {
          // Skip if currently loading to avoid duplicate fetches
          if (roomType.loading) {
            return roomType;
          }

          try {
            const response = await getAvailableRoomCount(
              roomType.room.id,
              checkInStr,
              checkOutStr
            );
            return {
              ...roomType,
              availableCount: response.data.available_count,
              loading: false
            };
          } catch (error) {
            console.error(
              `Error fetching availability for room ${roomType.room.id}:`,
              error
            );
            return {
              ...roomType,
              availableCount: null,
              loading: false
            };
          }
        })
      );

      // Only update if something changed
      const hasChanges = updatedRoomTypes.some(
        (updated, idx) => 
          updated.availableCount !== 
          selectedRoomTypes[idx].availableCount
      );
      
      if (hasChanges) {
        setSelectedRoomTypes(updatedRoomTypes);
      }
    };

    updateAvailability();
  }, [checkInDate, checkOutDate, selectedRoomTypes.length]);

  // Calculate number of nights and total price
  const numberOfNights =
    checkInDate && checkOutDate
      ? Math.ceil(
          (checkOutDate.getTime() - 
            checkInDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  // Calculate total price for all selected room types
  const roomTotalPrice = selectedRoomTypes.reduce((sum, roomType) => {
    const price = roomType.room.room_type?.base_price || 0;
    return sum + (numberOfNights * price * roomType.quantity);
  }, 0);
  
  // Calculate services total
  const servicesTotalPrice = Object.entries(selectedServices).reduce(
    (sum, [serviceId, quantity]) => {
      const service = services.find(
        (s) => s.id === Number(serviceId)
      );
      return sum + (service ? service.price * quantity : 0);
    },
    0
  );
  
  const totalPrice = roomTotalPrice + servicesTotalPrice;

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Handle room type quantity change
  const handleRoomQuantityChange = (roomTypeId: string, newQuantity: number) => {
    setSelectedRoomTypes(prev => 
      prev.map(rt => 
        rt.id === roomTypeId 
          ? { ...rt, quantity: Math.max(1, Math.min(rt.availableCount || 10, newQuantity)) }
          : rt
      )
    );
  };

  // Handle remove room type
  const handleRemoveRoomType = (roomTypeId: string) => {
    setSelectedRoomTypes(prev => prev.filter(rt => rt.id !== roomTypeId));
  };

  // Handle add new room type
  const handleAddRoomType = async (selectedRoom: Room) => {
    const newRoomType: SelectedRoomType = {
      id: `room-${Date.now()}-${selectedRoom.id}`,
      room: selectedRoom,
      quantity: 1,
      availableCount: null,
      loading: true
    };
    setSelectedRoomTypes(prev => [...prev, newRoomType]);
    setShowRoomTypeSelector(false);

    // Fetch availability for new room type
    if (checkInDate && checkOutDate) {
      try {
        const checkInStr = formatLocalDate(checkInDate);
        const checkOutStr = formatLocalDate(checkOutDate);
        
        const response = await getAvailableRoomCount(
          selectedRoom.id,
          checkInStr,
          checkOutStr
        );
        
        setSelectedRoomTypes(prev => 
          prev.map(rt => 
            rt.id === newRoomType.id
              ? { 
                  ...rt, 
                  availableCount: response.data.available_count,
                  loading: false 
                }
              : rt
          )
        );
      } catch (error) {
        console.error('Error fetching availability:', error);
        setSelectedRoomTypes(prev => 
          prev.map(rt => 
            rt.id === newRoomType.id
              ? { ...rt, availableCount: null, loading: false }
              : rt
          )
        );
      }
    }
  };

  // Handle form submission
  const onSubmit = async (data: BookingFormData) => {
    if (!room) return;

    try {
      setSubmitting(true);

      const checkInDateStr = formatLocalDate(data.checkInDate);
      const checkOutDateStr = formatLocalDate(data.checkOutDate);

      // Step 1: Prepare services list
      const servicesList = Object.entries(selectedServices)
        .filter(([_, quantity]) => quantity > 0)
        .map(([serviceId, quantity]) => ({
          service_id: Number(serviceId),
          quantity,
        }));

      // Step 2: Check if multi-room booking (always use new API for multiple rooms)
      const hasMultipleRooms = selectedRoomTypes.length > 1 || 
        selectedRoomTypes.some(rt => rt.quantity > 1);

      let bookingData: BookingData | MultiRoomTypeBookingData;

      if (hasMultipleRooms) {
        // Use multi-room-type API for any multi-room booking
        bookingData = {
          rooms: selectedRoomTypes.map(rt => ({
            room_id: rt.room.id,
            quantity: rt.quantity
          })),
          check_in_date: checkInDateStr,
          check_out_date: checkOutDateStr,
          guest_count: data.guestCount,
          notes: data.notes || '',
          payment_method: data.paymentMethod,
          total_price: totalPrice,
          guest_info: {
            full_name: data.fullName,
            email: data.email,
            phone: data.phone,
          },
          services: servicesList.length > 0 ? servicesList : undefined,
        } as MultiRoomTypeBookingData;
      } else {
        // Single room type (multiple quantity)
        bookingData = {
          room_id: room.id,
          check_in_date: checkInDateStr,
          check_out_date: checkOutDateStr,
          guest_count: data.guestCount,
          notes: data.notes || '',
          payment_method: data.paymentMethod,
          total_price: totalPrice,
          room_quantity: selectedRoomTypes.reduce(
            (sum, rt) => sum + rt.quantity, 
            0
          ),
          guest_info: {
            full_name: data.fullName,
            email: data.email,
            phone: data.phone,
          },
          services: servicesList.length > 0 ? servicesList : undefined,
        } as BookingData;
      }

      // Step 3: Create booking or show modal based on payment method
      if (bookingData.payment_method === 'bank_transfer') {
        // For bank transfer, show modal first, create booking only after confirmation
        setPendingBookingData(bookingData);
        
        // Generate temporary booking number for QR code
        const tempBookingNumber = `TEMP-${Date.now()}`;
        
        // Generate QR code from bank transfer info
        const qrContent = `Bank: Vietcombank\nAccount: 0123456789\nAmount: ${totalPrice}\nContent: ${tempBookingNumber}`;
        try {
          const qrUrl = await QRCode.toDataURL(qrContent, {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          });
          setQrCodeUrl(qrUrl);
        } catch (err) {
          console.error('Error generating QR code:', err);
          setQrCodeUrl(null);
        }
        
        setShowBankModal(true);
        toast.info('Vui lòng xác nhận thông tin chuyển khoản');
      } else if (bookingData.payment_method === 'vnpay') {
        // For VNPay payment, create booking first then redirect to VNPay
        toast.info('Đang tạo booking và chuyển đến VNPay...');
        
        const bookingResponse = hasMultipleRooms
          ? await createMultiRoomTypeBooking(bookingData as MultiRoomTypeBookingData)
          : await createBooking(bookingData as BookingData);

        if (bookingResponse.success && bookingResponse.data) {
          const newBooking = bookingResponse.data.booking;

          // Find payment from payments array (VNPay uses 'full' type, cash uses 'deposit')
          const payment = newBooking.payments?.find(
            (p: any) => p.payment_type === 'full' || p.payment_type === 'deposit'
          );

          if (payment) {
            // Create VNPay payment URL
            const vnpayResponse = await createVNPayPayment(
              payment.id
            );

            if (vnpayResponse.success && vnpayResponse.data.payment_url) {
              // Clear any pending data
              sessionStorage.removeItem('pendingBookingData');
              
              // Redirect to VNPay
              window.location.href = vnpayResponse.data.payment_url;
            } else {
              toast.error(vnpayResponse.message || 
                'Không thể tạo thanh toán VNPay');
            }
          } else {
            toast.error('Không tìm thấy thông tin thanh toán');
          }
        } else {
          toast.error(bookingResponse.message || 
            'Không thể tạo booking');
        }
      } else {
        // For cash payment, save booking data and redirect to deposit payment page
        // Store booking data in sessionStorage
        sessionStorage.setItem('pendingBookingData', JSON.stringify(bookingData));
        
        toast.info('Vui lòng hoàn tất thanh toán tiền đặt cọc');
        
        // Redirect to deposit payment page (use room_id as placeholder)
        navigate(`/deposit-payment/${room.id}?pending=true`);
      }
    } catch (err: any) {
      console.error('Error creating booking:', err);
      
      // Handle specific error cases
      if (err.response?.status === 409) {
        toast.error(
          '❌ Phòng đã được đặt trong thời gian này. ' +
          'Vui lòng chọn ngày khác.'
        );
      } else if (err.response?.status === 400) {
        toast.error(
          err.response?.data?.message || 
          'Thông tin đặt phòng không hợp lệ'
        );
      } else {
        const message =
          err.response?.data?.message ||
          'Không thể đặt phòng. Vui lòng thử lại.';
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle bank transfer confirmation
  const handleConfirmBankTransfer = async () => {
    if (!pendingBookingData) return;

    try {
      setSubmitting(true);

      // Check if multi-room-type booking
      const isMultiType = 'rooms' in pendingBookingData;
      const response = isMultiType
        ? await createMultiRoomTypeBooking(pendingBookingData as MultiRoomTypeBookingData)
        : await createBooking(pendingBookingData as BookingData);

      if (response.success && response.data?.booking) {
        const created = response.data.booking;
        
        // Update QR code with actual booking number
        const qrContent = `Bank: Vietcombank\nAccount: 0123456789\nAmount: ${pendingBookingData.total_price}\nContent: ${created.booking_number}`;
        try {
          const qrUrl = await QRCode.toDataURL(qrContent, {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          });
          setQrCodeUrl(qrUrl);
        } catch (err) {
          console.error('Error generating QR code:', err);
        }

        setRecentBooking({ 
          id: created.id, 
          booking_number: created.booking_number 
        });
        
        setShowBankModal(false);
        setPendingBookingData(null);
        
        toast.success(
          '🎉 Tạo đơn đặt phòng thành công!',
          { icon: <CheckCircle className="text-green-500" /> }
        );
        
        navigate(`/booking-success/${created.id}`);
      } else {
        throw new Error(
          response.message || 'Không thể tạo đặt phòng'
        );
      }
    } catch (err: any) {
      console.error('Error creating booking:', err);
      const message =
        err.response?.data?.message ||
        'Không thể tạo đặt phòng. Vui lòng thử lại.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle close modal without creating booking
  const handleCloseBankModal = () => {
    setShowBankModal(false);
    setPendingBookingData(null);
    setQrCodeUrl(null);
    toast.info('Đã hủy thao tác đặt phòng');
  };

  if (loading) {
    return <Loading fullScreen text="Đang tải..." />;
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div 
            className="bg-red-50 border border-red-200 
              rounded-lg p-8 text-center"
          >
            <AlertCircle 
              className="w-12 h-12 text-red-500 
                mx-auto mb-3" 
            />
            <p className="text-red-700 font-medium mb-4">
              {error || 'Không tìm thấy phòng'}
            </p>
            <button
              onClick={() => navigate('/rooms')}
              className="inline-flex items-center gap-2 bg-indigo-600 
            text-white px-3 py-2 rounded-md hover:bg-indigo-700 
            disabled:bg-gray-400 mb-6 transition-colors"
            >
              Quay lại danh sách phòng
            </button>
          </div>
        </div>
      </div>
    );
  }

  const roomType = room.room_type;
  if (!roomType) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <Link
          to={`/rooms/${room.id}${location.search || ''}`}
          className="inline-flex items-center gap-2 bg-indigo-600 
            text-white px-3 py-2 rounded-md hover:bg-indigo-700 
            disabled:bg-gray-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại chi tiết phòng</span>
        </Link>

        {/* Page Title */}
        <h1 
          className="text-3xl font-bold text-gray-900 mb-8"
        >
          Đặt phòng
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form 
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white rounded-lg shadow-md 
                p-6 space-y-6"
            >
              {/* Guest Information */}
              <div>
                <h2 
                  className="text-xl font-bold 
                    text-gray-900 mb-4"
                >
                  Thông tin khách hàng
                </h2>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label 
                      className="block text-sm font-medium 
                        text-gray-700 mb-1"
                    >
                      Họ và tên
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('fullName')}
                      type="text"
                      className="w-full px-4 py-2 border 
                        border-gray-300 rounded-lg 
                        focus:ring-2 focus:ring-indigo-500 
                        focus:border-indigo-500"
                      placeholder="Nguyễn Văn A"
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 
                    md:grid-cols-2 gap-4"
                  >
                    <div>
                      <label 
                        className="block text-sm 
                          font-medium text-gray-700 mb-1"
                      >
                        Email
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full px-4 py-2 border 
                          border-gray-300 rounded-lg 
                          focus:ring-2 
                          focus:ring-indigo-500 
                          focus:border-indigo-500"
                        placeholder="email@example.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600 
                          mt-1"
                        >
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label 
                        className="block text-sm 
                          font-medium text-gray-700 mb-1"
                      >
                        Số điện thoại
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('phone')}
                        type="tel"
                        className="w-full px-4 py-2 border 
                          border-gray-300 rounded-lg 
                          focus:ring-2 
                          focus:ring-indigo-500 
                          focus:border-indigo-500"
                        placeholder="0123456789"
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-600 
                          mt-1"
                        >
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="border-t pt-6">
                <h2 
                  className="text-xl font-bold 
                    text-gray-900 mb-4"
                >
                  Chi tiết đặt phòng
                </h2>

                <div className="space-y-4">
                  {/* Date Range */}
                  <div className="grid grid-cols-1 
                    md:grid-cols-2 gap-4"
                  >
                    {/* Check-in Date */}
                    <div>
                      <label 
                        className="block text-sm 
                          font-medium text-gray-700 mb-1"
                      >
                        <Calendar 
                          className="w-4 h-4 inline mr-1" 
                        />
                        Ngày nhận phòng
                        <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        control={control}
                        name="checkInDate"
                        render={({ field }) => (
                          <DatePicker
                            selected={field.value}
                            onChange={(date) => 
                              field.onChange(date)
                            }
                            minDate={new Date()}
                            selectsStart
                            startDate={checkInDate}
                            endDate={checkOutDate}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Chọn ngày nhận"
                            className="w-full px-4 py-2 
                              border border-gray-300 
                              rounded-lg focus:ring-2 
                              focus:ring-indigo-500 
                              focus:border-indigo-500"
                            wrapperClassName="w-full"
                          />
                        )}
                      />
                      {errors.checkInDate && (
                        <p className="text-sm text-red-600 
                          mt-1"
                        >
                          {errors.checkInDate.message}
                        </p>
                      )}
                    </div>

                    {/* Check-out Date */}
                    <div>
                      <label 
                        className="block text-sm 
                          font-medium text-gray-700 mb-1"
                      >
                        <Calendar 
                          className="w-4 h-4 inline mr-1" 
                        />
                        Ngày trả phòng
                        <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        control={control}
                        name="checkOutDate"
                        render={({ field }) => (
                          <DatePicker
                            selected={field.value}
                            onChange={(date) => 
                              field.onChange(date)
                            }
                            minDate={checkInDate ? addDays(checkInDate, 1) : new Date()}
                            selectsEnd
                            startDate={checkInDate}
                            endDate={checkOutDate}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Chọn ngày trả"
                            className="w-full px-4 py-2 
                              border border-gray-300 
                              rounded-lg focus:ring-2 
                              focus:ring-indigo-500 
                              focus:border-indigo-500"
                            wrapperClassName="w-full"
                          />
                        )}
                      />
                      {errors.checkOutDate && (
                        <p className="text-sm text-red-600 
                          mt-1"
                        >
                          {errors.checkOutDate.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Guest Count */}
                  <div>
                    <label 
                      className="block text-sm font-medium 
                        text-gray-700 mb-1"
                    >
                      <Users 
                        className="w-4 h-4 inline mr-1" 
                      />
                      Số người
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('guestCount')}
                      type="number"
                      min="1"
                      max={roomType.capacity}
                      className="w-full px-4 py-2 border 
                        border-gray-300 rounded-lg 
                        focus:ring-2 focus:ring-indigo-500 
                        focus:border-indigo-500"
                      placeholder="1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Sức chứa tối đa: {roomType.capacity} người
                    </p>
                    {errors.guestCount && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.guestCount.message}
                      </p>
                    )}
                  </div>

                  {/* Selected Room Types */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building2 className="w-4 h-4 inline mr-1" />
                      Phòng bạn muốn đặt
                      <span className="text-red-500">*</span>
                    </label>

                    {selectedRoomTypes.map((roomType, index) => (
                      <div 
                        key={roomType.id}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                              🛏 Loại phòng {index + 1}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Loại phòng:</span>{' '}
                              {roomType.room.room_type?.name || 'N/A'}
                            </p>
                          </div>
                          {selectedRoomTypes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRoomType(roomType.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              ✕ Xóa
                            </button>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            {roomType.loading ? (
                              <span className="text-gray-500">
                                <Loader2 className="w-3 h-3 inline animate-spin mr-1" />
                                Đang kiểm tra...
                              </span>
                            ) : roomType.availableCount !== null ? (
                              roomType.availableCount > 0 ? (
                                <span className="text-green-600">
                                  ✓ Còn trống: {roomType.availableCount}
                                </span>
                              ) : (
                                <span className="text-red-600">
                                  ✗ Hết phòng
                                </span>
                              )
                            ) : (
                              <span className="text-gray-500">
                                Chọn ngày để xem
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">Số lượng:</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleRoomQuantityChange(
                                  roomType.id, 
                                  roomType.quantity - 1
                                )}
                                disabled={roomType.quantity <= 1}
                                className="w-8 h-8 rounded-md border border-gray-300 
                                  flex items-center justify-center
                                  hover:bg-gray-100 disabled:opacity-50 
                                  disabled:cursor-not-allowed"
                              >
                                −
                              </button>
                              <span className="w-12 text-center font-semibold">
                                {roomType.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRoomQuantityChange(
                                  roomType.id, 
                                  roomType.quantity + 1
                                )}
                                disabled={
                                  roomType.availableCount !== null && 
                                  roomType.quantity >= roomType.availableCount
                                }
                                className="w-8 h-8 rounded-md border border-gray-300 
                                  flex items-center justify-center
                                  hover:bg-gray-100 disabled:opacity-50 
                                  disabled:cursor-not-allowed"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add Room Type Button */}
                    <button
                      type="button"
                      onClick={() => {
                        fetchAvailableRoomTypes();
                        setShowRoomTypeSelector(true);
                      }}
                      className="w-full py-3 border-2 border-dashed border-gray-300 
                        rounded-lg text-gray-600 hover:border-indigo-500 
                        hover:text-indigo-600 transition-colors flex items-center 
                        justify-center gap-2"
                    >
                      ➕ Thêm loại phòng khác
                    </button>
                  </div>

                  {/* Notes */}
                  <div>
                    <label 
                      className="block text-sm font-medium 
                        text-gray-700 mb-1"
                    >
                      <FileText 
                        className="w-4 h-4 inline mr-1" 
                      />
                      Ghi chú (không bắt buộc)
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={3}
                      className="w-full px-4 py-2 border 
                        border-gray-300 rounded-lg 
                        focus:ring-2 focus:ring-indigo-500 
                        focus:border-indigo-500"
                      placeholder="Yêu cầu đặc biệt..."
                    />
                    {errors.notes && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.notes.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Services */}
              {services.length > 0 && (
                <div className="border-t pt-6">
                  <h2 
                    className="text-xl font-bold 
                      text-gray-900 mb-4"
                  >
                    Dịch vụ bổ sung (tùy chọn)
                  </h2>

                  <div className="space-y-3">
                        <div className="max-h-72 overflow-y-auto space-y-3 pr-2">
                        {services.map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center 
                              justify-between p-4 border 
                              border-gray-200 rounded-lg 
                              hover:border-indigo-500 
                              transition-colors"
                          >
                        <div className="flex-1">
                          <h3 
                            className="font-medium 
                              text-gray-900"
                          >
                            {service.name}
                          </h3>
                          {service.description && (
                            <p 
                              className="text-sm 
                                text-gray-600 mt-1"
                            >
                              {service.description}
                            </p>
                          )}
                          <p
                            className="text-sm text-indigo-600 
                              font-medium mt-1"
                          >
                            {formatPrice(service.price)} /{service.unit}
                          </p>
                        </div>

                        <div 
                          className="flex items-center gap-2 
                            ml-4"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              const currentQty =
                                selectedServices[
                                  service.id
                                ] || 0;
                              if (currentQty > 0) {
                                setSelectedServices({
                                  ...selectedServices,
                                  [service.id]: 
                                    currentQty - 1,
                                });
                              }
                            }}
                            className="w-8 h-8 flex 
                              items-center justify-center 
                              rounded-lg border 
                              border-gray-300 
                              hover:bg-gray-100 
                              disabled:opacity-50 
                              disabled:cursor-not-allowed"
                            disabled={
                              !selectedServices[service.id] ||
                              selectedServices[service.id] === 0
                            }
                          >
                            -
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={
                              selectedServices[service.id] || 0
                            }
                            onChange={(e) => {
                              const value = Math.max(
                                0,
                                parseInt(e.target.value) || 0
                              );
                              setSelectedServices({
                                ...selectedServices,
                                [service.id]: value,
                              });
                            }}
                            className="w-16 text-center px-2 
                              py-1 border border-gray-300 
                              rounded-lg focus:ring-2 
                              focus:ring-indigo-500 
                              focus:border-indigo-500"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              const currentQty =
                                selectedServices[
                                  service.id
                                ] || 0;
                              setSelectedServices({
                                ...selectedServices,
                                [service.id]: currentQty + 1,
                              });
                            }}
                            className="w-8 h-8 flex 
                              items-center justify-center 
                              rounded-lg border 
                              border-gray-300 
                              hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="border-t pt-6">
                <h2 
                  className="text-xl font-bold 
                    text-gray-900 mb-4"
                >
                  Phương thức thanh toán
                </h2>

                <div className="space-y-3">
                  {/* Cash */}
                  <label 
                    className="flex items-start p-4 
                      border-2 border-gray-200 
                      rounded-lg cursor-pointer 
                      hover:border-indigo-500 
                      transition-colors"
                  >
                    <input
                      {...register('paymentMethod')}
                      type="radio"
                      value="cash"
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center 
                        gap-2 mb-1"
                      >
                        <CreditCard 
                          className="w-5 h-5 
                            text-gray-600" 
                        />
                        <span className="font-medium 
                          text-gray-900"
                        >
                          Thanh toán khi nhận phòng
                        </span>
                        <span className="text-xs bg-orange-100 
                          text-orange-700 px-2 py-0.5 rounded"
                        >
                          Cần đặt cọc 20%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Thanh toán phần còn lại khi nhận phòng
                      </p>
                      <div className="bg-orange-50 border 
                        border-orange-200 rounded p-2"
                      >
                        <p className="text-xs text-orange-800">
                          <strong>Lưu ý:</strong> Bạn cần thanh toán 
                          <strong> 20% tiền cọc</strong> qua 
                          chuyển khoản ngay sau khi đặt phòng để 
                          giữ phòng. Phần còn lại thanh toán 
                          khi nhận phòng.
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Bank Transfer */}
                  <label 
                    className="flex items-start p-4 
                      border-2 border-gray-200 
                      rounded-lg cursor-pointer 
                      hover:border-indigo-500 
                      transition-colors"
                  >
                    <input
                      {...register('paymentMethod')}
                      type="radio"
                      value="bank_transfer"
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center 
                        gap-2 mb-1"
                      >
                        <Building2 
                          className="w-5 h-5 
                            text-gray-600" 
                        />
                        <span className="font-medium 
                          text-gray-900"
                        >
                          Chuyển khoản ngân hàng
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Chuyển khoản qua QR code hoặc 
                        số tài khoản
                      </p>
                    </div>
                  </label>

                  {/* VNPay */}
                  <label 
                    className="flex items-start p-4 
                      border-2 border-gray-200 
                      rounded-lg cursor-pointer 
                      hover:border-indigo-500 
                      transition-colors"
                  >
                    <input
                      {...register('paymentMethod')}
                      type="radio"
                      value="vnpay"
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center 
                        gap-2 mb-1"
                      >
                        <CreditCard 
                          className="w-5 h-5 
                            text-blue-600" 
                        />
                        <span className="font-medium 
                          text-gray-900"
                        >
                          Thanh toán qua VNPay
                        </span>
                        <span className="text-xs bg-blue-100 
                          text-blue-700 px-2 py-0.5 rounded"
                        >
                          Nhanh chóng & An toàn
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Thanh toán bằng thẻ ATM, Visa, 
                        Mastercard qua cổng VNPay
                      </p>
                    </div>
                  </label>

                  {errors.paymentMethod && (
                    <p className="text-sm text-red-600">
                      {errors.paymentMethod.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="border-t pt-6">
                <button
                  type="submit"
                  disabled={
                    submitting || 
                    selectedRoomTypes.length === 0 ||
                    selectedRoomTypes.some(rt => rt.availableCount === 0) ||
                    selectedRoomTypes.some(rt => rt.availableCount !== null && rt.quantity > rt.availableCount)
                  }
                  className="w-full bg-indigo-600 
                    text-white py-4 rounded-lg 
                    hover:bg-indigo-700 
                    transition-colors font-semibold 
                    text-lg disabled:bg-gray-400 
                    disabled:cursor-not-allowed
                    flex items-center justify-center 
                    gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 
                        className="w-5 h-5 animate-spin" 
                      />
                      Đang xử lý...
                    </>
                  ) : (
                    'Xác nhận đặt phòng'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div 
              className="bg-white rounded-lg shadow-md 
                p-6 sticky top-8"
            >
              <h2 
                className="text-xl font-bold 
                  text-gray-900 mb-4"
              >
                Tóm tắt đặt phòng
              </h2>

              {/* Room Info */}
              <div className="mb-4">
                {room?.images?.[0] && (
                  <img
                    src={room.images[0]}
                    alt={roomType.name}
                    className="w-full h-48 object-cover 
                      rounded-lg mb-3"
                  />
                )}
                <h3 className="font-bold text-gray-900">
                  {roomType.name}
                </h3>
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t pt-4 space-y-2">
                {numberOfNights > 0 && (
                  <div className="flex justify-between 
                    text-sm"
                  >
                    <span className="text-gray-600">
                      Số đêm
                    </span>
                    <span className="font-medium">
                      {numberOfNights} đêm
                    </span>
                  </div>
                )}

                {/* Room types breakdown */}
                <div className="space-y-1">
                  <p className="text-sm font-medium 
                    text-gray-700"
                  >
                    Phòng đã chọn
                  </p>
                  {selectedRoomTypes.map((roomType) => {
                    const price = 
                      roomType.room.room_type?.base_price || 0;
                    const subtotal = 
                      numberOfNights * price * roomType.quantity;
                    return (
                      <div
                        key={roomType.id}
                        className="flex justify-between 
                          text-sm text-gray-600 pl-2"
                      >
                        <span>
                          {roomType.room.room_type?.name} × 
                          {roomType.quantity}
                        </span>
                        <span>
                          {formatPrice(subtotal)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {numberOfNights > 0 && (
                  <div className="flex justify-between 
                    text-sm"
                  >
                    <span className="text-gray-600">
                      Tổng tiền phòng
                    </span>
                    <span className="font-medium">
                      {formatPrice(roomTotalPrice)}
                    </span>
                  </div>
                )}

                {/* Services breakdown */}
                {servicesTotalPrice > 0 && (
                  <>
                    <div className="border-t pt-2">
                      <p className="text-sm font-medium 
                        text-gray-700 mb-2"
                      >
                        Dịch vụ bổ sung
                      </p>
                      {Object.entries(selectedServices)
                        .filter(([_, qty]) => qty > 0)
                        .map(([serviceId, qty]) => {
                          const service = services.find(
                            (s) => s.id === Number(serviceId)
                          );
                          if (!service) return null;
                          return (
                            <div
                              key={serviceId}
                              className="flex justify-between 
                                text-sm text-gray-600 mb-1"
                            >
                              <span>
                                {service.name} × {qty}
                              </span>
                              <span>
                                {formatPrice(
                                  service.price * qty
                                )}
                              </span>
                            </div>
                          );
                        })}
                    </div>

                    <div className="flex justify-between 
                      text-sm font-medium"
                    >
                      <span className="text-gray-600">
                        Tổng tiền dịch vụ
                      </span>
                      <span>
                        {formatPrice(servicesTotalPrice)}
                      </span>
                    </div>
                  </>
                )}

                <div 
                  className="border-t pt-2 flex 
                    justify-between text-lg 
                    font-bold"
                >
                  <span>Tổng cộng</span>
                  <span className="text-indigo-600">
                    {numberOfNights > 0
                      ? formatPrice(totalPrice)
                      : '---'}
                  </span>
                </div>

                {/* Deposit amount for cash payment */}
                {paymentMethod === 'cash' && numberOfNights > 0 && (
                  <div className="bg-orange-50 border 
                    border-orange-200 rounded-lg p-3 mt-2"
                  >
                    <div className="flex justify-between 
                      items-center mb-1"
                    >
                      <span className="text-sm font-medium 
                        text-orange-900"
                      >
                        Tiền cọc cần thanh toán (20%)
                      </span>
                      <span className="text-lg font-bold 
                        text-orange-700"
                      >
                        {formatPrice(totalPrice * 0.2)}
                      </span>
                    </div>
                    <p className="text-xs text-orange-700">
                      Thanh toán qua chuyển khoản để xác nhận đặt phòng
                    </p>
                  </div>
                )}
              </div>

              {/* Note */}
              <div 
                className={`border rounded-lg p-3 mt-4 ${
                  paymentMethod === 'cash'
                    ? 'bg-orange-50 border-orange-200'
                    : paymentMethod === 'vnpay'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                {paymentMethod === 'cash' ? (
                  <p className="text-xs text-orange-800">
                    🔒 <strong>Bắt buộc:</strong> Thanh toán 20% tiền cọc 
                    qua chuyển khoản sau khi đặt phòng. 
                    Phần còn lại ({formatPrice(totalPrice * 0.8)}) 
                    thanh toán khi nhận phòng.
                  </p>
                ) : paymentMethod === 'vnpay' ? (
                  <p className="text-xs text-blue-800">
                    💳 <strong>VNPay:</strong> Bạn sẽ được chuyển đến 
                    cổng thanh toán VNPay để hoàn tất giao dịch 
                    một cách nhanh chóng và an toàn.
                  </p>
                ) : (
                  <p className="text-xs text-yellow-800">
                    💡 Quét mã QR hoặc chuyển khoản theo thông tin 
                    sau khi xác nhận đặt phòng.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Bank transfer modal shown before creating booking */}
        {showBankModal && pendingBookingData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Building2 className="w-7 h-7" />
                  Thông tin chuyển khoản
                </h3>
                <p className="text-indigo-100 text-sm mt-1">
                  Xác nhận thông tin và bấm "Tôi đã chuyển khoản" để hoàn tất đặt phòng
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bank Details */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-indigo-100">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium uppercase">Ngân hàng</p>
                            <p className="text-base font-bold text-gray-900 mt-0.5">Vietcombank (VCB)</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CreditCard className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium uppercase">Số tài khoản</p>
                            <p className="text-base font-bold text-gray-900 mt-0.5 font-mono">0123456789</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Users className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium uppercase">Chủ tài khoản</p>
                            <p className="text-base font-bold text-gray-900 mt-0.5">KHACH SAN ABC</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Amount & Content */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase mb-1">Số tiền</p>
                          <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                            {formatPrice(totalPrice)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase mb-1">Nội dung chuyển khoản</p>
                          <div className="bg-white rounded-lg px-3 py-2 border border-orange-200">
                            <p className="text-base font-bold text-gray-900 font-mono">
                              {recentBooking?.booking_number || `BOOKING-${Date.now()}`}
                            </p>
                          </div>
                          <p className="text-xs text-orange-600 mt-1 font-medium">
                            ⚠️ Mã đặt phòng sẽ được tạo sau khi xác nhận
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-100">
                      {qrCodeUrl ? (
                        <img
                          src={qrCodeUrl}
                          alt="QR code chuyển khoản"
                          className="w-64 h-64 object-contain"
                        />
                      ) : (
                        <div className="w-64 h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-3 text-center font-medium">
                      Quét mã QR để chuyển khoản nhanh
                    </p>
                  </div>
                </div>

                {/* Important Note */}
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900 mb-1">Lưu ý quan trọng</p>
                      <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                        <li>Vui lòng chuyển khoản đúng số tiền và nội dung như trên</li>
                        <li>Đơn hàng sẽ được xác nhận sau khi nhận được thanh toán (5-15 phút)</li>
                        <li>Nếu có thắc mắc, vui lòng liên hệ hotline: 1900 1234</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                <button
                  type="button"
                  className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                  onClick={handleCloseBankModal}
                  disabled={submitting}
                >
                  Đóng
                </button>
                <button
                  type="button"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg shadow-indigo-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleConfirmBankTransfer}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Tôi đã chuyển khoản
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Room Type Selector Modal */}
        {showRoomTypeSelector && (
          <div className="fixed inset-0 z-50 flex 
            items-center justify-center p-4 
            bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-white rounded-2xl shadow-2xl 
              max-w-6xl w-full max-h-[90vh] overflow-hidden 
              animate-fade-in"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 
                to-purple-600 px-6 py-5"
              >
                <div className="flex items-center 
                  justify-between"
                >
                  <div>
                    <h3 className="text-2xl font-bold 
                      text-white flex items-center gap-3"
                    >
                      <Building2 className="w-7 h-7" />
                      Chọn loại phòng
                    </h3>
                    <p className="text-indigo-100 text-sm mt-1">
                      Chọn thêm loại phòng muốn đặt
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRoomTypeSelector(false)}
                    className="text-white/80 hover:text-white 
                      transition-colors p-2 hover:bg-white/10 
                      rounded-lg"
                  >
                    <svg className="w-6 h-6" fill="none" 
                      stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" 
                        strokeLinejoin="round" strokeWidth={2} 
                        d="M6 18L18 6M6 6l12 12" 
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {availableRoomTypes.length === 0 ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin 
                      text-indigo-500 mx-auto mb-4" 
                    />
                    <p className="text-gray-600">
                      Đang tải danh sách phòng...
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 
                    lg:grid-cols-3 gap-6"
                  >
                    {availableRoomTypes
                      .filter(roomOption => 
                        !selectedRoomTypes.some(
                          rt => rt.room.id === roomOption.id
                        )
                      )
                      .map(roomOption => {
                        const roomType = 
                          roomOption.room_type || 
                          { name: 'N/A', base_price: 0 };
                        const imageUrl = 
                          roomOption.images?.[0] || 
                          '/placeholder-room.jpg';
                        
                        return (
                          <div
                            key={roomOption.id}
                            className="bg-white rounded-xl 
                              border-2 border-gray-200 
                              hover:border-indigo-500 
                              transition-all hover:shadow-xl 
                              cursor-pointer group"
                            onClick={() => handleAddRoomType(roomOption)}
                          >
                            {/* Room Image */}
                            <div className="relative h-48 
                              overflow-hidden rounded-t-xl"
                            >
                              <img
                                src={imageUrl}
                                alt={roomType.name}
                                className="w-full h-full 
                                  object-cover 
                                  group-hover:scale-110 
                                  transition-transform 
                                  duration-300"
                              />
                              <div className="absolute inset-0 
                                bg-gradient-to-t 
                                from-black/60 to-transparent"
                              />
                              <div className="absolute bottom-3 
                                left-3 right-3"
                              >
                                <h4 className="text-white 
                                  font-bold text-lg"
                                >
                                  {roomType.name}
                                </h4>
                                <p className="text-white/90 
                                  text-sm"
                                >
                                  Phòng {roomOption.room_number}
                                </p>
                              </div>
                            </div>

                            {/* Room Details */}
                            <div className="p-4 space-y-3">
                                <div className="flex items-center \
                                  justify-between"
                                >
                                  <span className="text-sm \
                                    text-gray-600"
                                  >
                                    Giá/đêm
                                  </span>
                                  {/**
                                   * `roomType.base_price` may be undefined depending
                                   * on the shared type. Coerce to a number to satisfy
                                   * `formatPrice` which expects a `number`.
                                   */}
                                  <span className="text-lg \
                                    font-bold text-indigo-600"
                                  >
                                    {formatPrice(Number(roomType.base_price ?? 0))}
                                  </span>
                                </div>

                              {roomOption.room_type?.capacity && (
                                <div className="flex items-center 
                                  gap-2 text-sm text-gray-600"
                                >
                                  <Users className="w-4 h-4" />
                                  <span>
                                    Tối đa {roomOption.room_type.capacity} người
                                  </span>
                                </div>
                              )}

                              {roomOption.status && (
                                <div className="flex items-center 
                                  gap-2"
                                >
                                  <div className={`w-2 h-2 
                                    rounded-full 
                                    ${roomOption.status === 'available' 
                                      ? 'bg-green-500' 
                                      : 'bg-gray-400'
                                    }`}
                                  />
                                  <span className="text-xs 
                                    text-gray-600"
                                  >
                                    {roomOption.status === 'available' 
                                      ? 'Còn trống' 
                                      : 'Đang bận'
                                    }
                                  </span>
                                </div>
                              )}

                              <button
                                type="button"
                                className="w-full py-2.5 
                                  bg-gradient-to-r 
                                  from-indigo-600 to-purple-600 
                                  text-white rounded-lg 
                                  hover:from-indigo-700 
                                  hover:to-purple-700 
                                  transition-all font-semibold 
                                  shadow-lg 
                                  shadow-indigo-500/30"
                              >
                                Chọn phòng này
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {availableRoomTypes.length > 0 && 
                  availableRoomTypes.filter(roomOption => 
                    !selectedRoomTypes.some(
                      rt => rt.room.id === roomOption.id
                    )
                  ).length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 
                      text-gray-400 mx-auto mb-4" 
                    />
                    <p className="text-gray-600">
                      Đã chọn tất cả các phòng có sẵn
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 
                flex justify-end border-t border-gray-200"
              >
                <button
                  type="button"
                  onClick={() => setShowRoomTypeSelector(false)}
                  className="px-5 py-2.5 bg-white 
                    border border-gray-300 text-gray-700 
                    rounded-lg hover:bg-gray-50 
                    transition-colors font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
