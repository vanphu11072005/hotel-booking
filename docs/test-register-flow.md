# Test Chức Năng Đăng Ký (Register)

## Mục đích
Kiểm tra flow đăng ký người dùng mới hoạt động chính xác từ frontend đến backend, bao gồm validation, tạo user, gửi email, và trả về token.

---

## Flow Tổng Quan

```
Client (RegisterPage.tsx)
    ↓
    POST /api/auth/register
    ↓
authRoutes.js → authValidator → authController.register
    ↓
authService.register
    ↓
authRepository (Database)
    ↓
Gửi welcome email
    ↓
Trả về: user, token, refreshToken (cookie)
```

---

## 1. Frontend - RegisterPage.tsx

**Vị trí:** `client/src/pages/auth/RegisterPage.tsx`

### Input Fields:
- `name` (string, 2-50 ký tự)
- `email` (string, phải là email hợp lệ)
- `password` (string, ≥8 ký tự, có chữ hoa, chữ thường, số)
- `phone` (optional, 10-11 số)

### Validation Frontend:
- Kiểm tra email format
- Kiểm tra password strength
- Kiểm tra phone format (nếu có)
- Hiển thị lỗi realtime

### API Call:
```typescript
// client/src/services/api/authService.ts
const register = async (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};
```

### Response Handling:
- **Success (201):**
  ```json
  {
    "status": "success",
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": 1,
        "full_name": "John Doe",
        "email": "john@example.com",
        "phone": "0123456789",
        "role_id": 3,
        "created_at": "2025-11-18T...",
        "updated_at": "2025-11-18T..."
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
  - Lưu `token` vào localStorage
  - `refreshToken` được set tự động qua cookie (HttpOnly)
  - Redirect đến homepage `/`

- **Error (400):**
  ```json
  {
    "status": "error",
    "message": "Email already registered"
  }
  ```
  - Hiển thị toast error

---

## 2. Backend - Route & Middleware

**Vị trí:** `server/src/routes/authRoutes.js`

```javascript
router.post(
  '/register',
  registerValidation,  // Validator middleware
  validate,            // Check validation errors
  authController.register
);
```

### Validation Rules (`authValidator.js`):

| Field    | Rules                                           |
|----------|-------------------------------------------------|
| name     | Required, 2-50 chars                           |
| email    | Required, valid email format                   |
| password | Required, ≥8 chars, chữ hoa + thường + số     |
| phone    | Optional, 10-11 digits                         |

---

## 3. Backend - Controller

**Vị trí:** `server/src/controllers/authController.js`

### register() Function:

```javascript
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const result = await authService.register({
      name,
      email,
      password,
      phone
    });

    // Set refreshToken cookie (7 days)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    };

    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    // Remove refreshToken from response body
    const { refreshToken, ...dataWithoutRefreshToken } = result;

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: dataWithoutRefreshToken
    });
  } catch (error) {
    if (error.message === 'Email already registered') {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
    next(error);
  }
};
```

---

## 4. Backend - Service Layer

**Vị trí:** `server/src/services/authService.js`

### register() Logic:

```javascript
async register(data) {
  const { name, email, password, phone } = data;

  // 1. Check email tồn tại
  const emailExists = await authRepository.isEmailExists(email);
  if (emailExists) {
    throw new Error('Email already registered');
  }

  // 2. Hash password (bcrypt, salt=10)
  const hashedPassword = await this.hashPassword(password);

  // 3. Tạo user trong DB (role_id = 3 = customer)
  const user = await authRepository.createUser({
    full_name: name,
    email,
    password: hashedPassword,
    phone,
    role_id: 3
  });

  // 4. Generate JWT tokens
  const { accessToken, refreshToken } = this.generateTokens(user.id);

  // 5. Lưu refreshToken vào DB (expires 7 days)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await authRepository.saveRefreshToken(
    user.id, 
    refreshToken, 
    expiresAt
  );

  // 6. Gửi welcome email (async, non-blocking)
  try {
    await sendEmail({
      to: user.email,
      subject: 'Chào mừng đến với Hotel Booking',
      html: `...welcome email template...`
    });
  } catch (err) {
    console.error('Failed to send welcome email:', err);
    // Không fail registration nếu email lỗi
  }

  // 7. Return user + tokens
  const userResponse = user.toJSON();
  delete userResponse.password;

  return {
    user: userResponse,
    token: accessToken,
    refreshToken
  };
}
```

### Token Generation:

```javascript
generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }  // 1 hour
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }  // 7 days
  );

  return { accessToken, refreshToken };
}
```

---

## 5. Backend - Repository (Database)

**Vị trí:** `server/src/repositories/authRepository.js`

### Database Operations:

```javascript
// 1. Check email exists
async isEmailExists(email) {
  const user = await User.findOne({ where: { email } });
  return !!user;
}

// 2. Create new user
async createUser(data) {
  return await User.create(data);
}

// 3. Save refresh token
async saveRefreshToken(userId, token, expiresAt) {
  return await RefreshToken.create({
    user_id: userId,
    token,
    expires_at: expiresAt
  });
}
```

### Database Tables:

**users table:**
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role_id INT DEFAULT 3,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**refresh_tokens table:**
```sql
CREATE TABLE refresh_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**roles table:**
```sql
CREATE TABLE roles (
  id INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL  -- 'admin', 'staff', 'customer'
);
```

---

## 6. Email Service

**Vị trí:** `server/src/utils/mailer.js`

### Welcome Email Template:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px;">
  <h2 style="color: #4F46E5;">Chào mừng [UserName]!</h2>
  <p>Cảm ơn bạn đã đăng ký tài khoản tại Hotel Booking.</p>
  <p>Email: <strong>[user.email]</strong></p>
  
  <div style="background-color: #F3F4F6; padding: 20px;">
    <strong>Bạn có thể:</strong>
    <ul>
      <li>Tìm kiếm và đặt phòng</li>
      <li>Quản lý đặt phòng</li>
      <li>Cập nhật thông tin cá nhân</li>
    </ul>
  </div>
  
  <a href="http://localhost:5173/login">Đăng nhập ngay</a>
</div>
```

### Config (`.env`):
```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=Hotel Booking <noreply@hotelbooking.com>
```

---

## 7. Test Cases

### Test Case 1: Đăng ký thành công
**Input:**
```json
{
  "name": "Nguyen Van A",
  "email": "vana@gmail.com",
  "password": "Password123",
  "phone": "0123456789"
}
```

**Expected:**
- Status: 201 Created
- Response chứa user object (không có password)
- Response chứa accessToken
- Cookie `refreshToken` được set (HttpOnly, 7 days)
- Email welcome được gửi
- User được tạo trong DB với role_id = 3
- RefreshToken được lưu trong DB

**Verify Database:**
```sql
SELECT * FROM users WHERE email = 'vana@gmail.com';
SELECT * FROM refresh_tokens WHERE user_id = [new_user_id];
```

---

### Test Case 2: Email đã tồn tại
**Input:**
```json
{
  "name": "Nguyen Van B",
  "email": "vana@gmail.com",  // Email trùng
  "password": "Password123",
  "phone": "0987654321"
}
```

**Expected:**
- Status: 400 Bad Request
- Response:
  ```json
  {
    "status": "error",
    "message": "Email already registered"
  }
  ```
- Không tạo user mới
- Không gửi email

---

### Test Case 3: Validation errors
**Input:**
```json
{
  "name": "A",                    // Too short (< 2 chars)
  "email": "invalid-email",       // Invalid format
  "password": "weak",             // Too short, no uppercase/number
  "phone": "123"                  // Invalid phone
}
```

**Expected:**
- Status: 400 Bad Request
- Response:
  ```json
  {
    "status": "error",
    "errors": [
      {
        "field": "name",
        "message": "Name must be between 2 and 50 characters"
      },
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      },
      {
        "field": "phone",
        "message": "Phone must be 10-11 digits"
      }
    ]
  }
  ```

---

### Test Case 4: Missing required fields
**Input:**
```json
{
  "name": "Nguyen Van C"
  // Missing email & password
}
```

**Expected:**
- Status: 400 Bad Request
- Response chứa validation errors cho email & password

---

### Test Case 5: Phone optional
**Input:**
```json
{
  "name": "Nguyen Van D",
  "email": "vand@gmail.com",
  "password": "Password123"
  // No phone
}
```

**Expected:**
- Status: 201 Created
- User được tạo với phone = null
- Các bước khác giống Test Case 1

---

## 8. Manual Testing với Postman

### Setup:
1. Import collection: `Hotel Booking API`
2. Set environment variables:
   - `BASE_URL`: `http://localhost:3000`

### Request:
```
POST {{BASE_URL}}/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "testuser@gmail.com",
  "password": "Test1234",
  "phone": "0123456789"
}
```

### Check Response:
- Status code: 201
- Body chứa user object
- Body chứa token
- Headers chứa `Set-Cookie: refreshToken=...`

### Verify Cookie:
```javascript
// Chrome DevTools > Application > Cookies
// Tìm cookie `refreshToken`:
- Name: refreshToken
- Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- HttpOnly: ✓
- Secure: (chỉ trong production)
- SameSite: Strict
- Expires: +7 days
```

---

## 9. Automated Testing với Jest

**Vị trí:** `server/tests/auth.test.js` (chưa có, cần tạo)

### Example Test:
```javascript
const request = require('supertest');
const app = require('../src/app');
const { User, RefreshToken } = require('../src/databases/models');

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    // Clear test data
    await RefreshToken.destroy({ where: {} });
    await User.destroy({ where: { email: 'test@example.com' } });
  });

  it('should register new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test1234',
        phone: '0123456789'
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user.email).toBe('test@example.com');
    expect(res.body.data.token).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();

    // Verify database
    const user = await User.findOne({ 
      where: { email: 'test@example.com' } 
    });
    expect(user).not.toBeNull();
    expect(user.role_id).toBe(3);
  });

  it('should reject duplicate email', async () => {
    // Create existing user
    await User.create({
      full_name: 'Existing User',
      email: 'test@example.com',
      password: 'hashed',
      role_id: 3
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'New User',
        email: 'test@example.com',
        password: 'Test1234'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email already registered');
  });

  it('should reject invalid data', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'A',
        email: 'invalid',
        password: 'weak'
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});
```

---

## 10. Security Considerations

### Password Security:
- ✅ Hash với bcrypt (salt rounds = 10)
- ✅ Không trả password trong response
- ✅ Validate độ mạnh password (uppercase, lowercase, number)

### Token Security:
- ✅ AccessToken: JWT, expires 1h, stored in localStorage
- ✅ RefreshToken: JWT, expires 7d, stored in HttpOnly cookie
- ✅ RefreshToken stored in DB với expires_at
- ✅ Cookie flags: HttpOnly, SameSite=strict, Secure (production)

### Email Enumeration Prevention:
- ⚠️ Hiện tại: API trả `"Email already registered"` → có thể enumerate
- ✅ Best practice: Luôn trả "If email exists, confirmation sent"

### Rate Limiting:
- ⚠️ Chưa implement
- 🔧 Nên thêm: express-rate-limit cho `/register` endpoint

---

## 11. Error Handling

### Possible Errors:

| Error | Status | Message | Cause |
|-------|--------|---------|-------|
| Validation | 400 | Validation errors | Invalid input |
| Duplicate email | 400 | Email already registered | Email exists in DB |
| DB error | 500 | Internal server error | Database connection/query failed |
| Email error | 201* | Success (log error) | SMTP failed (non-blocking) |

*Email failure không ảnh hưởng đến registration success

---

## 12. Environment Variables

### Required (.env):
```env
# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hotel_booking
DB_USER=root
DB_PASS=your-password

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=Hotel Booking <noreply@hotel.com>

# Client URL (for email links)
CLIENT_URL=http://localhost:5173

# Environment
NODE_ENV=development
```

---

## 13. Checklist Testing

### Pre-Test:
- [ ] Database running và có tables
- [ ] .env configured đúng
- [ ] SMTP credentials valid (test gửi email)
- [ ] Server running: `npm run dev`
- [ ] Client running: `npm run dev`

### Test Flow:
1. [ ] Frontend form validation works
2. [ ] API call được gửi đúng format
3. [ ] Backend validation catches invalid data
4. [ ] Duplicate email được reject
5. [ ] User created trong DB với role_id=3
6. [ ] Password được hash trong DB
7. [ ] RefreshToken saved trong DB
8. [ ] AccessToken returned trong response
9. [ ] RefreshToken set trong cookie
10. [ ] Welcome email được gửi
11. [ ] Frontend lưu token vào localStorage
12. [ ] Frontend redirect đến homepage
13. [ ] User có thể access protected routes
14. [ ] Token refresh works sau 1h

---

## 14. Common Issues & Solutions

### Issue 1: Email không được gửi
**Symptom:** Registration success nhưng không nhận được email

**Debug:**
```javascript
// Check logs
console.error('Failed to send welcome email:', err);

// Verify SMTP config
MAIL_HOST=smtp.gmail.com  // Correct host?
MAIL_PORT=587             // Correct port? (587 for TLS)
MAIL_USER=...             // Valid email?
MAIL_PASS=...             // App password (not regular password)
```

**Solution:**
- Dùng App Password cho Gmail (không phải password thường)
- Enable "Less secure app access" (hoặc dùng OAuth2)
- Check SMTP logs

---

### Issue 2: Cookie không được set
**Symptom:** RefreshToken không xuất hiện trong browser cookies

**Debug:**
```javascript
// Check response headers
Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict

// Check cookie settings
httpOnly: true,
secure: process.env.NODE_ENV === 'production',  // false in dev
sameSite: 'strict',
```

**Solution:**
- Development: `secure: false` để test localhost
- Production: `secure: true` + HTTPS required
- Check browser cookie settings (allow third-party cookies)

---

### Issue 3: CORS error
**Symptom:** Browser blocks API request

**Solution:**
```javascript
// server/src/app.js
app.use(cors({
  origin: 'http://localhost:5173',  // Client URL
  credentials: true                 // Allow cookies
}));
```

---

### Issue 4: Token expires quá nhanh
**Symptom:** User bị logout sau 1h

**Solution:**
- Implement token refresh logic trong frontend
- Gọi `/api/auth/refresh` trước khi accessToken expire
- Use axios interceptors

---

## 15. Next Steps

### Improvements:
1. [ ] Add rate limiting (express-rate-limit)
2. [ ] Add email verification (send verification code)
3. [ ] Add CAPTCHA (reCAPTCHA v3)
4. [ ] Add OAuth login (Google, Facebook)
5. [ ] Add phone verification (SMS OTP)
6. [ ] Add password strength meter (zxcvbn)
7. [ ] Add audit logs (track registrations)
8. [ ] Add analytics (track conversion)

### Testing:
1. [ ] Write unit tests (Jest)
2. [ ] Write integration tests (Supertest)
3. [ ] Write E2E tests (Playwright)
4. [ ] Add code coverage (Istanbul)
5. [ ] Setup CI/CD (GitHub Actions)

---

## Kết luận

Chức năng đăng ký hoạt động theo flow:
1. User nhập thông tin → Frontend validation
2. POST /api/auth/register → Backend validation
3. Check email duplicate → Hash password
4. Create user (role=customer) → Generate tokens
5. Save refreshToken → Send welcome email
6. Return token + set cookie → Frontend redirect

**Security:** Password hashed, tokens signed, HttpOnly cookies

**Testing:** Manual (Postman), Automated (Jest), E2E (Playwright)

**Next:** Test login flow, token refresh, forgot password
