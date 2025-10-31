## Day 3 – Đặt phòng & Thanh toán

### Mục tiêu:
    Xây dựng tính năng đặt phòng, quản lý giỏ đặt phòng, và thanh toán cơ bản.

#### Nhiệm vụ chi tiết
1. Tạo trang BookingPage:
    - Khi người dùng chọn “Đặt ngay”, hiển thị form nhập:
        + Họ tên, Số điện thoại, Ngày đến – Ngày đi, Ghi chú.
    - Tính tổng tiền = giá phòng × số ngày.

2. Tạo API booking:
    - POST /api/bookings → gửi thông tin đặt phòng + userId + roomId.
    - Nếu thành công → chuyển đến trang BookingSuccess.

3. Tạo trang MyBookingsPage:
    - GET /api/bookings/me → hiển thị danh sách đơn đặt của user.
    - Cho phép hủy đặt phòng (PATCH /api/bookings/:id/cancel).

4. Tích hợp thanh toán (giả lập):
    - Chọn phương thức: “Thanh toán tại chỗ” hoặc “Chuyển khoản”.
    - Nếu chọn chuyển khoản → hiển thị mã QR hoặc thông tin ngân hàng.

### Kết quả mong đợi
    - Người dùng có thể đặt phòng thành công.
    - Có thể xem và hủy đặt phòng.
    - Giao diện tính toán tổng tiền chính xác.

## Day 4 – Trang quản trị (Admin Dashboard)

### Mục tiêu:
    Tạo giao diện quản trị cơ bản để quản lý phòng, người dùng, và đơn đặt.

#### Nhiệm vụ chi tiết
1. Tạo layout riêng cho Admin:
    - Sử dụng SidebarAdmin và HeaderAdmin.
    - Route: /admin/*

2. Tạo các trang quản trị:
    ```
    /admin/rooms → Danh sách phòng, thêm/sửa/xóa (CRUD).
    /admin/bookings → Duyệt, hủy hoặc xem chi tiết đơn đặt.
    /admin/users → Danh sách người dùng, phân quyền (user/admin).
    ```

3. Tạo store useDashboardStore (Zustand):
    - Lưu trữ thống kê tổng số phòng, người dùng, đơn đặt.

4. Tạo trang Dashboard chính:
    - Hiển thị biểu đồ (tổng quan doanh thu, số đơn, phòng đang trống, phòng đã đặt).
    - Dùng thư viện recharts hoặc chart.js.

### Kết quả mong đợi
    - Dashboard admin hoạt động.
    - CRUD phòng, người dùng, booking thành công.
    - Phân quyền route: chỉ admin được truy cập /admin/*.