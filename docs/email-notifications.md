# Email Notification System

## Overview
Hệ thống gửi email tự động khi thanh toán hoặc đặt cọc thành công.

## Implementation

### Email Templates
File: `server/src/utils/emailTemplates.js`

Hai template:
- `bookingConfirmationEmail(bookingData)` - HTML email với styling đẹp
- `bookingConfirmationText(bookingData)` - Plain text fallback

### Email Sending Points

#### 1. Bank Transfer Deposit Confirmation
**File:** `server/src/services/paymentService.js`
**Method:** `confirmDepositPayment()`
**Trigger:** Khi user bấm "Tôi đã chuyển khoản"
**Flow:**
```javascript
// User notifies payment completion
await confirmDepositPayment(userId, { payment_id, transaction_id })
  -> Updates payment status to 'completed'
  -> Sets booking.deposit_paid = true
  -> Sends confirmation email
```

#### 2. VNPay Payment Success
**File:** `server/src/services/paymentService.js`
**Method:** `handleVNPayReturn()`
**Trigger:** VNPay callback với response code = '00' (success)
**Flow:**
```javascript
// VNPay redirects user back with success
await handleVNPayReturn(vnpParams)
  -> Verifies VNPay signature
  -> Updates payment to 'completed'
  -> Confirms booking (status = 'confirmed')
  -> Sends confirmation email
```

### Email Content

**Subject:** `Xác nhận đặt phòng {booking_number}`

**Includes:**
- 🎉 Success header with gradient background
- Booking number (highlighted)
- Room details (type, number)
- Check-in/check-out dates with Vietnamese formatting
- Payment method
- Total price (formatted VND)
- Deposit amount (if applicable)
- Important notes (ID requirement, check-in/out times)
- Link to view booking details

**Responsive Design:**
- Max width 600px
- Mobile-friendly
- Works in all major email clients

## Configuration

### Environment Variables (.env)
```bash
# Required
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password  # Gmail App Password required
MAIL_FROM=Hotel Booking <noreply@yourdomain.com>

# Optional (used in email template)
CLIENT_URL=http://localhost:5173
```

### Gmail Setup (for Development)

1. **Enable 2-Step Verification** on your Google account
2. **Generate App Password:**
   - Go to https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Scroll down to "App passwords"
   - Generate password for "Mail" application
   - Copy the 16-character password
3. **Update .env:**
   ```bash
   MAIL_USER=your-email@gmail.com
   MAIL_PASS=xxxx xxxx xxxx xxxx  # App password
   ```

## Error Handling

Email sending errors are caught and logged but **DO NOT block** booking confirmation:

```javascript
try {
  await sendEmail({...});
  console.log('✅ Đã gửi email xác nhận đến:', email);
} catch (error) {
  console.error('❌ Lỗi gửi email xác nhận:', error.message);
  // Booking still succeeds
}
```

## Testing

### Manual Test Flow

**Test 1: Bank Transfer Deposit**
1. Create booking with cash payment
2. Go to deposit payment page
3. Fill bank transfer info
4. Click "Tôi đã chuyển khoản"
5. Check email inbox for confirmation

**Test 2: VNPay Payment**
1. Create booking with VNPay payment
2. Complete VNPay sandbox payment
   - Card: `9704198526191432198`
   - Name: `NGUYEN VAN A`
   - Date: `07/15`
   - OTP: `123456`
3. Check email inbox after redirect

### Console Logs to Watch

```bash
✅ Tìm thấy payment: 123
✅ Thanh toán thành công, đang cập nhật dữ liệu...
✅ Đã gửi email xác nhận đến: customer@example.com
```

Or error:
```bash
❌ Lỗi gửi email xác nhận: SMTP connection failed
```

## Production Recommendations

### Use Professional Email Service
Replace Gmail with:
- **SendGrid** (Free 100 emails/day)
- **Mailgun** (Free 5000 emails/month)
- **Amazon SES** (Pay as you go)
- **Postmark** (Best deliverability)

### Why Not Gmail?
- Daily send limit (500 emails/day)
- May flag automated emails as spam
- Not designed for transactional emails
- No detailed analytics

### SendGrid Example Config
```bash
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASS=SG.xxxxxxxxxxxxxxxxxxxxx
MAIL_FROM=bookings@yourdomain.com
```

## Email Template Customization

### Modify HTML Template
Edit `server/src/utils/emailTemplates.js`:

```javascript
// Change colors
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
// -> your brand colors

// Add logo
<img src="https://yourdomain.com/logo.png" alt="Logo" />

// Modify sections
// Add/remove info rows in .booking-info
```

### Add More Email Types

Create new templates:
```javascript
// emailTemplates.js
function depositReminderEmail(bookingData) { ... }
function bookingCancellationEmail(bookingData) { ... }
```

## Troubleshooting

### Email Not Sending

**Check 1: SMTP Credentials**
```bash
# Test SMTP connection
node -e "require('./src/utils/mailer').sendEmail({
  to: 'test@example.com',
  subject: 'Test',
  text: 'Test email'
}).then(console.log).catch(console.error)"
```

**Check 2: Environment Variables**
```bash
echo $MAIL_HOST
echo $MAIL_USER
# Make sure they're loaded
```

**Check 3: Firewall/Port**
```bash
# Test SMTP port connectivity
telnet smtp.gmail.com 587
```

### Email Goes to Spam

**Solutions:**
1. Use professional email service (not Gmail)
2. Add SPF record to domain DNS
3. Add DKIM signature
4. Use verified domain in MAIL_FROM
5. Avoid spam trigger words in subject/body

### Guest Email Missing

Email requires `guest_info.email` field. Check:
```javascript
// In booking creation
guest_info: {
  name: "John Doe",
  email: "john@example.com",  // Required
  phone: "0123456789"
}
```

## Future Enhancements

- [ ] Email queue system (Bull/Redis)
- [ ] Email templates dashboard
- [ ] Multiple language support
- [ ] Email delivery tracking
- [ ] Retry failed emails
- [ ] Email preferences (user can opt-out)
- [ ] Payment receipt PDF attachment
- [ ] Calendar invite (ICS file)
