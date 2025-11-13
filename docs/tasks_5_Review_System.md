# Review System

## Chức năng 1: ReviewPage – Trang người dùng đánh giá phòng

### Mục tiêu
    Cho phép người dùng viết đánh giá cho những phòng họ đã đặt thành công.

#### Nhiệm vụ chi tiết
1. Route: /reviews
2. Gọi API:
    ```
    GET /api/bookings/me → Lấy danh sách phòng người dùng đã đặt.
    POST /api/reviews → Gửi đánh giá.
    ```
3. Giao diện:
    - Hiển thị danh sách phòng đã đặt (tên, ngày ở, trạng thái)
    - Nút “Đánh giá” (hiện nếu chưa đánh giá phòng đó)
4. Khi nhấn “Đánh giá” → mở Modal:
    - Input chọn số sao (⭐ 1–5)
    - Textarea nhập nội dung bình luận
    - Nút “Gửi đánh giá”
5. Validate:
    - Rating bắt buộc (1–5)
    - Comment không để trống
6. Sau khi gửi thành công → toast thông báo “Đánh giá của bạn đang chờ duyệt”.

### Kết quả mong đợi
1. Người dùng chỉ thấy nút “Đánh giá” với phòng đã từng đặt.
2. Modal mở ra và validate chính xác.
3. Gửi thành công → review có trạng thái "pending".
4. Toast hiển thị thông báo hợp lý.
5. Giao diện gọn, trực quan, không lỗi khi chưa có phòng nào đặt.

---

## Chức năng 2: RoomDetailPage – Hiển thị danh sách đánh giá

### Mục tiêu
    Hiển thị danh sách các đánh giá đã được admin duyệt cho từng phòng.

#### Nhiệm vụ chi tiết
1. Route: /rooms/:id
2. API:
    ```
    GET /api/reviews?roomId={id}&status=approved
    ```
3. Hiển thị danh sách review:
    - Avatar + tên người dùng
    - Số sao (⭐)
    - Nội dung bình luận
    - Ngày đăng (createdAt)
4. Tính và hiển thị điểm trung bình rating (VD: ⭐ 4.2 / 5)
5. Nếu chưa có review → hiển thị: “Chưa có đánh giá nào.”

### Kết quả mong đợi
1. Danh sách review hiển thị đúng theo phòng.
2. Chỉ review có status = approved được render.
3. Tính điểm trung bình chính xác (làm tròn 1 chữ số thập phân).
4. Hiển thị avatar, tên, sao, và ngày đầy đủ.
5. Có thông báo “Chưa có đánh giá” khi danh sách trống.

---

## Chức năng 3: AdminReviewPage – Trang quản trị đánh giá

### Mục tiêu
    Cho phép Admin xem, duyệt hoặc từ chối các đánh giá người dùng gửi lên.

#### Nhiệm vụ chi tiết
1. Route: /admin/reviews
2. API:
    ```
    GET /api/reviews
    PATCH /api/reviews/:id/approve
    PATCH /api/reviews/:id/reject
    ```
3. Hành động:
    ✅ Duyệt → review chuyển sang approved
    ❌ Từ chối → review chuyển sang rejected
4. Sau khi duyệt → cập nhật giao diện và hiển thị toast thông báo.
5. Có filter theo trạng thái (pending, approved, rejected).

### Kết quả mong đợi
1. Admin thấy đầy đủ danh sách review.
2. Duyệt hoặc từ chối hoạt động đúng API.
3. Bảng tự cập nhật khi thay đổi trạng thái.
4. Toast hiển thị rõ “Đã duyệt” hoặc “Đã từ chối”.
5. Chỉ review approved mới hiển thị công khai cho người dùng.

--- 

## Chức năng 4: Bảo mật & Logic hiển thị

### Mục tiêu
    Đảm bảo chỉ người hợp lệ mới có thể gửi đánh giá và hệ thống hiển thị đúng dữ liệu.

#### Nhiệm vụ chi tiết
1. Kiểm tra quyền:
    - Người dùng chưa đăng nhập → redirect /login
    - Người dùng chưa từng đặt phòng → không hiển thị nút “Đánh giá”
2. Kiểm tra logic:
    - Mỗi người chỉ được đánh giá 1 lần / phòng
    - Review mặc định status = pending
3. Phân quyền:
    - User: chỉ gửi review
    - Admin: duyệt / từ chối
    - Staff: chỉ xem

### Kết quả mong đợi
1. Người chưa đăng nhập không thể gửi review.
2. Mỗi phòng chỉ được review 1 lần bởi 1 user.
3. Dữ liệu hiển thị chính xác theo phân quyền.
4. Review chỉ xuất hiện công khai khi được duyệt.
5. Không có lỗi logic hoặc hiển thị sai trạng thái.

---

## Chức năng 5: UX & Hiển thị tổng quan

### Mục tiêu
    Cải thiện trải nghiệm người dùng và giao diện hiển thị đánh giá.

#### Nhiệm vụ chi tiết
1. Dùng component đánh giá sao trực quan (ví dụ react-rating-stars-component).
2. Format ngày tạo bằng:
    ```
    new Date(createdAt).toLocaleDateString('vi-VN')
    ```
3. Thêm hiệu ứng hover nhẹ khi hiển thị danh sách review.
4. Dùng toast (react-hot-toast) cho thông báo gửi / duyệt / từ chối.
5. Loading spinner khi chờ API.

### Kết quả mong đợi
1. UI mượt mà, dễ đọc và thân thiện.
2. Loading / toast hiển thị đúng trạng thái.
3. Ngày tháng, sao và bình luận được format đẹp.
4. Giao diện quản trị và người dùng thống nhất phong cách.
5. Trải nghiệm người dùng mượt, không giật lag.

---
