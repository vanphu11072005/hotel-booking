/**
 * Example: Cách sử dụng useAuthStore trong components
 * 
 * File này chỉ để tham khảo, không được sử dụng 
 * trong production
 */

import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

// ============================================
// Example 1: Login Component
// ============================================
export const LoginExample = () => {
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (
    email: string, 
    password: string
  ) => {
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (error) {
      // Error đã được xử lý trong store
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}
      <button 
        onClick={() => handleLogin(
          'user@example.com', 
          'password123'
        )}
        disabled={isLoading}
      >
        {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
      </button>
    </div>
  );
};

// ============================================
// Example 2: Register Component
// ============================================
export const RegisterExample = () => {
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '0123456789'
      });
      navigate('/login');
    } catch (error) {
      console.error('Register failed:', error);
    }
  };

  return (
    <button 
      onClick={handleRegister} 
      disabled={isLoading}
    >
      {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
    </button>
  );
};

// ============================================
// Example 3: User Profile Display
// ============================================
export const UserProfileExample = () => {
  const { userInfo, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <p>Vui lòng đăng nhập</p>;
  }

  return (
    <div>
      <h2>Thông tin người dùng</h2>
      <p>Tên: {userInfo?.name}</p>
      <p>Email: {userInfo?.email}</p>
      <p>Role: {userInfo?.role}</p>
      {userInfo?.avatar && (
        <img 
          src={userInfo.avatar} 
          alt={userInfo.name} 
        />
      )}
    </div>
  );
};

// ============================================
// Example 4: Logout Button
// ============================================
export const LogoutButtonExample = () => {
  const { logout, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <button 
      onClick={handleLogout} 
      disabled={isLoading}
    >
      {isLoading ? 'Đang xử lý...' : 'Đăng xuất'}
    </button>
  );
};

// ============================================
// Example 5: Forgot Password
// ============================================
export const ForgotPasswordExample = () => {
  const { forgotPassword, isLoading } = useAuthStore();

  const handleForgotPassword = async (
    email: string
  ) => {
    try {
      await forgotPassword({ email });
      // Toast sẽ hiển thị thông báo thành công
    } catch (error) {
      console.error('Forgot password failed:', error);
    }
  };

  return (
    <button 
      onClick={() => 
        handleForgotPassword('user@example.com')
      }
      disabled={isLoading}
    >
      Gửi email đặt lại mật khẩu
    </button>
  );
};

// ============================================
// Example 6: Reset Password
// ============================================
export const ResetPasswordExample = () => {
  const { resetPassword, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleResetPassword = async (
    token: string,
    password: string
  ) => {
    try {
      await resetPassword({
        token,
        password,
        confirmPassword: password
      });
      navigate('/login');
    } catch (error) {
      console.error('Reset password failed:', error);
    }
  };

  return (
    <button 
      onClick={() => 
        handleResetPassword(
          'reset-token-123', 
          'newpassword123'
        )
      }
      disabled={isLoading}
    >
      Đặt lại mật khẩu
    </button>
  );
};

// ============================================
// Example 7: Conditional Rendering by Role
// ============================================
export const RoleBasedComponentExample = () => {
  const { userInfo } = useAuthStore();

  return (
    <div>
      {userInfo?.role === 'admin' && (
        <button>Admin Panel</button>
      )}
      {userInfo?.role === 'staff' && (
        <button>Staff Tools</button>
      )}
      {userInfo?.role === 'customer' && (
        <button>Customer Dashboard</button>
      )}
    </div>
  );
};

// ============================================
// Example 8: Auth State Check
// ============================================
export const AuthStateCheckExample = () => {
  const { 
    isAuthenticated, 
    isLoading, 
    token 
  } = useAuthStore();

  if (isLoading) {
    return <p>Đang tải...</p>;
  }

  if (!isAuthenticated || !token) {
    return <p>Bạn chưa đăng nhập</p>;
  }

  return <p>Bạn đã đăng nhập</p>;
};

// ============================================
// Example 9: Update User Info
// ============================================
export const UpdateUserInfoExample = () => {
  const { userInfo, setUser } = useAuthStore();

  const handleUpdateProfile = () => {
    if (userInfo) {
      setUser({
        ...userInfo,
        name: 'New Name',
        avatar: 'https://example.com/avatar.jpg'
      });
    }
  };

  return (
    <button onClick={handleUpdateProfile}>
      Cập nhật thông tin
    </button>
  );
};

// ============================================
// Example 10: Clear Error
// ============================================
export const ErrorHandlingExample = () => {
  const { error, clearError } = useAuthStore();

  if (!error) return null;

  return (
    <div className="bg-red-100 p-4 rounded">
      <p className="text-red-800">{error}</p>
      <button 
        onClick={clearError}
        className="mt-2 text-sm text-red-600"
      >
        Đóng
      </button>
    </div>
  );
};
