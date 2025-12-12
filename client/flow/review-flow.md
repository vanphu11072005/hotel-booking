# Luồng chức năng đánh giá (ngắn gọn)

Mô tả ngắn: Khách đã hoàn tất lưu trú có thể gửi đánh giá (sao + nội dung),
server lưu review, cập nhật điểm trung bình và hiển thị cho người dùng.

1) Client hiển thị form đánh giá
- Form gồm: số sao (1–5), nội dung.
- Validate input rồi gửi POST /api/reviews kèm booking_id và token.

2) Server kiểm tra & validate
- Xác thực user, chỉ cho đánh giá khi đã hoàn tất lưu trú.
- Validate rating, nội dung.
- Chặn duplicate review cho cùng booking.

3) Lưu review & cập nhật điểm
- Lưu vào bảng reviews với trạng thái pending.
- Khi được approve, cập nhật average_rating & total_reviews của phòng/room type.

4) Hiển thị review
- Các API public chỉ trả review đã approved.
- Hỗ trợ phân trang, sort theo mới nhất hoặc rating.
- UI hiển thị average_rating + tổng số review.

5) Chỉnh sửa / xoá review
- User có thể sửa hoặc xoá review của mình (hoặc admin).
- Cập nhật lại rating tổng khi review thay đổi.

----
