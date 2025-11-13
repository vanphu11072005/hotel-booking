import React, { useState, useEffect } from 'react';
import { 
  useParams, 
  useNavigate, 
  Link 
} from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  FileText,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getBookingById,
  generateQRCode,
  type Booking,
} from '../../services/api/bookingService';
import { confirmBankTransfer } from 
  '../../services/api/paymentService';
import useAuthStore from '../../store/useAuthStore';
import Loading from '../../components/common/Loading';
import PaymentStatusBadge from 
  '../../components/common/PaymentStatusBadge';

const PaymentConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [booking, setBooking] = useState<Booking | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = 
    useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = 
    useState<string | null>(null);
  const [copiedBookingNumber, setCopiedBookingNumber] = 
    useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error(
        'Vui lòng đăng nhập để xác nhận thanh toán'
      );
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (id && isAuthenticated) {
      fetchBookingDetails(Number(id));
    }
  }, [id, isAuthenticated]);

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
        
        // Check if already paid
        if (bookingData.payment_status === 'paid') {
          toast.info('Đơn đặt phòng này đã được thanh toán');
          navigate(`/bookings/${bookingId}`);
          return;
        }
        
        // Check if payment method is cash
        if (bookingData.payment_method === 'cash') {
          toast.info(
            'Đơn này sử dụng phương thức thanh toán tại chỗ'
          );
          navigate(`/bookings/${bookingId}`);
          return;
        }
        
        setBooking(bookingData);
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

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        'Kích thước ảnh không được vượt quá 5MB'
      );
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmPayment = async () => {
    if (!selectedFile || !booking) return;

    try {
      setUploading(true);

      const transactionId = 
        `TXN-${booking.booking_number}-${Date.now()}`;

      const response = await confirmBankTransfer(
        booking.id,
        transactionId,
        selectedFile
      );

      if (response.success) {
        toast.success(
          '✅ Đã gửi xác nhận thanh toán thành công!'
        );
        setUploadSuccess(true);
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate(`/bookings/${booking.id}`);
        }, 2000);
      } else {
        throw new Error(
          response.message || 
          'Không thể xác nhận thanh toán'
        );
      }
    } catch (err: any) {
      console.error('Error confirming payment:', err);
      const message =
        err.response?.data?.message ||
        'Không thể gửi xác nhận thanh toán';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

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
              onClick={() => navigate('/bookings')}
              className="px-6 py-2 bg-red-600 
                text-white rounded-lg 
                hover:bg-red-700 transition-colors"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  const qrCodeUrl = generateQRCode(
    booking.booking_number,
    booking.total_price
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link
          to={`/bookings/${booking.id}`}
          className="inline-flex items-center gap-2 
            text-gray-600 hover:text-gray-900 
            mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại chi tiết đặt phòng</span>
        </Link>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 
            mb-2"
          >
            Xác nhận thanh toán
          </h1>
          <p className="text-gray-600">
            Hoàn tất thanh toán cho đơn đặt phòng của bạn
          </p>
        </div>

        {/* Booking Info Card */}
        <div className="bg-white rounded-lg shadow-md 
          p-6 mb-6"
        >
          <div className="flex items-start justify-between 
            gap-4 mb-4"
          >
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Mã đặt phòng
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold 
                  text-indigo-900 font-mono"
                >
                  {booking.booking_number}
                </span>
                <button
                  onClick={copyBookingNumber}
                  className="p-1 hover:bg-gray-100 
                    rounded transition-colors"
                  title="Sao chép"
                >
                  {copiedBookingNumber ? (
                    <Check className="w-4 h-4 
                      text-green-600" 
                    />
                  ) : (
                    <Copy className="w-4 h-4 
                      text-gray-400" 
                    />
                  )}
                </button>
              </div>
            </div>

            <PaymentStatusBadge
              status={booking.payment_status}
              size="md"
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between 
              items-center"
            >
              <span className="text-gray-600">
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

        {!uploadSuccess ? (
          <>
            {/* Bank Transfer Instructions */}
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
                  <h3 className="font-bold text-blue-900 
                    mb-3"
                  >
                    Thông tin chuyển khoản
                  </h3>

                  <div className="grid grid-cols-1 
                    md:grid-cols-2 gap-4"
                  >
                    {/* Bank Info */}
                    <div className="bg-white rounded-lg 
                      p-4 space-y-2 text-sm"
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
                    <div className="bg-white rounded-lg 
                      p-4 flex flex-col items-center"
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
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Receipt Section */}
            <div className="bg-white rounded-lg shadow-md 
              p-6 mb-6"
            >
              <h3 className="text-xl font-bold 
                text-gray-900 mb-4"
              >
                <Upload className="w-5 h-5 inline mr-2" />
                Tải lên biên lai thanh toán
              </h3>

              <p className="text-gray-600 mb-4">
                Sau khi chuyển khoản, vui lòng tải lên ảnh 
                biên lai để chúng tôi xác nhận nhanh hơn.
              </p>

              <div className="space-y-4">
                {/* File Input */}
                <label
                  htmlFor="receipt-upload"
                  className="block w-full px-4 py-6 
                    border-2 border-dashed 
                    border-gray-300 rounded-lg 
                    text-center cursor-pointer 
                    hover:border-indigo-400 
                    hover:bg-indigo-50 
                    transition-all"
                >
                  <input
                    id="receipt-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {previewUrl ? (
                    <div className="flex flex-col 
                      items-center gap-3"
                    >
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-48 h-48 object-cover 
                          rounded-lg border-2 
                          border-indigo-200"
                      />
                      <p className="text-sm text-indigo-600 
                        font-medium"
                      >
                        {selectedFile?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Click để chọn ảnh khác
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col 
                      items-center gap-2"
                    >
                      <FileText 
                        className="w-12 h-12 text-gray-400" 
                      />
                      <p className="text-sm text-gray-600 
                        font-medium"
                      >
                        Click để chọn ảnh biên lai
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, JPEG (Tối đa 5MB)
                      </p>
                    </div>
                  )}
                </label>

                {/* Upload Button */}
                {selectedFile && (
                  <button
                    onClick={handleConfirmPayment}
                    disabled={uploading}
                    className="w-full px-6 py-4 
                      bg-indigo-600 text-white 
                      rounded-lg hover:bg-indigo-700 
                      transition-colors font-semibold 
                      text-lg disabled:bg-gray-400 
                      disabled:cursor-not-allowed
                      flex items-center justify-center 
                      gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 
                          className="w-5 h-5 animate-spin" 
                        />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Xác nhận đã thanh toán
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-green-50 border 
            border-green-200 rounded-lg p-8 
            text-center"
          >
            <CheckCircle 
              className="w-16 h-16 text-green-600 
                mx-auto mb-4" 
            />
            <h3 className="text-2xl font-bold 
              text-green-900 mb-2"
            >
              Đã gửi xác nhận thành công!
            </h3>
            <p className="text-green-700 mb-4">
              Chúng tôi sẽ xác nhận thanh toán của bạn 
              trong thời gian sớm nhất.
            </p>
            <p className="text-sm text-green-600">
              Đang chuyển hướng...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentConfirmationPage;
