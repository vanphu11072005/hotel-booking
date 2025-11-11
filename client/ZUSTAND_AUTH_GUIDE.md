# useAuthStore - Zustand Authentication Store

## ✅ Hoàn thành Chức năng 3

### 📦 Files đã tạo:

1. **`src/store/useAuthStore.ts`** - Zustand store quản lý auth
2. **`src/services/api/apiClient.ts`** - Axios client với interceptors
3. **`src/services/api/authService.ts`** - Auth API service
4. **`.env.example`** - Template cho environment variables

### 🎯 Tính năng đã implement:

#### State Management:
```typescript
interface AuthState {
  token: string | null;
  refreshToken: string | null;
  userInfo: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

#### Actions:
- ✅ `login(credentials)` - Đăng nhập
- ✅ `register(data)` - Đăng ký tài khoản mới
- ✅ `logout()` - Đăng xuất
- ✅ `setUser(user)` - Cập nhật thông tin user
- ✅ `refreshAuthToken()` - Làm mới token
- ✅ `forgotPassword(data)` - Quên mật khẩu
- ✅ `resetPassword(data)` - Đặt lại mật khẩu
- ✅ `initializeAuth()` - Khởi tạo auth từ localStorage
- ✅ `clearError()` - Xóa error message

### 📝 Cách sử dụng:

#### 1. Khởi tạo trong App.tsx:
```typescript
import useAuthStore from './store/useAuthStore';

function App() {
  const { 
    isAuthenticated, 
    userInfo, 
    logout, 
    initializeAuth 
  } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // ...
}
```

#### 2. Sử dụng trong Login Form:
```typescript
import useAuthStore from '../store/useAuthStore';

const LoginPage = () => {
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      await login(data);
      navigate('/dashboard'); // Redirect sau khi login
    } catch (error) {
      // Error đã được xử lý bởi store
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {error && <div>{error}</div>}
      <button disabled={isLoading}>
        {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
      </button>
    </form>
  );
};
```

#### 3. Sử dụng trong Register Form:
```typescript
const RegisterPage = () => {
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      await register(data);
      navigate('/login'); // Redirect về login
    } catch (error) {
      // Error được hiển thị qua toast
    }
  };

  // ...
};
```

#### 4. Logout:
```typescript
const Header = () => {
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    // Auto redirect về login nếu cần
  };

  return <button onClick={handleLogout}>Đăng xuất</button>;
};
```

#### 5. Hiển thị thông tin user:
```typescript
const Profile = () => {
  const { userInfo } = useAuthStore();

  return (
    <div>
      <h1>Xin chào, {userInfo?.name}</h1>
      <p>Email: {userInfo?.email}</p>
      <p>Role: {userInfo?.role}</p>
    </div>
  );
};
```

### 🔐 LocalStorage Persistence:

Store tự động lưu và đọc từ localStorage:
- `token` - JWT access token
- `refreshToken` - JWT refresh token
- `userInfo` - Thông tin user

Khi reload page, auth state được khôi phục tự động qua `initializeAuth()`.

### 🌐 API Integration:

#### Base URL Configuration:
Tạo file `.env` trong thư mục `client/`:
```env
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

#### API Endpoints được sử dụng:
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/profile` - Lấy profile
- `POST /api/auth/refresh-token` - Refresh token
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu

### 🛡️ Security Features:

1. **Auto Token Injection**:
   - Axios interceptor tự động thêm token vào headers
   ```typescript
   Authorization: Bearer <token>
   ```

2. **Auto Logout on 401**:
   - Khi token hết hạn (401), tự động logout và redirect về login

3. **Token Refresh**:
   - Có thể refresh token khi sắp hết hạn

4. **Password Hashing**:
   - Backend xử lý bcrypt hashing

### 📱 Toast Notifications:

Store tự động hiển thị toast cho các events:
- ✅ Login thành công
- ✅ Đăng ký thành công
- ✅ Logout
- ❌ Login thất bại
- ❌ Đăng ký thất bại
- ❌ API errors

### 🔄 Component Updates:

#### ProtectedRoute:
```typescript
// TRƯỚC (với props)
<ProtectedRoute isAuthenticated={isAuthenticated}>
  <Dashboard />
</ProtectedRoute>

// SAU (tự động lấy từ store)
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

#### AdminRoute:
```typescript
// TRƯỚC (với props)
<AdminRoute userInfo={userInfo}>
  <AdminPanel />
</AdminRoute>

// SAU (tự động lấy từ store)
<AdminRoute>
  <AdminPanel />
</AdminRoute>
```

#### LayoutMain:
Vẫn nhận props từ App.tsx để hiển thị Header/Navbar:
```typescript
<LayoutMain 
  isAuthenticated={isAuthenticated}
  userInfo={userInfo}
  onLogout={handleLogout}
/>
```

### 🧪 Testing:

Để test authentication flow:

1. **Tạo file `.env`**:
   ```bash
   cp .env.example .env
   ```

2. **Ensure backend đang chạy**:
   ```bash
   cd server
   npm run dev
   ```

3. **Chạy frontend**:
   ```bash
   cd client
   npm run dev
   ```

4. **Test flow**:
   - Truy cập `/register` → Đăng ký tài khoản
   - Truy cập `/login` → Đăng nhập
   - Truy cập `/dashboard` → Xem dashboard (protected)
   - Click logout → Xóa session
   - Reload page → Auth state được khôi phục

### 🚀 Next Steps:

**Chức năng 4: Form Login**
- Tạo LoginPage với React Hook Form + Yup
- Tích hợp với useAuthStore
- UX enhancements (loading, show/hide password, remember me)

**Chức năng 5: Form Register**
- Tạo RegisterPage với validation
- Tích hợp với useAuthStore

**Chức năng 6-7: Password Reset Flow**
- ForgotPasswordPage
- ResetPasswordPage

### 📚 TypeScript Types:

```typescript
interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface UserInfo {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  createdAt?: string;
}
```

### ✅ Kết quả đạt được:

1. ✅ Toàn bộ thông tin user được quản lý tập trung
2. ✅ Duy trì đăng nhập sau khi reload trang
3. ✅ Dễ dàng truy cập userInfo trong mọi component
4. ✅ Auto token management
5. ✅ Type-safe với TypeScript
6. ✅ Clean code, dễ maintain
