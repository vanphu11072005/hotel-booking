# Luồng chức năng "Yêu thích phòng" (ngắn gọn)

Mô tả: người dùng có thể đánh dấu phòng/loại phòng là yêu
thích để dễ truy cập sau này; trạng thái được lưu cho
cá nhân (sync giữa thiết bị nếu có đăng nhập).

1) Frontend hiển thị & xử lý
- Có icon “heart” trên phòng/room type.
- Nếu chưa đăng nhập → yêu cầu login hoặc lưu tạm localStorage.
- Khi bấm yêu thích/bỏ yêu thích → cập nhật UI ngay và gọi API.

2) API (Server)
- POST `/api/favorites` → thêm favorite.
- DELETE `/api/favorites/:id` → bỏ favorite.
- GET `/api/favorites` → lấy danh sách favorites.
- Các API yêu cầu user đã đăng nhập.

3) Database
- Bảng favorites: id, userId, roomId (hoặc roomTypeId), createdAt.
- Index theo userId để query nhanh.

4) Cách hoạt động chi tiết
- Thêm: server kiểm tra room tồn tại, không trùng lặp,
  tạo bản ghi favorite.
- Xóa: server xóa bản ghi tương ứng.
- Lấy: server trả danh sách rooms được favorite với
  thông tin tối thiểu (id, title, thumbnail, price).
