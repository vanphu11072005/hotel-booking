# Luồng đăng nhập (ngắn gọn)

Mô tả: người dùng nhập email/password trên client, server
xác thực, trả về token/session. Frontend lưu và chuyển
trang. Dưới đây là các bước chính và tình huống bổ sung.

1) Client gửi thông tin đăng nhập
- User nhập email/password.
- Frontend validate và gửi POST /api/auth/login.
- Nếu OK → lưu token/session và chuyển sang trang chủ hoặc trang yêu cầu.

2) Server xác thực
- Validate dữ liệu nhận được.
- Tìm user theo email, kiểm tra password.
- Kiểm tra isVerified và trạng thái tài khoản.
- Nếu hợp lệ → trả về JWT Access Token + Refresh Token (cookie HTTP-only).

3) Xử lý lỗi
- Sai thông tin: trả `401 Unauthorized`.
- Tài khoản chưa xác thực: trả `403`.
- Tài khoản bị khóa: trả `423 Locked` hoặc `403`.
- Quá nhiều lần thử: áp rate-limit, có thể tạm khoá.

4) Bảo mật
- Luôn dùng HTTPS.
- Hash password (bcrypt/argon2).
- Refresh token trong HTTP-only cookie.
- Access token ngắn hạn; refresh token dài hạn.

---
