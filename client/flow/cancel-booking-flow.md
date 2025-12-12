# Luồng huỷ đặt phòng (ngắn gọn)

Mô tả ngắn: Khách có thể huỷ booking từ client; server xử lý trạng thái,
kiểm tra điều kiện huỷ và xử lý hoàn tiền (nếu có).

1) Client gửi yêu cầu hủy
- User mở trang booking → chọn “Hủy”.
- Hiển thị modal xác nhận.
- Client gọi API: PATCH `/api/bookings/:id/cancel`.

2) Server kiểm tra điều kiện
- Kiểm tra user có quyền hủy (chính chủ).
- Lấy booking và kiểm tra trạng thái (pending hoặc confirmed).

3) Xử lý hủy booking
- Đặt trạng thái booking thành cancelled.
- Giải phóng phòng hoặc xóa hold/reservation nếu có.
- Chưa hỗ trợ hoàn tiền, bỏ qua bước refund.
- Gửi email thông báo hủy cho người dùng:

4) Phản hồi client
- Trả về JSON thành công + booking đã được cập nhật.
- Client cập nhật UI: trạng thái "Đã hủy".

----

- Người dùng chọn hủy 
  → frontend gọi PATCH /api/bookings/:id/cancel 
  → server kiểm tra quyền và trạng thái, cập nhật booking.status = 'cancelled' (ghi lý do, thời gian), phòng được coi là khả dụng lại vì các kiểm tra availability bỏ qua booking đã hủy, server gửi email xác nhận và frontend cập nhật UI/hiển thị thông báo.