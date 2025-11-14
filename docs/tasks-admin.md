# 🏨 Hotel Management & Booking System  
## Bản Phân Tích Dành Cho Admin (SRS Admin Analysis)

---

## 1. Giới thiệu
Tài liệu này phân tích các yêu cầu từ SRS của hệ thống **Hotel Management & Booking Online (e-Hotel)**, tập trung hoàn toàn vào phần **Admin / Manager / Staff** (không bao gồm khách hàng).  
Mục tiêu là nắm rõ các chức năng quản trị, vận hành và bảo mật của hệ thống.

---

# 2. Phân tích chức năng dành cho Admin

---

## 2.1 Setup Module (Thiết lập hệ thống)

### 2.1.1 Setup Rooms (Quản lý phòng)
**Vai trò sử dụng:** Manager, Admin  

**Các chức năng:**
- Thêm mới phòng  
- Chỉnh sửa thông tin phòng  
- Xoá phòng *(chỉ khi phòng chưa có booking)*  
- Upload hình ảnh phòng  

**Thông tin phòng gồm:**
- RoomID  
- Description  
- Type (VIP, DELUX, SUITE, …)  
- Size (Single, Double, …)  
- Price  
- Pictures  

**Quy tắc:**
- Validate toàn bộ dữ liệu khi thêm/sửa  
- Không cho xoá phòng đã phát sinh booking  

---

### 2.1.2 Setup Services (Quản lý dịch vụ)
**Vai trò:** Manager, Admin  

**Chức năng:**
- Thêm dịch vụ  
- Chỉnh sửa  
- Xoá dịch vụ  

**Thông tin dịch vụ:**
- Service ID  
- Service Name  
- Description  
- Unit (giờ, suất, lần,…)  
- Price  

**Quy tắc:**  
- Validate tất cả dữ liệu nhập  

---

### 2.1.3 Promotion Management (Quản lý khuyến mãi)
**Vai trò:** Manager, Admin  

**Chức năng:**
- Add promotion  
- Edit promotion  
- Delete promotion  
- Promotion có thể áp dụng bằng code hoặc tự động trong booking  

**Thông tin:**
- ID  
- Name  
- Description  
- Value (phần trăm hoặc số tiền)  

---

# 2.2 Operation Module (Vận hành khách sạn)

---

## 2.2.1 Booking Management
**Vai trò:** Staff, Manager, Admin  

**Chức năng:**
- Tìm booking theo tên khách, số booking, ngày đặt  
- Xem chi tiết booking  
- Xem bill dịch vụ  
- Xử lý yêu cầu:
  - Hủy booking  
  - Checkout  

---

## 2.2.2 Check-in
**Vai trò:** Staff, Manager  

**Quy trình check-in:**
- Khách xuất trình Booking Number  
- Nhân viên kiểm tra thông tin booking  
- Nhập thông tin từng khách trong phòng  
- Gán số phòng thực tế  
- Thu thêm phí nếu có trẻ em hoặc extra person  

---

## 2.2.3 Use Services (Khách đăng ký sử dụng dịch vụ)
**Vai trò:** Staff  

**Chức năng:**
- Đăng ký dịch vụ cho khách dựa trên Room Number  
- In ticket nếu có yêu cầu  

---

## 2.2.4 Check-out
**Vai trò:** Staff, Manager  

**Chức năng:**
- Tính toán:
  - Phí phòng  
  - Phí dịch vụ  
  - Phụ phí khác  
- Tạo hóa đơn (Invoice)  
- Khấu trừ tiền đã đặt cọc (booking value)  
- Khách thanh toán phần còn lại  

---

# 2.3 Report Module (Báo cáo)

**Vai trò:** Manager, Admin  

**Chức năng:**
- Nhập khoảng thời gian From → To  
- Liệt kê toàn bộ booking trong khoảng thời gian  
- Tính tổng doanh thu  
- Xuất báo cáo:
  - Excel  
  - PDF  

**Nội dung báo cáo:**
- Booking ID  
- Customer Name  
- Room  
- Total Amount  
- Booking Date  
- Status  
- Revenue Summary  

---

# 2.4 System Administration Module (Quản trị hệ thống)

---

## 2.4.1 User Management
**Vai trò:** Admin  

**Chức năng:**
- Add user  
- Edit user  
- Delete user  
- View user detail  
- List tất cả user  
- Gán role (Admin, Manager, Staff)  

---

## 2.4.2 Security
**Chức năng bảo mật của hệ thống:**

### Roles được định nghĩa:
| Role | Quyền |
|------|-------|
| **Customer** | Không cần login |
| **Staff (Sale)** | Truy cập Operation Module |
| **Manager** | Truy cập Setup Module |
| **Admin** | Toàn quyền, bao gồm User & Security |

### Quy tắc bảo mật:
- Nhân viên & admin bắt buộc phải login  
- Quyền thao tác phụ thuộc vào role  
- Session timeout sau 30 phút không hoạt động  

---

# 3. Tóm tắt theo góc nhìn Admin

| Module | Quyền Admin | Nội dung |
|--------|-------------|----------|
| Room Setup | Full | CRUD phòng |
| Service Setup | Full | CRUD dịch vụ |
| Promotion Setup | Full | CRUD khuyến mãi |
| Booking Management | Full | Xem, duyệt, hủy booking |
| Check-in / Check-out | Full | Quản lý vận hành |
| Service Usage | Full | Ghi log dịch vụ |
| Reports | Full | Thống kê, xuất file |
| User Management | Full | Quản lý nhân viên |
| Security | Full | Role, phân quyền |

---

# 4. Kết luận
Phân tích trên giúp xác định đầy đủ các chức năng cần triển khai cho **Admin / Manager / Staff** trong hệ thống quản lý khách sạn.  
Tài liệu có thể được sử dụng để xây dựng database, API, UI/UX, và phân quyền hệ thống.

