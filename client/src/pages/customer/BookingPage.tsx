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
import { generateBankTransferQR, DEFAULT_BANK_INFO } from '../../utils/bankTransfer';
import { 
  Calendar,
  Users,
  Building2,
  FileText,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import useRoomStore from '../../store/useRoomStore';
import type { Room } from '../../types/rooms';
import useBookingStore from '../../store/useBookingStore';
import type {
  BookingData,
  MultiRoomTypeBookingData,
} from '../../types/booking';
import useServiceStore from '../../store/useServiceStore';
import usePaymentStore from '../../store/usePaymentStore';
import useAuthStore from '../../store/useAuthStore';
import { 
  bookingValidationSchema, 
  type BookingFormData 
} from '../../validators/bookingValidator';
import Loading from '../../components/common/Loading';
import RoomTypeSelectorModal from '../../components/rooms/RoomTypeSelectorModal';
import PaymentMethodSection from '../../components/booking/PaymentMethodSection';
import AdditionalServicesSection from '../../components/booking/AdditionalServicesSection';
import BankTransferModal from '../../components/booking/BankTransferModal';
import BookingSummary from '../../components/booking/BookingSummary';

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userInfo } = useAuthStore();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedServices, setSelectedServices] = useState<
    Record<number, number>
  >({});
  const [recentBooking, setRecentBooking] = useState<
    { id: number; booking_number: string } | null
  >(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [pendingBookingData, setPendingBookingData] = useState<BookingData | MultiRoomTypeBookingData | null>(null);
  
  // Trạng thái đặt nhiều loại phòng
  interface SelectedRoomType {
    id: string; // ID duy nhất cho mỗi lựa chọn
    room: Room;
    quantity: number;
    availableCount: number | null;
    loading: boolean;
  }
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<SelectedRoomType[]>([]);
  const [showRoomTypeSelector, setShowRoomTypeSelector] = useState(false);
  const [availableRoomTypes, setAvailableRoomTypes] = useState<Room[]>([]);

  // Stores Zustand (hành động / trạng thái)
  const { getRoom, fetchRooms, getAvailableCount } = useRoomStore();
  const { fetchServices: fetchServicesFromStore, services: servicesFromStore } = useServiceStore();
  const { createBooking: createBookingStore, createMultiRoomBooking } = useBookingStore();
  const { createVNPay: createVNPayStore } = usePaymentStore();
  const services = servicesFromStore;

  // Chuyển hướng nếu chưa đăng nhập
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

  // Lấy thông tin phòng và danh sách dịch vụ
  useEffect(() => {
    if (id && isAuthenticated) {
      fetchRoomDetails(Number(id));
      fetchServicesFromStore({ status: 'active', limit: 100 });
    }
  }, [id, isAuthenticated]);

  // Khởi tạo loại phòng đầu tiên khi thông tin phòng đã tải xong
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
      const r = await getRoom(roomId);
      if (r) setRoom(r);
      else throw new Error('Không thể tải thông tin phòng');
    } catch (err: any) {
      console.error('Lỗi khi tải thông tin phòng:', err);
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
      await fetchRooms({ limit: 100 });
      const rooms = useRoomStore.getState().rooms || [];
      setAvailableRoomTypes(rooms);
    } catch (err) {
      console.error('Lỗi khi tải danh sách phòng có sẵn:', err);
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

  // Theo dõi giá trị form để phục vụ việc tính toán
  const checkInDate = watch('checkInDate');
  const checkOutDate = watch('checkOutDate');
  const paymentMethod = watch('paymentMethod');

  const formatLocalDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Lấy số phòng khả dụng cho từng loại khi thay đổi ngày
  useEffect(() => {
    const updateAvailability = async () => {
      if (!checkInDate || !checkOutDate || 
        selectedRoomTypes.length === 0
      ) {
        return;
      }

      const checkInStr = formatLocalDate(checkInDate);
      const checkOutStr = formatLocalDate(checkOutDate);

      // Cập nhật trạng thái khả dụng cho từng loại phòng
      const updatedRoomTypes = await Promise.all(
        selectedRoomTypes.map(async (roomType) => {
          // Bỏ qua nếu đang tải để tránh gọi lặp
          if (roomType.loading) {
            return roomType;
          }

          try {
            const count = await getAvailableCount(roomType.room.id, checkInStr, checkOutStr);
            return { ...roomType, availableCount: count, loading: false };
          } catch (error) {
            console.error(
              `Lỗi khi lấy số phòng khả dụng cho phòng ${roomType.room.id}:`,
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

      // Chỉ cập nhật nếu có thay đổi
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

  // Tính số đêm và tổng tiền
  const numberOfNights =
    checkInDate && checkOutDate
      ? Math.ceil(
          (checkOutDate.getTime() - 
            checkInDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  // Tính tổng tiền cho tất cả loại phòng đã chọn
  const roomTotalPrice = selectedRoomTypes.reduce((sum, roomType) => {
    const price = roomType.room.price || roomType.room.room_type?.base_price || 0;
    return sum + (numberOfNights * price * roomType.quantity);
  }, 0);
  
  // Tính tổng tiền dịch vụ
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

  // Định dạng tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Xử lý thay đổi số lượng cho loại phòng
  const handleRoomQuantityChange = (roomTypeId: string, newQuantity: number) => {
    setSelectedRoomTypes(prev => 
      prev.map(rt => 
        rt.id === roomTypeId 
          ? { ...rt, quantity: Math.max(1, Math.min(rt.availableCount || 10, newQuantity)) }
          : rt
      )
    );
  };

  // Xử lý xóa loại phòng
  const handleRemoveRoomType = (roomTypeId: string) => {
    setSelectedRoomTypes(prev => prev.filter(rt => rt.id !== roomTypeId));
  };

  // Xử lý thêm loại phòng mới
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

    // Lấy số phòng khả dụng cho loại phòng mới
    if (checkInDate && checkOutDate) {
      try {
        const checkInStr = formatLocalDate(checkInDate);
        const checkOutStr = formatLocalDate(checkOutDate);
        
        const count = await getAvailableCount(selectedRoom.id, checkInStr, checkOutStr);

        setSelectedRoomTypes(prev => 
          prev.map(rt => 
            rt.id === newRoomType.id
              ? { ...rt, availableCount: count, loading: false }
              : rt
          )
        );
      } catch (error) {
        console.error('Lỗi khi kiểm tra khả dụng:', error);
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

  // Xử lý gửi form
  const onSubmit = async (data: BookingFormData) => {
    if (!room) return;

    try {
      setSubmitting(true);

      const checkInDateStr = formatLocalDate(data.checkInDate);
      const checkOutDateStr = formatLocalDate(data.checkOutDate);

      // Bước 1: Chuẩn bị danh sách dịch vụ
      const servicesList = Object.entries(selectedServices)
        .filter(([_, quantity]) => quantity > 0)
        .map(([serviceId, quantity]) => ({
          service_id: Number(serviceId),
          quantity,
        }));

      // Bước 2: Kiểm tra xem có đặt nhiều loại/phòng hay không
      const hasMultipleRooms = selectedRoomTypes.length > 1 || 
        selectedRoomTypes.some(rt => rt.quantity > 1);

      let bookingData: BookingData | MultiRoomTypeBookingData;

      if (hasMultipleRooms) {
        // Sử dụng API đặt nhiều loại phòng khi cần đặt nhiều loại/phòng
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
        // Một loại phòng (số lượng > 1)
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

      // Bước 3: Tạo booking hoặc hiển thị modal tùy theo phương thức thanh toán
      if (bookingData.payment_method === 'bank_transfer') {
        // Đối với chuyển khoản: hiển thị modal trước, chỉ tạo booking sau khi xác nhận
        setPendingBookingData(bookingData);
        
        // Tạo mã đặt phòng tạm thời để hiển thị trong QR
        const tempBookingNumber = `TEMP-${Date.now()}`;
        
        // Tạo mã QR từ thông tin chuyển khoản
        try {
          const qrUrl = await generateBankTransferQR({
            bank_name: DEFAULT_BANK_INFO.bank_name,
            account_number: DEFAULT_BANK_INFO.account_number,
            amount: totalPrice,
            content: tempBookingNumber,
          });
          setQrCodeUrl(qrUrl);
        } catch (err) {
          console.error('Lỗi khi tạo mã QR:', err);
          setQrCodeUrl(null);
        }
        
        setShowBankModal(true);
        toast.info('Vui lòng xác nhận thông tin chuyển khoản');
      } else if (bookingData.payment_method === 'vnpay') {
        // Đối với VNPay: tạo booking trước rồi chuyển hướng sang VNPay
        toast.info('Đang tạo booking và chuyển đến VNPay...');
        
        const createdBooking = hasMultipleRooms
          ? await createMultiRoomBooking(bookingData as MultiRoomTypeBookingData, { silent: true })
          : await createBookingStore(bookingData as BookingData, { silent: true });

        if (createdBooking) {
          const newBooking = createdBooking;

          // Tìm thông tin thanh toán trong mảng payments (VNPay thường là 'full', tiền mặt là 'deposit')
          const payment = newBooking.payments?.find(
            (p: any) => p.payment_type === 'full' || p.payment_type === 'deposit'
          );

          if (payment) {
            const vnpayData = await createVNPayStore(payment.id);
            if (vnpayData && vnpayData.payment_url) {
              sessionStorage.removeItem('pendingBookingData');
              window.location.href = vnpayData.payment_url;
            } else {
              toast.error('Không thể tạo thanh toán VNPay');
            }
          } else {
            toast.error('Không tìm thấy thông tin thanh toán');
          }
        } else {
          toast.error('Không thể tạo booking');
        }
      } else {
        // Đối với thanh toán tiền mặt: lưu tạm booking và chuyển tới trang thanh toán đặt cọc
        // Lưu booking tạm vào sessionStorage
        sessionStorage.setItem('pendingBookingData', JSON.stringify(bookingData));
        
        toast.info('Vui lòng hoàn tất thanh toán tiền đặt cọc');
        
        // Chuyển sang trang thanh toán đặt cọc (sử dụng room_id làm placeholder)
        navigate(`/deposit-payment/${room.id}?pending=true`);
      }
    } catch (err: any) {
      console.error('Lỗi khi tạo đặt phòng:', err);
      
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

  // Xử lý xác nhận chuyển khoản
  const handleConfirmBankTransfer = async () => {
    if (!pendingBookingData) return;

    try {
      setSubmitting(true);

      // Kiểm tra xem có phải đặt nhiều loại/phòng không
      const isMultiType = 'rooms' in pendingBookingData;
      const created = isMultiType
        ? await createMultiRoomBooking(pendingBookingData as MultiRoomTypeBookingData, { silent: true })
        : await createBookingStore(pendingBookingData as BookingData, { silent: true });

      if (created) {
        
        // Cập nhật QR code với mã đặt phòng thực tế
        try {
          const qrUrl = await generateBankTransferQR({
            bank_name: DEFAULT_BANK_INFO.bank_name,
            account_number: DEFAULT_BANK_INFO.account_number,
            amount: pendingBookingData.total_price,
            content: created.booking_number,
          });
          setQrCodeUrl(qrUrl);
        } catch (err) {
          console.error('Lỗi khi tạo mã QR:', err);
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
        throw new Error('Không thể tạo đặt phòng');
      }
    } catch (err: any) {
      console.error('Lỗi khi tạo đặt phòng:', err);
      const message =
        err.response?.data?.message ||
        'Không thể tạo đặt phòng. Vui lòng thử lại.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý đóng modal mà không tạo booking
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
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
          className="text-3xl text-center font-bold text-gray-900 dark:text-white mb-8"
        >
          Đặt phòng
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form 
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md 
                p-6 space-y-6"
            >
              {/* Thông tin khách hàng */}
              <div>
                <h2 
                  className="text-xl font-bold 
                    text-gray-900 dark:text-white mb-4"
                >
                  Thông tin khách hàng
                </h2>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label 
                      className="block text-sm font-medium 
                        text-gray-700 dark:text-white mb-1"
                    >
                      Họ và tên
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('fullName')}
                      type="text"
                      className="w-full px-4 py-2 border 
                        border-gray-300 dark:border-gray-600 rounded-lg 
                        focus:ring-2 focus:ring-indigo-500 
                        focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Nguyễn Văn A"
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
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
                            font-medium text-gray-700 dark:text-white mb-1"
                      >
                        Email
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full px-4 py-2 border 
                          border-gray-300 dark:border-gray-600 rounded-lg 
                          focus:ring-2 
                          focus:ring-indigo-500 
                          focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="email@example.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600 dark:text-red-400 
                          mt-1"
                        >
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label 
                          className="block text-sm 
                            font-medium text-gray-700 dark:text-white mb-1"
                      >
                        Số điện thoại
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('phone')}
                        type="tel"
                          className="w-full px-4 py-2 border 
                            border-gray-300 dark:border-gray-600 rounded-lg 
                            focus:ring-2 
                            focus:ring-indigo-500 
                            focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="0123456789"
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-600 dark:text-red-400 
                          mt-1"
                        >
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chi tiết đặt phòng */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h2 
                  className="text-xl font-bold 
                    text-gray-900 dark:text-white mb-4"
                >
                  Chi tiết đặt phòng
                </h2>

                <div className="space-y-4">
                  {/* Khoảng ngày */}
                  <div className="grid grid-cols-1 
                    md:grid-cols-2 gap-4"
                  >
                    {/* Check-in Date */}
                    <div>
                      <label 
                        className="block text-sm 
                          font-medium text-gray-700 dark:text-white mb-1"
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
                              border border-gray-300 dark:border-gray-600 
                              rounded-lg focus:ring-2 
                              focus:ring-indigo-500 
                              focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            wrapperClassName="w-full"
                          />
                        )}
                      />
                      {errors.checkInDate && (
                        <p className="text-sm text-red-600 dark:text-red-400 
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
                          font-medium text-gray-700 dark:text-white mb-1"
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
                              border border-gray-300 dark:border-gray-600 
                              rounded-lg focus:ring-2 
                              focus:ring-indigo-500 
                              focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            wrapperClassName="w-full"
                          />
                        )}
                      />
                      {errors.checkOutDate && (
                        <p className="text-sm text-red-600 dark:text-red-400 
                          mt-1"
                        >
                          {errors.checkOutDate.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Số người */}
                  <div>
                    <label 
                      className="block text-sm font-medium 
                        text-gray-700 dark:text-white mb-1"
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
                        border-gray-300 dark:border-gray-600 rounded-lg 
                        focus:ring-2 focus:ring-indigo-500 
                        focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="1"
                    />
                    <p className="text-sm text-gray-500 dark:text-white mt-1">
                      Sức chứa tối đa: {roomType.capacity} người
                    </p>
                    {errors.guestCount && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {errors.guestCount.message}
                      </p>
                    )}
                  </div>

                  {/* Các loại phòng đã chọn */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                      <Building2 className="w-4 h-4 inline mr-1" />
                      Phòng bạn muốn đặt
                      <span className="text-red-500">*</span>
                    </label>

                    {selectedRoomTypes.map((roomType, index) => (
                      <div 
                        key={roomType.id}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              🛏 Loại phòng {index + 1}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-white mt-1">
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
                              <span className="text-gray-500 dark:text-white">
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
                              <span className="text-gray-500 dark:text-white">
                                Chọn ngày để xem
                              </span>
                            )}
                          </div>

                            <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 dark:text-white">Số lượng:</span>
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
                        rounded-lg text-gray-600 dark:text-white hover:border-indigo-500 
                        hover:text-indigo-600 transition-colors flex items-center 
                        justify-center gap-2"
                    >
                      ➕ Thêm loại phòng khác
                    </button>
                  </div>

                  {/* Ghi chú */}
                  <div>
                    <label 
                      className="block text-sm font-medium 
                        text-gray-700 dark:text-white mb-1"
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
                        border-gray-300 dark:border-gray-600 rounded-lg 
                        focus:ring-2 focus:ring-indigo-500 
                        focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Yêu cầu đặc biệt..."
                    />
                    {errors.notes && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {errors.notes.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Dịch vụ bổ sung */}
              <AdditionalServicesSection
                services={services}
                selectedServices={selectedServices}
                setSelectedServices={setSelectedServices}
                formatPrice={formatPrice}
              />

              {/* Phương thức thanh toán */}
              <PaymentMethodSection
                register={register}
                errors={errors}
                totalPrice={totalPrice}
                formatPrice={formatPrice}
              />

              {/* Nút xác nhận */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <button
                  type="submit"
                  disabled={
                    submitting || 
                    selectedRoomTypes.length === 0 ||
                    selectedRoomTypes.some(rt => rt.availableCount === 0) ||
                    selectedRoomTypes.some(rt => rt.availableCount !== null && rt.quantity > rt.availableCount)
                  }
                  className="w-full bg-indigo-600 dark:bg-indigo-700 
                    text-white py-4 rounded-lg 
                    hover:bg-indigo-700 dark:hover:bg-indigo-800 
                    transition-colors font-semibold 
                    text-lg disabled:bg-gray-400 dark:disabled:bg-gray-600 
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
          <BookingSummary
            room={room}
            numberOfNights={numberOfNights}
            selectedRoomTypes={selectedRoomTypes}
            roomTotalPrice={roomTotalPrice}
            services={services}
            selectedServices={selectedServices}
            servicesTotalPrice={servicesTotalPrice}
            totalPrice={totalPrice}
            paymentMethod={paymentMethod}
            formatPrice={formatPrice}
          />
        </div>
        {/* Bank transfer modal shown before creating booking */}
        <BankTransferModal
          isOpen={showBankModal}
          pendingBookingData={pendingBookingData}
          recentBooking={recentBooking}
          qrCodeUrl={qrCodeUrl}
          submitting={submitting}
          onConfirm={handleConfirmBankTransfer}
          onClose={handleCloseBankModal}
          formatPrice={formatPrice}
        />

        {/* Room Type Selector Modal */}
        <RoomTypeSelectorModal
          isOpen={showRoomTypeSelector}
          onClose={() => setShowRoomTypeSelector(false)}
          availableRoomTypes={availableRoomTypes}
          selectedRoomTypes={selectedRoomTypes}
          onSelect={handleAddRoomType}
        />
      </div>
    </div>
  );
};

export default BookingPage;
