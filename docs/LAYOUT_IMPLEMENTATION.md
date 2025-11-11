# Layout Components - Chức năng 1

## Tổng quan
Đã triển khai thành công **Chức năng 1: Layout cơ bản** bao gồm:

### Components đã tạo

#### 1. **Header** (`src/components/layout/Header.tsx`)
- Logo và tên ứng dụng
- Sticky header với shadow
- Responsive design
- Links cơ bản (Trang chủ, Phòng, Đặt phòng)

#### 2. **Footer** (`src/components/layout/Footer.tsx`)
- Thông tin công ty
- Quick links (Liên kết nhanh)
- Support links (Hỗ trợ)
- Contact info (Thông tin liên hệ)
- Social media icons
- Copyright info
- Fully responsive (4 columns → 2 → 1)

#### 3. **Navbar** (`src/components/layout/Navbar.tsx`)
- **Trạng thái chưa đăng nhập**: 
  - Hiển thị nút "Đăng nhập" và "Đăng ký"
- **Trạng thái đã đăng nhập**: 
  - Hiển thị avatar/tên user
  - Dropdown menu với "Hồ sơ", "Quản trị" (admin), "Đăng xuất"
- Mobile menu với hamburger icon
- Responsive cho desktop và mobile

#### 4. **SidebarAdmin** (`src/components/layout/SidebarAdmin.tsx`)
- Chỉ hiển thị cho role = "admin"
- Collapsible sidebar (mở/đóng)
- Menu items: Dashboard, Users, Rooms, Bookings, Payments, Services, Promotions, Banners, Reports, Settings
- Active state highlighting
- Responsive design

#### 5. **LayoutMain** (`src/components/layout/LayoutMain.tsx`)
- Tích hợp Header, Navbar, Footer
- Sử dụng `<Outlet />` để render nội dung động
- Props: `isAuthenticated`, `userInfo`, `onLogout`
- Min-height 100vh với flex layout

### Cấu trúc thư mục
```
src/
├── components/
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── Navbar.tsx
│       ├── SidebarAdmin.tsx
│       ├── LayoutMain.tsx
│       └── index.ts
├── pages/
│   ├── HomePage.tsx
│   └── AdminLayout.tsx
├── styles/
│   └── index.css
├── App.tsx
└── main.tsx
```

### Cách sử dụng

#### 1. Import Layout vào App
```tsx
import LayoutMain from './components/layout/LayoutMain';

// Trong Routes
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
  {/* Các route con khác */}
</Route>
```

#### 2. Sử dụng SidebarAdmin cho trang Admin
```tsx
import SidebarAdmin from '../components/layout/SidebarAdmin';

const AdminLayout = () => (
  <div className="flex h-screen">
    <SidebarAdmin />
    <div className="flex-1 overflow-auto">
      <Outlet />
    </div>
  </div>
);
```

### Tính năng đã hoàn thành ✅

- [x] Tạo thư mục `src/components/layout/`
- [x] Header.tsx với logo và navigation
- [x] Footer.tsx với thông tin đầy đủ
- [x] Navbar.tsx với logic đăng nhập/đăng xuất động
- [x] SidebarAdmin.tsx chỉ hiển thị với role admin
- [x] LayoutMain.tsx sử dụng `<Outlet />`
- [x] Navbar thay đổi theo trạng thái đăng nhập
- [x] Giao diện responsive, tương thích desktop/mobile
- [x] Tích hợp TailwindCSS cho styling
- [x] Export tất cả components qua index.ts

### Demo Routes đã tạo

**Public Routes** (với LayoutMain):
- `/` - Trang chủ
- `/rooms` - Danh sách phòng
- `/bookings` - Đặt phòng
- `/about` - Giới thiệu

**Auth Routes** (không có layout):
- `/login` - Đăng nhập
- `/register` - Đăng ký
- `/forgot-password` - Quên mật khẩu

**Admin Routes** (với SidebarAdmin):
- `/admin/dashboard` - Dashboard
- `/admin/users` - Quản lý người dùng
- `/admin/rooms` - Quản lý phòng
- `/admin/bookings` - Quản lý đặt phòng
- `/admin/payments` - Quản lý thanh toán
- `/admin/services` - Quản lý dịch vụ
- `/admin/promotions` - Quản lý khuyến mãi
- `/admin/banners` - Quản lý banner

### Chạy ứng dụng

```bash
# Di chuyển vào thư mục client
cd client

# Cài đặt dependencies (nếu chưa cài)
npm install

# Chạy development server
npm run dev

# Mở trình duyệt tại: http://localhost:5173
```

### Các bước tiếp theo

**Chức năng 2**: Cấu hình Routing (react-router-dom)
- ProtectedRoute component
- AdminRoute component
- Redirect logic

**Chức năng 3**: useAuthStore (Zustand Store)
- Quản lý authentication state
- Login/Logout functions
- Persist state trong localStorage

**Chức năng 4-8**: Auth Forms
- LoginPage
- RegisterPage
- ForgotPasswordPage
- ResetPasswordPage

### Notes
- Layout components được thiết kế để tái sử dụng
- Props-based design cho flexibility
- Sẵn sàng tích hợp với Zustand store
- Tailwind classes tuân thủ 80 ký tự/dòng
- Icons sử dụng lucide-react (đã có trong dependencies)
