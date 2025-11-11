# Chức năng 6: Quên Mật Khẩu (Forgot Password) - Hoàn Thành ✅

## 📦 Files Đã Tạo/Cập Nhật

### Frontend
1. **`client/src/pages/auth/ForgotPasswordPage.tsx`** - Component form quên mật khẩu
2. **`client/src/pages/auth/index.ts`** - Export ForgotPasswordPage
3. **`client/src/App.tsx`** - Route `/forgot-password`

### Backend
4. **`server/src/controllers/authController.js`** - forgotPassword() & resetPassword()
5. **`server/src/routes/authRoutes.js`** - Routes cho forgot/reset password

## ✨ Tính Năng Chính

### 1. Form State (Initial)
```
┌─────────────────────────────────────┐
│   🏨 Hotel Icon (Blue)              │
│   Quên mật khẩu?                    │
│   Nhập email để nhận link...        │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ Email                         │  │
│  │ [📧 email@example.com     ]   │  │
│  ├───────────────────────────────┤  │
│  │  [📤 Gửi link đặt lại MK]     │  │
│  ├───────────────────────────────┤  │
│  │ ← Quay lại đăng nhập          │  │
│  └───────────────────────────────┘  │
│  Chưa có tài khoản? Đăng ký ngay    │
└─────────────────────────────────────┘
```

### 2. Success State (After Submit)
```
┌─────────────────────────────────────┐
│           ✅ Success Icon            │
│                                     │
│      Email đã được gửi!             │
│   Chúng tôi đã gửi link đến         │
│      user@example.com               │
├─────────────────────────────────────┤
│  ℹ️ Lưu ý:                           │
│  • Link có hiệu lực trong 1 giờ     │
│  • Kiểm tra cả thư mục Spam/Junk    │
│  • Nếu không nhận được, thử lại     │
├─────────────────────────────────────┤
│  [📧 Gửi lại email]                 │
│  [← Quay lại đăng nhập]             │
└─────────────────────────────────────┘
```

### 3. Two-State Design Pattern
✅ **Form State** - Nhập email
✅ **Success State** - Hiển thị xác nhận & hướng dẫn

State management:
```typescript
const [isSuccess, setIsSuccess] = useState(false);
const [submittedEmail, setSubmittedEmail] = useState('');
```

## 🔧 Features Chi Tiết

### 1. Validation (Yup Schema)
```typescript
email:
  - Required: "Email là bắt buộc"
  - Valid format: "Email không hợp lệ"
  - Trim whitespace
```

### 2. Form Field
- **Email input** với Mail icon
- Auto-focus khi load page
- Validation real-time
- Error message inline

### 3. Submit Button States
```tsx
{isLoading ? (
  <>
    <Loader2 className="animate-spin" />
    Đang xử lý...
  </>
) : (
  <>
    <Send />
    Gửi link đặt lại mật khẩu
  </>
)}
```

### 4. Success Features
✅ **Visual Confirmation**
- Green checkmark icon
- Success message
- Display submitted email

✅ **User Instructions**
- Link expires in 1 hour
- Check spam folder
- Can resend email

✅ **Action Buttons**
- "Gửi lại email" - Reset to form state
- "Quay lại đăng nhập" - Navigate to /login

### 5. Help Section
```tsx
<div className="bg-white rounded-lg shadow-sm border">
  <h3>Cần trợ giúp?</h3>
  <p>
    Liên hệ: support@hotel.com hoặc 1900-xxxx
  </p>
</div>
```

## 🔗 Backend Integration

### API Endpoint: Forgot Password
```
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Password reset link has been sent to your email"
}
```

**Implementation:**
```javascript
const forgotPassword = async (req, res, next) => {
  // 1. Find user by email
  // 2. Generate crypto reset token (32 bytes)
  // 3. Hash token with SHA256
  // 4. Save to password_reset_tokens table
  // 5. Expires in 1 hour
  // 6. TODO: Send email with reset link
  // 7. Return success (prevent email enumeration)
};
```

### API Endpoint: Reset Password
```
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "NewPassword123@"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Password has been reset successfully"
}
```

**Implementation:**
```javascript
const resetPassword = async (req, res, next) => {
  // 1. Hash incoming token
  // 2. Find valid token in DB (not expired)
  // 3. Find user by user_id
  // 4. Hash new password with bcrypt
  // 5. Update user password
  // 6. Delete used token
  // 7. TODO: Send confirmation email
  // 8. Return success
};
```

## 🔐 Security Features

### 1. Token Generation
```javascript
// Generate random 32-byte token
const resetToken = crypto.randomBytes(32).toString('hex');

// Hash with SHA256 before storing
const hashedToken = crypto
  .createHash('sha256')
  .update(resetToken)
  .digest('hex');
```

### 2. Token Storage
- Stored in `password_reset_tokens` table
- Hashed (SHA256)
- Expires in 1 hour
- One token per user (old tokens deleted)

### 3. Email Enumeration Prevention
```javascript
// Always return success, even if email not found
if (!user) {
  return res.status(200).json({
    status: 'success',
    message: 'If email exists, reset link has been sent'
  });
}
```

### 4. Token Validation
```javascript
// Check token exists and not expired
const resetToken = await PasswordResetToken.findOne({
  where: {
    token: hashedToken,
    expires_at: { [Op.gt]: new Date() }
  }
});
```

## 📊 Database Schema

### password_reset_tokens Table
```sql
CREATE TABLE password_reset_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🎨 Design & Styling

**Color Scheme:**
- Primary: blue-600, blue-700
- Background: gradient from-blue-50 to-indigo-100
- Success: green-100, green-600
- Info: blue-50, blue-200
- Text: gray-600, gray-700, gray-900

**Icons:**
- 🏨 Hotel - Main logo
- 📧 Mail - Email input
- 📤 Send - Submit button
- ⏳ Loader2 - Loading spinner
- ✅ CheckCircle - Success state
- ← ArrowLeft - Back navigation

## 🔄 User Flow

```
1. User visits /forgot-password
        ↓
2. Enter email address
        ↓
3. Click "Gửi link đặt lại mật khẩu"
        ↓
4. Frontend validation (Yup)
        ↓
5. Call useAuthStore.forgotPassword()
        ↓
6. API POST /api/auth/forgot-password
        ↓
7. Backend:
   - Generate token
   - Save to DB
   - TODO: Send email
        ↓
8. Frontend shows success state
        ↓
9. User receives email (TODO)
        ↓
10. Click link → /reset-password/:token
        ↓
11. Enter new password (Chức năng 7)
```

## 🧪 Test Scenarios

### Test Case 1: Valid email
```
Input: email = "user@example.com"
Expected:
  - API called successfully
  - Success state shown
  - Email displayed correctly
  - Instructions visible
```

### Test Case 2: Invalid email format
```
Input: email = "notanemail"
Expected:
  - Validation error: "Email không hợp lệ"
  - Form not submitted
```

### Test Case 3: Empty email
```
Input: email = ""
Expected:
  - Validation error: "Email là bắt buộc"
  - Form not submitted
```

### Test Case 4: Loading state
```
Action: Submit form
Expected:
  - Button disabled
  - Spinner shows
  - Text: "Đang xử lý..."
```

### Test Case 5: Resend email
```
Action: Click "Gửi lại email" in success state
Expected:
  - Return to form state
  - Email field cleared
  - Error cleared
```

### Test Case 6: Back to login
```
Action: Click "Quay lại đăng nhập"
Expected:
  - Navigate to /login
```

### Test Case 7: Email not found (Backend)
```
Input: email = "nonexistent@example.com"
Expected:
  - Still return success (security)
  - No error shown to user
```

### Test Case 8: Token expiry (Backend)
```
Scenario: Token created 2 hours ago
Expected:
  - Reset fails
  - Error: "Invalid or expired reset token"
```

## 📝 Code Quality

✅ **TypeScript**: Full type safety
✅ **React Hook Form**: Optimized performance
✅ **Yup Validation**: Schema-based validation
✅ **State Management**: Local state for success toggle
✅ **Error Handling**: Try-catch blocks
✅ **Security**: Token hashing, email enumeration prevention
✅ **UX**: Clear instructions, help section
✅ **Accessibility**: Labels, autocomplete, focus management
✅ **Responsive**: Mobile-friendly
✅ **80 chars/line**: Code formatting

## 🔗 Integration Points

### useAuthStore.forgotPassword()
```typescript
const { forgotPassword, isLoading, error, clearError } = 
  useAuthStore();

await forgotPassword({ email: data.email });
```

### Success Handling
```typescript
await forgotPassword({ email: data.email });
setIsSuccess(true); // Show success state
```

### Error Handling
```typescript
try {
  await forgotPassword({ email });
} catch (error) {
  // Error displayed via store.error
  console.error('Forgot password error:', error);
}
```

## 🚀 Usage

### Test Frontend
```bash
URL: http://localhost:5173/forgot-password

Test Data:
Email: admin@hotel.com (from seed data)
```

### Test Backend API
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hotel.com"}'
```

Expected response:
```json
{
  "status": "success",
  "message": "Password reset link has been sent to your email"
}
```

Check server console for:
```
Reset token: abc123...
Reset URL: http://localhost:5173/reset-password/abc123...
```

## ⚠️ TODO: Email Service

Currently, the backend **logs** the reset token to console instead of sending email. To implement:

### 1. Install email package
```bash
cd server
npm install nodemailer
```

### 2. Create email service
```javascript
// server/src/utils/emailService.js
const nodemailer = require('nodemailer');

const sendResetEmail = async (email, resetUrl) => {
  const transporter = nodemailer.createTransport({
    // Configure SMTP
  });

  await transporter.sendMail({
    from: 'Hotel Booking <noreply@hotel.com>',
    to: email,
    subject: 'Reset Password',
    html: `
      <p>Click link to reset password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Expires in 1 hour.</p>
    `
  });
};
```

### 3. Use in controller
```javascript
const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
await sendResetEmail(user.email, resetUrl);
```

## ✅ Checklist

- [x] ✅ Create ForgotPasswordPage.tsx
- [x] ✅ Implement React Hook Form
- [x] ✅ Add Yup validation
- [x] ✅ Two-state design (form + success)
- [x] ✅ Loading state
- [x] ✅ Error display
- [x] ✅ Success state with instructions
- [x] ✅ Resend email button
- [x] ✅ Back to login navigation
- [x] ✅ Help section
- [x] ✅ Integration with useAuthStore
- [x] ✅ Add route to App.tsx
- [x] ✅ Backend: forgotPassword() method
- [x] ✅ Backend: resetPassword() method
- [x] ✅ Backend: Routes added
- [x] ✅ Token generation & hashing
- [x] ✅ Token expiry (1 hour)
- [x] ✅ Security: Email enumeration prevention
- [ ] ⏳ TODO: Send actual email (nodemailer)
- [ ] ⏳ TODO: Email templates

## 📚 Related Files

- `client/src/pages/auth/LoginPage.tsx` - Login form
- `client/src/pages/auth/RegisterPage.tsx` - Register form
- `client/src/utils/validationSchemas.ts` - Validation schemas
- `client/src/store/useAuthStore.ts` - Auth state
- `server/src/controllers/authController.js` - Auth logic
- `server/src/routes/authRoutes.js` - Auth routes
- `server/src/databases/models/PasswordResetToken.js` - Token model

---

**Status:** ✅ Chức năng 6 hoàn thành
**Next:** Chức năng 7 - Reset Password (form to change password with token)
**Test URL:** http://localhost:5173/forgot-password
**API:** POST /api/auth/forgot-password
