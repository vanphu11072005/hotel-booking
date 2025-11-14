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

// Auth Components
import { 
  ProtectedRoute, 
  AdminRoute 
} from './components/auth';

// Pages
import HomePage from './pages/HomePage';
import DashboardPage from 
  './pages/customer/DashboardPage';
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
import { 
  LoginPage, 
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage 
} from './pages/auth';

// Admin Pages
import {
  DashboardPage as AdminDashboardPage,
  RoomManagementPage,
  UserManagementPage,
  BookingManagementPage,
  PaymentManagementPage,
  ServiceManagementPage,
  ReviewManagementPage,
  PromotionManagementPage,
  CheckInPage,
  CheckOutPage,
} from './pages/admin';

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
    initializeAuth 
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
            path="about" 
            element={<DemoPage title="Giới thiệu" />} 
          />
          
          {/* Protected Routes - Yêu cầu đăng nhập */}
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
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
            path="booking-success/:id" 
            element={
              <ProtectedRoute>
                <BookingSuccessPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="deposit-payment/:bookingId" 
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
                <DemoPage title="Hồ sơ" />
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
            path="bookings" 
            element={<BookingManagementPage />} 
          />
          <Route 
            path="payments" 
            element={<PaymentManagementPage />} 
          />
          <Route 
            path="services" 
            element={<ServiceManagementPage />} 
          />
          <Route 
            path="reviews" 
            element={<ReviewManagementPage />} 
          />
          <Route 
            path="promotions" 
            element={<PromotionManagementPage />} 
          />
          <Route 
            path="check-in" 
            element={<CheckInPage />} 
          />
          <Route 
            path="check-out" 
            element={<CheckOutPage />} 
          />
          <Route 
            path="banners" 
            element={<DemoPage title="Quản lý banner" />} 
          />
          <Route 
            path="reports" 
            element={<DemoPage title="Báo cáo" />} 
          />
          <Route 
            path="settings" 
            element={<DemoPage title="Cài đặt" />} 
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
