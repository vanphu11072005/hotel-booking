# Booking & Payment

## Chức năng 1: BookingPage – Form Đặt phòng

### Mục tiêu
    Xây dựng form đặt phòng đầy đủ thông tin, xác thực dữ liệu, tính tổng tiền theo số ngày, và gửi yêu cầu đặt.

#### Nhiệm vụ chi tiết
1. Route:
    ```
    /booking/:roomId
    ```
2. Khi user click “Đặt ngay” ở RoomDetailPage → chuyển sang BookingPage.
3. Hiển thị:
    - Ảnh phòng, tên phòng, giá/đêm
    - Thông tin người dùng (tự động điền nếu đã login)
    - Form:
        + Ngày check-in / check-out (DateRangePicker)
        + Số người
        + Ghi chú
        + Phương thức thanh toán:
            1. Thanh toán tại chỗ
            2. Chuyển khoản (hiển thị QR + hướng dẫn)
4. Validate bằng Yup + React Hook Form:
    - Check-in < Check-out
    - Không bỏ trống ngày
    - Có chọn phương thức thanh toán
5. Tính tổng tiền:
    ```
    total = room.price * (số ngày ở)
    ```
6. Nút “Đặt phòng”:
    - Loading spinner
    - Disable khi đang submit

7. Nếu chưa đăng nhập → redirect /login.

---

## Chức năng 2: Booking API (Giao tiếp backend)

### Mục tiêu
    Kết nối và xử lý API liên quan đến đặt phòng.

#### Nhiệm vụ chi tiết
🔧 Endpoints:
    ```
    POST /api/bookings               → Tạo booking
    GET /api/bookings/me             → Lấy danh sách booking của user
    PATCH /api/bookings/:id/cancel   → Hủy booking
    GET /api/bookings/:id            → Chi tiết booking
    GET /api/bookings/check/:bookingNumber → Tra cứu booking
    ```
🔄 Luồng xử lý:
1. Frontend gọi POST /api/bookings
2. Backend kiểm tra phòng trống:
    ```
    GET /api/rooms/available?roomId=...&from=...&to=...
    ```
3. Nếu trống → tạo booking
    - Nếu trùng lịch → trả 409 “Phòng đã được đặt trong thời gian này”
4. Gửi email xác nhận booking (nếu cần)
5. Trả về dữ liệu booking để hiển thị /booking-success/:id.

---

## Chức năng 3: BookingSuccess – Trang kết quả sau đặt phòng

### Mục tiêu
    Hiển thị kết quả đặt phòng thành công và các hành động tiếp theo.

#### Nhiệm vụ chi tiết
1. Route: /booking-success/:id
2. Gọi GET /api/bookings/:id → hiển thị chi tiết
3. Nút:
    - “Xem đơn của tôi” → /my-bookings
    - “Về trang chủ” → /
4. Nếu phương thức là Chuyển khoản:
    + Hiển thị QR code ngân hàng
    + Cho phép upload ảnh xác nhận
    + Gọi POST /api/notify/payment khi người dùng xác nhận đã chuyển khoản.

--- 

## Chức năng 4: MyBookingsPage – Danh sách đơn đặt của người

### Mục tiêu
    Hiển thị toàn bộ các đơn đặt của user + cho phép hủy đơn.

#### Nhiệm vụ chi tiết
1. Route: /my-bookings
2. API: GET /api/bookings/me
3. Hiển thị danh sách booking:
    - Phòng, ngày nhận/trả, tổng tiền
    - Trạng thái:
        🟡 pending
        🟢 confirmed
        🔴 cancelled
4. Nút “Hủy đặt phòng”:
    1. window.confirm("Bạn có chắc muốn hủy không?")
    2. Gọi PATCH /api/bookings/:id/cancel (hoặc DELETE /api/bookings/:id tùy implement)
    3. Logic hủy:
        - Giữ 20% giá trị đơn
        - Hoàn 80% còn lại cho user
        - Cập nhật trạng thái phòng về available
    4. Hiển thị toast “Đơn đã được hủy thành công”
5. Cho phép xem chi tiết booking:
    - Route: /bookings/:id
    - Gọi GET /api/bookings/:id
    - Hiển thị chi tiết phòng, thông tin user, tổng tiền, status.

---

## Chức năng 5: Thanh toán (Giả lập Payment)

### Mục tiêu
    Cho phép người dùng chọn phương thức thanh toán và xác nhận thanh toán.

#### Nhiệm vụ chi tiết
- Phương thức:
    1. Thanh toán tại chỗ
        - Booking được tạo với status = "pending"
    2. Chuyển khoản
        - Hiển thị mã QR ngân hàng (tĩnh hoặc từ API)
        - Upload ảnh biên lai (image upload)
        - Sau khi upload → gọi POST /api/notify/payment gửi email xác nhận
        - Cập nhật status = "confirmed"

---

## Chức năng 6: UX & Hiệu năng

### Mục tiêu
    Cải thiện trải nghiệm người dùng và tính trực quan.

#### Nhiệm vụ chi tiết
1. Toasts (react-hot-toast hoặc sonner)
2. Loading spinner rõ ràng
3. DateRangePicker cho chọn ngày
4. Form được validate đầy đủ (và báo lỗi chi tiết)
5. Focus input đầu tiên
6. Tự động redirect khi đặt thành công / hủy đơn

---