# Route Protection Documentation

## Chức năng 8: Phân quyền & Bảo vệ Route

Hệ thống sử dụng 2 component để bảo vệ các route:
- **ProtectedRoute**: Yêu cầu user phải đăng nhập
- **AdminRoute**: Yêu cầu user phải là Admin

---

## 1. ProtectedRoute

### Mục đích
Bảo vệ các route yêu cầu authentication (đăng nhập).

### Cách hoạt động
```tsx
// File: client/src/components/auth/ProtectedRoute.tsx

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children 
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuthStore();

  // 1. Nếu đang loading → hiển thị spinner
  if (isLoading) {
    return <LoadingScreen />;
  }

  // 2. Nếu chưa đăng nhập → redirect /login
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }}  // Lưu location để quay lại
        replace 
      />
    );
  }

  // 3. Đã đăng nhập → cho phép truy cập
  return <>{children}</>;
};
```

### Sử dụng trong App.tsx
```tsx
import { ProtectedRoute } from './components/auth';

// Route yêu cầu đăng nhập
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/bookings" 
  element={
    <ProtectedRoute>
      <BookingListPage />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  } 
/>
```

### Luồng hoạt động
1. User chưa đăng nhập truy cập `/dashboard`
2. ProtectedRoute kiểm tra `isAuthenticated === false`
3. Redirect về `/login` và lưu `state={{ from: '/dashboard' }}`
4. Sau khi login thành công, redirect về `/dashboard`

---

## 2. AdminRoute

### Mục đích
Bảo vệ các route chỉ dành cho Admin (role-based access).

### Cách hoạt động
```tsx
// File: client/src/components/auth/AdminRoute.tsx

const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children 
}) => {
  const location = useLocation();
  const { isAuthenticated, userInfo, isLoading } = useAuthStore();

  // 1. Nếu đang loading → hiển thị spinner
  if (isLoading) {
    return <LoadingScreen />;
  }

  // 2. Nếu chưa đăng nhập → redirect /login
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // 3. Nếu không phải admin → redirect /
  const isAdmin = userInfo?.role === 'admin';
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 4. Là admin → cho phép truy cập
  return <>{children}</>;
};
```

### Sử dụng trong App.tsx
```tsx
import { AdminRoute } from './components/auth';

// Route chỉ dành cho Admin
<Route 
  path="/admin" 
  element={
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
  }
>
  <Route path="dashboard" element={<AdminDashboard />} />
  <Route path="users" element={<UserManagement />} />
  <Route path="rooms" element={<RoomManagement />} />
  <Route path="bookings" element={<BookingManagement />} />
  <Route path="settings" element={<Settings />} />
</Route>
```

### Luồng hoạt động

#### Case 1: User chưa đăng nhập
1. Truy cập `/admin`
2. AdminRoute kiểm tra `isAuthenticated === false`
3. Redirect về `/login` với `state={{ from: '/admin' }}`
4. Sau login thành công → quay lại `/admin`
5. AdminRoute kiểm tra lại role

#### Case 2: User đã đăng nhập nhưng không phải Admin
1. Customer (role='customer') truy cập `/admin`
2. AdminRoute kiểm tra `isAuthenticated === true`
3. AdminRoute kiểm tra `userInfo.role === 'customer'` (không phải 'admin')
4. Redirect về `/` (trang chủ)

#### Case 3: User là Admin
1. Admin (role='admin') truy cập `/admin`
2. AdminRoute kiểm tra `isAuthenticated === true`
3. AdminRoute kiểm tra `userInfo.role === 'admin'` ✅
4. Cho phép truy cập

---

## 3. Cấu trúc Route trong App.tsx

```tsx
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Không cần đăng nhập */}
        <Route path="/" element={<LayoutMain />}>
          <Route index element={<HomePage />} />
          <Route path="rooms" element={<RoomListPage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>

        {/* Auth Routes - Không cần layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected Routes - Yêu cầu đăng nhập */}
        <Route path="/" element={<LayoutMain />}>
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
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Admin Routes - Chỉ Admin */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="rooms" element={<RoomManagement />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="payments" element={<PaymentManagement />} />
          <Route path="services" element={<ServiceManagement />} />
          <Route path="promotions" element={<PromotionManagement />} />
          <Route path="banners" element={<BannerManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 4. Tích hợp với Zustand Store

### useAuthStore State
```tsx
// File: client/src/store/useAuthStore.ts

const useAuthStore = create<AuthStore>((set) => ({
  // State
  token: localStorage.getItem('token') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  // Actions
  login: async (credentials) => { ... },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    set({
      token: null,
      refreshToken: null,
      userInfo: null,
      isAuthenticated: false,
      error: null
    });
  },
  
  // ... other actions
}));
```

### User Roles
- **admin**: Quản trị viên (full access)
- **staff**: Nhân viên (limited access)
- **customer**: Khách hàng (customer features only)

---

## 5. Loading State

Cả 2 component đều xử lý loading state để tránh:
- Flash of redirect (nhấp nháy khi chuyển trang)
- Race condition (auth state chưa load xong)

```tsx
if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 
          border-b-2 border-indigo-600 mx-auto"
        />
        <p className="mt-4 text-gray-600">Đang xác thực...</p>
      </div>
    </div>
  );
}
```

---

## 6. Redirect After Login

### LoginPage implementation
```tsx
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();

  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      
      // Redirect về page ban đầu hoặc /dashboard
      navigate(from, { replace: true });
      
      toast.success('Đăng nhập thành công!');
    } catch (error) {
      toast.error('Đăng nhập thất bại!');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ... form fields */}
    </form>
  );
};
```

### Flow
1. User truy cập `/bookings` (protected)
2. Redirect `/login?from=/bookings`
3. Login thành công
4. Redirect về `/bookings` (page ban đầu)

---

## 7. Testing Route Protection

### Test Case 1: ProtectedRoute - Unauthenticated
**Given**: User chưa đăng nhập  
**When**: Truy cập `/dashboard`  
**Then**: Redirect về `/login`  
**And**: Lưu `from=/dashboard` trong location state

### Test Case 2: ProtectedRoute - Authenticated
**Given**: User đã đăng nhập  
**When**: Truy cập `/dashboard`  
**Then**: Hiển thị DashboardPage thành công

### Test Case 3: AdminRoute - Not Admin
**Given**: User có role='customer'  
**When**: Truy cập `/admin`  
**Then**: Redirect về `/` (trang chủ)

### Test Case 4: AdminRoute - Is Admin
**Given**: User có role='admin'  
**When**: Truy cập `/admin`  
**Then**: Hiển thị AdminLayout thành công

### Test Case 5: Loading State
**Given**: Auth đang initialize  
**When**: isLoading === true  
**Then**: Hiển thị loading spinner  
**And**: Không redirect

---

## 8. Security Best Practices

### ✅ Đã Implement
1. **Client-side protection**: ProtectedRoute & AdminRoute
2. **Token persistence**: localStorage
3. **Role-based access**: Kiểm tra userInfo.role
4. **Location state**: Lưu "from" để redirect về đúng page
5. **Loading state**: Tránh flash của redirect
6. **Replace navigation**: Không lưu lịch sử redirect

### ⚠️ Lưu Ý
- Client-side protection **không đủ** → Phải có backend validation
- API endpoints phải kiểm tra JWT + role
- Middleware backend: `auth`, `adminOnly`
- Never trust client-side role → Always verify on server

### Backend Middleware Example
```javascript
// server/src/middlewares/auth.js
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      message: 'Unauthorized' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.userId);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Forbidden: Admin only' 
    });
  }
  next();
};

// Usage
router.get('/admin/users', auth, adminOnly, getUsers);
```

---

## 9. Troubleshooting

### Vấn đề 1: Infinite redirect loop
**Nguyên nhân**: ProtectedRoute check sai logic  
**Giải pháp**: Đảm bảo `replace={true}` trong Navigate

### Vấn đề 2: Flash of redirect
**Nguyên nhân**: Không handle loading state  
**Giải pháp**: Thêm check `if (isLoading)` trước check auth

### Vấn đề 3: Lost location state
**Nguyên nhân**: Không pass `state={{ from: location }}`  
**Giải pháp**: Luôn lưu location khi redirect

### Vấn đề 4: Admin có thể truy cập nhưng API fail
**Nguyên nhân**: Backend không verify role  
**Giải pháp**: Thêm middleware `adminOnly` trên API routes

---

## 10. Summary

### ProtectedRoute
- ✅ Kiểm tra `isAuthenticated`
- ✅ Redirect `/login` nếu chưa đăng nhập
- ✅ Lưu location state để quay lại
- ✅ Handle loading state

### AdminRoute
- ✅ Kiểm tra `isAuthenticated` trước
- ✅ Kiểm tra `userInfo.role === 'admin'`
- ✅ Redirect `/login` nếu chưa đăng nhập
- ✅ Redirect `/` nếu không phải admin
- ✅ Handle loading state

### Kết quả
- Bảo vệ toàn bộ protected routes
- UX mượt mà, không flash
- Role-based access hoạt động chính xác
- Security tốt (kết hợp backend validation)

---

**Chức năng 8 hoàn thành! ✅**
