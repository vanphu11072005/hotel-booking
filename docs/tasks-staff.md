# 🏨 Hotel Management System — Staff Module Specification

## 1. Overview
This document defines the operational features available to **Staff** in the Hotel Management & Booking System.  
Staff members handle hotel operations such as managing bookings, check-in, check-out, service usage, and payments.

---

## 2. Responsibilities of Staff
- Manage daily hotel operations  
- Handle customer check-in and check-out  
- Register service usage  
- Process payments  
- Update booking status  
- Support customers during their stay  

---

# 3. Staff Operational Modules

---

## 3.1 Booking Management

### Features:
- Search bookings by:
  - Booking number  
  - Customer name  
  - Date  
- View booking details  
- View room & guest info  
- Cancel booking (based on policy)  
- Update booking status  

---

## 3.2 Check-in Process

### Workflow:
1. Verify booking number  
2. Validate booking status  
3. Collect guest information (ID, number of guests, children, etc.)  
4. Assign actual room  
5. Add extra fees (additional guest, early check-in, etc.)  
6. Confirm check-in and update booking  

---

## 3.3 Check-out Process

### Staff can:
- Calculate:
  - Room charge  
  - Service usage  
  - Additional fees  
- Generate invoice  
- Deduct deposit (prepayment amount)  
- Process final payment  
- Complete check-out flow  

---

## 3.4 Service Usage Registration

### Features:
- Register services for a room
- Add service quantity  
- Auto-calculate service cost  
- Print service ticket (optional)  

---

## 3.5 Payment Management

### Staff can:
- Create payments  
- View payments by booking  
- Complete outstanding amounts  
- Print receipts  

---

# 4. Access Rules & Security

### Staff Role Limitations:
Staff **cannot**:
- Manage rooms / services / promotions  
- Manage users  
- Access system settings  
- Access security module  

### Security:
- JWT authentication required  
- Only operation-related routes permitted  
- Session timeout: 30 minutes  

---

# 5. Summary
Staff role focuses exclusively on hotel operational workflows:  
booking → check-in → service usage → payment → check-out.  
They do not manage system data or configurations.
