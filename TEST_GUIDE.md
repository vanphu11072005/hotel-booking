# 🧪 Test Credentials & Quick Commands

## 🚀 Khởi động nhanh

### Terminal 1: Start Server
```bash
cd d:/hotel-booking/server
npm run dev
```

### Terminal 2: Start Client
```bash
cd d:/hotel-booking/client
npm run dev
```

## 📝 Test với cURL

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@test.com\",\"password\":\"Test1234\",\"phone\":\"0123456789\"}"
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@test.com\",\"password\":\"Test1234\",\"rememberMe\":true}"
```

## 🔐 Test Credentials (sau khi seed)

### Admin Account
```
Email: admin@hotel.com
Password: Admin123
Role: admin
```

### Staff Account
```
Email: staff@hotel.com
Password: Staff123
Role: staff
```

### Customer Account
```
Email: customer@hotel.com
Password: Customer123
Role: customer
```

## 🌐 URLs

- **Server API:** http://localhost:3000/api
- **Server Health:** http://localhost:3000/health
- **Client App:** http://localhost:5173
- **Login Page:** http://localhost:5173/login

## 📋 Database Commands

### Create Database
```bash
mysql -u root -p
```
```sql
CREATE DATABASE hotel_db;
SHOW DATABASES;
USE hotel_db;
exit;
```

### Run Migrations
```bash
cd d:/hotel-booking/server
npm run migrate
```

### Seed Database
```bash
npm run seed
```

### Undo Last Migration
```bash
npm run migrate:undo
```

### Undo All Seeds
```bash
npm run seed:undo
```

## 🧪 Postman Collection

### Register
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test1234",
  "phone": "0123456789"
}
```

### Login
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test1234",
  "rememberMe": true
}
```

### Get Profile (Protected)
```
GET http://localhost:3000/api/auth/profile
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

### Refresh Token
```
POST http://localhost:3000/api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
}
```

### Logout
```
POST http://localhost:3000/api/auth/logout
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
}
```

## 🔍 Debug Commands

### Check MySQL Connection
```bash
mysql -u root -p -e "SELECT 1"
```

### Check Database Exists
```bash
mysql -u root -p -e "SHOW DATABASES LIKE 'hotel%'"
```

### Check Tables
```bash
mysql -u root -p hotel_db -e "SHOW TABLES"
```

### Check Users Table
```bash
mysql -u root -p hotel_db -e "SELECT id, full_name, email, role_id FROM users"
```

### Check Roles Table
```bash
mysql -u root -p hotel_db -e "SELECT * FROM roles"
```

## 🐛 Common Issues

### Port 3000 in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Change port in .env
PORT=3001
```

### Database connection refused
```bash
# Check MySQL service
net start | findstr MySQL

# Start MySQL
net start MySQL80
```

### Cannot find module
```bash
cd d:/hotel-booking/server
npm install
```

## 💡 Tips

### Quick Test Login Flow
1. Start server: `cd d:/hotel-booking/server && npm run dev`
2. Start client: `cd d:/hotel-booking/client && npm run dev`
3. Open: http://localhost:5173/login
4. Register new user or use seeded credentials
5. Check browser DevTools > Network > login request
6. Check browser DevTools > Application > Local Storage > token

### Watch Server Logs
Look for these messages:
- ✅ Database connection established
- 🚀 Server running on port 3000
- Request logs from Morgan

### Test API Response
```bash
# Pretty print JSON with jq (if installed)
curl http://localhost:3000/health | jq

# Save response to file
curl http://localhost:3000/api/auth/login -d '...' > response.json
```

---

**Quick Start Checklist:**
- [ ] MySQL running
- [ ] Database created
- [ ] Migrations run
- [ ] Server started (port 3000)
- [ ] Client started (port 5173)
- [ ] Test login from browser
- [ ] Check token in localStorage

🎯 **Ready to test!**
