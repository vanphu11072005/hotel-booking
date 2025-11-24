md_content = """
# 🏨 Quản Lý Phòng – Giao diện dành cho Staff

Trang này dành cho **nhân viên lễ tân (Staff)** để theo dõi trạng thái phòng, hỗ trợ check-in, check-out và phối hợp với Housekeeping.  
Khác với Admin, Staff **không được chỉnh sửa thông tin cấu hình phòng**.

---

## 🎯 1. Mục Tiêu

Nhân viên lễ tân cần có khả năng:

- Xem trạng thái từng phòng trong khách sạn  
- Biết phòng nào trống để nhận khách  
- Biết phòng nào đang có khách  
- Biết phòng nào cần dọn sau khi check-out  
- Biết phòng nào đang dọn hoặc bảo trì  
- Xem nhanh thông tin khách/booking đang ở phòng  
- Chuyển trạng thái phòng theo nghiệp vụ  

---

## 🧭 2. Bộ Lọc & Tìm Kiếm

### Bộ lọc hiển thị:
- **Tất cả**
- **Trống (Available)**
- **Đang ở (Occupied)**
- **Bẩn (Dirty)**
- **Đang dọn (Cleaning)**
- **Bảo trì (Maintenance)**

### Thanh tìm kiếm:
[ 🔍 Tìm kiếm phòng theo số phòng hoặc loại phòng ]

---

## 🗂️ 3. Giao Diện Danh Sách Phòng (Staff View)

| Số phòng | Loại phòng | Trạng thái | Khách đang ở | Booking | Thao tác |
|---------|------------|------------|---------------|---------|----------|
| 902 | Family | 🟢 Trống | – | – | [Xem] |
| 701 | Deluxe | 🔴 Đang ở | Nguyễn Văn A | #BKG1234 | [Chi tiết] |
| 503 | Superior | 🟡 Bẩn | – | – | [Báo dọn] |
| 304 | Deluxe | 🔧 Bảo trì | – | – | – |

---

## 🧱 4. Thao Tác Staff Được Phép

### ✔ Xem chi tiết phòng  
Hiển thị:
- Trạng thái  
- Tầng  
- Loại phòng  
- Booking hiện tại  
- Thông tin khách  
- Ghi chú (nếu có)

### ✔ Thay đổi trạng thái phòng  
- Bẩn → Đang dọn → Trống  
- Trống → Đang ở (check-in)  
- Đang ở → Bẩn (check-out)

### ✔ Báo dọn phòng  
[Báo dọn]

### ✔ Xem booking  
[Chi tiết booking]

---

## 🚫 5. Staff Không Được Phép  
- Thêm phòng  
- Xóa phòng  
- Sửa cấu hình phòng  
- Sửa giá  
- Sửa loại phòng  
- Sửa hình ảnh  

---

## 🖥️ 6. UI Gợi Ý  
Card phòng:

PHÒNG 902 – Family  
Tầng 9  
Trạng thái: 🟢 Trống  
——————————  
• Giá: 2.000.000đ  
[ Xem chi tiết ]

---

## 📌 7. Tổng Kết  

| Vai trò | Quyền hạn |
|---------|-----------|
| Admin | Thêm–Sửa–Xoá phòng, chỉnh giá, loại phòng |
| Staff | Theo dõi & thay đổi trạng thái phòng |

---
"""

with open("staff-room-management.md", "w", encoding="utf-8") as f:
    f.write(md_content)

print("Đã tạo file staff-room-management.md thành công!")
