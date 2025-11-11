# Layout Components - Hướng dẫn sử dụng

## Cấu trúc Layout đã được tối ưu

### Components chính:

#### 1. **Header** (đã tích hợp Navigation + Auth)
- Hiển thị Logo
- Navigation links (Trang chủ, Phòng, Đặt phòng, Giới thiệu)
- Auth section:
  - Nếu chưa đăng nhập: Nút "Đăng nhập" / "Đăng ký"
  - Nếu đã đăng nhập: Avatar + Tên user + Dropdown menu
- Responsive với mobile hamburger menu
- Sticky position (luôn hiển thị ở top)

**Props:**
```typescript
interface HeaderProps {
  isAuthenticated?: boolean;
  userInfo?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  } | null;
  onLogout?: () => void;
}
```

#### 2. **Navbar** (Component độc lập - không dùng trong LayoutMain)
- Component độc lập cho navigation
- Có thể sử dụng riêng nếu cần layout khác
- Tương tự Header nhưng không có Logo

#### 3. **Footer**
- 4 sections: Company Info, Quick Links, Support, Contact
- Social media icons
- Copyright footer
- Responsive design

#### 4. **SidebarAdmin**
- Sidebar cho admin panel
- Chỉ hiển thị với role = "admin"
- Collapsible (thu gọn/mở rộng)
- 10 menu items: Dashboard, Users, Rooms, Bookings, 
  Payments, Services, Promotions, Banners, Reports, Settings

#### 5. **LayoutMain**
- Layout wrapper cho public pages
- Tích hợp: Header + Main Content (Outlet) + Footer
- Không còn trùng lặp navigation

**Props:**
```typescript
interface LayoutMainProps {
  isAuthenticated?: boolean;
  userInfo?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  } | null;
  onLogout?: () => void;
}
```

## Cách sử dụng trong App.tsx

```tsx
import LayoutMain from './components/layout/LayoutMain';

function App() {
  const [isAuthenticated, setIsAuthenticated] = 
    useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const handleLogout = () => {
    // Xử lý logout logic
    setIsAuthenticated(false);
    setUserInfo(null);
  };

  return (
    <BrowserRouter>
      <Routes>
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
          <Route path="rooms" element={<RoomsPage />} />
          {/* ... other routes */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

## Thay đổi so với phiên bản cũ

### ❌ Trước (Trùng lặp):
```
Header (Logo + Nav Links)
↓
Navbar (Nav Links + Auth) ← TRÙNG LẶP
↓
Content
↓
Footer
```

### ✅ Sau (Tối ưu):
```
Header (Logo + Nav Links + Auth) ← GỘP THÀNH 1
↓
Content
↓
Footer
```

## Lưu ý:
- Header giờ đã tích hợp đầy đủ navigation và auth
- Navbar vẫn tồn tại như một component độc lập (có thể 
  dùng riêng nếu cần)
- LayoutMain chỉ dùng Header (không dùng Navbar nữa)
- Không còn hiển thị navigation trùng lặp
- Mobile responsive hoạt động hoàn hảo
