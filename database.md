Danh sách bảng cơ sở dữ liệu và giải thích các cột

Lưu ý: mô tả dưới đây dựa trên các model Sequelize trong
`server/src/databases/models`.

---

**Bảng: roles**
- `id` (INT, PK, auto-increment): Khóa chính của vai trò.
- `name` (VARCHAR(50), unique): Tên vai trò (ví dụ: admin, staff,
  customer).
- `description` (VARCHAR(255), nullable): Mô tả ngắn về vai trò.

Mục đích: lưu các vai trò người dùng và phân quyền cơ bản.

---

**Bảng: users**
- `id` (INT, PK, auto-increment): Khóa chính người dùng.
- `role_id` (INT, FK -> roles.id): Tham chiếu tới vai trò của người dùng.
- `email` (VARCHAR(100), unique): Email đăng nhập, dùng để xác thực.
- `password` (VARCHAR(255)): Mật khẩu đã mã hóa (luôn bị loại khi toJSON).
- `full_name` (VARCHAR(100)): Họ và tên đầy đủ của người dùng.
- `phone` (VARCHAR(20), nullable): Số điện thoại liên hệ.
- `address` (TEXT, nullable): Địa chỉ người dùng.
- `avatar` (VARCHAR(255), nullable): URL hoặc đường dẫn ảnh đại diện.
- `is_active` (BOOLEAN): Trạng thái kích hoạt tài khoản (mặc định true).

Mục đích: lưu thông tin tài khoản khách hàng và nhân viên.

---

**Bảng: refresh_tokens**
- `id` (INT, PK, auto-increment)
- `user_id` (INT, FK -> users.id): Người dùng sở hữu token.
- `token` (VARCHAR(500), unique): Giá trị refresh token dùng cấp mới
  access token.
- `expires_at` (DATETIME): Thời điểm token hết hạn.

Mục đích: quản lý refresh token cho authentication.

---

**Bảng: room_types**
- `id` (INT, PK, auto-increment)
- `name` (VARCHAR(100), unique): Tên loại phòng (ví dụ: Deluxe).
- `description` (TEXT, nullable): Mô tả loại phòng.
- `base_price` (DECIMAL(10,2)): Giá cơ bản / đêm của loại phòng.
- `capacity` (INT): Sức chứa tối đa (số người).
- `amenities` (JSON, nullable): Danh sách tiện nghi (mảng chuỗi
  hoặc object), dùng để lọc/hiển thị.
- `images` (JSON, nullable, default []): Danh sách URL/đường dẫn ảnh
  đại diện cho loại phòng.

Mục đích: mô tả mẫu/phân loại phòng, dùng làm template cho `rooms`.

---

**Bảng: rooms**
- `id` (INT, PK, auto-increment)
- `room_type_id` (INT, FK -> room_types.id): Loại phòng tham chiếu.
- `room_number` (VARCHAR(20), unique): Mã/số phòng (hiển thị cho khách).
- `floor` (INT): Tầng của phòng.
- `status` (ENUM): Trạng thái phòng: `available`, `occupied`,
  `maintenance`, `cleaning`.
- `price` (DECIMAL(10,2)): Giá hiện tại của phòng (có thể ghi đè
  base_price của room_type).
- `featured` (BOOLEAN): Cờ phòng nổi bật.
- `images` (JSON, nullable): Danh sách ảnh cụ thể cho phòng này
  (ưu tiên dùng khi hiển thị phòng).
- `amenities` (JSON, nullable): Tiện nghi riêng của phòng (nếu khác
  room_type).
- `description` (TEXT, nullable): Mô tả chi tiết phòng.

Mục đích: từng phòng vật lý trong khách sạn.

---

**Bảng: bookings**
- `id` (INT, PK, auto-increment)
- `booking_number` (VARCHAR(50), unique): Mã đơn/booking dùng để
  tham chiếu và làm nội dung chuyển khoản.
- `user_id` (INT, FK -> users.id): Người đặt (nếu đăng nhập).
- `room_id` (INT, FK -> rooms.id): Phòng được đặt.
- `check_in_date` (DATETIME): Ngày nhận phòng (bắt đầu đặt).
- `check_out_date` (DATETIME): Ngày trả phòng (kết thúc đặt).
- `num_guests` (INT): Số khách thực tế.
- `total_price` (DECIMAL(10,2)): Tổng tiền của booking (phòng + dịch vụ).
- `status` (ENUM): `pending`, `confirmed`, `checked_in`, `checked_out`,
  `cancelled`.
- `deposit_paid` (BOOLEAN): Cờ đã thanh toán tiền cọc hay chưa.
- `requires_deposit` (BOOLEAN): Cờ yêu cầu thanh toán cọc hay không.
- `special_requests` (TEXT, nullable): Yêu cầu đặc biệt (ghi chú).

Mục đích: lưu các đặt phòng, trạng thái và tổng chi phí.

---

**Bảng: payments**
- `id` (INT, PK, auto-increment)
- `booking_id` (INT, FK -> bookings.id): Thuộc booking nào.
- `amount` (DECIMAL(10,2)): Số tiền thanh toán.
- `payment_method` (ENUM): `cash`, `credit_card`, `debit_card`,
  `bank_transfer`, `e_wallet`.
- `payment_type` (ENUM): `full`, `deposit`, `remaining`.
- `deposit_percentage` (INT, nullable): Tỷ lệ % tiền cọc nếu có.
- `related_payment_id` (INT, nullable): Tham chiếu đến payment khác
  (vd: deposit -> remaining).
- `payment_status` (ENUM): `pending`, `completed`, `failed`, `refunded`.
- `transaction_id` (VARCHAR(100), nullable): ID giao dịch từ cổng
  thanh toán.
- `payment_date` (DATETIME, nullable): Ngày thực hiện thanh toán.
- `notes` (TEXT, nullable): Ghi chú liên quan thanh toán.

Mục đích: quản lý các giao dịch liên quan đến booking.

---

**Bảng: services**
- `id` (INT, PK, auto-increment)
- `name` (VARCHAR(100)): Tên dịch vụ (vd: Ăn sáng, Xe đưa đón).
- `description` (TEXT, nullable)
- `price` (DECIMAL(10,2)): Giá dịch vụ theo đơn vị.
- `unit` (VARCHAR(50), nullable, default 'lần'): Đơn vị tính.
- `category` (VARCHAR(50), nullable): Nhóm dịch vụ.
- `status` (ENUM): `active`, `inactive`.
- `is_active` (BOOLEAN): Cờ kích hoạt.

Mục đích: danh mục dịch vụ bổ sung khách sạn cung cấp.

---

**Bảng: service_usages**
- `id` (INT, PK, auto-increment)
- `booking_id` (INT, FK -> bookings.id): Đơn đặt liên quan.
- `service_id` (INT, FK -> services.id): Dịch vụ được sử dụng.
- `quantity` (INT): Số lượng lần sử dụng.
- `unit_price` (DECIMAL(10,2)): Giá / đơn vị lúc sử dụng.
- `total_price` (DECIMAL(10,2)): Tổng tiền của mục dịch vụ.
- `usage_date` (DATETIME): Ngày sử dụng (mặc định now).
- `notes` (TEXT, nullable)

Mục đích: lưu chi tiết dịch vụ phát sinh cho mỗi booking.

---

**Bảng: promotions**
- `id` (INT, PK, auto-increment)
- `code` (VARCHAR(50), unique): Mã khuyến mãi nhập bởi khách.
- `name` (VARCHAR(100)): Tên chương trình khuyến mãi.
- `description` (TEXT, nullable)
- `discount_type` (ENUM): `percentage` hoặc `fixed_amount`.
- `discount_value` (DECIMAL(10,2)): Giá trị giảm (theo loại).
- `min_booking_amount` (DECIMAL(10,2), nullable): Số tiền tối thiểu
  để áp dụng mã.
- `max_discount_amount` (DECIMAL(10,2), nullable): Giảm tối đa.
- `start_date` (DATETIME): Ngày bắt đầu hiệu lực.
- `end_date` (DATETIME): Ngày kết thúc hiệu lực.
- `usage_limit` (INT, nullable): Giới hạn số lần sử dụng (toàn bộ).
- `used_count` (INT): Số lần đã sử dụng (mặc định 0).
- `is_active` (BOOLEAN): Cờ kích hoạt.

Mục đích: cấu hình mã giảm giá và logic kiểm tra/áp dụng.

---

**Bảng: banners**
- `id` (INT, PK, auto-increment)
- `title` (VARCHAR(100)): Tiêu đề banner.
- `description` (TEXT, nullable)
- `image_url` (VARCHAR(255)): Đường dẫn ảnh banner.
- `link_url` (VARCHAR(255), nullable): URL chuyển hướng khi click.
- `position` (VARCHAR(50)): Vị trí hiển thị (ví dụ 'home').
- `display_order` (INT): Thứ tự hiển thị.
- `is_active` (BOOLEAN): Bật/tắt banner.
- `start_date` (DATETIME, nullable): Ngày bắt đầu hiển thị.
- `end_date` (DATETIME, nullable): Ngày kết thúc hiển thị.

Mục đích: quản lý banner trên trang chủ hoặc các vị trí khác.

---

**Bảng: checkin_checkout**
- `id` (INT, PK, auto-increment)
- `booking_id` (INT, FK -> bookings.id): Booking liên quan.
- `checkin_time` (DATETIME, nullable): Thời gian check-in thực tế.
- `checkout_time` (DATETIME, nullable): Thời gian check-out thực tế.
- `checkin_by` (INT, nullable, FK -> users.id): Nhân viên xử lý check-in.
- `checkout_by` (INT, nullable, FK -> users.id): Nhân viên xử lý check-out.
- `room_condition_checkin` (TEXT, nullable): Ghi chú tình trạng phòng khi
  nhận.
- `room_condition_checkout` (TEXT, nullable): Ghi chú khi trả phòng.
- `additional_charges` (DECIMAL(10,2)): Phí phát sinh khi trả phòng.
- `notes` (TEXT, nullable)

Mục đích: ghi lại lịch sử check-in/check-out và phí bổ sung.

---

**Bảng: password_reset_tokens**
- `id` (INT, PK, auto-increment)
- `user_id` (INT, FK -> users.id)
- `token` (VARCHAR, unique): Mã dùng để reset mật khẩu.
- `expires_at` (DATETIME): Thời hạn hiệu lực token.
- `used` (BOOLEAN): Đã dùng token hay chưa.

Mục đích: hỗ trợ chức năng quên mật khẩu / thiết lập mật khẩu mới.

---

**Bảng: reviews**
- `id` (INT, PK, auto-increment)
- `user_id` (INT, FK -> users.id): Người đánh giá.
- `room_id` (INT, FK -> rooms.id): Phòng được đánh giá.
- `rating` (INT): Điểm số (ví dụ 1-5).
- `comment` (TEXT): Nội dung đánh giá.
- `status` (ENUM): `pending`, `approved`, `rejected`.

Mục đích: thu thập đánh giá khách hàng cho phòng.

---

**Bảng: favorites**
- `id` (INT, PK, auto-increment)
- `user_id` (INT, FK -> users.id): Người đánh dấu yêu thích.
- `room_id` (INT, FK -> rooms.id): Phòng được thích.

Mục đích: lưu trạng thái favorite của người dùng cho từng phòng.

---

Ghi chú chung:
- Các trường kiểu `JSON` (ví dụ `images`, `amenities`) được dùng để lưu
  mảng hoặc object — frontend xử lý chuyển đổi thành URL/chuỗi khi cần.
- Một số migration bổ sung có thể thêm cột (ví dụ: tracking deposit,
  images) — phần mô tả ở trên đã phản ánh trạng thái hiện tại của models
  trong code.

