# Luồng khóa tài khoản khi nhập mật khẩu sai nhiều lần

Mô tả ngắn: hệ thống theo dõi số lần đăng nhập sai, khi vượt
ngưỡng sẽ tạm khóa tài khoản trong thời gian định trước.

1) Theo dõi số lần nhập sai
- Mỗi lần login sai → tăng failedAttempts.
- Lưu trong DB user hoặc Redis (có TTL).
- Login thành công → reset bộ đếm.

2) Kích hoạt khóa tài khoản
- Thiết lập ngưỡng 5 lần trong 5 phút
- Nếu vượt ngưỡng → đặt isLocked = true và lockedUntil = now + lockDuration.

3) Trả lỗi khi bị khóa
- Server trả 423 Locked hoặc 403 với thông báo:
  “Tài khoản tạm bị khóa, vui lòng thử lại sau X phút.”
