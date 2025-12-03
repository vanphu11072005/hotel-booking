import React, { useEffect } from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Store
import useAuthStore from './store/useAuthStore';
import useFavoritesStore from './store/useFavoritesStore';

// Layout Components
import { LayoutMain } from './components/layout';
import AdminLayout from './pages/AdminLayout';
import StaffLayout from './pages/StaffLayout';
import ScrollToTop from './components/common/ScrollToTop';

// Auth Components
import { 
  ProtectedRoute, 
  AdminRoute,
  StaffRoute 
} from './components/auth';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/customer/AboutPage';
import ServicesPage from './pages/ServicesPage';
import RoomListPage from 
  './pages/customer/RoomListPage';
import RoomDetailPage from 
  './pages/customer/RoomDetailPage';
import SearchResultsPage from 
  './pages/customer/SearchResultsPage';
import FavoritesPage from 
  './pages/customer/FavoritesPage';
import MyBookingsPage from 
  './pages/customer/MyBookingsPage';
import BookingPage from 
  './pages/customer/BookingPage';
import BookingSuccessPage from 
  './pages/customer/BookingSuccessPage';
import BookingDetailPage from 
  './pages/customer/BookingDetailPage';
import DepositPaymentPage from 
  './pages/customer/DepositPaymentPage';
import PaymentConfirmationPage from 
  './pages/customer/PaymentConfirmationPage';
import PaymentResultPage from 
  './pages/customer/PaymentResultPage';
import VNPayReturnPage from
  './pages/customer/VNPayReturnPage';
import { 
  LoginPage, 
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage 
} from './pages/auth';
import ProfilePage from './pages/customer/ProfilePage';

// Admin Pages
import {
  DashboardPage as AdminDashboardPage,
  RoomManagementPage,
  RoomTypeManagementPage,
  UserManagementPage,
  ServiceManagementPage,
  ReviewManagementPage,
  PromotionManagementPage,
  PaymentManagementPage,
} from './pages/admin';
import BannerManagementPage from './pages/admin/BannerManagementPage';
import SettingsPage from './pages/admin/SettingsPage';

// Staff Pages
import {
  StaffDashboard,
  BookingManagementPage as StaffBookingPage,
  CheckInPage as StaffCheckInPage,
  CheckOutPage as StaffCheckOutPage,
  RoomManagementPage as StaffRoomPage,
} from './pages/staff';

// Demo component cho các page chưa có
const DemoPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold text-gray-800">
      {title}
    </h1>
    <p className="text-gray-600 mt-4">
      Page này đang được phát triển...
    </p>
  </div>
);

function App() {
  // Sử dụng Zustand store
  const { 
    isAuthenticated, 
    userInfo, 
    logout, 
    initializeAuth,
    refreshAuthToken
  } = useAuthStore();
  
  const { 
    fetchFavorites, 
    syncGuestFavorites,
    loadGuestFavorites,
  } = useFavoritesStore();

  // Khởi tạo auth state khi app load
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Auto-refresh token mỗi 50 phút nếu rememberMe enabled
  useEffect(() => {
    if (isAuthenticated && localStorage.getItem('rememberMe') === 'true') {
      const interval = setInterval(() => {
        refreshAuthToken().catch((err) => {
          console.error('Auto refresh token failed:', err);
        });
      }, 50 * 60 * 1000); // 50 minutes

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, refreshAuthToken]);

  // Load favorites when authenticated or load guest favorites
  useEffect(() => {
    if (isAuthenticated) {
      // Sync guest favorites first, then fetch
      syncGuestFavorites().then(() => {
        fetchFavorites();
      });
    } else {
      // Load guest favorites from localStorage
      loadGuestFavorites();
    }
  }, [
    isAuthenticated, 
    fetchFavorites, 
    syncGuestFavorites,
    loadGuestFavorites,
  ]);

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Routes with Main Layout */}
        <Route 
          path="/" 
          element={
            <LayoutMain 
              isAuthenticated={isAuthenticated}
              userInfo={userInfo}
              onLogout={handleLogout}
            />
          }
        >
          <Route index element={<HomePage />} />
          <Route 
            path="rooms" 
            element={<RoomListPage />} 
          />
          <Route 
            path="rooms/search" 
            element={<SearchResultsPage />} 
          />
          <Route 
            path="rooms/:id" 
            element={<RoomDetailPage />} 
          />
          <Route 
            path="favorites" 
            element={<FavoritesPage />} 
          />
          <Route 
            path="payment-result" 
            element={<PaymentResultPage />} 
          />
          <Route 
            path="payment/vnpay-return" 
            element={<VNPayReturnPage />} 
          />
          <Route 
            path="about" 
            element={<AboutPage />} 
          />
          <Route 
            path="services" 
            element={<ServicesPage />} 
          />
          
          <Route 
            path="booking/:id" 
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/booking-success/:id" 
            element={
              <ProtectedRoute>
                <BookingSuccessPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/deposit-payment/:bookingId" 
            element={
              <ProtectedRoute>
                <DepositPaymentPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="bookings" 
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="bookings/:id" 
            element={
              <ProtectedRoute>
                <BookingDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="payment/:id" 
            element={
              <ProtectedRoute>
                <PaymentConfirmationPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Auth Routes (no layout) */}
        <Route 
          path="/login" 
          element={<LoginPage />} 
        />
        <Route 
          path="/register" 
          element={<RegisterPage />} 
        />
        <Route 
          path="/forgot-password" 
          element={<ForgotPasswordPage />} 
        />
        <Route 
          path="/reset-password/:token" 
          element={<ResetPasswordPage />} 
        />

        {/* Admin Routes - Chỉ admin mới truy cập được */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route 
            index 
            element={<Navigate to="dashboard" replace />} 
          />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route 
            path="users" 
            element={<UserManagementPage />} 
          />
          <Route 
            path="rooms" 
            element={<RoomManagementPage />} 
          />
          <Route 
            path="room-types" 
            element={<RoomTypeManagementPage />} 
          />
          <Route 
            path="services" 
            element={<ServiceManagementPage />} 
          />
          <Route 
            path="promotions" 
            element={<PromotionManagementPage />} 
          />
          <Route 
            path="reviews" 
            element={<ReviewManagementPage />} 
          />
          <Route 
            path="payments" 
            element={<PaymentManagementPage />} 
          />
          <Route 
            path="banners" 
            element={<BannerManagementPage />} 
          />
          <Route 
            path="reports" 
            element={<AdminDashboardPage />} 
          />
          <Route 
            path="settings" 
            element={<SettingsPage />} 
          />
        </Route>

        {/* Staff Routes - Cho staff và admin */}
        <Route 
          path="/staff" 
          element={
            <StaffRoute>
              <StaffLayout />
            </StaffRoute>
          }
        >
          <Route 
            index 
            element={<Navigate to="dashboard" replace />} 
          />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route 
            path="bookings" 
            element={<StaffBookingPage />} 
          />
          <Route 
            path="check-in" 
            element={<StaffCheckInPage />} 
          />
          <Route 
            path="check-out" 
            element={<StaffCheckOutPage />} 
          />
          <Route 
            path="rooms" 
            element={<StaffRoomPage />} 
          />
        </Route>

        {/* 404 Route */}
        <Route 
          path="*" 
          element={<DemoPage title="404 - Không tìm thấy trang" />} 
        />
      </Routes>
      
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </BrowserRouter>
  );
}

export default App;
