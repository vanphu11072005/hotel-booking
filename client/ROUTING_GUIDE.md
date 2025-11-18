# Routing Configuration - Hướng dẫn Test

## ✅ Đã hoàn thành Chức năng 2

### Components đã tạo:

1. **ProtectedRoute** - `src/components/auth/ProtectedRoute.tsx`
   - Bảo vệ routes yêu cầu authentication
   - Redirect về `/login` nếu chưa đăng nhập
   - Lưu location để quay lại sau khi login

2. **AdminRoute** - `src/components/auth/AdminRoute.tsx`
   - Bảo vệ routes chỉ dành cho Admin
   - Redirect về `/` nếu không phải admin
   - Kiểm tra `userInfo.role === 'admin'`

3. **Page Components**:
   - `RoomListPage` - Danh sách phòng (public)
   - `BookingListPage` - Lịch sử đặt phòng (protected)
   - `DashboardPage` - Dashboard cá nhân (protected)

### Cấu trúc Routes:

#### Public Routes (Không cần đăng nhập):
```
/                  → HomePage
/rooms             → RoomListPage
/about             → About Page
/login             → Login Page (chưa có)
/register          → Register Page (chưa có)
/forgot-password   → Forgot Password Page (chưa có)
/reset-password/:token → Reset Password Page (chưa có)
```

#### Protected Routes (Cần đăng nhập):
```
/dashboard         → DashboardPage (ProtectedRoute)
/bookings          → BookingListPage (ProtectedRoute)
/profile           → Profile Page (ProtectedRoute)
```

#### Admin Routes (Chỉ Admin):
```
/admin             → AdminLayout (AdminRoute)
/admin/dashboard   → Admin Dashboard
/admin/users       → Quản lý người dùng
/admin/rooms       → Quản lý phòng
/admin/bookings    → Quản lý đặt phòng
/admin/payments    → Quản lý thanh toán
/admin/services    → Quản lý dịch vụ
/admin/promotions  → Quản lý khuyến mãi
/admin/banners     → Quản lý banner
/admin/settings    → Cài đặt
```

## 🧪 Cách Test

### 1. Khởi động Dev Server:
```bash
cd /d/hotel-booking/client
npm run dev
```

Mở `http://localhost:5173`

### 2. Test Public Routes:
- Truy cập `/` → Hiển thị HomePage ✅
- Truy cập `/rooms` → Hiển thị RoomListPage ✅
- Truy cập `/about` → Hiển thị About Page ✅

### 3. Test Protected Routes (Chưa login):
- Truy cập `/dashboard` → Redirect về `/login` ✅
- Truy cập `/bookings` → Redirect về `/login` ✅
- Truy cập `/profile` → Redirect về `/login` ✅

### 4. Test Protected Routes (Đã login):
- Click nút **"🔒 Demo Login"** ở góc dưới phải
- Truy cập `/dashboard` → Hiển thị Dashboard ✅
- Truy cập `/bookings` → Hiển thị Booking List ✅
- Truy cập `/profile` → Hiển thị Profile ✅

### 5. Test Admin Routes (Role = Customer):
- Đảm bảo đã login (role = customer)
- Truy cập `/admin` → Redirect về `/` ✅
- Truy cập `/admin/dashboard` → Redirect về `/` ✅

### 6. Test Admin Routes (Role = Admin):
- Click nút **"👑 Switch to Admin"**
- Truy cập `/admin` → Redirect về `/admin/dashboard` ✅
- Truy cập `/admin/users` → Hiển thị User Management ✅
- Truy cập `/admin/rooms` → Hiển thị Room Management ✅
- Click các menu trong SidebarAdmin → Hoạt động bình thường ✅

### 7. Test Logout:
- Click nút **"🔓 Demo Logout"**
- Truy cập `/dashboard` → Redirect về `/login` ✅
- Truy cập `/admin` → Redirect về `/` ✅

## 🎯 Kết quả mong đợi

### ✅ ProtectedRoute:
1. User chưa login không thể truy cập protected routes
2. Redirect về `/login` và lưu `state.from` để quay lại sau
3. User đã login có thể truy cập protected routes bình thường

### ✅ AdminRoute:
1. User không phải admin không thể truy cập `/admin/*`
2. Redirect về `/` nếu không phải admin
3. Admin có thể truy cập tất cả admin routes

### ✅ Không có redirect loop:
1. Redirect chỉ xảy ra 1 lần
2. Không có vòng lặp redirect vô tận
3. Browser history hoạt động đúng (back/forward)

## 📝 Demo Buttons (Tạm thời)

### 🔒 Demo Login/Logout:
- Click để toggle authentication state
- Mô phỏng login/logout
- Sẽ được thay bằng Zustand store ở Chức năng 3

### 👑 Switch Role:
- Chỉ hiển thị khi đã login
- Toggle giữa `customer` ↔ `admin`
- Test AdminRoute hoạt động đúng

## 🚀 Bước tiếp theo

Chức năng 3: useAuthStore (Zustand Store)
- Tạo store quản lý auth state toàn cục
- Thay thế demo state bằng Zustand
- Tích hợp với localStorage
- Xóa demo toggle buttons

## 🔧 File Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.tsx
│   │   ├── AdminRoute.tsx
│   │   └── index.ts
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── SidebarAdmin.tsx
│       ├── LayoutMain.tsx
│       └── index.ts
├── pages/
│   ├── HomePage.tsx
│   ├── AdminLayout.tsx
│   └── customer/
│       ├── RoomListPage.tsx
│       ├── BookingListPage.tsx
│       └── DashboardPage.tsx
└── App.tsx
```
