# Authentication

## Chức năng 1: Layout cơ bản (Header, Footer, Navbar, SidebarAdmin)

### Mục tiêu
    Tạo layout nền tảng cho toàn bộ hệ thống và cấu trúc render nội dung theo route.

#### Nhiệm vụ chi tiết
- Tạo thư mục:
    ```
    src/components/layouts/
    ```
- Bao gồm:
    + Header.jsx
    + Footer.jsx
    + Navbar.jsx
    + SidebarAdmin.jsx
    + LayoutMain.jsx
- Dùng <Outlet /> trong LayoutMain để render nội dung động.
- Navbar thay đổi tùy trạng thái đăng nhập:
    + Nếu chưa login → hiển thị nút “Đăng nhập / Đăng ký”.
    + Nếu đã login → hiển thị avatar, tên user và nút “Đăng xuất”.
- SidebarAdmin chỉ hiển thị với role = admin.

### Kết quả mong đợi
1. Layout tổng thể hiển thị ổn định.
2. Navbar hiển thị nội dung động theo trạng thái người dùng.
3. Giao diện responsive, tương thích desktop/mobile.

---

## Chức năng 2: Cấu hình Routing (react-router-dom)

### Mục tiêu
    Thiết lập hệ thống định tuyến chuẩn, có bảo vệ route theo role.

#### Nhiệm vụ chi tiết
- Cấu trúc route chính:
    ```
    <Route path="/" element={<LayoutMain />}>
        <Route index element={<HomePage />} />
        <Route path="rooms" element={<RoomListPage />} />
        <Route path="bookings" element={<BookingListPage />} />
    </Route>

    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/admin/*" element={<AdminRoute><AdminModule /></AdminRoute>} />
    ```
- Dùng ProtectedRoute và AdminRoute để kiểm tra:
    + isAuthenticated
    + role === "admin"

### Kết quả mong đợi
1. Người dùng không đăng nhập bị redirect về /login.
2. AdminRoute chỉ cho phép admin truy cập.
3. Tất cả route hoạt động mượt, không lỗi vòng lặp redirect.

---

## Chức năng 3: useAuthStore (Zustand Store)

### Mục tiêu
    Quản lý trạng thái xác thực toàn cục (token, userInfo, role).

#### Nhiệm vụ chi tiết
- Tạo src/stores/useAuthStore.js
- Cấu trúc:
    ```
    const useAuthStore = create((set) => ({
        token: localStorage.getItem("token") || null,
        userInfo: JSON.parse(localStorage.getItem("userInfo")) || null,
        isAuthenticated: !!localStorage.getItem("token"),

        login: async (credentials) => { ... },
        logout: () => { ... },
        setUser: (user) => { ... },
        resetPassword: async (payload) => { ... },
    }));
    ```
- Khi đăng nhập thành công:
    + Lưu token + userInfo vào localStorage.
- Khi logout:
    + Xóa localStorage và reset state.

### Kết quả mong đợi
1. Toàn bộ thông tin user được quản lý tập trung.
2. Duy trì đăng nhập sau khi reload trang.
3. Dễ dàng truy cập userInfo trong mọi component.

--- 

## Chức năng 4: Form Login

### Mục tiêu
    Cho phép người dùng đăng nhập hệ thống.

#### Nhiệm vụ chi tiết
- Tạo LoginPage.jsx
- Dùng React Hook Form + Yup validate:
    + Email hợp lệ
    + Mật khẩu ≥ 8 ký tự
- API:
    ```
    POST /api/auth/login
    ```
- Sau khi đăng nhập thành công:
    + Lưu token vào localStorage.
    + Gọi setUser() để cập nhật Zustand.
    + Redirect về /dashboard.
    + Gửi email POST /api/notify/login-success.
- UX nâng cao:
    + Nút loading khi đang gửi form.
    + “Hiện/Ẩn mật khẩu”.
    + “Nhớ đăng nhập” → lưu 7 ngày.

### Kết quả mong đợi
1. Đăng nhập hoạt động mượt, hiển thị thông báo lỗi rõ ràng.
2. Email được gửi khi login thành công.
3. Chuyển hướng đúng theo vai trò user.

---

## Chức năng 5: Form Register

### Mục tiêu
    Cho phép người dùng đăng ký tài khoản mới.

#### Nhiệm vụ chi tiết
- Tạo RegisterPage.jsx
- Dùng React Hook Form + Yup validate:
    + Họ tên không rỗng
    + Email hợp lệ
    + Mật khẩu ≥ 8 ký tự, có ký tự đặc biệt
- API:
    ```
    POST /api/auth/register
    ```
- Sau khi đăng ký thành công:
    + Hiển thị toast “Đăng ký thành công, vui lòng đăng nhập”.
    + Redirect về /login.

### Kết quả mong đợi
1. Người dùng tạo tài khoản mới thành công.
2. Validate chặt chẽ, UX mượt mà.
3. Giao diện thống nhất với form login.

---

## Chức năng 6: Quên mật khẩu (Forgot Password)

### Mục tiêu
    Cung cấp chức năng gửi email reset mật khẩu.

#### Nhiệm vụ chi tiết
- Tạo ForgotPasswordPage.jsx
- API:
    ```
    POST /api/auth/forgot-password
    ```
- Sau khi gửi thành công:
    + Hiển thị thông báo “Vui lòng kiểm tra email để đặt lại mật khẩu.”
    + Backend gửi link reset có token dạng:
        ```
        https://domain.com/reset-password/:token
        ```

### Kết quả mong đợi
1. Gửi email thành công.
2. UX rõ ràng, có loading và thông báo lỗi.
3. Giao diện thân thiện.

---

## Chức năng 7: Đặt lại mật khẩu (Reset Password)

### Mục tiêu
    Cho phép người dùng đổi mật khẩu thông qua link email.

#### Nhiệm vụ chi tiết
- Tạo ResetPasswordPage.jsx
- Validate:
    + Mật khẩu mới ≥ 8 ký tự, chứa ký tự đặc biệt
    + Nhập lại mật khẩu trùng khớp
- API:
    ```
    POST /api/auth/reset-password
    ```
- Sau khi đổi mật khẩu thành công:
    + Gửi email xác nhận POST /api/notify/reset-success.
    + Redirect về /login.

### Kết quả mong đợi
1. Mật khẩu được cập nhật thành công.
2. Gửi email thông báo thành công.
3. Bảo vệ token hết hạn (invalid token → redirect về forgot-password).

--- 

## Chức năng 8: Phân quyền & Bảo vệ route (ProtectedRoute / AdminRoute)

### Mục tiêu
    Chặn truy cập trái phép và bảo vệ các route quan trọng.

#### Nhiệm vụ chi tiết
- Tạo component ProtectedRoute.jsx:
    ```
    const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuthStore();
    const location = useLocation();
    return isAuthenticated ? children : <Navigate to="/login" state={{ from: location }} replace />;
    };
    ```

- Tạo AdminRoute.jsx:
    ```
    const AdminRoute = ({ children }) => {
    const { userInfo } = useAuthStore();
    return userInfo?.role === "admin" ? children : <Navigate to="/" replace />;
    };
    ```
### Kết quả mong đợi
1. Chỉ người dùng hợp lệ mới truy cập được route quan trọng.
2. AdminRoute đảm bảo bảo mật cho module quản trị.
