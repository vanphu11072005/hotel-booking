# Chức năng 4: Form Đăng Nhập - Hướng Dẫn Sử Dụng

## 📋 Tổng Quan

Form đăng nhập đã được triển khai đầy đủ với:
- ✅ Validation form bằng React Hook Form + Yup
- ✅ Hiển thị/ẩn mật khẩu
- ✅ Checkbox "Nhớ đăng nhập" (7 ngày)
- ✅ Loading state trong quá trình đăng nhập
- ✅ Hiển thị lỗi từ server
- ✅ Redirect sau khi đăng nhập thành công
- ✅ UI đẹp với Tailwind CSS và Lucide Icons
- ✅ Responsive design

## 🗂️ Các File Đã Tạo/Cập Nhật

### 1. **LoginPage.tsx** - Component form đăng nhập
**Đường dẫn:** `client/src/pages/auth/LoginPage.tsx`

```typescript
// Các tính năng chính:
- React Hook Form với Yup validation
- Show/hide password toggle
- Remember me checkbox
- Loading state với spinner
- Error handling
- Redirect với location state
```

### 2. **index.ts** - Export module
**Đường dẫn:** `client/src/pages/auth/index.ts`

```typescript
export { default as LoginPage } from './LoginPage';
```

### 3. **App.tsx** - Đã cập nhật routing
**Đường dẫn:** `client/src/App.tsx`

```typescript
// Đã thêm:
import { LoginPage } from './pages/auth';

// Route:
<Route path="/login" element={<LoginPage />} />
```

## 🎨 Cấu Trúc UI

### Layout
```
┌─────────────────────────────────────┐
│   🏨 Hotel Icon                     │
│   Đăng nhập                         │
│   Chào mừng bạn trở lại...          │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ [Error message if any]        │  │
│  ├───────────────────────────────┤  │
│  │ Email                         │  │
│  │ [📧 email@example.com       ] │  │
│  ├───────────────────────────────┤  │
│  │ Mật khẩu                      │  │
│  │ [🔒 ••••••••            👁️] │  │
│  ├───────────────────────────────┤  │
│  │ ☑️ Nhớ đăng nhập              │  │
│  │              Quên mật khẩu? → │  │
│  ├───────────────────────────────┤  │
│  │      [🔐 Đăng nhập]           │  │
│  └───────────────────────────────┘  │
│  Chưa có tài khoản? Đăng ký ngay    │
│                                     │
│  Điều khoản & Chính sách bảo mật    │
└─────────────────────────────────────┘
```

## 🔧 Cách Sử Dụng

### 1. Truy Cập Form

```bash
# URL
http://localhost:5173/login
```

### 2. Các Trường Trong Form

| Trường | Type | Bắt buộc | Validation |
|--------|------|----------|------------|
| Email | text | ✅ | Email hợp lệ |
| Password | password | ✅ | Min 8 ký tự |
| Remember Me | checkbox | ❌ | Boolean |

### 3. Validation Rules

**Email:**
```typescript
- Required: "Email là bắt buộc"
- Valid email format: "Email không hợp lệ"
- Trim whitespace
```

**Password:**
```typescript
- Required: "Mật khẩu là bắt buộc"
- Min 8 characters: "Mật khẩu phải có ít nhất 8 ký tự"
```

### 4. Luồng Đăng Nhập

```
1. User nhập email + password
2. Click "Đăng nhập"
3. Validation form (client-side)
4. Nếu valid:
   - Button disabled + hiển thị loading
   - Gọi useAuthStore.login()
   - API POST /api/auth/login
5. Nếu thành công:
   - Lưu token vào localStorage
   - Update Zustand state
   - Redirect đến /dashboard
6. Nếu lỗi:
   - Hiển thị error message
   - Button enabled lại
```

## 🎯 Tính Năng Chính

### 1. Show/Hide Password

```typescript
const [showPassword, setShowPassword] = useState(false);

// Toggle button
<button onClick={() => setShowPassword(!showPassword)}>
  {showPassword ? <EyeOff /> : <Eye />}
</button>

// Input type
<input type={showPassword ? 'text' : 'password'} />
```

### 2. Remember Me (7 ngày)

```typescript
// Checkbox
<input {...register('rememberMe')} type="checkbox" />

// Logic trong authService.login()
if (rememberMe) {
  // Token sẽ được lưu trong localStorage
  // và không bị xóa khi đóng trình duyệt
}
```

### 3. Loading State

```typescript
// Button disabled khi đang loading
<button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="animate-spin" />
      Đang xử lý...
    </>
  ) : (
    <>
      <LogIn />
      Đăng nhập
    </>
  )}
</button>
```

### 4. Error Handling

```typescript
// Error từ Zustand store
const { error } = useAuthStore();

// Hiển thị error message
{error && (
  <div className="bg-red-50 border border-red-200">
    {error}
  </div>
)}
```

### 5. Redirect Logic

```typescript
// Lấy location state từ ProtectedRoute
const location = useLocation();

// Redirect về trang trước đó hoặc dashboard
const from = location.state?.from?.pathname || '/dashboard';
navigate(from, { replace: true });
```

## 🔗 Integration với Zustand Store

```typescript
// Hook usage
const { 
  login,      // Function để login
  isLoading,  // Loading state
  error,      // Error message
  clearError  // Clear error
} = useAuthStore();

// Login call
await login({
  email: 'user@example.com',
  password: 'password123',
  rememberMe: true
});
```

## 🎨 Styling với Tailwind

### Color Scheme
```
- Primary: blue-600, blue-700
- Background: gradient from-blue-50 to-indigo-100
- Error: red-50, red-200, red-600, red-700
- Text: gray-600, gray-700, gray-900
```

### Responsive Design
```typescript
// Container
className="max-w-md w-full"  // Max width 28rem

// Grid (nếu có)
className="grid grid-cols-1 md:grid-cols-2"
```

## 🧪 Testing Scenarios

### 1. Validation Testing

**Test Case 1: Empty form**
```
- Input: Submit form trống
- Expected: Hiển thị lỗi "Email là bắt buộc"
```

**Test Case 2: Invalid email**
```
- Input: Email = "notanemail"
- Expected: "Email không hợp lệ"
```

**Test Case 3: Short password**
```
- Input: Password = "123"
- Expected: "Mật khẩu phải có ít nhất 8 ký tự"
```

### 2. Authentication Testing

**Test Case 4: Valid credentials**
```
- Input: Valid email + password
- Expected: Redirect to /dashboard
```

**Test Case 5: Invalid credentials**
```
- Input: Wrong password
- Expected: Error message từ server
```

**Test Case 6: Network error**
```
- Input: Server offline
- Expected: Error message "Có lỗi xảy ra"
```

### 3. UX Testing

**Test Case 7: Show/hide password**
```
- Action: Click eye icon
- Expected: Password text visible/hidden
```

**Test Case 8: Remember me**
```
- Action: Check "Nhớ đăng nhập"
- Expected: Token persist sau khi reload
```

**Test Case 9: Loading state**
```
- Action: Submit form
- Expected: Button disabled, spinner hiển thị
```

## 🔐 Security Features

### 1. Password Visibility
```typescript
// Default: password hidden
type="password"

// Toggle: user control
onClick={() => setShowPassword(!showPassword)}
```

### 2. HTTPS Only (Production)
```typescript
// Trong .env
VITE_API_URL=https://api.yourdomain.com
```

### 3. Token Storage
```typescript
// LocalStorage cho remember me
if (rememberMe) {
  localStorage.setItem('token', token);
}

// SessionStorage cho session only
else {
  sessionStorage.setItem('token', token);
}
```

## 📝 Best Practices

### 1. Form Validation
```typescript
✅ Client-side validation (Yup)
✅ Server-side validation (Express validator)
✅ Immediate feedback
✅ Clear error messages
```

### 2. Error Handling
```typescript
✅ Try-catch blocks
✅ User-friendly messages
✅ Clear error state
✅ Console logging for debugging
```

### 3. UX
```typescript
✅ Loading indicators
✅ Disabled states
✅ Auto-focus first field
✅ Enter key submit
✅ Remember form state
```

## 🚀 Next Steps (Chức năng 5-7)

1. **Chức năng 5: Form Register**
   - Copy structure từ LoginPage
   - Thêm fields: name, phone, confirmPassword
   - Use registerSchema
   - Redirect to /login after success

2. **Chức năng 6: Forgot Password**
   - Simple form với email only
   - Send reset link
   - Success message

3. **Chức năng 7: Reset Password**
   - Form với password + confirmPassword
   - Token từ URL params
   - Redirect to /login after success

## 🐛 Troubleshooting

### Issue 1: "Error: Token expired"
```typescript
Solution: Check token expiry time
- Access token: 1 hour
- Refresh token: 7 days
```

### Issue 2: Form không submit
```typescript
Solution: Check console for validation errors
- Open DevTools > Console
- Look for Yup validation errors
```

### Issue 3: Redirect không hoạt động
```typescript
Solution: Check location state
console.log(location.state?.from);
```

### Issue 4: Remember me không work
```typescript
Solution: Check localStorage
- Open DevTools > Application > Local Storage
- Check "token" và "refreshToken" keys
```

## 📚 Resources

- [React Hook Form Docs](https://react-hook-form.com/)
- [Yup Validation](https://github.com/jquense/yup)
- [Zustand Guide](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

## ✅ Checklist

- [x] ✅ Create validationSchemas.ts
- [x] ✅ Create LoginPage.tsx
- [x] ✅ Add route to App.tsx
- [x] ✅ Email validation
- [x] ✅ Password validation
- [x] ✅ Show/hide password
- [x] ✅ Remember me checkbox
- [x] ✅ Loading state
- [x] ✅ Error display
- [x] ✅ Redirect after login
- [x] ✅ Responsive design
- [x] ✅ Icons integration
- [ ] ⏳ E2E testing

---

**Status:** ✅ Chức năng 4 hoàn thành
**Next:** Chức năng 5 - Form Register
