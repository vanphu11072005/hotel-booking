# Lộ trình phát triển hệ thống Hotel Booking Online (10 ngày)

## Day 1 – Authentication

### Mục tiêu
    Hoàn thiện chức năng xác thực người dùng (Authentication) toàn diện: đăng nhập, đăng ký, quên mật khẩu, đặt lại mật khẩu, và bảo mật phiên làm việc.

#### Nhiệm vụ chi tiết
1. Tạo layout chung:
    - Header, Footer, Navbar, SidebarAdmin tách riêng trong thư mục:
        ```
        src/components/layouts/
        ```
    - Thêm <Outlet /> trong LayoutMain để render nội dung theo route.
    - Navbar thay đổi động theo trạng thái đăng nhập:
        + Nếu chưa đăng nhập: hiển thị "Đăng nhập/Đăng ký"
        + Nếu đã đăn nhập hiển thị tên người dùng, avatar và nút "Đăng xuất"

2. Cấu hình routing với react-router-dom
    - Tạo cấu trúc route dạng lồng:
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

3. Tạo store useAuthStore (Zustand):
    - Lưu trữ: token, userInfo, isAuthenticated
    - Các hàm chính: login(), logout(), setUser(), resetPassword()
    ✅ Token được lưu trong localStorage để duy trì trạng thái đăng nhập.

4. Xây dựng form Login & Register
    - Sử dụng React Hook Form + Yup để validate
        + Email hợp lệ
        + Mật khẩu >= 8 ký tự, có ít nhất 1 chữ hoa và 1 ký tự đặc biệt
    - Gọi API:
        ```
        POST /api/auth/login
        POST /api/auth/register
        POST /api/auth/forgot-password
        POST /api/auth/reset-password
        ```
    - Sau khi đăng nhập thành công:
        + Lưu token vào localStorage
        + Redirect về /dashboard
        + Hiển thị loading trong nút
        + Thông báo lỗi từ server (toasts)

    - UX cải thiện:
        + Focus tự động vào input đầu tiên
        + Hiển thị lỗi cụ thể từng trường
        + Cho phép "Hiện/Ẩn mật khẩu"
        + Nút "Nhớ đăng nhập" -> lưu token lâu hơn (7 ngày)

5. Gửi Email Tự động (Notification Email)
    |           Tình huống            |                API               |                                   Mô tả                                | 
    | ------------------------------- | -------------------------------- | ---------------------------------------------------------------------- | 
    | **Đăng nhập thành công**        | `POST /api/notify/login-success` | Gửi email thông báo đăng nhập thành công (kèm thời gian & địa chỉ IP). |
    | **Quên mật khẩu**               | `POST /api/auth/forgot-password` | Gửi email chứa link đặt lại mật khẩu.                                  |
    | **Đặt lại mật khẩu thành công** | `POST /api/notify/reset-success` | Gửi email xác nhận mật khẩu mới đã được cập nhật.                      |

6. Tạo PrivateRoute / ProtectedRoute
    - Kiểm tra quyền truy cập dựa trên:
        + isAuthenticated
        + role (admin / staff / customer)
    - Chặn truy cập trái phép vào các route /admin, /dashboard.

### Kết quả mong đợi
1. Người dùng hoàn tất được toàn bộ luồng: đăng ký → xác thực email (tùy chọn) → đăng nhập → quên/đặt lại mật khẩu.
2. Token và thông tin người dùng được lưu trong Zustand + localStorage.
3. Phân quyền hiển thị và điều hướng đúng theo role.
4. Hệ thống gửi email ở 3 tình huống:
    - Khi đăng nhập thành công
    - Khi người dùng quên mật khẩu
    - Khi đặt lại mật khẩu thành công
5. Giao diện cơ bản (Header, Footer, Navbar) hoạt động ổn định.
6. Hệ thống an toàn, có khả năng mở rộng qua middleware hoặc API guard.

---

## Day 2 – Trang chủ & Tìm phòng

### Mục tiêu
    - Hoàn thiện luồng trải nghiệm khách hàng trên trang chủ:
        + Khám phá phòng, xem chi tiết, lọc, tìm phòng trống.
        + Đánh giá & yêu thích phòng.
        + Giao diện đẹp, tương tác mượt, responsive hoàn chỉnh.

#### Nhiệm vụ chi tiết
1. Tạo HomePage
    - Banner động (carousel hoặc ảnh tĩnh)
        ```
        GET /api/banners?position=home
        ```
    - Hiển thị các “phòng nổi bật” (featured=true)
        ```
        GET /api/rooms?featured=true
        ```
        - Dùng component RoomCard
        - Giới hạn hiển thị 4–6 phòng
    - UX:
        + Loading skeleton trong khi fetch data
        + Khi không có banner → hiển thị ảnh mặc định
        + Nút “Xem tất cả phòng” → chuyển đến /rooms

2. Tạo RoomListPage
    - Bộ lọc (RoomFilter)
        ```
        Loại phòng (VIP, Deluxe, Suite, …)
        Giá (min–max)
        Số người
        ```
    - khi submit -> gọi API:
        ```
        GET /api/rooms?type=&minPrice=&maxPrice=&capacity=&page=
        ```
    - Reset filter dễ dàng
    - Lưu lại filter vào URL query
    - Nếu danh sách dài -> thêm Pagination component

3. Tạo RoomDetailPage
    - Các phần chính:
        1. Thông tin phòng: ảnh, mô tả, giá, tiện ích (RoomAmenities)
        2. Gallery ảnh: nhiều ảnh dạng carousel (RoomGallery)
        3. Nút “Đặt ngay”:
            - Khi bấm → điều hướng /bookings/new?roomId=...
        4. Khu vực đánh giá (Reviews):
            - Hiển thị danh sách review đã duyệt
                ```
                GET /api/rooms/:id/reviews
                ```
            - Người dùng đã từng đặt phòng → có thể viết review
                ```
                POST /api/reviews
                ```
            - RatingStars để nhập điểm số
            - ReviewStore lưu tạm review trước khi gửi
        Tối ưu UX Review:
            - Nếu chưa đăng nhập → hiển thị thông báo “Vui lòng đăng nhập để đánh giá”
            - Loading skeleton khi chờ tải review
            - Hiển thị trung bình số sao (averageRating)

4. Chức năng tìm phòng trống
    - Form tìm kiếm (ở HomePage hoặc RoomListPage):
        + Input: ngày đến, ngày đi, loại phòng
        + API:
            ```
            GET /api/rooms/available?from=&to=&type=
            ```
        + Khi có kết quả → hiển thị bằng RoomCard
        + Nếu không có kết quả → “Không tìm thấy phòng phù hợp”
        + Dùng DatePicker đẹp (vd: react-day-picker hoặc react-datepicker)
        + Validate:
            from < to
            from không nhỏ hơn hôm nay
        + Loading state khi đang tìm

5. Tính năng Yêu thích phòng (Wishlist)
    - Cho phép người dùng đánh dấu hoặc bỏ đánh dấu phòng yêu thích.
    - API:
        ```
        POST /api/favorites/:roomId   -> Thêm vào danh sách yêu thích
        DELETE /api/favorites/:roomId -> Xóa khỏi danh sách yêu thích
        GET /api/favorites            -> Lấy danh sách phòng yêu thích
        ```
    - UI:
        + FavoriteButton (icon ❤️)
            Nếu phòng đã yêu thích → tô đỏ
            Nếu chưa → viền xám
            Tooltip: “Thêm vào yêu thích” / “Bỏ yêu thích”
        + Nếu người dùng chưa đăng nhập:
            Lưu tạm trong localStorage (guestFavorites)
            Khi đăng nhập → đồng bộ với server.

6. Tối ưu UI/UX & Performance
    - Loading skeletons: khi fetch phòng hoặc review.
    - Infinite scroll (tuỳ chọn): thay cho pagination.
    - Debounce khi lọc giá để tránh gọi API liên tục.
    - Responsive hoàn chỉnh: 2 cột (tablet), 1 cột (mobile).
    - Empty states:
        Không có phòng → ảnh minh họa + dòng chữ thân thiện.
        Không có review → “Hãy là người đầu tiên đánh giá!”
    - Toasts: thông báo thêm/bỏ yêu thích, gửi đánh giá thành công.

### Kết quả mong đợi
1. Trang chủ hiển thị đầy đủ banner + phòng nổi bật.
2. Người dùng có thể:
    + Tìm, lọc và xem chi tiết phòng.
    + Tìm được danh sách phòng trống theo ngày.
    + Viết và xem đánh giá (có kiểm duyệt).
    + Đánh dấu yêu thích và xem lại sau.
4. UI/UX thân thiện, hiện đại, responsive hoàn toàn.
5. Dữ liệu phòng, yêu thích, review đều đồng bộ với backend.
6. Hệ thống sẵn sàng mở rộng sang Day 3 – Booking Flow.