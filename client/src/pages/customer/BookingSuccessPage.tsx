import React, { useState, useEffect } from 'react';
import { 
  useParams, 
  useNavigate, 
  Link 
} from 'react-router-dom';
import {
  CheckCircle,
  Home,
  ListOrdered,
  Calendar,
  Users,
  CreditCard,
  MapPin,
  Mail,
  Phone,
  User,
  FileText,
  Building2,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  Clock,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getBookingById,
  generateQRCode,
  type Booking,
} from '../../services/api/bookingService';
import { confirmBankTransfer } from 
  '../../services/api/paymentService';
import Loading from '../../components/common/Loading';

const BookingSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedBookingNumber, setCopiedBookingNumber] = 
    useState(false);
  const [uploadingReceipt, setUploadingReceipt] = 
    useState(false);
  const [receiptUploaded, setReceiptUploaded] = 
    useState(false);
  const [selectedFile, setSelectedFile] = 
    useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = 
    useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchBookingDetails(Number(id));
    }
  }, [id]);

  const fetchBookingDetails = async (bookingId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getBookingById(bookingId);

      if (
        response.success && 
        response.data?.booking
      ) {
        const bookingData = response.data.booking;
        setBooking(bookingData);

        // Redirect to deposit payment page if required and not yet paid
        if (
          bookingData.requires_deposit && 
          !bookingData.deposit_paid
        ) {
          navigate(`/deposit-payment/${bookingId}`, { replace: true });
          return;
        }
      } else {
        throw new Error(
          'Không thể tải thông tin đặt phòng'
        );
      }
    } catch (err: any) {
      console.error('Error fetching booking:', err);
      const message =
        err.response?.data?.message ||
        'Không thể tải thông tin đặt phòng';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'checked_in':
        return 'bg-blue-100 text-blue-800';
      case 'checked_out':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Chờ xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      case 'checked_in':
        return 'Đã nhận phòng';
      case 'checked_out':
        return 'Đã trả phòng';
      default:
        return status;
    }
  };

  const copyBookingNumber = async () => {
    if (!booking?.booking_number) return;

    try {
      await navigator.clipboard.writeText(
        booking.booking_number
      );
      setCopiedBookingNumber(true);
      toast.success('Đã sao chép mã đặt phòng');
      setTimeout(() => setCopiedBookingNumber(false), 2000);
    } catch (err) {
      toast.error('Không thể sao chép');
    }
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadReceipt = async () => {
    if (!selectedFile || !booking) return;

    try {
      setUploadingReceipt(true);

      // Generate transaction ID based on booking number
      const transactionId = 
        `TXN-${booking.booking_number}-${Date.now()}`;

      const response = await confirmBankTransfer(
        booking.id,
        transactionId,
        selectedFile
      );

      if (response.success) {
        toast.success(
          '✅ Đã gửi xác nhận thanh toán thành công! ' +
          'Chúng tôi sẽ xác nhận trong thời gian sớm nhất.'
        );
        setReceiptUploaded(true);
        
        // Update booking payment status locally
        setBooking((prev) =>
          prev
            ? { 
                ...prev, 
                payment_status: 'paid',
                status: prev.status === 'pending' 
                  ? 'confirmed' 
                  : prev.status 
              }
            : null
        );
      } else {
        throw new Error(
          response.message || 
          'Không thể xác nhận thanh toán'
        );
      }
    } catch (err: any) {
      console.error('Error uploading receipt:', err);
      const message =
        err.response?.data?.message ||
        'Không thể gửi xác nhận thanh toán. ' +
        'Vui lòng thử lại.';
      toast.error(message);
    } finally {
      setUploadingReceipt(false);
    }
  };

  const qrCodeUrl = booking
    ? generateQRCode(
        booking.booking_number,
        booking.total_price
      )
    : null;

  if (loading) {
    return <Loading fullScreen text="Đang tải..." />;
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div
            className="bg-red-50 border border-red-200 
              rounded-lg p-8 text-center"
          >
            <AlertCircle
              className="w-12 h-12 text-red-500 
                mx-auto mb-3"
            />
            <p className="text-red-700 font-medium mb-4">
              {error || 'Không tìm thấy đặt phòng'}
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

  const room = booking.room;
  const roomType = room?.room_type;

  // Calculate number of nights
  const numberOfNights = Math.ceil(
    (new Date(booking.check_out_date).getTime() - 
      new Date(booking.check_in_date).getTime()) / 
      (1000 * 60 * 60 * 24)
  );

  // Calculate room price and services price
  const roomPrice = roomType?.base_price || room?.price || 0;
  const roomTotalPrice = numberOfNights * roomPrice;
  const servicesTotal = booking.service_usages?.reduce(
    (sum, usage) => sum + parseFloat(usage.total_price.toString()),
    0
  ) || 0;

  // Resolve room image with SERVER_URL
  const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000')
    .replace(/\/api\/?$/i, '')
    .replace(/\/$/, '');
  
  const PLACEHOLDER = '/images/room-placeholder.jpg';
  
  const resolveRoomImage = (): string => {
    const imagesField = room?.images as any;
    let firstImage: string | undefined;

    if (Array.isArray(imagesField)) {
      firstImage = imagesField[0];
    } else if (typeof imagesField === 'string') {
      try {
        const parsed = JSON.parse(imagesField);
        if (Array.isArray(parsed) && parsed.length > 0) {
          firstImage = parsed[0];
        } else if (typeof parsed === 'string') {
          firstImage = parsed;
        }
      } catch {
        const s = imagesField as string;
        if (s.includes(',')) {
          firstImage = s.split(',')[0].trim();
        } else {
          firstImage = s.trim();
        }
      }
    }

    if (firstImage) {
      if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
        return firstImage;
      } else if (firstImage.startsWith('/uploads')) {
        return `${SERVER_URL}${firstImage}`;
      } else if (firstImage.startsWith('/')) {
        return firstImage;
      } else {
        return `${SERVER_URL}/uploads/rooms/${firstImage}`;
      }
    }
    
    return PLACEHOLDER;
  };

  const roomImageSrc = resolveRoomImage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Success Header with Gradient */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 mb-6 text-center text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="w-14 h-14 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold mb-2">
              🎉 Đặt phòng thành công!
            </h1>
            <p className="text-green-50 text-lg mb-6">
              Cảm ơn bạn đã đặt phòng tại khách sạn của chúng tôi
            </p>

            {/* Booking Number Card */}
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-8 py-4 rounded-xl border-2 border-white/30">
              <div className="text-left">
                <p className="text-green-100 text-sm font-medium">Mã đặt phòng</p>
                <p className="text-2xl font-bold tracking-wider">
                  {booking.booking_number}
                </p>
              </div>
              <button
                onClick={copyBookingNumber}
                className="ml-2 p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Sao chép mã"
              >
                {copiedBookingNumber ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Status Badge */}
            <div className="mt-6">
              <span className={`inline-block px-6 py-2 rounded-full text-sm font-bold shadow-lg ${getStatusColor(booking.status)}`}>
                {getStatusText(booking.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Left Column - Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            
        {/* Booking Details Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              📋 Chi tiết đặt phòng
            </h2>
            <span className="text-sm text-gray-500">
              ID: #{booking.id}
            </span>
          </div>

          <div className="space-y-6">
            {/* Room Information with Image */}
            {roomType && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-start gap-4">
                  <img
                    src={roomImageSrc}
                    alt={roomType?.name || 'Room'}
                    className="w-32 h-32 object-cover rounded-xl shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER;
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 mb-1">
                          {roomType.name}
                        </h3>
                        {room && (
                          <p className="text-gray-600 text-sm flex items-center gap-1 mb-2">
                            <MapPin className="w-4 h-4" />
                            Phòng {room.room_number} • Tầng {room.floor}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-bold text-indigo-600">
                        {formatPrice(roomPrice)}
                      </span>
                      <span className="text-sm text-gray-500">/đêm</span>
                    </div>
                    {roomType.capacity && (
                      <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Sức chứa: {roomType.capacity} người
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Check-in/Check-out Timeline */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">Nhận phòng</p>
                      <p className="font-bold text-gray-900">
                        {new Date(booking.check_in_date).toLocaleDateString('vi-VN', { 
                          day: '2-digit', 
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Từ 14:00</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full font-bold text-lg">
                    {numberOfNights} đêm
                  </div>
                  <div className="w-full h-1 bg-gradient-to-r from-green-200 via-indigo-200 to-red-200 rounded-full mt-2"></div>
                </div>

                <div className="text-center md:text-right">
                  <div className="flex items-center justify-center md:justify-end gap-2 mb-2">
                    <div className="md:order-2">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-red-600" />
                      </div>
                    </div>
                    <div className="md:order-1">
                      <p className="text-xs text-gray-500 uppercase font-medium">Trả phòng</p>
                      <p className="font-bold text-gray-900">
                        {new Date(booking.check_out_date).toLocaleDateString('vi-VN', { 
                          day: '2-digit', 
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Trước 12:00</p>
                </div>
              </div>
            </div>

            {/* Guest Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-gray-600 font-medium">Số khách</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {booking.num_guests || booking.guest_count}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <p className="text-sm text-gray-600 font-medium">Thanh toán</p>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {booking.payment_method === 'cash' ? 'Tại chỗ' : 'Chuyển khoản'}
                </p>
              </div>
            </div>

            {/* Special Requests */}
            {booking.special_requests && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900 mb-1">
                      Yêu cầu đặc biệt
                    </p>
                    <p className="text-sm text-yellow-800">
                      {booking.special_requests}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Services Used */}
            {booking.service_usages && booking.service_usages.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                  <span>🛎️</span> Dịch vụ đã đặt
                </h3>
                <div className="space-y-2">
                  {booking.service_usages.map((usage: any, index: number) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {usage.service?.name || 'Dịch vụ'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {usage.quantity} x {formatPrice(parseFloat(usage.unit_price.toString()))}
                        </p>
                      </div>
                      <p className="font-bold text-indigo-600">
                        {formatPrice(parseFloat(usage.total_price.toString()))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="border-t pt-4 space-y-3">
              <h3 className="font-bold text-lg text-gray-900 mb-3">
                💰 Chi tiết thanh toán
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Tiền phòng ({numberOfNights} đêm x {formatPrice(roomPrice)})
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(roomTotalPrice)}
                  </span>
                </div>
                
                {booking.service_usages && booking.service_usages.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Dịch vụ bổ sung:</p>
                    {booking.service_usages.map((usage: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm pl-2">
                        <span className="text-gray-600">
                          • {usage.service?.name || 'Dịch vụ'} ({usage.quantity} x {formatPrice(parseFloat(usage.unit_price.toString()))})
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatPrice(parseFloat(usage.total_price.toString()))}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-300">
                      <span className="text-gray-700">Tổng dịch vụ:</span>
                      <span className="text-gray-900">
                        {formatPrice(servicesTotal)}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center bg-indigo-50 rounded-lg p-3">
                  <span className="text-lg font-bold text-gray-900">
                    Tổng thanh toán
                  </span>
                  <span className="text-3xl font-bold text-indigo-600">
                    {formatPrice(booking.total_price)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Information */}
        {booking.guest_info && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-6 h-6 text-indigo-600" />
              Thông tin liên hệ
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Họ và tên</p>
                  <p className="font-bold text-gray-900 text-lg">
                    {booking.guest_info.full_name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Email</p>
                  <p className="font-medium text-gray-900 break-all">
                    {booking.guest_info.email}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Số điện thoại</p>
                  <p className="font-bold text-gray-900 text-lg">
                    {booking.guest_info.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Booking Timeline */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Trạng thái đơn hàng
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div className="w-0.5 h-full bg-green-200 my-1"></div>
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-semibold text-gray-900">Đặt phòng thành công</p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      booking.status === 'confirmed' || booking.status === 'checked_in' || booking.status === 'checked_out'
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}>
                      {booking.status === 'confirmed' || booking.status === 'checked_in' || booking.status === 'checked_out' ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className={`w-0.5 h-full my-1 ${
                      booking.status === 'confirmed' || booking.status === 'checked_in' || booking.status === 'checked_out'
                        ? 'bg-green-200'
                        : 'bg-gray-200'
                    }`}></div>
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-semibold text-gray-900">Xác nhận đặt phòng</p>
                    <p className="text-sm text-gray-500">
                      {booking.status === 'pending' ? 'Đang chờ xác nhận' : 'Đã xác nhận'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      booking.status === 'checked_in' || booking.status === 'checked_out'
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}>
                      {booking.status === 'checked_in' || booking.status === 'checked_out' ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className={`w-0.5 h-full my-1 ${
                      booking.status === 'checked_in' || booking.status === 'checked_out'
                        ? 'bg-green-200'
                        : 'bg-gray-200'
                    }`}></div>
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-semibold text-gray-900">Nhận phòng</p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.check_in_date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      booking.status === 'checked_out'
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}>
                      {booking.status === 'checked_out' ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Trả phòng</p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.check_out_date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-yellow-900 mb-2">
                    ⚠️ Lưu ý quan trọng
                  </p>
                  <ul className="text-sm text-yellow-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      <span>Mang theo CMND/CCCD khi nhận phòng</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      <span>Check-in: 14:00 | Check-out: 12:00</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      <span>Hủy phòng sẽ bị giữ 20% tổng giá trị</span>
                    </li>
                    {booking.payment_method === 'bank_transfer' && (
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">•</span>
                        <span>Chuyển khoản trong 24h để giữ phòng</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

        {/* Bank Transfer Instructions */}
        {booking.payment_method === 'bank_transfer' && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg"
          >
            <div className="mb-4">
              <h3 className="font-bold text-blue-900 mb-4 text-xl flex items-center gap-2">
                <Building2 className="w-7 h-7 text-blue-600" />
                🏦 Thông tin chuyển khoản
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bank Info */}
                <div className="bg-white rounded-xl p-5 shadow-md border border-blue-100">
                  <h4 className="font-bold text-gray-900 mb-4 text-lg">Thông tin tài khoản</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Ngân hàng</p>
                        <p className="font-bold text-gray-900">Vietcombank (VCB)</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Số tài khoản</p>
                        <p className="font-bold text-gray-900 font-mono text-lg">0123456789</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Chủ tài khoản</p>
                        <p className="font-bold text-gray-900">KHACH SAN ABC</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 border border-orange-200">
                      <p className="text-xs text-gray-500 uppercase mb-1">Số tiền</p>
                      <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                        {formatPrice(booking.total_price)}
                      </p>
                    </div>
                    
                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                      <p className="text-xs text-gray-500 uppercase mb-1">Nội dung chuyển khoản</p>
                      <p className="font-bold text-gray-900 font-mono text-lg">
                        {booking.booking_number}
                      </p>
                      <p className="text-xs text-red-600 font-medium mt-1">
                        ⚠️ Vui lòng nhập chính xác
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                {qrCodeUrl && (
                  <div className="bg-white rounded-xl p-5 shadow-md border border-blue-100 flex flex-col items-center justify-center">
                    <h4 className="font-bold text-gray-900 mb-3 text-lg">Quét mã QR</h4>
                    <div className="bg-white p-4 rounded-xl border-4 border-gray-100 shadow-lg">
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="w-56 h-56"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-3 text-center font-medium">
                      📱 Quét để chuyển khoản nhanh
                    </p>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Mã QR đã bao gồm đầy đủ thông tin
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Receipt Section */}
            {!receiptUploaded ? (
              <div className="border-t border-blue-200 
                pt-4"
              >
                <h4 className="font-semibold text-blue-900 
                  mb-3"
                >
                  📎 Xác nhận thanh toán
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  Sau khi chuyển khoản, vui lòng tải lên 
                  ảnh biên lai để chúng tôi xác nhận nhanh 
                  hơn.
                </p>

                <div className="space-y-3">
                  {/* File Input */}
                  <div>
                    <label
                      htmlFor="receipt-upload"
                      className="block w-full px-4 py-3 
                        border-2 border-dashed 
                        border-blue-300 rounded-lg 
                        text-center cursor-pointer 
                        hover:border-blue-400 
                        hover:bg-blue-100/50 
                        transition-colors"
                    >
                      <input
                        id="receipt-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="flex flex-col 
                        items-center gap-2"
                      >
                        {previewUrl ? (
                          <>
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="w-32 h-32 
                                object-cover rounded"
                            />
                            <p className="text-sm 
                              text-blue-600 font-medium"
                            >
                              {selectedFile?.name}
                            </p>
                            <p className="text-xs 
                              text-gray-500"
                            >
                              Click để chọn ảnh khác
                            </p>
                          </>
                        ) : (
                          <>
                            <FileText 
                              className="w-8 h-8 
                                text-blue-400" 
                            />
                            <p className="text-sm 
                              text-blue-600 font-medium"
                            >
                              Chọn ảnh biên lai
                            </p>
                            <p className="text-xs 
                              text-gray-500"
                            >
                              PNG, JPG, JPEG (Tối đa 5MB)
                            </p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Upload Button */}
                  {selectedFile && (
                    <button
                      onClick={handleUploadReceipt}
                      disabled={uploadingReceipt}
                      className="w-full px-4 py-3 
                        bg-blue-600 text-white 
                        rounded-lg hover:bg-blue-700 
                        transition-colors font-semibold 
                        disabled:bg-gray-400 
                        disabled:cursor-not-allowed
                        flex items-center 
                        justify-center gap-2"
                    >
                      {uploadingReceipt ? (
                        <>
                          <Loader2 
                            className="w-5 h-5 
                              animate-spin" 
                          />
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <CheckCircle 
                            className="w-5 h-5" 
                          />
                          Xác nhận đã thanh toán
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="border-t border-green-200 
                pt-4 bg-green-50 rounded-lg p-4"
              >
                <div className="flex items-center 
                  gap-3"
                >
                  <CheckCircle 
                    className="w-6 h-6 text-green-600 
                      flex-shrink-0" 
                  />
                  <div>
                    <p className="font-semibold 
                      text-green-900"
                    >
                      Đã gửi xác nhận thanh toán
                    </p>
                    <p className="text-sm text-green-700">
                      Chúng tôi sẽ xác nhận đơn hàng của 
                      bạn trong thời gian sớm nhất.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/bookings"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <ListOrdered className="w-6 h-6" />
            Xem đơn đặt phòng
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Home className="w-6 h-6" />
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
