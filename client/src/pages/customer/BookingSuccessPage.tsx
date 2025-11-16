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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div
          className="bg-white rounded-lg shadow-md 
            p-8 mb-6 text-center"
        >
          <div
            className="w-20 h-20 bg-green-100 
              rounded-full flex items-center 
              justify-center mx-auto mb-4"
          >
            <CheckCircle 
              className="w-12 h-12 text-green-600" 
            />
          </div>
          <h1
            className="text-3xl font-bold text-gray-900 
              mb-2"
          >
            Đặt phòng thành công!
          </h1>
          <p className="text-gray-600 mb-4">
            Cảm ơn bạn đã đặt phòng tại khách sạn của chúng 
            tôi
          </p>

          {/* Booking Number */}
          <div
            className="inline-flex items-center gap-2 
              bg-indigo-50 px-6 py-3 rounded-lg"
          >
            <span className="text-sm text-indigo-600 
              font-medium"
            >
              Mã đặt phòng:
            </span>
            <span className="text-lg font-bold 
              text-indigo-900"
            >
              {booking.booking_number}
            </span>
            <button
              onClick={copyBookingNumber}
              className="ml-2 p-1 hover:bg-indigo-100 
                rounded transition-colors"
              title="Sao chép mã"
            >
              {copiedBookingNumber ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-indigo-600" />
              )}
            </button>
          </div>

          {/* Status Badge */}
          <div className="mt-4">
            <span
              className={`inline-block px-4 py-2 
                rounded-full text-sm font-medium 
                ${getStatusColor(booking.status)}`}
            >
              {getStatusText(booking.status)}
            </span>
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-lg shadow-md 
          p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 
            mb-4"
          >
            Chi tiết đặt phòng
          </h2>

          <div className="space-y-4">
            {/* Room Information */}
            {roomType && (
              <div className="border-b pb-4">
                <div className="flex items-start gap-4">
                  {room?.images?.[0] && (
                    <img
                      src={room.images[0]}
                      alt={roomType?.name}
                      className="w-24 h-24 object-cover 
                        rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg 
                      text-gray-900"
                    >
                      {roomType.name}
                    </h3>
                    {room && (
                      <p className="text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 
                          inline mr-1" 
                        />
                        Phòng {room.room_number} - 
                        Tầng {room.floor}
                      </p>
                    )}
                    <p className="text-indigo-600 
                      font-semibold mt-1"
                    >
                      {formatPrice(roomType.base_price)}/đêm
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 
              gap-4"
            >
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Ngày nhận phòng
                </p>
                <p className="font-medium text-gray-900">
                  {formatDate(booking.check_in_date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Ngày trả phòng
                </p>
                <p className="font-medium text-gray-900">
                  {formatDate(booking.check_out_date)}
                </p>
              </div>
            </div>

            {/* Guest Count */}
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <Users className="w-4 h-4 inline mr-1" />
                Số người
              </p>
              <p className="font-medium text-gray-900">
                {booking.guest_count} người
              </p>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Ghi chú
                </p>
                <p className="font-medium text-gray-900">
                  {booking.notes}
                </p>
              </div>
            )}

            {/* Payment Method */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-1">
                <CreditCard className="w-4 h-4 inline mr-1" />
                Phương thức thanh toán
              </p>
              <p className="font-medium text-gray-900">
                {booking.payment_method === 'cash'
                  ? '💵 Thanh toán tại chỗ'
                  : '🏦 Chuyển khoản ngân hàng'}
              </p>
            </div>

            {/* Total Price */}
            <div className="border-t pt-4">
              <div className="flex justify-between 
                items-center"
              >
                <span className="text-lg font-semibold 
                  text-gray-900"
                >
                  Tổng thanh toán
                </span>
                <span className="text-2xl font-bold 
                  text-indigo-600"
                >
                  {formatPrice(booking.total_price)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Information */}
        {booking.guest_info && (
          <div className="bg-white rounded-lg shadow-md 
            p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-900 
              mb-4"
            >
              Thông tin khách hàng
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">
                  <User className="w-4 h-4 inline mr-1" />
                  Họ và tên
                </p>
                <p className="font-medium text-gray-900">
                  {booking.guest_info.full_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </p>
                <p className="font-medium text-gray-900">
                  {booking.guest_info.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Số điện thoại
                </p>
                <p className="font-medium text-gray-900">
                  {booking.guest_info.phone}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bank Transfer Instructions */}
        {booking.payment_method === 'bank_transfer' && (
          <div
            className="bg-blue-50 border border-blue-200 
              rounded-lg p-6 mb-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <Building2 
                className="w-6 h-6 text-blue-600 
                  mt-1 flex-shrink-0" 
              />
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-2">
                  Hướng dẫn chuyển khoản
                </h3>
                <div className="space-y-2 text-sm 
                  text-blue-800"
                >
                  <p>
                    Vui lòng chuyển khoản theo thông tin sau:
                  </p>
                  
                  <div className="grid grid-cols-1 
                    md:grid-cols-2 gap-4"
                  >
                    {/* Bank Info */}
                    <div className="bg-white rounded-lg 
                      p-4 space-y-2"
                    >
                      <p>
                        <strong>Ngân hàng:</strong> 
                        Vietcombank (VCB)
                      </p>
                      <p>
                        <strong>Số tài khoản:</strong> 
                        0123456789
                      </p>
                      <p>
                        <strong>Chủ tài khoản:</strong> 
                        KHACH SAN ABC
                      </p>
                      <p>
                        <strong>Số tiền:</strong>{' '}
                        <span className="text-indigo-600 
                          font-bold"
                        >
                          {formatPrice(booking.total_price)}
                        </span>
                      </p>
                      <p>
                        <strong>Nội dung:</strong>{' '}
                        <span className="font-mono 
                          text-indigo-600"
                        >
                          {booking.booking_number}
                        </span>
                      </p>
                    </div>

                    {/* QR Code */}
                    {qrCodeUrl && (
                      <div className="bg-white rounded-lg 
                        p-4 flex flex-col items-center 
                        justify-center"
                      >
                        <p className="text-sm font-medium 
                          text-gray-700 mb-2"
                        >
                          Quét mã QR để chuyển khoản
                        </p>
                        <img
                          src={qrCodeUrl}
                          alt="QR Code"
                          className="w-48 h-48 border-2 
                            border-gray-200 rounded-lg"
                        />
                        <p className="text-xs text-gray-500 
                          mt-2 text-center"
                        >
                          Mã QR đã bao gồm đầy đủ thông tin
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="text-xs italic mt-2">
                    💡 Lưu ý: Vui lòng ghi đúng mã đặt phòng 
                    vào nội dung chuyển khoản để chúng tôi 
                    có thể xác nhận thanh toán của bạn.
                  </p>
                </div>
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

        {/* Important Notice */}
        <div
          className="bg-yellow-50 border border-yellow-200 
            rounded-lg p-4 mb-6"
        >
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Lưu ý quan trọng:</strong>
          </p>
          <ul className="text-sm text-yellow-700 mt-2 
            space-y-1 ml-4 list-disc"
          >
            <li>
              Vui lòng mang theo CMND/CCCD khi nhận phòng
            </li>
            <li>
              Thời gian nhận phòng: 14:00 / 
              Thời gian trả phòng: 12:00
            </li>
            <li>
              Nếu hủy đặt phòng, bạn sẽ bị giữ 20% 
              tổng giá trị đơn
            </li>
            {booking.payment_method === 'bank_transfer' && (
              <li>
                Vui lòng chuyển khoản trong vòng 24 giờ 
                để giữ phòng
              </li>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/bookings"
            className="flex-1 flex items-center 
              justify-center gap-2 px-6 py-3 
              bg-indigo-600 text-white rounded-lg 
              hover:bg-indigo-700 transition-colors 
              font-semibold"
          >
            <ListOrdered className="w-5 h-5" />
            Xem đơn của tôi
          </Link>
          <Link
            to="/"
            className="flex-1 flex items-center 
              justify-center gap-2 px-6 py-3 
              bg-gray-600 text-white rounded-lg 
              hover:bg-gray-700 transition-colors 
              font-semibold"
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
