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
import { getRoomById, type Room } from 
  '../../services/api/roomService';
import { 
  createBooking,
  checkRoomAvailability,
  type BookingData,
} from '../../services/api/bookingService';
import { getServices, type Service } from 
  '../../services/api/serviceService';
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
  const [pendingBookingData, setPendingBookingData] = useState<BookingData | null>(null);

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

  // Calculate number of nights and total price
  const numberOfNights =
    checkInDate && checkOutDate
      ? Math.ceil(
          (checkOutDate.getTime() - 
            checkInDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  const roomPrice = 
    room?.room_type?.base_price || 0;
  const roomTotalPrice = numberOfNights * roomPrice;
  
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

  // Handle form submission
  const onSubmit = async (data: BookingFormData) => {
    if (!room) return;

    try {
      setSubmitting(true);

      const checkInDateStr = data.checkInDate
        .toISOString()
        .split('T')[0];
      const checkOutDateStr = data.checkOutDate
        .toISOString()
        .split('T')[0];

      // Step 1: Check room availability
      const availability = await checkRoomAvailability(
        room.id,
        checkInDateStr,
        checkOutDateStr
      );

      if (!availability.available) {
        toast.error(
          availability.message || 
          'Phòng đã được đặt trong thời gian này'
        );
        return;
      }

      // Step 2: Prepare booking data
      const servicesList = Object.entries(selectedServices)
        .filter(([_, quantity]) => quantity > 0)
        .map(([serviceId, quantity]) => ({
          service_id: Number(serviceId),
          quantity,
        }));

      const bookingData: BookingData = {
        room_id: room.id,
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
      };

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
        // For VNPay payment, create booking and redirect to VNPay payment page
        sessionStorage.setItem('pendingBookingData', JSON.stringify(bookingData));
        
        toast.info('Đang chuyển đến cổng thanh toán VNPay...');
        
        // Redirect to VNPay payment page (use room_id as placeholder)
        navigate(`/vnpay-payment/${room.id}?pending=true`);
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

      const response = await createBooking(pendingBookingData);

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
          '🎉 Đặt phòng thành công! Vui lòng hoàn tất chuyển khoản.',
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
                            minDate={
                              checkInDate || new Date()
                            }
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
                  disabled={submitting}
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
                <p className="text-sm text-gray-600">
                  Phòng {room.room_number} - Tầng {room.floor}
                </p>
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between 
                  text-sm"
                >
                  <span className="text-gray-600">
                    Giá phòng/đêm
                  </span>
                  <span className="font-medium">
                    {formatPrice(roomPrice)}
                  </span>
                </div>

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
      </div>
    </div>
  );
};

export default BookingPage;
