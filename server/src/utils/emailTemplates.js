/**
 * Email templates for booking notifications
 */

/**
 * Generate booking confirmation email HTML
 */
function bookingConfirmationEmail(bookingData) {
  const {
    booking_number,
    guest_name,
    room_name,
    room_number,
    check_in_date,
    check_out_date,
    total_price,
    payment_method,
    deposit_amount,
    requires_deposit
  } = bookingData;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate deposit if not provided (fallback for old bookings)
  const calculatedDeposit = deposit_amount || (requires_deposit ? total_price * 0.2 : 0);

  const paymentMethodText = 
    payment_method === 'cash' 
      ? 'Thanh toán khi nhận phòng'
      : payment_method === 'e_wallet'
      ? 'VNPay'
      : payment_method === 'bank_transfer'
      ? 'Chuyển khoản ngân hàng'
      : 'Chuyển khoản ngân hàng';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận đặt phòng</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .booking-info {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border: 1px solid #e5e7eb;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: 600;
      color: #6b7280;
    }
    .value {
      color: #111827;
      font-weight: 500;
    }
    .highlight {
      background: #dbeafe;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #3b82f6;
    }
    .total {
      background: #f0fdf4;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
      border: 2px solid #10b981;
    }
    .total-amount {
      font-size: 28px;
      font-weight: bold;
      color: #059669;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
      margin-top: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 Đặt phòng thành công!</h1>
    <p>Cảm ơn bạn đã đặt phòng tại khách sạn của chúng tôi</p>
  </div>

  <div class="content">
    <p>Xin chào <strong>${guest_name}</strong>,</p>
    
    <p>Chúng tôi xác nhận đã nhận được đặt phòng của bạn. Dưới đây là thông tin chi tiết:</p>

    <div class="highlight">
      <strong>Mã đặt phòng:</strong> <span style="font-size: 20px; color: #667eea;">${booking_number}</span>
    </div>

    <div class="booking-info">
      <h3 style="margin-top: 0; color: #667eea;">📋 Thông tin đặt phòng</h3>
      
      <div class="info-row">
        <span class="label">Loại phòng:</span>
        <span class="value">${room_name}</span>
      </div>
      
      <div class="info-row">
        <span class="label">Số phòng:</span>
        <span class="value">${room_number}</span>
      </div>
      
      <div class="info-row">
        <span class="label">Nhận phòng:</span>
        <span class="value">${formatDate(check_in_date)} (Từ 14:00)</span>
      </div>
      
      <div class="info-row">
        <span class="label">Trả phòng:</span>
        <span class="value">${formatDate(check_out_date)} (Trước 12:00)</span>
      </div>
      
      <div class="info-row">
        <span class="label">Phương thức thanh toán:</span>
        <span class="value">${paymentMethodText}</span>
      </div>
    </div>

    <div class="total">
      <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Tổng thanh toán</div>
      <div class="total-amount">${formatPrice(total_price)}</div>
    </div>

    ${bookingData.is_full_payment ? `
    <div class="highlight" style="background: #d1fae5; border-left-color: #10b981;">
      <strong>✅ Đã thanh toán đầy đủ:</strong> ${formatPrice(total_price)}<br>
      <small style="color: #065f46;">Thanh toán 100% qua VNPay thành công. Không cần thanh toán thêm khi nhận phòng.</small>
    </div>
    ` : requires_deposit ? `
    <div class="highlight" style="background: #fef3c7; border-left-color: #f59e0b;">
      <strong>💳 Tiền đặt cọc:</strong> ${formatPrice(calculatedDeposit)}<br>
      <small style="color: #92400e;">Đã thanh toán 20% tiền cọc. Phần còn lại thanh toán khi nhận phòng.</small>
    </div>
    ` : ''}

    <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
      <strong style="color: #991b1b;">⚠️ Lưu ý quan trọng:</strong>
      <ul style="margin: 10px 0; padding-left: 20px; color: #991b1b;">
        <li>Vui lòng mang theo CMND/CCCD khi nhận phòng</li>
        <li>Giờ nhận phòng: 14:00 | Giờ trả phòng: 12:00</li>
        <li>Liên hệ trước nếu cần hủy hoặc thay đổi đặt phòng</li>
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/bookings" class="button">
        Xem chi tiết đặt phòng
      </a>
    </div>

    <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
    
    <p>Trân trọng,<br><strong>Khách sạn</strong></p>
  </div>

  <div class="footer">
    <p>Email này được gửi tự động, vui lòng không trả lời.</p>
    <p>&copy; ${new Date().getFullYear()} Hotel Booking. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Generate booking confirmation plain text
 */
function bookingConfirmationText(bookingData) {
  const {
    booking_number,
    guest_name,
    room_name,
    room_number,
    check_in_date,
    check_out_date,
    total_price,
    payment_method
  } = bookingData;

  // Also accept deposit fields for calculation
  const { deposit_amount, requires_deposit } = bookingData;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate deposit if not provided (fallback for old bookings)
  const calculatedDeposit = deposit_amount || (requires_deposit ? total_price * 0.2 : 0);

  const paymentMethodText = 
    payment_method === 'cash' 
      ? 'Thanh toán khi nhận phòng'
      : payment_method === 'e_wallet'
      ? 'VNPay'
      : payment_method === 'bank_transfer'
      ? 'Chuyển khoản ngân hàng'
      : 'Chuyển khoản ngân hàng';

  return `
ĐẶT PHÒNG THÀNH CÔNG

Xin chào ${guest_name},

Chúng tôi xác nhận đã nhận được đặt phòng của bạn.

Mã đặt phòng: ${booking_number}

THÔNG TIN ĐẶT PHÒNG:
- Loại phòng: ${room_name}
- Số phòng: ${room_number}
- Nhận phòng: ${formatDate(check_in_date)} (Từ 14:00)
- Trả phòng: ${formatDate(check_out_date)} (Trước 12:00)
- Phương thức thanh toán: ${paymentMethodText}

TỔNG THANH TOÁN: ${formatPrice(total_price)}

LƯU Ý QUAN TRỌNG:
- Vui lòng mang theo CMND/CCCD khi nhận phòng
- Giờ nhận phòng: 14:00 | Giờ trả phòng: 12:00
- Liên hệ trước nếu cần hủy hoặc thay đổi đặt phòng

Trân trọng,
Khách sạn
  `;
}

module.exports = {
  bookingConfirmationEmail,
  bookingConfirmationText
};
