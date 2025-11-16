# Services Booking Integration

## Overview
Implemented the ability for users to select additional services when booking a room and calculate the total price including services.

## Changes Made

### Backend

#### 1. Updated Service Model
**File**: `server/src/databases/models/Service.js`
- Added `unit` field (string, default: 'lần')
- Added `status` field (enum: 'active', 'inactive', default: 'active')

#### 2. Created Migration
**File**: `server/src/databases/migrations/20250102000001-add-unit-status-to-services.js`
- Adds `unit` column to services table
- Adds `status` column to services table

#### 3. Updated Service Seeder
**File**: `server/src/databases/seeders/20250101000005-seed-services.js`
- Added `unit` field to all service records (phần, kg, đơn, lần, chuyến)
- Added `status: 'active'` to all service records

#### 4. Updated Booking Controller
**File**: `server/src/controllers/bookingController.js`
- Added `Service` and `ServiceUsage` to model imports
- Extract `services` array from request body
- Create `ServiceUsage` records for each selected service
- Store unit price and calculate total price per service
- Include service usages in booking response

### Frontend

#### 1. Updated Booking Validator
**File**: `client/src/validators/bookingValidator.ts`
- Added optional `services` array field to validation schema
- Each service has `service_id` (number) and `quantity` (number, min: 1)

#### 2. Updated Booking Data Type
**File**: `client/src/services/api/bookingService.ts`
- Added optional `services` field to `BookingData` interface

#### 3. Enhanced Booking Page
**File**: `client/src/pages/customer/BookingPage.tsx`

**State Management**:
- Added `services` state to store available services
- Added `selectedServices` state (Record<serviceId, quantity>)

**Data Fetching**:
- Created `fetchServices()` function to fetch active services
- Called on component mount

**UI Components**:
- Added "Dịch vụ bổ sung" section after booking details
- For each service, display:
  - Name and description
  - Price per unit
  - Quantity selector with +/- buttons and input field
  - Total calculated based on quantity

**Price Calculation**:
- `roomTotalPrice`: nights × room price
- `servicesTotalPrice`: sum of (service price × quantity) for all selected services
- `totalPrice`: roomTotalPrice + servicesTotalPrice

**Price Breakdown Display**:
- Show room total separately
- Show each selected service with quantity and subtotal
- Show services total
- Show grand total

**Form Submission**:
- Filter selected services (quantity > 0)
- Format as array: `[{ service_id, quantity }]`
- Include in booking data sent to API

## Database Schema

### services table (updated)
```sql
- id: INTEGER (PK)
- name: VARCHAR(100)
- description: TEXT
- price: DECIMAL(10,2)
- unit: VARCHAR(50) -- NEW: 'phần', 'kg', 'lần', etc.
- category: VARCHAR(50)
- status: ENUM('active', 'inactive') -- NEW
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### service_usages table (existing)
```sql
- id: INTEGER (PK)
- booking_id: INTEGER (FK -> bookings.id)
- service_id: INTEGER (FK -> services.id)
- quantity: INTEGER
- unit_price: DECIMAL(10,2)
- total_price: DECIMAL(10,2)
- usage_date: DATE
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## User Flow

1. User fills in booking form (dates, guests, etc.)
2. System fetches and displays available services
3. User can select services by adjusting quantity (default: 0)
4. Price automatically updates to include services
5. Booking summary shows detailed breakdown:
   - Room price (nights × rate)
   - Each selected service (name × quantity = subtotal)
   - Total services price
   - Grand total
6. On submission:
   - Booking is created with total price
   - ServiceUsage records are created for each selected service
   - User receives confirmation with all details

## Example Services

| ID | Name | Price | Unit | Category |
|----|------|-------|------|----------|
| 1 | Bữa sáng | 150,000đ | phần | Ăn uống |
| 4 | Giặt ủi nhanh | 100,000đ | kg | Giặt ủi |
| 7 | Massage truyền thống | 500,000đ | lần | Spa |
| 8 | Đón sân bay | 400,000đ | chuyến | Vận chuyển |
| 11 | Trả phòng muộn | 500,000đ | lần | Tiện ích |

## Testing

### Setup
1. Run migration: `cd server && npx sequelize-cli db:migrate`
2. If needed, reseed: `npx sequelize-cli db:seed:undo --seed 20250101000005-seed-services && npx sequelize-cli db:seed --seed 20250101000005-seed-services`

### Test Scenarios
1. **Basic booking without services**: Should work as before
2. **Booking with 1 service**: Select breakfast × 2, verify price includes 300,000đ
3. **Booking with multiple services**: Select breakfast + airport pickup, verify both are included
4. **Quantity adjustment**: Test +/- buttons and direct input
5. **Price calculation**: Verify all totals match (room + services)
6. **Backend verification**: Check `service_usages` table has correct records

## Future Enhancements

- [ ] Allow service selection after booking (in booking details page)
- [ ] Service categories/filters in booking UI
- [ ] Service recommendations based on room type
- [ ] Package deals (bundle services with discount)
- [ ] Service availability by date
- [ ] Service images/icons
- [ ] Popular services badge
- [ ] Service usage history/analytics

## Notes

- Services can only be selected for active status services
- Unit prices are stored in ServiceUsage to preserve pricing at time of booking
- Service selection is optional (empty services array is valid)
- Total price in booking includes both room and services
