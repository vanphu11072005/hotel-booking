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

// Layout Components
import LayoutMain from './components/layout/LayoutMain';
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
import BookingListPage from 
  './pages/customer/BookingListPage';
import { 
  LoginPage, 
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage 
} from './pages/auth';

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

const AdminDashboard: React.FC = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-800 mb-6">
      Dashboard
    </h1>
    <div className="grid grid-cols-1 md:grid-cols-2 
      lg:grid-cols-4 gap-6"
    >
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm font-medium">
          Tổng đặt phòng
        </h3>
        <p className="text-3xl font-bold text-gray-800 mt-2">
          150
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm font-medium">
          Doanh thu
        </h3>
        <p className="text-3xl font-bold text-gray-800 mt-2">
          $45,000
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm font-medium">
          Phòng trống
        </h3>
        <p className="text-3xl font-bold text-gray-800 mt-2">
          23
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm font-medium">
          Khách hàng
        </h3>
        <p className="text-3xl font-bold text-gray-800 mt-2">
          1,234
        </p>
      </div>
    </div>
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

  // Khởi tạo auth state khi app load
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

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
            path="bookings" 
            element={
              <ProtectedRoute>
                <BookingListPage />
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
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route 
            path="users" 
            element={<DemoPage title="Quản lý người dùng" />} 
          />
          <Route 
            path="rooms" 
            element={<DemoPage title="Quản lý phòng" />} 
          />
          <Route 
            path="bookings" 
            element={<DemoPage title="Quản lý đặt phòng" />} 
          />
          <Route 
            path="payments" 
            element={<DemoPage title="Quản lý thanh toán" />} 
          />
          <Route 
            path="services" 
            element={<DemoPage title="Quản lý dịch vụ" />} 
          />
          <Route 
            path="promotions" 
            element={<DemoPage title="Quản lý khuyến mãi" />} 
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
