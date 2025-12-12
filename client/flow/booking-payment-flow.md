# Luồng đặt phòng và thanh toán (ngắn gọn)

Mô tả ngắn: Khách chọn loại phòng và ngày, kiểm tra khả dụng,
thực hiện đặt tạm / thanh toán, server xác nhận và gửi thông báo.

1) Client gửi yêu cầu đặt phòng
- User chọn loại phòng, ngày ở, số khách, dịch vụ thêm.
- Validate → gửi POST /api/bookings.

2) Server tạo booking tạm
- Kiểm tra khả dụng theo ngày.
- Tạo booking trạng thái pending.
- Tính tổng tiền.
- Nếu chọn thanh toán online → trả về payment_url (VNPay).

3) Khởi tạo thanh toán VNPay
- Client gọi:
  `POST /api/payments/vnpay/create`
  {
    booking_id,
    amount,
    return_url
  }

- Server:
  ● Tạo tham số: vnp_TxnRef, vnp_Amount, vnp_OrderInfo, vnp_ReturnUrl, vnp_TmnCode, vnp_CreateDate, …
  ● Sắp xếp params theo key → build query string.
  ● Tạo vnp_SecureHash bằng vnp_HashSecret.
  ● Lưu giao dịch trạng thái pending.
  ● Trả về payment_url để client redirect người dùng sang VNPay.

4) User thanh toán trên VNPay
- User chọn ngân hàng → thanh toán.
- VNPay xử lý xong → redirect về return_url kèm:
  `vnp_ResponseCode, vnp_TxnRef, vnp_SecureHash, ...`

5) Server xác nhận thanh toán
- Tại endpoint POST /api/payments/vnpay/return hoặc webhook:
  ● Verify vnp_SecureHash bằng vnp_HashSecret.
  ● Kiểm tra vnp_TxnRef, vnp_Amount đúng giao dịch.
  ● Nếu vnp_ResponseCode = "00" → Thanh toán thành công:
    cập nhật giao dịch → paid
    cập nhật booking → confirmed
    gửi email xác nhận cho khách.
  ● Nếu lỗi → đánh dấu giao dịch failed, booking có thể bị hủy hoặc giữ pending.

6) Client xử lý sau thanh toán
- Sau redirect, Client gọi GET /api/bookings/:id.
- Hiển thị:
  ● Trang thành công, hoặc
  ● Trang thất bại + hướng dẫn thanh toán lại.

7) Các endpoint chính
- `POST /api/bookings` — tạo booking pending
- `GET /api/bookings/:id` — chi tiết booking
- `POST /api/payments/vnpay/create` — tạo payment VNPay
- `POST /api/payments/vnpay/return` — VNPay redirect/confirm
- `POST /api/payments/webhook` — callback từ VNPay (nếu dùng)
- `PATCH /api/bookings/:id/cancel` — hủy booking trước thanh toán

----
