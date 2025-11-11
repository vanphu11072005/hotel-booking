# ✅ Server Backend - Setup Complete

## 📦 Files Created

### Core Server Files
1. **`.env`** - Environment configuration (với mật khẩu và secrets)
2. **`src/server.js`** - Server entry point với database connection
3. **`src/app.js`** - Express application setup với middleware

### Controllers
4. **`src/controllers/authController.js`** - Authentication logic
   - register()
   - login()
   - refreshAccessToken()
   - logout()
   - getProfile()

### Routes
5. **`src/routes/authRoutes.js`** - Auth endpoints
   - POST /api/auth/register
   - POST /api/auth/login
   - POST /api/auth/refresh-token
   - POST /api/auth/logout
   - GET /api/auth/profile

6. **`src/routes/userRoutes.js`** - User endpoints (placeholder)
7. **`src/routes/roomRoutes.js`** - Room endpoints (placeholder)
8. **`src/routes/bookingRoutes.js`** - Booking endpoints (placeholder)

### Middleware
9. **`src/middlewares/auth.js`** - JWT authentication
   - authenticateToken()
   - authorizeRoles()

10. **`src/middlewares/errorHandler.js`** - Global error handling
11. **`src/middlewares/validate.js`** - Validation middleware

### Validators
12. **`src/validators/authValidator.js`** - Validation rules
    - registerValidation
    - loginValidation
    - refreshTokenValidation

### Documentation
13. **`README.md`** - Server documentation
14. **`QUICK_START.md`** - Quick setup guide

## 🎯 Features Implemented

### Security
- ✅ JWT authentication (access + refresh tokens)
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ Rate limiting (100 req/15min)
- ✅ Input validation with express-validator

### Authentication Flow
- ✅ Register with email/password validation
- ✅ Login with email/password
- ✅ Remember me (7 days vs 1 day token expiry)
- ✅ Refresh token mechanism
- ✅ Logout with token cleanup
- ✅ Protected routes with JWT

### Error Handling
- ✅ Global error handler
- ✅ Sequelize error handling
- ✅ JWT error handling
- ✅ Validation error formatting
- ✅ Development vs production error responses

### Validation Rules

**Register:**
```javascript
- name: 2-50 chars, required
- email: valid email format, required, unique
- password: min 8 chars, uppercase + lowercase + number
- phone: 10-11 digits, optional
```

**Login:**
```javascript
- email: valid email format, required
- password: required
- rememberMe: boolean, optional
```

## 🗄️ Database Integration

### Models Used
- ✅ User model (full_name, email, password, phone, role_id)
- ✅ Role model (for role-based access)
- ✅ RefreshToken model (token storage)

### Associations
- User belongsTo Role
- User hasMany RefreshToken
- User hasMany Booking

## 🔐 JWT Configuration

```javascript
Access Token:
- Secret: JWT_SECRET
- Expiry: 1h
- Payload: { userId }

Refresh Token:
- Secret: JWT_REFRESH_SECRET
- Expiry: 7d (remember me) or 1d (normal)
- Payload: { userId }
- Stored in database (refresh_tokens table)
```

## 📡 API Endpoints Ready

### Public Endpoints
```
✅ GET  /health                    - Health check
✅ POST /api/auth/register         - User registration
✅ POST /api/auth/login            - User login
✅ POST /api/auth/refresh-token    - Refresh access token
✅ POST /api/auth/logout           - User logout
```

### Protected Endpoints
```
✅ GET  /api/auth/profile          - Get user profile (JWT required)
🔜 GET  /api/users                 - Get all users (Admin only)
🔜 GET  /api/rooms                 - Get rooms (Public)
🔜 GET  /api/bookings              - Get bookings (User's own)
```

## 🧪 Request/Response Examples

### Login Request
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "Password123",
  "rememberMe": true
}
```

### Login Response (Success)
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "phone": "0123456789",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login Response (Error)
```json
{
  "status": "error",
  "message": "Invalid email or password"
}
```

### Validation Error
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

## 🔧 Middleware Stack

```javascript
1. helmet()              - Security headers
2. compression()         - Response compression
3. cors()               - CORS handling
4. express.json()       - JSON body parser
5. morgan()             - Request logging
6. rateLimit()          - Rate limiting
7. Routes               - API routes
8. errorHandler()       - Global error handler
```

## ⚙️ Environment Variables

```bash
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=hotel_db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=7d

# Client
CLIENT_URL=http://localhost:5173
```

## 📋 Next Steps (Manual)

### 1. Database Setup
```bash
# Tạo database
mysql -u root -p
CREATE DATABASE hotel_db;

# Chạy migrations
cd d:/hotel-booking/server
npm run migrate

# (Optional) Seed data
npm run seed
```

### 2. Start Server
```bash
cd d:/hotel-booking/server
npm run dev
```

Expected output:
```
✅ Database connection established successfully
📊 Database models synced
🚀 Server running on port 3000
🌐 Environment: development
🔗 API: http://localhost:3000/api
🏥 Health: http://localhost:3000/health
```

### 3. Test API

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test1234",
    "phone": "0123456789"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "rememberMe": true
  }'
```

### 4. Test with Frontend

1. Make sure client .env has:
   ```
   VITE_API_URL=http://localhost:3000
   ```

2. Start frontend:
   ```bash
   cd d:/hotel-booking/client
   npm run dev
   ```

3. Navigate to: http://localhost:5173/login

4. Try to login with credentials from step 3

## 🎯 Integration Checklist

- [ ] MySQL server running
- [ ] Database `hotel_db` created
- [ ] Migrations executed successfully
- [ ] Server running on port 3000
- [ ] Health endpoint returns 200
- [ ] Frontend .env configured
- [ ] Frontend running on port 5173
- [ ] Login API working with Postman/curl
- [ ] Frontend login form connects to backend
- [ ] JWT tokens stored in localStorage
- [ ] Protected routes work after login

## 🔍 Troubleshooting

### Server won't start
- Check MySQL is running
- Check .env database credentials
- Check port 3000 is not in use

### Login returns 401
- Check email/password are correct
- Check user exists in database
- Check JWT_SECRET in .env

### CORS errors in frontend
- Check CLIENT_URL in server .env
- Check frontend is using correct API URL
- Check server CORS middleware

### Token expired immediately
- Check JWT_EXPIRES_IN in .env
- Check system clock is correct
- Check refresh token mechanism

## 📚 Code Quality

- ✅ Proper error handling with try-catch
- ✅ Async/await pattern
- ✅ Input validation before processing
- ✅ Password never returned in responses
- ✅ Proper HTTP status codes
- ✅ Consistent API response format
- ✅ Environment-based logging
- ✅ Rate limiting for security
- ✅ Token expiry management
- ✅ Database connection pooling

---

**Status:** ✅ Backend Setup Complete  
**Next:** Run migrations → Start server → Test login from frontend  
**Time to complete:** ~5 minutes manual setup

🎉 **Congratulations!** Backend API is ready for testing!
