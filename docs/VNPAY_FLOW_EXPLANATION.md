# Luồng Hoạt Động Thanh Toán VNPay (Giả Lập)

Tài liệu này mô tả chi tiết quy trình xử lý thanh toán VNPay trong hệ thống, từ lúc người dùng bắt đầu đặt phòng đến khi thanh toán được xác nhận thành công.

## Tổng Quan Quy Trình

1.  **Frontend (BookingPage):** Người dùng chọn thanh toán VNPay -> Gọi API tạo URL.
2.  **Backend:** Tạo URL thanh toán chứa thông tin đơn hàng và chữ ký bảo mật -> Trả về Frontend.
3.  **VNPay Sandbox:** Người dùng nhập thông tin thẻ demo -> VNPay xử lý -> Redirect về Frontend.
4.  **Frontend (VNPayReturnPage):** Nhận tham số từ URL -> Gọi API xác thực.
5.  **Backend:** Kiểm tra chữ ký (Checksum) -> Cập nhật trạng thái đơn hàng -> Trả kết quả.

---

## Chi Tiết Từng Bước

### Bước 1: Khởi Tạo Thanh Toán (Frontend)

Người dùng thực hiện thao tác tại trang đặt phòng.

*   **File:** `client/src/pages/customer/BookingPage.tsx`
*   **Hàm xử lý:** `onSubmit`
*   **Luồng xử lý:**
    1.  Người dùng điền thông tin và chọn phương thức thanh toán là `vnpay`.
    2.  Hệ thống gọi API tạo Booking trước (`createBookingStore` hoặc `createMultiRoomBooking`).
    3.  Sau khi Booking được tạo, hệ thống lấy `payment.id` từ response.
    4.  Gọi action `createVNPayStore(payment.id)` để yêu cầu Backend cấp URL thanh toán.
    5.  Nếu thành công, trình duyệt chuyển hướng (`window.location.href`) sang trang thanh toán của VNPay.

```typescript
// Trích đoạn logic trong BookingPage.tsx
if (bookingData.payment_method === 'vnpay') {
    // 1. Tạo booking
    const createdBooking = await createBookingStore(bookingData);
    
    // 2. Lấy thông tin payment
    const payment = createdBooking.payments.find(p => p.payment_type === 'full' || p.payment_type === 'deposit');
    
    // 3. Lấy URL thanh toán VNPay
    const vnpayData = await createVNPayStore(payment.id);
    
    // 4. Chuyển hướng
    if (vnpayData?.payment_url) {
        window.location.href = vnpayData.payment_url;
    }
}
```

### Bước 2: Tạo URL Thanh Toán (Backend)

Backend nhận yêu cầu tạo URL, tính toán mã băm (hash) để đảm bảo toàn vẹn dữ liệu.

*   **API Endpoint:** `POST /api/payments/vnpay/create`
*   **Controller:** `server/src/controllers/paymentController.js` (`createVNPayPayment`)
*   **Service:** `server/src/services/paymentService.js` (`createVNPayPayment`)
*   **Utility:** `server/src/utils/vnpayService.js` (`createPaymentUrl`)

**Logic chính:**
1.  Kiểm tra `payment_id` có hợp lệ và thuộc về user hiện tại không.
2.  Lấy số tiền (`amount`) và thông tin đơn hàng.
3.  Sử dụng thư viện `vnpay` để tạo URL với các tham số bắt buộc:
    *   `vnp_Amount`: Số tiền (VND).
    *   `vnp_TxnRef`: Mã tham chiếu giao dịch (thường là `paymentId` + timestamp).
    *   `vnp_ReturnUrl`: URL mà VNPay sẽ chuyển hướng về sau khi thanh toán xong (cấu hình trong `.env` hoặc gửi từ client).
    *   `vnp_SecureHash`: Chữ ký bảo mật tạo từ secret key.

### Bước 3: Thanh Toán Trên Cổng VNPay (Sandbox)

*   Người dùng được chuyển đến giao diện của VNPay.
*   Nhập thông tin thẻ demo (Ví dụ: Ngân hàng NCB, Số thẻ: 9704198526191432198, OTP: 123456).
*   Sau khi hoàn tất, VNPay chuyển hướng người dùng về `vnp_ReturnUrl`.
    *   Ví dụ URL trả về: `http://localhost:5173/payment/vnpay-return?vnp_Amount=100000&vnp_ResponseCode=00&vnp_TxnRef=...&vnp_SecureHash=...`

### Bước 4: Xử Lý Kết Quả Trả Về (Frontend)

Frontend đón người dùng quay lại và gửi dữ liệu xác thực lên Backend.

*   **File:** `client/src/pages/customer/VNPayReturnPage.tsx`
*   **Component:** `VNPayReturnPage`
*   **Luồng xử lý:**
    1.  Component mount, `useEffect` lấy toàn bộ query parameters từ URL (`location.search`).
    2.  Gọi API `verifyVNPayReturn(queryParams)` để xác thực.
    3.  Hiển thị trạng thái `Loading` trong lúc chờ.
    4.  Nếu Backend trả về thành công -> Hiển thị thông báo thành công và nút về trang chi tiết Booking.
    5.  Nếu thất bại -> Hiển thị lỗi.

```typescript
// Trích đoạn VNPayReturnPage.tsx
const verifyPayment = async () => {
    const queryParams = location.search;
    // Gửi toàn bộ query string lên server để verify chữ ký
    const response = await verifyVNPayReturn(queryParams);
    
    if (response.success) {
        toast.success('Thanh toán thành công!');
        // Cập nhật UI...
    }
};
```

### Bước 5: Xác Thực & Cập Nhật Database (Backend)

Đây là bước quan trọng nhất để đảm bảo bảo mật, tránh việc người dùng tự sửa URL để giả mạo thanh toán thành công.

*   **API Endpoint:** `GET /api/payments/vnpay/return`
*   **Service:** `server/src/services/paymentService.js` (`handleVNPayReturn`)
*   **Utility:** `server/src/utils/vnpayService.js` (`verifyReturn`)

**Logic chính:**
1.  **Verify Checksum:** Backend lấy các tham số từ URL, dùng `Secure Secret` (giống lúc tạo URL) để hash lại và so sánh với `vnp_SecureHash` nhận được.
    *   Nếu khớp: Dữ liệu toàn vẹn, do VNPay gửi.
    *   Nếu không khớp: Dữ liệu bị can thiệp -> Từ chối.
2.  **Kiểm tra trạng thái:** Kiểm tra `vnp_ResponseCode`.
    *   `00`: Giao dịch thành công.
    *   Khác `00`: Giao dịch lỗi hoặc bị hủy.
3.  **Cập nhật Database:**
    *   Tìm `Payment` dựa trên `vnp_TxnRef`.
    *   Cập nhật `payment_status` thành `completed`.
    *   Cập nhật `payment_date`.
    *   (Tùy chọn) Cập nhật trạng thái Booking nếu đã thanh toán đủ.

---

## Các File Quan Trọng

| Vai trò | File Path | Mô tả |
| :--- | :--- | :--- |
| **Frontend Page** | `client/src/pages/customer/BookingPage.tsx` | Nơi bắt đầu quy trình thanh toán. |
| **Frontend Return** | `client/src/pages/customer/VNPayReturnPage.tsx` | Trang đích sau khi thanh toán xong. |
| **Frontend Service** | `client/src/services/api/paymentService.ts` | Các hàm gọi API (`createVNPayPayment`, `verifyVNPayReturn`). |
| **Backend Service** | `server/src/services/paymentService.js` | Logic nghiệp vụ chính, gọi VNPay lib và update DB. |
| **VNPay Helper** | `server/src/utils/vnpayService.js` | Wrapper cho thư viện `vnpay`, xử lý tạo URL và verify hash. |
