# 🏨 Hotel Management System — Admin Module Specification

## 1. Overview
This document defines the complete specifications for all **Admin** features in the Hotel Management & Booking System.  
Admin is the highest-privileged role responsible for system setup, configuration, and high-level hotel management.

---

## 2. Responsibilities of Admin
- Full access to all system modules  
- Manage hotel resources (rooms, services, promotions, banners)  
- Manage users and assign roles  
- View financial and operational reports  
- Oversee booking and operation workflows  

---

# 3. Modules and Features (Admin)

---

## 3.1 System Setup Module

### 3.1.1 Room Management
**Admin can:**
- Create room  
- Update room  
- Delete room *(only if no booking exists)*  
- Upload room images  

**Room fields include:**
- `roomId`
- `roomTypeId`
- `description`
- `size` (Single, Double, Twin…)
- `price`
- `pictures[]`

---

### 3.1.2 Room Type Management
**Admin can:**
- Create room type  
- Edit room type  
- Add multiple images  
- Setup default pricing  

**Room type fields:**
- `typeId`
- `name`
- `description`
- `basePrice`
- `images[]`

---

### 3.1.3 Service Management
**Admin can:**
- Add new service  
- Edit existing service  
- Remove service  

**Service fields:**
- `serviceId`
- `serviceName`
- `description`
- `unit`
- `price`
- `status`

---

### 3.1.4 Promotion Management
**Admin can:**
- Add promotion  
- Edit promotion  
- Delete promotion  
- Set rules and discount logic  

**Promotion fields:**
- `promoId`
- `name`
- `description`
- `value` (percentage or fixed amount)
- `code`
- `validFrom / validTo`

---

### 3.1.5 Banner Management
**Admin can:**
- Create banner  
- Edit banner  
- Delete banner  
- Configure position (home, about, etc.)

---

## 3.2 User & Security Module

### 3.2.1 User Management (Admin Only)
- Create user  
- Edit user  
- Delete user  
- View user details  
- List all users  
- Assign roles: `Admin`, `Manager`, `Staff`, `Customer`

### 3.2.2 Security Rules
- All privileged roles must authenticate with JWT  
- Password hashing via bcrypt  
- Session timeout after 30 minutes  
- Role-based API authorization  
- Refresh tokens stored securely  

---

## 3.3 Reports Module

Admin can generate reports within a selected date range.

**Report includes:**
- Booking list  
- Customer name  
- Room info  
- Total amount  
- Payment details  
- Booking status  
- Revenue summary  

**Export options:**
- Excel  
- PDF  

---

## 3.4 Operation Monitoring
Admin has *visibility* on all operations:
- Booking list  
- Check-in records  
- Check-out records  
- Payments  
- Service usage  

*(Staff executes operations, Admin oversees.)*

---

# 4. Summary
Admin is the full-control user responsible for hotel setup, configuration, user management, and business reporting.  
All high-level operations depend on Admin permissions.
