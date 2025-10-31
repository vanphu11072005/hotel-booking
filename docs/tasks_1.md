# Lộ trình phát triển hệ thống Hotel Booking Online (10 ngày)

## Day 1 – Authentication

### Mục tiêu
    Chuẩn bị nền tảng frontend, cấu trúc React, và hoàn thiện chức năng đăng nhập/đăng ký.

#### Nhiệm vụ chi tiết
1. Tạo layout chung:
    - Header, Footer, Navbar, SidebarAdmin

2. Cấu hình routing với react-router-dom
    - Các route chính:
        ```
        /               -> Trang chủ
        /login          -> Đăng nhập
        /register       -> Đăng ký
        /dashboard      -> Bảng điều khiển (user/staff/admin)
        /rooms          -> Danh sách phòng
        /bookings       -> Danh sách đặt phòng
        /admin/*        -> Module quản trị
        ```

3. Tạo store useAuthStore (Zustand):
    - Lưu trữ: token, userInfo, isAuthenticated
    - Có hàm: login, logout, setUser

4. Xây dựng form Login & Register
    - Sử dụng React Hook Form + Yup để validate
    - Gọi API:
        ```
        POST /api/auth/login
        POST /api/auth/register
        ```
    - Lưu token vào localStorage
    - Redirect về /dashboard sau khi đăng nhập thành công

5. Tạo PrivateRoute / ProtectedRoute
    - Kiểm tra role (admin/staff/customer)
    - Chặn truy cập trái phép

### Kết quả mong đợi
    1. Người dùng có thể đăng ký và đăng nhập thành công
    2. Token lưu trong store và localStorage
    3. Hệ thống phân quyền truy cập theo role
    4. Giao diện cơ bản (Header/Footer/Navbar) hoạt động ổn định

---

## Day 2 – Trang chủ & Tìm phòng

### Mục tiêu
    Xây dựng giao diện hiển thị phòng và chức năng tìm phòng trống.

#### Nhiệm vụ chi tiết
1. Tạo HomePage
    - Hiển thị banner quảng cáo (GET /api/banners?position=home)
    - Hiển thị danh sách phòng nổi bật (GET /api/rooms)

2. Tạo RoomListPage
    - Danh sách tất cả phòng
    - Bộ lọc:
        ```
        Loại phòng (VIP, Deluxe, Suite, …)
        Giá (min–max)
        Số người
        ```
    - Gọi API: GET /api/rooms

3. Tạo RoomDetailPage
    - Hiển thị:
       + Mô tả chi tiết, hình ảnh, giá, tiện ích
    - Nút “Đặt ngay” → điều hướng đến form booking

4. Chức năng tìm phòng trống
    - Tạo form tìm kiếm (date range, loại phòng)
    - Gọi API:
        ```
        GET /api/rooms/available?from=&to=&type=
        ```
    - Hiển thị danh sách phòng có sẵn

5. Tạo các component hỗ trợ:
    - DatePicker (chọn ngày đến/đi)
    - RoomCard (hiển thị thông tin phòng)

6. Tối ưu trải nghiệm người dùng
    - Loading state / No results message
    - Responsive UI (Tailwind)

### Kết quả mong đợi
    - Người dùng xem danh sách phòng, lọc, và xem chi tiết được
    - Hệ thống hiển thị đúng phòng còn trống theo ngày
    - Giao diện Home, RoomList, RoomDetail hoàn chỉnh