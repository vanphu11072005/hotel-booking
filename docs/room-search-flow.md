# Luồng tìm phòng trống (ngắn gọn)

Mô tả: người dùng nhập ngày/khách, hệ thống trả về phòng
còn trống phù hợp (tính phụ thuộc booking hiện có,
giá, quy tắc đóng phòng).

1) Client gửi yêu cầu tìm phòng
- User nhập checkIn, checkOut, Loại phòng, guests.
- Validate ngày và số khách.
- Gửi request /api/rooms/availability.

2) Server xử lý và tìm phòng trống
- Validate params.
- Lấy danh sách phòng/phòng loại.
- Loại bỏ phòng có booking trùng ngày.

