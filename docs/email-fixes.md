# Email Display Issues - Fix Summary

## 🐛 Issues Fixed

### Issue 1: Guest Name Shows "undefined"
**Problem:** Email greeting shows "Xin chào undefined"
**Root Cause:** `guestInfo.name` might not exist, no proper fallback
**Fix:** Added multiple fallbacks in order:
```javascript
guest_name: guestInfo.name || guestInfo.fullName || 'Khách hàng'
```

### Issue 2: Room Info Shows "N/A"
**Problem:** 
- Room type: "N/A"
- Room number: "N/A"

**Root Cause:** `findBookingWithPayments()` query không include Room relations
**Fix:** 
1. Updated repository query to include Room + RoomType:
```javascript
// paymentRepository.js
async findBookingWithPayments(bookingId) {
  return await Booking.findByPk(bookingId, {
    include: [
      { model: Payment, as: 'payments' },
      {
        model: Room,
        as: 'room',
        include: [{ model: RoomType, as: 'room_type' }], // Added!
      },
      // ... service_usages
    ],
  });
}
```

2. Added Vietnamese fallback text:
```javascript
room_name: booking.room?.room_type?.name || 'Chưa xác định',
room_number: booking.room?.room_number || 'Chưa xác định',
```

### Issue 3: VNPay Payment Shows Deposit "NaN ₫"
**Problem:** 
- VNPay full payment (100%) hiển thị "💳 Tiền đặt cọc: NaN ₫"
- Nội dung sai: "Đã thanh toán 20% tiền cọc"

**Root Cause:** 
- VNPay có `payment_type = 'full'` nhưng email vẫn hiển thị deposit section
- `deposit_amount` là undefined cho full payment

**Fix:**
1. Detect payment type in paymentService:
```javascript
const payment = booking.payments?.[0];
const isFullPayment = payment?.payment_type === 'full';

const emailData = {
  // ...
  deposit_amount: booking.deposit_amount || 0, // Fallback to 0
  requires_deposit: booking.requires_deposit && !isFullPayment, // Hide for full
  is_full_payment: isFullPayment // New flag
};
```

2. Update email template with conditional display:
```javascript
// emailTemplates.js
${bookingData.is_full_payment ? `
  <div class="highlight" style="background: #d1fae5; border-left-color: #10b981;">
    <strong>✅ Đã thanh toán đầy đủ:</strong> ${formatPrice(total_price)}<br>
    <small style="color: #065f46;">
      Thanh toán 100% qua VNPay thành công. 
      Không cần thanh toán thêm khi nhận phòng.
    </small>
  </div>
` : requires_deposit ? `
  <div class="highlight" style="background: #fef3c7; border-left-color: #f59e0b;">
    <strong>💳 Tiền đặt cọc:</strong> ${formatPrice(deposit_amount)}<br>
    <small style="color: #92400e;">
      Đã thanh toán 20% tiền cọc. 
      Phần còn lại thanh toán khi nhận phòng.
    </small>
  </div>
` : ''}
```

## 📝 Files Changed

### 1. `server/src/repositories/paymentRepository.js`
**Line 29-44:** Added Room and RoomType includes to `findBookingWithPayments()`

### 2. `server/src/services/paymentService.js`
**Line 36-53:** 
- Added payment type detection
- Fixed guest_name fallback chain
- Fixed room info fallback text (Vietnamese)
- Added `is_full_payment` flag
- Fixed deposit_amount handling

### 3. `server/src/utils/emailTemplates.js`
**Line ~130:** Updated deposit section to:
- Show "✅ Đã thanh toán đầy đủ" for VNPay full payment
- Show "💳 Tiền đặt cọc" only for actual deposits
- Hide section entirely if no deposit required

## ✅ Expected Results After Fix

### Bank Transfer Email (Deposit 20%)
```
Xin chào Nguyễn Văn A,

📋 Thông tin đặt phòng
Loại phòng: Deluxe Room
Số phòng: 101
Nhận phòng: Chủ Nhật, 30 tháng 11, 2025 (Từ 14:00)
Trả phòng: Thứ Hai, 1 tháng 12, 2025 (Trước 12:00)
Phương thức thanh toán: Chuyển khoản ngân hàng

Tổng thanh toán: 5.400.000 ₫

💳 Tiền đặt cọc: 1.080.000 ₫
Đã thanh toán 20% tiền cọc. Phần còn lại thanh toán khi nhận phòng.
```

### VNPay Email (Full Payment 100%)
```
Xin chào Nguyễn Văn A,

📋 Thông tin đặt phòng
Loại phòng: Deluxe Room
Số phòng: 101
Nhận phòng: Chủ Nhật, 30 tháng 11, 2025 (Từ 14:00)
Trả phòng: Thứ Hai, 1 tháng 12, 2025 (Trước 12:00)
Phương thức thanh toán: VNPay

Tổng thanh toán: 5.400.000 ₫

✅ Đã thanh toán đầy đủ: 5.400.000 ₫
Thanh toán 100% qua VNPay thành công. Không cần thanh toán thêm khi nhận phòng.
```

## 🧪 Testing Steps

### Test 1: Bank Transfer Email
1. Restart server: `cd server && npm start`
2. Create booking with cash payment
3. Complete deposit payment
4. Check email - should show:
   - ✅ Real guest name (not "undefined")
   - ✅ Real room type & number (not "N/A")
   - ✅ "💳 Tiền đặt cọc: 1.080.000 ₫" (20%)

### Test 2: VNPay Full Payment Email
1. Create booking with VNPay payment
2. Complete VNPay sandbox payment
3. Check email - should show:
   - ✅ Real guest name
   - ✅ Real room type & number
   - ✅ "✅ Đã thanh toán đầy đủ: 5.400.000 ₫" (100%)
   - ✅ No deposit section

## 🔍 Debug Tips

If issues persist, check console logs:

```bash
# Should see:
✅ Đã gửi email xác nhận đến: customer@example.com

# If you see errors:
❌ Lỗi gửi email xác nhận: [error message]
```

Check email data before sending:
```javascript
console.log('📧 Email data:', {
  guest_name: emailData.guest_name,
  room_name: emailData.room_name,
  room_number: emailData.room_number,
  is_full_payment: emailData.is_full_payment,
  deposit_amount: emailData.deposit_amount
});
```

## 🎯 Summary

**Before:**
- ❌ "Xin chào undefined"
- ❌ Room: "N/A"
- ❌ VNPay shows "Tiền đặt cọc: NaN ₫"

**After:**
- ✅ "Xin chào Nguyễn Văn A"
- ✅ Room: "Deluxe Room - 101"
- ✅ VNPay shows "Đã thanh toán đầy đủ: 5.400.000 ₫"
- ✅ Bank transfer shows "Tiền đặt cọc: 1.080.000 ₫"

---

**Status:** ✅ Ready to test after server restart
