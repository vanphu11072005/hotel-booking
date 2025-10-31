# Database Seeders

This directory contains seed data for the hotel booking system.

## Seed Files (in order)

1. **20250101000001-seed-roles.js**
   - 3 roles: admin, staff, customer

2. **20250101000002-seed-users.js**
   - 6 users (1 admin, 2 staff, 3 customers)
   - Default password: `password123`

3. **20250101000003-seed-room-types.js**
   - 5 room types: Standard Single, Standard Double, Deluxe, 
     Family Suite, Presidential Suite

4. **20250101000004-seed-rooms.js**
   - 60+ rooms across 10 floors with varying statuses

5. **20250101000005-seed-services.js**
   - 17 services across categories: Food & Beverage, Laundry, 
     Spa & Wellness, Transportation, Room Extras

6. **20250101000006-seed-promotions.js**
   - 7 active promotions with different discount types

7. **20250101000007-seed-banners.js**
   - 6 banners for home and services pages

8. **20250101000008-seed-bookings.js**
   - 6 bookings with various statuses (pending, confirmed, 
     checked_in, checked_out, cancelled)

9. **20250101000009-seed-payments.js**
   - 6 payment records matching bookings

10. **20250101000010-seed-service-usages.js**
    - 8 service usage records for active bookings

11. **20250101000011-seed-checkin-checkout.js**
    - 2 check-in/checkout records

## Usage

### Run all seeders
```bash
npx sequelize-cli db:seed:all
```

### Run specific seeder
```bash
npx sequelize-cli db:seed --seed 
  20250101000001-seed-roles.js
```

### Undo all seeders
```bash
npx sequelize-cli db:seed:undo:all
```

### Undo specific seeder
```bash
npx sequelize-cli db:seed:undo --seed 
  20250101000001-seed-roles.js
```

## Sample Login Credentials

### Admin
- Email: `admin@hotel.com`
- Password: `password123`

### Staff
- Email: `staff@hotel.com` or `staff2@hotel.com`
- Password: `password123`

### Customer
- Email: `customer1@gmail.com`, `customer2@gmail.com`, 
  or `customer3@gmail.com`
- Password: `password123`

## Data Summary

- **Users**: 6 (1 admin, 2 staff, 3 customers)
- **Roles**: 3 (admin, staff, customer)
- **Room Types**: 5
- **Rooms**: 60+
- **Services**: 17
- **Promotions**: 7
- **Banners**: 6
- **Bookings**: 6 (with various statuses)
- **Payments**: 6
- **Service Usages**: 8
- **Check-in/out Records**: 2

## Notes

- All users share the same password for testing: `password123`
- Passwords are hashed using bcrypt
- Booking dates are relative to current date for realistic 
  testing
- Some rooms are marked as occupied, cleaning, or maintenance
- Promotions are active for 6 months from seed date
