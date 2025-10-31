# 🚀 Quick Setup Guide

## Step-by-Step Setup

### 1. Create Database
```bash
mysql -u root -p
```
```sql
CREATE DATABASE hotel_booking_dev;
EXIT;
```

### 2. Configure Environment
The `.env` file is already created. Update if needed:
```env
DB_USER=root
DB_PASS=your_password
DB_NAME=hotel_booking_dev
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Migrations
```bash
npm run migrate
```

### 5. Seed Database (Optional)
```bash
npm run seed
```

### 6. Start Server
```bash
npm run dev
```

## ✅ Verification

### Test Server Health
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2025-01-30T..."
}
```

### Test API Endpoints
```bash
# Get all rooms (not implemented yet, returns 501)
curl http://localhost:3000/api/rooms

# Auth endpoints
curl http://localhost:3000/api/auth/login
```

## 📋 What's Created

✅ **Server Files:**
- `src/app.js` - Express application
- `src/server.js` - Server entry point
- `.env` - Environment configuration

✅ **Database:**
- 12 migrations
- 13 models
- 11 seeders

✅ **Routes (Placeholders):**
- Auth routes
- User routes
- Room routes
- Booking routes
- Payment routes
- Service routes
- Promotion routes
- Banner routes
- Operation routes

✅ **Utils:**
- JWT utilities
- Response helpers
- General helpers

## 🎯 Next Steps

The server is now ready to run, but routes are not implemented yet.

**Next phase:**
1. Create Controllers
2. Create Middlewares (Auth, Validation, Upload)
3. Implement all API endpoints
4. Add validators

## 🔐 Test Credentials (After seeding)

**Admin:**
- Email: `admin@hotel.com`
- Password: `password123`

**Staff:**
- Email: `staff@hotel.com`
- Password: `password123`

**Customer:**
- Email: `customer1@gmail.com`
- Password: `password123`

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check MySQL is running
sudo service mysql status  # Linux
brew services list         # macOS
net start MySQL            # Windows

# Test connection
mysql -u root -p
```

### Migration Errors
```bash
# Undo all migrations
npm run migrate:undo

# Run migrations again
npm run migrate
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

## 📞 Support

If you encounter issues:
1. Check `.env` configuration
2. Verify database credentials
3. Ensure MySQL is running
4. Check Node.js version (>= 18)
