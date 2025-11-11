# Hotel Booking Server - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

Edit `.env`:
```bash
DB_NAME=hotel_db
DB_USER=root
DB_PASS=your_password
JWT_SECRET=your-secret-key
```

### 3. Setup Database

**Option A: Using existing MySQL database**
```bash
# Create database
mysql -u root -p
CREATE DATABASE hotel_db;
exit;

# Run migrations
npm run migrate

# (Optional) Seed data
npm run seed
```

**Option B: Database will be created automatically**
- Just run the server
- Make sure MySQL is running
- Database will be created on first connection

### 4. Start Server
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

Server will be available at: `http://localhost:3000`

## 📡 API Endpoints

### Health Check
```bash
GET http://localhost:3000/health
```

### Authentication
```bash
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh-token
POST /api/auth/logout
GET  /api/auth/profile (Protected)
```

## 🧪 Test API

### Register New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "phone": "0123456789"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

## ✅ Server Features

- ✅ Express.js setup with security middleware
- ✅ JWT authentication (access + refresh tokens)
- ✅ Password hashing with bcrypt
- ✅ Input validation with express-validator
- ✅ Error handling middleware
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Request logging with Morgan
- ✅ Compression middleware
- ✅ Helmet security headers

## 📁 Project Structure
```
server/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/
│   │   └── authController.js    # Auth logic
│   ├── databases/
│   │   ├── migrations/          # Database migrations
│   │   ├── models/              # Sequelize models
│   │   └── seeders/             # Seed data
│   ├── middlewares/
│   │   ├── auth.js              # JWT verification
│   │   ├── errorHandler.js     # Global error handler
│   │   └── validate.js          # Validation middleware
│   ├── routes/
│   │   ├── authRoutes.js        # Auth routes
│   │   ├── userRoutes.js        # User routes
│   │   ├── roomRoutes.js        # Room routes
│   │   └── bookingRoutes.js     # Booking routes
│   ├── validators/
│   │   └── authValidator.js     # Auth validation rules
│   ├── app.js                   # Express app setup
│   └── server.js                # Server entry point
├── .env                         # Environment variables
├── .env.example                 # Environment template
└── package.json
```

## 🔧 Troubleshooting

### Database Connection Error
```
Error: Access denied for user 'root'@'localhost'
```
**Solution:** Check DB_USER and DB_PASS in .env

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:** Change PORT in .env or kill process using port 3000

### JWT Secret Warning
```
Warning: Using default JWT secret
```
**Solution:** Set JWT_SECRET in .env to a strong random string

## 📝 Notes

- Default customer role_id = 3
- Access token expires in 1 hour
- Refresh token expires in 7 days (or 1 day without "Remember Me")
- Password must contain uppercase, lowercase, and number
- Password minimum length: 8 characters
