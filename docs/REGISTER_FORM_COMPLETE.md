# Chức năng 5: Form Đăng Ký - Hoàn Thành ✅

## 📦 Files Đã Tạo/Cập Nhật

### 1. **RegisterPage.tsx** - Component form đăng ký
**Đường dẫn:** `client/src/pages/auth/RegisterPage.tsx`

### 2. **index.ts** - Export module
**Đường dẫn:** `client/src/pages/auth/index.ts`
- Đã thêm export RegisterPage

### 3. **App.tsx** - Cập nhật routing
**Đường dẫn:** `client/src/App.tsx`
- Đã thêm route `/register`

## ✨ Tính Năng Chính

### 1. Form Fields (5 fields)
✅ **Họ và tên** (name)
- Required, 2-50 ký tự
- Icon: User
- Placeholder: "Nguyễn Văn A"

✅ **Email**
- Required, valid email format
- Icon: Mail
- Placeholder: "email@example.com"

✅ **Số điện thoại** (phone) - Optional
- 10-11 chữ số
- Icon: Phone
- Placeholder: "0123456789"

✅ **Mật khẩu** (password)
- Required, min 8 chars
- Must contain: uppercase, lowercase, number, special char
- Show/hide toggle với Eye icon
- Icon: Lock

✅ **Xác nhận mật khẩu** (confirmPassword)
- Must match password
- Show/hide toggle với Eye icon
- Icon: Lock

### 2. Password Strength Indicator
✅ **Visual Progress Bar** với 5 levels:
1. 🔴 Rất yếu (0/5)
2. 🟠 Yếu (1/5)
3. 🟡 Trung bình (2/5)
4. 🔵 Mạnh (3/5)
5. 🟢 Rất mạnh (5/5)

✅ **Real-time Requirements Checker:**
- ✅/❌ Ít nhất 8 ký tự
- ✅/❌ Chữ thường (a-z)
- ✅/❌ Chữ hoa (A-Z)
- ✅/❌ Số (0-9)
- ✅/❌ Ký tự đặc biệt (@$!%*?&)

### 3. Validation Rules (Yup Schema)

```typescript
name: 
  - Required: "Họ tên là bắt buộc"
  - Min 2 chars: "Họ tên phải có ít nhất 2 ký tự"
  - Max 50 chars: "Họ tên không được quá 50 ký tự"
  - Trim whitespace

email:
  - Required: "Email là bắt buộc"
  - Valid format: "Email không hợp lệ"
  - Trim whitespace

phone (optional):
  - Pattern /^[0-9]{10,11}$/
  - Error: "Số điện thoại không hợp lệ"

password:
  - Required: "Mật khẩu là bắt buộc"
  - Min 8 chars
  - Pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/
  - Error: "Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt"

confirmPassword:
  - Required: "Vui lòng xác nhận mật khẩu"
  - Must match password: "Mật khẩu không khớp"
```

### 4. UX Features

✅ **Loading State**
```tsx
{isLoading ? (
  <>
    <Loader2 className="animate-spin" />
    Đang xử lý...
  </>
) : (
  <>
    <UserPlus />
    Đăng ký
  </>
)}
```

✅ **Show/Hide Password** (2 toggles)
- Eye/EyeOff icons
- Separate toggle cho password và confirmPassword
- Visual feedback khi hover

✅ **Error Display**
- Inline validation errors dưới mỗi field
- Global error message ở top của form
- Red border cho fields có lỗi

✅ **Success Flow**
```typescript
1. Submit form
2. Validation passes
3. Call useAuthStore.register()
4. Show toast: "Đăng ký thành công! Vui lòng đăng nhập."
5. Navigate to /login
```

### 5. Design & Styling

**Color Scheme:**
- Primary: purple-600, purple-700
- Background: gradient from-purple-50 to-pink-100
- Success: green-500, green-600
- Error: red-50, red-200, red-600
- Text: gray-600, gray-700, gray-900

**Layout:**
```
┌─────────────────────────────────────┐
│   🏨 Hotel Icon (Purple)            │
│   Đăng ký tài khoản                 │
│   Tạo tài khoản mới để đặt phòng... │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ [Error message if any]        │  │
│  ├───────────────────────────────┤  │
│  │ Họ và tên                     │  │
│  │ [👤 Nguyễn Văn A          ]   │  │
│  ├───────────────────────────────┤  │
│  │ Email                         │  │
│  │ [📧 email@example.com     ]   │  │
│  ├───────────────────────────────┤  │
│  │ Số điện thoại (Tùy chọn)     │  │
│  │ [📱 0123456789            ]   │  │
│  ├───────────────────────────────┤  │
│  │ Mật khẩu                      │  │
│  │ [🔒 ••••••••            👁️] │  │
│  │ ▓▓▓▓▓░░░░░ Rất mạnh          │  │
│  │ ✅ Ít nhất 8 ký tự            │  │
│  │ ✅ Chữ thường (a-z)           │  │
│  │ ✅ Chữ hoa (A-Z)              │  │
│  │ ✅ Số (0-9)                   │  │
│  │ ✅ Ký tự đặc biệt             │  │
│  ├───────────────────────────────┤  │
│  │ Xác nhận mật khẩu             │  │
│  │ [🔒 ••••••••            👁️] │  │
│  ├───────────────────────────────┤  │
│  │      [👤 Đăng ký]             │  │
│  └───────────────────────────────┘  │
│  Đã có tài khoản? Đăng nhập ngay    │
│                                     │
│  Điều khoản & Chính sách bảo mật    │
└─────────────────────────────────────┘
```

## 🔗 Integration

### API Endpoint
```
POST /api/auth/register
```

### Request Body
```typescript
{
  name: string;      // "Nguyễn Văn A"
  email: string;     // "user@example.com"
  password: string;  // "Password123@"
  phone?: string;    // "0123456789" (optional)
}
```

### Response (Success)
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Nguyễn Văn A",
      "email": "user@example.com",
      "phone": "0123456789",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### useAuthStore Integration
```typescript
const { register: registerUser, isLoading, error, clearError } = 
  useAuthStore();

await registerUser({
  name: data.name,
  email: data.email,
  password: data.password,
  phone: data.phone,
});

// After success:
navigate('/login', { replace: true });
```

## 🧪 Test Scenarios

### 1. Validation Tests

**Test Case 1: Empty form**
```
Action: Submit empty form
Expected: Show validation errors for name, email, password
```

**Test Case 2: Invalid email**
```
Input: email = "notanemail"
Expected: "Email không hợp lệ"
```

**Test Case 3: Short name**
```
Input: name = "A"
Expected: "Họ tên phải có ít nhất 2 ký tự"
```

**Test Case 4: Weak password**
```
Input: password = "abc123"
Expected: "Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt"
Password strength: Yếu/Trung bình
```

**Test Case 5: Password mismatch**
```
Input: 
  password = "Password123@"
  confirmPassword = "Password456@"
Expected: "Mật khẩu không khớp"
```

**Test Case 6: Invalid phone**
```
Input: phone = "123"
Expected: "Số điện thoại không hợp lệ"
```

### 2. UX Tests

**Test Case 7: Password strength indicator**
```
Input: Type password character by character
Expected: 
  - Progress bar animates
  - Color changes: red → orange → yellow → blue → green
  - Checkmarks appear as requirements met
```

**Test Case 8: Show/hide password**
```
Action: Click eye icon on password field
Expected: Password text becomes visible/hidden
Action: Click eye icon on confirmPassword field
Expected: Confirm password text becomes visible/hidden
```

**Test Case 9: Loading state**
```
Action: Submit valid form
Expected: 
  - Button disabled
  - Spinner shows
  - Text changes to "Đang xử lý..."
```

### 3. Integration Tests

**Test Case 10: Successful registration**
```
Input: All valid data
Expected:
  1. API POST /api/auth/register called
  2. Toast: "Đăng ký thành công! Vui lòng đăng nhập."
  3. Redirect to /login
```

**Test Case 11: Email already exists**
```
Input: email = "existing@example.com"
Expected: 
  - Error message: "Email already registered"
  - Toast error displayed
  - Form remains on page
```

**Test Case 12: Network error**
```
Scenario: Server offline
Expected:
  - Error message: "Đăng ký thất bại. Vui lòng thử lại."
  - Toast error displayed
```

## 📊 Password Strength Algorithm

```typescript
function getPasswordStrength(pwd: string) {
  let strength = 0;
  
  if (pwd.length >= 8) strength++;        // +1
  if (/[a-z]/.test(pwd)) strength++;      // +1
  if (/[A-Z]/.test(pwd)) strength++;      // +1
  if (/\d/.test(pwd)) strength++;         // +1
  if (/[@$!%*?&]/.test(pwd)) strength++; // +1
  
  return {
    strength: 0-5,
    label: ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'][strength],
    color: ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'][strength]
  };
}
```

## 🎨 Component Structure

```tsx
RegisterPage/
├── Header Section
│   ├── Hotel Icon (purple)
│   ├── Title: "Đăng ký tài khoản"
│   └── Subtitle
│
├── Form Container (white card)
│   ├── Error Alert (conditional)
│   ├── Name Input
│   ├── Email Input
│   ├── Phone Input (optional)
│   ├── Password Input
│   │   ├── Show/Hide Toggle
│   │   ├── Strength Indicator
│   │   └── Requirements Checklist
│   ├── Confirm Password Input
│   │   └── Show/Hide Toggle
│   └── Submit Button (with loading)
│
├── Login Link
│   └── "Đã có tài khoản? Đăng nhập ngay"
│
└── Footer Links
    ├── Terms of Service
    └── Privacy Policy
```

## 🔐 Security Features

### 1. Password Validation
- Min 8 characters
- Requires: uppercase, lowercase, number, special char
- Visual feedback for strength

### 2. Confirm Password
- Must match original password
- Prevents typos

### 3. Client-side Validation
- Immediate feedback
- Prevents invalid API calls
- Better UX

### 4. Server-side Validation
- Backend also validates all fields
- Checks email uniqueness
- Password hashed with bcrypt

## 📝 Code Quality

✅ **TypeScript**: Full type safety
✅ **React Hook Form**: Optimized re-renders
✅ **Yup Validation**: Schema-based validation
✅ **Component Composition**: Reusable PasswordRequirement component
✅ **Accessibility**: Proper labels, IDs, autocomplete
✅ **Error Handling**: Try-catch, user-friendly messages
✅ **Loading States**: Visual feedback during async operations
✅ **Responsive Design**: Works on mobile and desktop
✅ **80 chars/line**: Code formatting standard

## 🚀 Usage

### Navigate to Register Page
```bash
http://localhost:5173/register
```

### Example Registration
```typescript
Name: "Nguyễn Văn A"
Email: "nguyenvana@example.com"
Phone: "0123456789"
Password: "Password123@"
Confirm: "Password123@"

Submit → Success → Redirect to /login
```

## 🔄 Flow Diagram

```
User visits /register
        ↓
Fill in form fields
        ↓
Real-time validation (Yup)
        ↓
Password strength updates live
        ↓
Submit button clicked
        ↓
Frontend validation passes
        ↓
Call useAuthStore.register()
        ↓
API POST /api/auth/register
        ↓
    ┌───────┴───────┐
    ↓               ↓
Success         Failure
    ↓               ↓
Toast success   Toast error
    ↓               ↓
Navigate        Stay on page
to /login       Show errors
```

## ✅ Checklist

- [x] ✅ Create RegisterPage.tsx component
- [x] ✅ Implement React Hook Form
- [x] ✅ Add Yup validation schema
- [x] ✅ Add 5 form fields (name, email, phone, password, confirmPassword)
- [x] ✅ Show/hide password toggle (2 fields)
- [x] ✅ Password strength indicator
- [x] ✅ Real-time requirements checker
- [x] ✅ Loading state
- [x] ✅ Error display (inline + global)
- [x] ✅ Integration with useAuthStore
- [x] ✅ Redirect to /login after success
- [x] ✅ Toast notifications
- [x] ✅ Add route to App.tsx
- [x] ✅ Responsive design
- [x] ✅ Purple color scheme
- [x] ✅ Icons integration (Lucide React)
- [x] ✅ Terms & Privacy links

## 📚 Related Files

- `client/src/pages/auth/LoginPage.tsx` - Login form (same design pattern)
- `client/src/utils/validationSchemas.ts` - Validation schemas
- `client/src/store/useAuthStore.ts` - Auth state management
- `client/src/services/api/authService.ts` - API calls
- `client/src/App.tsx` - Route configuration

---

**Status:** ✅ Chức năng 5 hoàn thành
**Next:** Chức năng 6 - Forgot Password
**Test URL:** http://localhost:5173/register
