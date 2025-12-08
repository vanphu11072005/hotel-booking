# Luồng quên mật khẩu (ngắn gọn)

Mô tả: người dùng yêu cầu đặt lại mật khẩu, server tạo
token một lần, gửi email chứa link đặt lại, người dùng
nhấn link và đặt mật khẩu mới.

1) Client gửi yêu cầu quên mật khẩu
- Form nhập `email` ở trang "Quên mật khẩu".
- Kiểm tra cơ bản: required, email format.
- Gửi `POST /api/auth/forgot-password` { email }.
- Hiển thị thông báo: "Nếu email tồn tại, kiểm tra hộp thư".

2) Server tạo token & gửi email
- Nhận email, validate định dạng.
- Nếu user tồn tại → tạo reset token 1 lần, có hạn, lưu DB.
- Gửi email chứa link: /reset-password?token=....

3) User mở link đặt lại mật khẩu
- Frontend hiển thị form nhập mật khẩu mới.
- Gửi POST /api/auth/reset-password với { token, newPassword }.

4) Server xử lý đổi mật khẩu
- Kiểm tra token hợp lệ & chưa hết hạn.
- Hash mật khẩu mới và cập nhật user.
- Xóa token (dùng một lần).
- Trả về thành công và hướng dẫn đăng nhập lại.

  ```
