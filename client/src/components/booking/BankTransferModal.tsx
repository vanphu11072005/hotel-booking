import React from 'react';
import type {
  BookingData,
  MultiRoomTypeBookingData,
} from '../../types/booking';
import {
  Building2,
  CreditCard,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

type RecentBooking = { id: number; booking_number: string } | null;

type Props = {
  isOpen: boolean;
  pendingBookingData?: BookingData | MultiRoomTypeBookingData | null;
  recentBooking?: RecentBooking;
  qrCodeUrl: string | null;
  submitting: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
  formatPrice: (p: number) => string;
};

const BankTransferModal: React.FC<Props> = ({
  isOpen,
  pendingBookingData,
  recentBooking,
  qrCodeUrl,
  submitting,
  onConfirm,
  onClose,
  formatPrice,
}) => {
  if (!isOpen || !pendingBookingData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden">
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
              <div className="bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-indigo-50 dark:to-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Ngân hàng</p>
                      <p className="text-base font-bold text-gray-900 dark:text-gray-100 mt-0.5">Vietcombank (VCB)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Số tài khoản</p>
                      <p className="text-base font-bold text-gray-900 dark:text-gray-100 mt-0.5 font-mono">0123456789</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Chủ tài khoản</p>
                      <p className="text-base font-bold text-gray-900 dark:text-gray-100 mt-0.5">KHACH SAN ABC</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount & Content */}
              <div className="bg-gradient-to-br from-orange-50 dark:from-orange-900/20 to-red-50 dark:to-red-900/20 rounded-xl p-4 border border-orange-100 dark:border-orange-800">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mb-1">Số tiền</p>
                    <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 dark:from-orange-400 to-red-600 dark:to-red-400">
                      {formatPrice(pendingBookingData.total_price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mb-1">Nội dung chuyển khoản</p>
                    <div className="bg-white dark:bg-gray-700 rounded-lg px-3 py-2 border border-orange-200 dark:border-orange-700">
                      <p className="text-base font-bold text-gray-900 dark:text-gray-100 font-mono">
                        {recentBooking?.booking_number || `BOOKING-${Date.now()}`}
                      </p>
                    </div>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-medium">
                      ⚠️ Mã đặt phòng sẽ được tạo sau khi xác nhận
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-white dark:bg-gray-700 rounded-2xl p-4 shadow-lg border-2 border-gray-100 dark:border-gray-600">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR code chuyển khoản" className="w-64 h-64 object-contain" />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 dark:from-gray-800 to-gray-100 dark:to-gray-700 rounded-lg">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500 dark:text-indigo-400" />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center font-medium">Quét mã QR để chuyển khoản nhanh</p>
            </div>
          </div>

          {/* Important Note */}
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-1">Lưu ý quan trọng</p>
                <ul className="text-xs text-yellow-800 dark:text-yellow-300 space-y-1 list-disc list-inside">
                  <li>Vui lòng chuyển khoản đúng số tiền và nội dung như trên</li>
                  <li>Đơn hàng sẽ được xác nhận sau khi nhận được thanh toán (5-15 phút)</li>
                  <li>Nếu có thắc mắc, vui lòng liên hệ hotline: 1900 1234</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            className="px-5 py-2.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors font-medium disabled:opacity-50"
            onClick={onClose}
            disabled={submitting}
          >
            Đóng
          </button>
          <button
            type="button"
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg shadow-indigo-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onConfirm}
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
  );
};

export default BankTransferModal;
