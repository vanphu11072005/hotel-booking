# Luồng đăng ký và gửi email (ngắn gọn)

Mô tả ngắn: người dùng đăng ký từ client, server tạo user,
gửi email xác thực bằng token, người dùng xác nhận qua link.

1) Client gửi yêu cầu đăng ký
- User nhập thông tin, client validate.
- Kiểm tra cơ bản ở client: required, email format, password match.
- Gửi POST `/api/auth/register`.

2) Server tạo tài khoản & token
- Nhận dữ liệu, validate server-side (same validation).
- Kiểm tra email trùng, hash password.
- Tạo user với `isVerified = false`.
- Tạo token xác thực và lưu DB.

3) Gửi email xác thực
- Tạo link `/verify?token=....`
- Gửi email thông báo hướng dẫn kích hoạt tài khoản.

4) Frontend xử lý sau khi đăng ký thành công
- Nhận response thành công từ server.
- Hiển thị thông báo: “Đăng ký thành công”
- Tự động redirect đến trang Login (VD: /login).

----
