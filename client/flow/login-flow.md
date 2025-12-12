# Luồng đăng nhập (ngắn gọn)

Mô tả: người dùng nhập email/password trên client, server
xác thực, trả về token. Frontend lưu và chuyển
trang. Dưới đây là các bước chính và tình huống bổ sung.

1) Client gửi thông tin đăng nhập
- User nhập email/password + tùy chọn Remember Me.
- Frontend validate và gửi POST /api/auth/login với { email, password, rememberMe }

2) Server xử lý đăng nhập
`2.1 Validate & tìm user`
- Kiểm tra cấu trúc dữ liệu.
- Tìm user theo email, kiểm tra trạng thái user:
  1. isActive
  2. isLocked và lockedUntil
- Nếu bị khóa → trả lỗi: 423 Locked.

`2.2 Kiểm tra mật khẩu + theo dõi đăng nhập sai`
- Nếu password sai:
  ● Tăng failedAttempts.
  ● Nếu vượt ngưỡng (vd: 5 lần/5 phút):
    + Đặt isLocked = true
    + lockedUntil = now + lockDuration
    + Trả: 423 Locked: "Tài khoản tạm bị khóa"
  ● Nếu chưa tới ngưỡng:
    + Trả lỗi 401 Unauthorized.
- Nếu password đúng:
  ● Reset failedAttempts = 0.

3) Sinh Token và xử lý Remember Me
`3.1 Access Token`
- JWT, thời hạn ngắn: 15 phút.

`3.2 Refresh Token`
- Nếu rememberMe = true:
  ● Refresh Token dài hạn (7 ngày).
- Nếu rememberMe = false:
  ● Refresh Token ngắn hơn (1 ngày) hoặc session cookie.
- Lưu Refresh Token vào:
  ● Cookie HttpOnly + Secure + SameSite (không đọc bằng JS).
  ● Lưu bản hash trong DB/Redis để phục vụ logout/revoke.

4) Trả về kết quả đăng nhập
- Response bao gồm:
  ● accessToken
  ● Cookie chứa refresh token (HTTP only)
  ● userInfo (name, email, avatar,…)
Frontend:
  ● Lưu access token trong localStore.
  ● Điều hướng sang trang chủ hoặc trang trước đó.

5) Gia hạn phiên (Silent Refresh)
- Client gọi POST /api/auth/refresh trước khi access token hết hạn.
- Cookie HttpOnly tự gửi kèm theo request.
- Server:
  ● Kiểm tra refresh token (còn hạn? không bị revoke? đúng user?)
  ● Nếu OK → sinh access token mới (+ optional refresh token mới).
  ● Nếu fail → trả 401 → client logout và chuyển sang login.

6) Đăng xuất & Thu hồi token
- Client gọi POST /api/auth/logout.
- Server:
  ● Xóa hoặc đánh dấu refresh token là revoked trong DB/Redis.
  ● Clear cookie HttpOnly.
- Khi user đổi mật khẩu hoặc admin thu hồi:
  ● Tất cả refresh token cũ bị vô hiệu hóa.

7) Trường hợp tài khoản bị khóa tạm thời
- Nếu user login sai quá số lần:
  ● failedAttempts >= threshold → khóa.
- Khi tài khoản đang khóa:
  ● Mọi request login đều trả 423 Locked.
- Khi hết lockedUntil:
  ● Server tự mở khóa (hoặc mở khi user login lại).

---
