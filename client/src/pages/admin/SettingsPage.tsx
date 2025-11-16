import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'react-toastify';

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Hotel Booking System',
    contactEmail: 'contact@hotel.com',
    contactPhone: '0123456789',
    address: '123 Main Street, City, Country',
  });

  const [bookingSettings, setBookingSettings] = useState({
    depositPercentage: 30,
    cancellationHours: 24,
    maxBookingDays: 30,
    minBookingHours: 2,
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@hotel.com',
    fromName: 'Hotel Booking',
  });

  const [paymentSettings, setPaymentSettings] = useState({
    enableVNPay: false,
    vnpayTmnCode: '',
    vnpayHashSecret: '',
    enableMomo: false,
    momoPartnerCode: '',
    momoAccessKey: '',
    momoSecretKey: '',
  });

  const handleSaveGeneral = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to save general settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Lưu cài đặt chung thành công');
    } catch (error) {
      toast.error('Không thể lưu cài đặt');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBooking = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to save booking settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Lưu cài đặt đặt phòng thành công');
    } catch (error) {
      toast.error('Không thể lưu cài đặt');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmail = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to save email settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Lưu cài đặt email thành công');
    } catch (error) {
      toast.error('Không thể lưu cài đặt');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayment = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to save payment settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Lưu cài đặt thanh toán thành công');
    } catch (error) {
      toast.error('Không thể lưu cài đặt');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Cài đặt chung' },
    { id: 'booking', label: 'Đặt phòng' },
    { id: 'email', label: 'Email' },
    { id: 'payment', label: 'Thanh toán' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
        <p className="text-gray-600 mt-1">Quản lý các cài đặt cơ bản của hệ thống</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên website
                </label>
                <input
                  type="text"
                  value={generalSettings.siteName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email liên hệ
                </label>
                <input
                  type="email"
                  value={generalSettings.contactEmail}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={generalSettings.contactPhone}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <textarea
                  value={generalSettings.address}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveGeneral}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
                </button>
              </div>
            </div>
          )}

          {/* Booking Settings Tab */}
          {activeTab === 'booking' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tỷ lệ đặt cọc (%)
                </label>
                <input
                  type="number"
                  value={bookingSettings.depositPercentage}
                  onChange={(e) => setBookingSettings({ ...bookingSettings, depositPercentage: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Số tiền đặt cọc khi khách hàng đặt phòng (% tổng tiền)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian hủy miễn phí (giờ)
                </label>
                <input
                  type="number"
                  value={bookingSettings.cancellationHours}
                  onChange={(e) => setBookingSettings({ ...bookingSettings, cancellationHours: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Khách có thể hủy miễn phí trước thời gian này (tính từ check-in)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số ngày đặt tối đa
                </label>
                <input
                  type="number"
                  value={bookingSettings.maxBookingDays}
                  onChange={(e) => setBookingSettings({ ...bookingSettings, maxBookingDays: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Số ngày tối đa khách có thể đặt phòng
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian đặt tối thiểu (giờ)
                </label>
                <input
                  type="number"
                  value={bookingSettings.minBookingHours}
                  onChange={(e) => setBookingSettings({ ...bookingSettings, minBookingHours: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Số giờ tối thiểu khách phải đặt trước khi check-in
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveBooking}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
                </button>
              </div>
            </div>
          )}

          {/* Email Settings Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={emailSettings.smtpHost}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={emailSettings.smtpPort}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP User
                </label>
                <input
                  type="text"
                  value={emailSettings.smtpUser}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Password
                </label>
                <input
                  type="password"
                  value={emailSettings.smtpPassword}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Email
                </label>
                <input
                  type="email"
                  value={emailSettings.fromEmail}
                  onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Name
                </label>
                <input
                  type="text"
                  value={emailSettings.fromName}
                  onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveEmail}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
                </button>
              </div>
            </div>
          )}

          {/* Payment Settings Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold mb-4">VNPay</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableVNPay"
                      checked={paymentSettings.enableVNPay}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, enableVNPay: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="enableVNPay" className="ml-2 text-sm font-medium text-gray-700">
                      Kích hoạt thanh toán VNPay
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TMN Code
                    </label>
                    <input
                      type="text"
                      value={paymentSettings.vnpayTmnCode}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, vnpayTmnCode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={!paymentSettings.enableVNPay}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hash Secret
                    </label>
                    <input
                      type="password"
                      value={paymentSettings.vnpayHashSecret}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, vnpayHashSecret: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={!paymentSettings.enableVNPay}
                    />
                  </div>
                </div>
              </div>

              <div className="pb-6">
                <h3 className="text-lg font-semibold mb-4">MoMo</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableMomo"
                      checked={paymentSettings.enableMomo}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, enableMomo: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="enableMomo" className="ml-2 text-sm font-medium text-gray-700">
                      Kích hoạt thanh toán MoMo
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Partner Code
                    </label>
                    <input
                      type="text"
                      value={paymentSettings.momoPartnerCode}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, momoPartnerCode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={!paymentSettings.enableMomo}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Access Key
                    </label>
                    <input
                      type="text"
                      value={paymentSettings.momoAccessKey}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, momoAccessKey: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={!paymentSettings.enableMomo}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secret Key
                    </label>
                    <input
                      type="password"
                      value={paymentSettings.momoSecretKey}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, momoSecretKey: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={!paymentSettings.enableMomo}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSavePayment}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
