import React, { useState, useEffect } from 'react';
import { 
  useParams, 
  useNavigate, 
  Link 
} from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import DatePicker from 'react-datepicker';
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
import useAuthStore from '../../store/useAuthStore';
import { 
  bookingValidationSchema, 
  type BookingFormData 
} from '../../validators/bookingValidator';
import Loading from '../../components/common/Loading';

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, userInfo } = useAuthStore();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch room details
  useEffect(() => {
    if (id && isAuthenticated) {
      fetchRoomDetails(Number(id));
    }
  }, [id, isAuthenticated]);

  const fetchRoomDetails = async (roomId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRoomById(roomId);

      if (
        (response.success || 
          (response as any).status === 'success') && 
        response.data?.room
      ) {
        setRoom(response.data.room);
      } else {
        throw new Error('Không thể tải thông tin phòng');
      }
    } catch (err: any) {
      console.error('Error fetching room:', err);
      const message =
        err.response?.data?.message ||
        'Không thể tải thông tin phòng';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Set up form with default values
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
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
  const totalPrice = numberOfNights * roomPrice;

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
      };

      // Step 3: Create booking
      const response = await createBooking(bookingData);

      if (
        response.success && 
        response.data?.booking
      ) {
        const bookingId = response.data.booking.id;
        
        toast.success(
          '🎉 Đặt phòng thành công!',
          { icon: <CheckCircle className="text-green-500" /> }
        );
        
        // Navigate to success page
        navigate(`/booking-success/${bookingId}`);
      } else {
        throw new Error(
          response.message || 
          'Không thể tạo đặt phòng'
        );
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
              className="px-6 py-2 bg-red-600 
                text-white rounded-lg 
                hover:bg-red-700 transition-colors"
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
          to={`/rooms/${room.id}`}
          className="inline-flex items-center gap-2 
            text-gray-600 hover:text-gray-900 
            mb-6 transition-colors"
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
                          Thanh toán tại chỗ
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Thanh toán trực tiếp tại khách sạn 
                        khi nhận phòng
                      </p>
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

                  {errors.paymentMethod && (
                    <p className="text-sm text-red-600">
                      {errors.paymentMethod.message}
                    </p>
                  )}

                  {/* Bank Transfer Info */}
                  {paymentMethod === 'bank_transfer' && (
                    <div 
                      className="bg-blue-50 border 
                        border-blue-200 rounded-lg 
                        p-4 mt-3"
                    >
                      <p className="text-sm text-blue-800 
                        font-medium mb-2"
                      >
                        📌 Thông tin chuyển khoản
                      </p>
                      <p className="text-sm text-blue-700">
                        Quét mã QR hoặc chuyển khoản theo 
                        thông tin sau khi xác nhận đặt phòng.
                      </p>
                    </div>
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
                {roomType.images?.[0] && (
                  <img
                    src={roomType.images[0]}
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
              </div>

              {/* Note */}
              <div 
                className="bg-yellow-50 border 
                  border-yellow-200 rounded-lg 
                  p-3 mt-4"
              >
                <p className="text-xs text-yellow-800">
                  💡 Bạn sẽ không bị tính phí ngay. 
                  Thanh toán khi nhận phòng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
