# tasks-admin.md
# Admin Panel Task Definition
# Module: Hotel Management & Booking Online
# Purpose: Define all admin pages, their API, UI logic, and expected behavior
# Format optimized for GitHub Copilot or AI-assisted code generation

---

## GLOBAL
role_required: ["admin"]
auth_method: "JWT"
ui_stack: ["React", "TypeScript", "TailwindCSS", "React Router", "Zustand", "Axios", "React Hot Toast"]
backend_stack: ["Node.js", "Express", "Sequelize (MySQL)"]

---

## PAGE: Admin Dashboard
route: /admin/dashboard
api:
  - GET /api/reports?from=&to=
  - GET /api/rooms
  - GET /api/bookings
  - GET /api/payments
features:
  - Display total revenue, total bookings, available rooms, new customers
  - Show revenue and bookings charts (line/bar)
  - Responsive cards with summary data
  - Auto refresh data on reload
ui:
  - Use Tailwind grid for layout
  - Use Chart.js or Recharts for visualization
success_criteria:
  - Dashboard updates correctly with real data
  - Charts render without layout shift

---

## PAGE: Room Management
route: /admin/rooms
api:
  - GET /api/rooms
  - POST /api/rooms
  - PUT /api/rooms/:id
  - DELETE /api/rooms/:id
features:
  - Display list of rooms with columns: name, type, price, status
  - Add/Edit modal with image upload (Multer)
  - Validate required fields
  - Filter by room type and availability
ui:
  - Table view + modal form
  - Tailwind form styling + toast notification
success_criteria:
  - CRUD operations work via API
  - Room list refreshes after update or delete

---

## PAGE: User Management
route: /admin/users
api:
  - GET /api/users
  - GET /api/users/:id
  - POST /api/users
  - PUT /api/users/:id
  - DELETE /api/users/:id
features:
  - Manage system users (Admin, Staff, Customer)
  - Create, update, delete users
  - Role assignment dropdown
  - Search + filter by role
ui:
  - Table list + modal edit
  - Prevent self-deletion
success_criteria:
  - Role filter works
  - Self-delete protection works

---

## PAGE: Booking Management
route: /admin/bookings
api:
  - GET /api/bookings
  - PUT /api/bookings/:id
  - PATCH /api/bookings/:id/cancel
features:
  - List bookings: customer, room, dates, status
  - Admin can cancel or confirm booking
  - View booking detail with payment info
ui:
  - Table with expandable row
  - Status badge color-coded
success_criteria:
  - API patch works
  - Status updates correctly

---

## PAGE: Payment Management
route: /admin/payments
api:
  - GET /api/payments
  - GET /api/payments/:bookingId
features:
  - List payments with booking info
  - Filter by date or method
  - Export CSV/Excel (optional)
ui:
  - Table with formatted currency and date
success_criteria:
  - Payments match booking records
  - Date and currency formatted (vi-VN)

---

## PAGE: Service Management
route: /admin/services
api:
  - GET /api/services
  - POST /api/services
  - PUT /api/services/:id
  - DELETE /api/services/:id
features:
  - CRUD hotel services
  - Columns: name, price, unit, status
  - Validate duplicate name
ui:
  - Table list + modal add/edit
success_criteria:
  - CRUD and validation working

---

## PAGE: Promotion Management
route: /admin/promotions
api:
  - GET /api/promotions
  - POST /api/promotions
  - PUT /api/promotions/:id
  - DELETE /api/promotions/:id
features:
  - Manage discount campaigns
  - Validate start/end date
  - Filter by active/expired
ui:
  - Table + modal form
success_criteria:
  - Correctly identify expired vs active promotions

---

## PAGE: Review Management
route: /admin/reviews
api:
  - GET /api/reviews
  - PATCH /api/reviews/:id/approve
  - PATCH /api/reviews/:id/reject
features:
  - Admin can approve or reject reviews
  - Filter by status (pending, approved, rejected)
  - Staff can view only
ui:
  - Table columns: user, room, rating, comment, createdAt, status, actions
  - Status color-coded: yellow (pending), green (approved), red (rejected)
  - Confirm modal before action
success_criteria:
  - Reviews update immediately after action
  - Toast notification appears

---

## PAGE: Report Center
route: /admin/reports
api:
  - GET /api/reports?from=&to=
features:
  - Show total bookings, revenue, and usage stats
  - Date range filter
  - Export CSV/Excel (optional)
ui:
  - Charts and summary cards
success_criteria:
  - Data updates dynamically by date range

---

## PAGE: Banner Management
route: /admin/banners
api:
  - GET /api/banners
  - POST /api/banners
  - PUT /api/banners/:id
  - DELETE /api/banners/:id
features:
  - CRUD homepage banners
  - Upload image with position select
ui:
  - Image preview + upload form
success_criteria:
  - Banners display correctly after save

---

## SECURITY AND ACCESS CONTROL
rules:
  - Only Admin can access `/admin/*`
  - Staff can access bookings, payments, and reviews (view only)
  - JWT token verification required
  - Redirect to /unauthorized if no permission
validation:
  - role = admin or staff required
  - useProtectedRoute() hook for front-end guard

---

## GLOBAL UX REQUIREMENTS
- Use React Hot Toast for all API notifications
- Use loading spinners during API calls
- Responsive design (mobile/tablet/desktop)
- Date formatting: `new Date(createdAt).toLocaleDateString('vi-VN')`
- Consistent color scheme across pages
- Smooth transitions on modals and table updates

---

## FINAL ACCEPTANCE CRITERIA
- [ ] All CRUD modules operational
- [ ] Role-based access verified
- [ ] Real API integration (MySQL)
- [ ] Unified UI/UX
- [ ] No console errors or 404s
- [ ] Approved reviews only appear on RoomDetailPage (user side)

---
