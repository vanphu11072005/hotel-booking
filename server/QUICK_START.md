# 🚀 QUICK START - Server Setup

## Bước 1: Copy file .env
```bash
cd d:/hotel-booking/server
cp .env.example .env
```
> File .env đã được tạo sẵn với cấu hình mặc định

## Bước 2: Tạo Database (nếu chưa có)
```bash
# Mở MySQL command line
mysql -u root -p

# Tạo database
CREATE DATABASE hotel_db;

# Thoát
exit;
```

## Bước 3: Chạy Migrations
```bash
cd d:/hotel-booking/server
npm run migrate
```

Lệnh này sẽ tạo các bảng:
- roles
- users
- refresh_tokens
- rooms
- room_types
- bookings
- payments
- services
- service_usages
- promotions
- checkin_checkout
- banners
- password_reset_tokens
- reviews

## Bước 4: (Optional) Seed Data
```bash
npm run seed
```

Lệnh này sẽ tạo:
- 3 roles: admin, staff, customer
- Demo users
- Demo rooms & room types
- Demo bookings

## Bước 5: Start Server
```bash
npm run dev
```

Bạn sẽ thấy:
```
✅ Database connection established successfully
📊 Database models synced
🚀 Server running on port 3000
🌐 Environment: development
🔗 API: http://localhost:3000/api
🏥 Health: http://localhost:3000/health
```

## Bước 6: Test API

### Health Check
Mở browser: http://localhost:3000/health

### Test Login (sau khi seed data)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hotel.com","password":"Admin123"}'
```

## ⚠️ Troubleshooting

### Lỗi: "Access denied for user 'root'"
**Giải pháp:** Sửa DB_PASS trong file `.env`
```bash
DB_PASS=your_mysql_password
```

### Lỗi: "Unknown database 'hotel_db'"
**Giải pháp:** Tạo database thủ công (Bước 2)

### Lỗi: "Port 3000 already in use"
**Giải pháp:** Đổi PORT trong `.env`
```bash
PORT=3001
```

### Lỗi: "Cannot find module"
**Giải pháp:** Cài lại dependencies
```bash
npm install
```

## 📝 Next Steps

1. ✅ Server đang chạy
2. ✅ Database đã setup
3. ✅ API endpoints sẵn sàng
4. 🔜 Test với frontend login form
5. 🔜 Implement các API còn lại

## 🧪 Test với Postman

**Collection:** Hotel Booking API

### 1. Register
```
POST http://localhost:3000/api/auth/register
Body (JSON):
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test1234",
  "phone": "0123456789"
}
```

### 2. Login
```
POST http://localhost:3000/api/auth/login
Body (JSON):
{
  "email": "test@example.com",
  "password": "Test1234",
  "rememberMe": true
}
```

### 3. Get Profile
```
GET http://localhost:3000/api/auth/profile
Headers:
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## ✅ Checklist

- [ ] MySQL đang chạy
- [ ] File .env đã tạo và cấu hình đúng
- [ ] Database hotel_db đã tạo
- [ ] Migrations đã chạy thành công
- [ ] Server đang chạy (port 3000)
- [ ] Health check trả về 200 OK
- [ ] Frontend .env đã có VITE_API_URL=http://localhost:3000
- [ ] Frontend đang chạy (port 5173)

## 🎯 Ready to Test Login!

1. Server: http://localhost:3000 ✅
2. Client: http://localhost:5173 ✅
3. Login page: http://localhost:5173/login ✅
4. API endpoint: http://localhost:3000/api/auth/login ✅

**Tất cả sẵn sàng!** Giờ có thể test login form từ frontend! 🚀
