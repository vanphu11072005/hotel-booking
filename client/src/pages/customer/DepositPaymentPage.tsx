import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  CheckCircle,
  AlertCircle,
  CreditCard,
  Building2,
  Copy,
  Check,
  Loader2,
  ArrowLeft,
  Download,
  Wallet,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getBookingById, createBooking, createMultiRoomTypeBooking } from '../../services/api/bookingService';
import type { Booking } from '../../types/booking';
import {
  getPaymentsByBookingId,
  notifyPaymentCompletion,
  createVNPayPayment,
} from '../../services/api/paymentService';
import type { Payment, BankInfo } from '../../types/payment';
import Loading from '../../components/common/Loading';

const DepositPaymentPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const isPending = searchParams.get('pending') === 'true';

  const [booking, setBooking] = useState<Booking | null>(null);
  const [depositPayment, setDepositPayment] = useState<Payment | null>(null);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifying, setNotifying] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    'bank_transfer' | 'vnpay' | null
    >('bank_transfer');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState<any>(null);

  useEffect(() => {
    if (isPending) {
      // Load pending booking data from sessionStorage
      const storedData = sessionStorage.getItem('pendingBookingData');
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          setPendingBookingData(data);
          setLoading(false);
        } catch (err) {
          console.error('Error parsing pending booking data:', err);
          setError('Không thể tải thông tin đặt phòng');
          setLoading(false);
        }
      } else {
        setError('Không tìm thấy thông tin đặt phòng');
        setLoading(false);
      }
    } else if (bookingId) {
      fetchData(Number(bookingId));
    }
  }, [bookingId, isPending]);

  const fetchData = async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch booking details
      const bookingResponse = await getBookingById(id);
      if (!bookingResponse.success || !bookingResponse.data?.booking) {
        throw new Error('Không tìm thấy booking');
      }

      const bookingData = bookingResponse.data.booking;
      setBooking(bookingData);

      // Check if booking requires deposit
      if (!bookingData.requires_deposit) {
        toast.info('Booking này không yêu cầu đặt cọc');
        navigate(`/bookings/${id}`);
        return;
      }

      // Fetch payments
      const paymentsResponse = await getPaymentsByBookingId(id);
      if (paymentsResponse.success) {
        const deposit = paymentsResponse.data.payments.find(
          (p) => p.payment_type === 'deposit'
        );
        if (deposit) {
          setDepositPayment(deposit);

          // If payment is pending, fetch bank info
          if (deposit.payment_status === 'pending') {
            // const bankInfoResponse = await getBankTransferInfo(deposit.id);   
            // if (bankInfoResponse.success && bankInfoResponse.data.bank_info) {
            //   setBankInfo(bankInfoResponse.data.bank_info);
            // }
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      const message =
        err.response?.data?.message || 'Không thể tải thông tin thanh toán';
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

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      toast.success(`Đã sao chép ${label}`);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      toast.error('Không thể sao chép');
    }
  };

  const generateBankTransferInfo = async () => {
    try {
      setGeneratingQR(true);

      let depositAmount = 0;
      let transferContent = '';

      if (pendingBookingData) {
        // For pending booking, calculate 20% deposit
        depositAmount = pendingBookingData.total_price * 0.2;
        transferContent = `TEMP-${Date.now()} DAT COC`;
      } else if (depositPayment && booking) {
        depositAmount = parseFloat(depositPayment.amount.toString());
        transferContent = `${booking.booking_number} DAT COC`;
      } else {
        return;
      }

      // Create bank info
      const bankTransferInfo: BankInfo = {
        bank_name: 'Vietcombank (VCB)',
        bank_code: 'VCB',
        account_number: '0123456789',
        account_name: 'KHACH SAN ABC',
        amount: depositAmount,
        content: transferContent,
        qr_url: '',
      };

      // Generate QR code
      const qrContent = `Bank: ${bankTransferInfo.bank_name}\nAccount: ${bankTransferInfo.account_number}\nAmount: ${depositAmount}\nContent: ${transferContent}`;
      
      const qrUrl = await QRCode.toDataURL(qrContent, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      bankTransferInfo.qr_url = qrUrl;
      setQrCodeUrl(qrUrl);
      setBankInfo(bankTransferInfo);
    } catch (err) {
      console.error('Error generating QR code:', err);
      toast.error('Không thể tạo mã QR');
    } finally {
      setGeneratingQR(false);
    }
  };

  // Generate bank info when bank transfer is selected
  useEffect(() => {
    if (selectedPaymentMethod === 'bank_transfer' && !bankInfo) {
      if (pendingBookingData || (depositPayment && booking)) {
        generateBankTransferInfo();
      }
    }
  }, [selectedPaymentMethod, depositPayment, booking, pendingBookingData]);

  // Handler for VNPay payment
  const handleVNPayPayment = async () => {
    try {
      setLoading(true);

      // Case 1: Pending booking - create booking first
      if (pendingBookingData) {
        const isMulti = 'rooms' in pendingBookingData;
        const bookingResponse = isMulti
          ? await createMultiRoomTypeBooking(pendingBookingData)
          : await createBooking(pendingBookingData);

        if (bookingResponse.success && bookingResponse.data) {
          const newBooking = bookingResponse.data.booking;

          // Find deposit payment from payments array
          const depositPayment = newBooking.payments?.find(
            (p: any) => p.payment_type === 'deposit'
          );

          if (depositPayment) {
            // Create VNPay payment URL
            const vnpayResponse = await createVNPayPayment(
              depositPayment.id
            );

            if (vnpayResponse.success && vnpayResponse.data.payment_url) {
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
      }
      // Case 2: Existing booking
      else if (depositPayment) {
        // Create VNPay payment URL
        const vnpayResponse = await createVNPayPayment(
          depositPayment.id
        );

        if (vnpayResponse.success && vnpayResponse.data.payment_url) {
          // Redirect to VNPay
          window.location.href = vnpayResponse.data.payment_url;
        } else {
          toast.error(vnpayResponse.message || 
            'Không thể tạo thanh toán VNPay');
        }
      }
    } catch (err: any) {
      console.error('VNPay payment error:', err);
      toast.error(err.response?.data?.message || 
        'Có lỗi xảy ra khi tạo thanh toán VNPay');
    } finally {
      setLoading(false);
    }
  };

  // No auto-redirect payment methods. Default to bank transfer.

  const handleNotifyPayment = async () => {
    console.log('🔵 handleNotifyPayment called');
    console.log('🔵 pendingBookingData:', pendingBookingData);
    console.log('🔵 depositPayment:', depositPayment);
    console.log('🔵 bookingId:', bookingId);

    try {
      setNotifying(true);

      // Case 1: Pending booking - create booking first
      if (pendingBookingData) {
        console.log('✅ Case 1: Creating new booking');
        const isMulti = 'rooms' in pendingBookingData;
        const bookingResponse = isMulti
          ? await createMultiRoomTypeBooking(pendingBookingData)
          : await createBooking(pendingBookingData);
        console.log('✅ Booking response:', bookingResponse);

        if (bookingResponse.success && bookingResponse.data) {
          const newBooking = bookingResponse.data.booking;
          const newBookingId = newBooking.id;
          console.log('✅ New booking created with ID:', newBookingId);

          // Find deposit payment from payments array
          const depositPayment = newBooking.payments?.find(
            (p: any) => p.payment_type === 'deposit'
          );

          if (depositPayment) {
            console.log('✅ Notifying payment completion for deposit:', depositPayment.id);
            await notifyPaymentCompletion(
              depositPayment.id,
              'Khách hàng đã chuyển khoản đặt cọc'
            );
          }

          // Clear pending data
          sessionStorage.removeItem('pendingBookingData');
          console.log('✅ Navigating to:', `/booking-success/${newBookingId}`);

          // Navigate to success page
          navigate(`/booking-success/${newBookingId}`);
        } else {
          console.error('❌ Booking creation failed:', bookingResponse);
          throw new Error(
            bookingResponse.message || 'Không thể tạo đặt phòng'
          );
        }
      }
      // Case 2: Existing booking - just notify payment
      else if (depositPayment && bookingId) {
        console.log('✅ Case 2: Notifying existing booking');
        const response = await notifyPaymentCompletion(
          depositPayment.id,
          'Khách hàng đã chuyển khoản đặt cọc'
        );
        console.log('✅ Notify response:', response);

        if (response.success) {
          console.log('✅ Navigating to:', `/booking-success/${bookingId}`);
          // Navigate to success page for existing booking too
          navigate(`/booking-success/${bookingId}`);
        } else {
          console.error('❌ Notify failed:', response);
          throw new Error(response.message || 'Không thể gửi thông báo');
        }
      } else {
        console.error('❌ No valid data found');
        toast.error('Không tìm thấy thông tin đặt phòng hoặc thanh toán');
      }
    } catch (err: any) {
      console.error('❌ Error notifying payment:', err);
      console.error('❌ Error details:', err.response?.data);
      const message =
        err.response?.data?.message ||
        'Không thể xử lý thanh toán. Vui lòng thử lại.';
      toast.error(message);
    } finally {
      console.log('🔵 Setting notifying to false');
      setNotifying(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Đang tải..." />;
  }

  // Check error for both pending and existing bookings
  if (error || (!pendingBookingData && (!booking || !depositPayment))) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div
            className="bg-red-50 border border-red-200 
              rounded-lg p-8 text-center"
          >
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-700 font-medium mb-4">
              {error || 'Không tìm thấy thông tin thanh toán'}
            </p>
            <Link
              to="/bookings"
              className="inline-flex items-center gap-2 bg-indigo-600 
                text-white px-3 py-2 rounded-md hover:bg-indigo-700 
                disabled:bg-gray-400 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại danh sách booking
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate deposit amount based on pending or existing booking
  let depositAmount = 0;
  let remainingAmount = 0;
  let isDepositPaid = false;
  let totalPrice = 0;

  if (pendingBookingData) {
    totalPrice = pendingBookingData.total_price;
    depositAmount = totalPrice * 0.2;
    remainingAmount = totalPrice - depositAmount;
    isDepositPaid = false;
  } else if (depositPayment && booking) {
    depositAmount = parseFloat(depositPayment.amount.toString());
    remainingAmount = booking.total_price - depositAmount;
    isDepositPaid = depositPayment.payment_status === 'completed';
    totalPrice = booking.total_price;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        {!pendingBookingData && (
          <Link
            to={`/bookings/${bookingId}`}
            className="inline-flex items-center gap-2 bg-indigo-600 
              text-white px-3 py-2 rounded-md hover:bg-indigo-700 
              disabled:bg-gray-400 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại chi tiết booking</span>
          </Link>
        )}
        {pendingBookingData && (
          <Link
            to={`/booking/${pendingBookingData.room_id}`}
            className="inline-flex items-center gap-2 bg-indigo-600 
              text-white px-3 py-2 rounded-md hover:bg-indigo-700 
              disabled:bg-gray-400 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại trang đặt phòng</span>
          </Link>
        )}

        {/* Success Header (if paid) */}
        {isDepositPaid && (
          <div
            className="bg-green-50 border-2 border-green-200 
              rounded-lg p-6 mb-6"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 bg-green-100 rounded-full 
                  flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-green-900 mb-1">
                  Đã thanh toán đặt cọc thành công!
                </h1>
                <p className="text-green-700">
                  Booking của bạn đã được xác nhận. 
                  Phần còn lại thanh toán khi nhận phòng.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pending Header */}
        {!isDepositPaid && (
          <div
            className="bg-orange-50 border-2 border-orange-200 
              rounded-lg p-6 mb-6"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 bg-orange-100 rounded-full 
                  flex items-center justify-center"
              >
                <CreditCard className="w-10 h-10 text-orange-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-orange-900 mb-1">
                  Thanh toán tiền đặt cọc
                </h1>
                <p className="text-orange-700">
                  Vui lòng thanh toán <strong>20% tiền cọc</strong> để 
                  xác nhận đặt phòng
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Thông tin thanh toán
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng tiền phòng</span>
                  <span className="font-medium">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                <div
                  className="flex justify-between border-t pt-3 
                    text-orange-600"
                >
                  <span className="font-medium">
                    Tiền cọc cần thanh toán (20%)
                  </span>
                  <span className="text-xl font-bold">
                    {formatPrice(depositAmount)}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>Phần còn lại thanh toán khi nhận phòng</span>
                  <span>{formatPrice(remainingAmount)}</span>
                </div>
              </div>

              {isDepositPaid && depositPayment && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm text-green-800">
                    ✓ Đã thanh toán tiền cọc vào:{' '}
                    {depositPayment.payment_date
                      ? new Date(depositPayment.payment_date).toLocaleString('vi-VN')
                      : 'N/A'}
                  </p>
                  {depositPayment.transaction_id && (
                    <p className="text-xs text-green-700 mt-1">
                      Mã giao dịch: {depositPayment.transaction_id}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            {!isDepositPaid && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Chọn phương thức thanh toán
                </h2>

                {/* Payment Method Buttons */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Bank Transfer Button */}
                  <button
                    onClick={() => setSelectedPaymentMethod('bank_transfer')}
                    className={`p-4 border-2 rounded-lg transition-all 
                      ${
                        selectedPaymentMethod === 'bank_transfer'
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-300 bg-white hover:border-indigo-300'
                      }`}
                  >
                    <Building2
                      className={`w-8 h-8 mx-auto mb-2 ${
                        selectedPaymentMethod === 'bank_transfer'
                          ? 'text-indigo-600'
                          : 'text-gray-600'
                      }`}
                    />
                    <div
                      className={`font-bold text-sm ${
                        selectedPaymentMethod === 'bank_transfer'
                          ? 'text-indigo-900'
                          : 'text-gray-700'
                      }`}
                    >
                      Chuyển khoản
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Chuyển khoản ngân hàng
                    </div>
                  </button>

                  {/* VNPay Button */}
                  <button
                    onClick={() => setSelectedPaymentMethod('vnpay')}
                    className={`p-4 border-2 rounded-lg transition-all 
                      ${
                        selectedPaymentMethod === 'vnpay'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 bg-white hover:border-blue-300'
                      }`}
                  >
                    <Wallet
                      className={`w-8 h-8 mx-auto mb-2 ${
                        selectedPaymentMethod === 'vnpay'
                          ? 'text-blue-600'
                          : 'text-gray-600'
                      }`}
                    />
                    <div
                      className={`font-bold text-sm ${
                        selectedPaymentMethod === 'vnpay'
                          ? 'text-blue-900'
                          : 'text-gray-700'
                      }`}
                    >
                      VNPay
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Thanh toán online
                    </div>
                  </button>
                </div>

                
              </div>
            )}

            {/* Bank Transfer Instructions */}
            {!isDepositPaid && selectedPaymentMethod === 'bank_transfer' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                {generatingQR ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
                    <p className="text-gray-600">Đang tạo thông tin chuyển khoản...</p>
                  </div>
                ) : bankInfo ? (
                  <>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      <Building2 className="w-5 h-5 inline mr-2" />
                      Thông tin chuyển khoản
                    </h2>

                    <div className="space-y-4">
                  {/* Bank Info */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="text-xs text-gray-500">Ngân hàng</div>
                        <div className="font-medium">{bankInfo.bank_name}</div>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(bankInfo.bank_name, 'tên ngân hàng')
                        }
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                      >
                        {copiedText === 'tên ngân hàng' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="text-xs text-gray-500">Số tài khoản</div>
                        <div className="font-medium font-mono">
                          {bankInfo.account_number}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(bankInfo.account_number, 'số tài khoản')
                        }
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                      >
                        {copiedText === 'số tài khoản' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="text-xs text-gray-500">Chủ tài khoản</div>
                        <div className="font-medium">{bankInfo.account_name}</div>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(bankInfo.account_name, 'chủ tài khoản')
                        }
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                      >
                        {copiedText === 'chủ tài khoản' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-orange-50 border border-orange-200 rounded">
                      <div>
                        <div className="text-xs text-orange-700">Số tiền</div>
                        <div className="text-lg font-bold text-orange-600">
                          {formatPrice(bankInfo.amount)}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(bankInfo.amount.toString(), 'số tiền')
                        }
                        className="p-2 hover:bg-orange-100 rounded transition-colors"
                      >
                        {copiedText === 'số tiền' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-orange-600" />
                        )}
                      </button>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="text-xs text-gray-500">Nội dung chuyển khoản</div>
                        <div className="font-medium font-mono text-red-600">
                          {bankInfo.content}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(bankInfo.content, 'nội dung')
                        }
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                      >
                        {copiedText === 'nội dung' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>⚠️ Lưu ý:</strong> Vui lòng nhập đúng nội dung chuyển khoản để 
                      hệ thống tự động xác nhận thanh toán.
                    </p>
                  </div>

                  {/* Notify Button */}
                  <button
                    onClick={handleNotifyPayment}
                    disabled={notifying}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg 
                      hover:bg-indigo-700 transition-colors font-semibold 
                      disabled:bg-gray-400 disabled:cursor-not-allowed 
                      flex items-center justify-center gap-2"
                  >
                    {notifying ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Tôi đã chuyển khoản
                      </>
                    )}
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Sau khi chuyển khoản, nhấn nút trên để thông báo cho chúng tôi
                  </p>
                </div>
                  </>
                ) : null}
              </div>
            )}

            {/* VNPay Payment Section */}
            {!isDepositPaid && selectedPaymentMethod === 'vnpay' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  <Wallet className="w-5 h-5 inline mr-2" />
                  Thanh toán qua VNPay
                </h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Thanh toán nhanh chóng và an toàn</strong>
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                    <li>Hỗ trợ thẻ ATM, thẻ tín dụng, ví điện tử</li>
                    <li>Xác nhận thanh toán tự động ngay lập tức</li>
                    <li>Bảo mật thông tin theo tiêu chuẩn quốc tế</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                    <div className="text-xs text-gray-500 font-medium uppercase mb-1">Số tiền thanh toán</div>
                    <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                      {formatPrice(depositAmount)}
                    </div>
                  </div>

                  <button
                    onClick={handleVNPayPayment}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 
                      to-blue-700 text-white py-3 rounded-lg 
                      transition-all font-semibold shadow-lg 
                      flex items-center justify-center gap-2
                      hover:from-blue-700 hover:to-blue-800
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-5 h-5" />
                        Thanh toán với VNPay
                      </>
                    )}
                  </button>

                  <p className="text-xs text-center text-gray-500">
                    Hỗ trợ thẻ ATM, thẻ tín dụng, ví điện tử
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* QR Code Sidebar */}
          {!isDepositPaid && 
            qrCodeUrl && 
            selectedPaymentMethod === 'bank_transfer' && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                  Quét mã QR để thanh toán
                </h3>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-full h-auto rounded"
                  />
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Quét mã QR bằng app ngân hàng
                  </p>
                  <p className="text-xs text-gray-500">
                    Thông tin chuyển khoản đã được điền tự động
                  </p>
                </div>

                <a
                  href={qrCodeUrl}
                  download={`deposit-qr-${booking?.booking_number || 'pending'}.jpg`}
                  className="mt-4 w-full inline-flex items-center justify-center 
                    gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 
                    text-gray-700 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Tải mã QR
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepositPaymentPage;
