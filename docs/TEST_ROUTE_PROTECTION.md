# Test Scenarios - Route Protection (Chức năng 8)

## Test Setup

### Test Users
```javascript
// Admin user
{
  email: "admin@hotel.com",
  password: "Admin@123",
  role: "admin"
}

// Customer user
{
  email: "customer@hotel.com",
  password: "Customer@123",
  role: "customer"
}

// Staff user
{
  email: "staff@hotel.com",
  password: "Staff@123",
  role: "staff"
}
```

---

## Test Case 1: ProtectedRoute - Unauthenticated User

### Objective
Verify that unauthenticated users cannot access protected routes.

### Steps
1. Open browser (incognito mode)
2. Navigate to `http://localhost:5173/dashboard`

### Expected Result
- ✅ Redirected to `/login`
- ✅ URL shows `/login`
- ✅ Login form displayed
- ✅ No error in console
- ✅ Location state contains `from: '/dashboard'`

### Actual Result
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test Case 2: ProtectedRoute - Authenticated User

### Objective
Verify that authenticated users can access protected routes.

### Steps
1. Login as customer (`customer@hotel.com` / `Customer@123`)
2. Navigate to `http://localhost:5173/dashboard`

### Expected Result
- ✅ Dashboard page displayed successfully
- ✅ URL shows `/dashboard`
- ✅ No redirect to login
- ✅ Navbar shows user info
- ✅ Logout button visible

### Actual Result
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test Case 3: ProtectedRoute - Redirect After Login

### Objective
Verify that users are redirected back to original page after login.

### Steps
1. Logout (if logged in)
2. Navigate to `http://localhost:5173/bookings` (protected)
3. Should redirect to `/login`
4. Login with valid credentials
5. Observe redirect behavior

### Expected Result
- ✅ Step 2: Redirected to `/login`
- ✅ Step 4: Login successful
- ✅ Step 5: Redirected back to `/bookings` (original page)
- ✅ URL shows `/bookings`
- ✅ BookingListPage displayed

### Actual Result
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test Case 4: AdminRoute - Unauthenticated User

### Objective
Verify that unauthenticated users cannot access admin routes.

### Steps
1. Open browser (incognito mode)
2. Navigate to `http://localhost:5173/admin`

### Expected Result
- ✅ Redirected to `/login`
- ✅ URL shows `/login`
- ✅ Login form displayed
- ✅ Location state contains `from: '/admin'`

### Actual Result
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test Case 5: AdminRoute - Customer User

### Objective
Verify that non-admin users (customer) cannot access admin routes.

### Steps
1. Login as customer (`customer@hotel.com` / `Customer@123`)
2. Navigate to `http://localhost:5173/admin`

### Expected Result
- ✅ Redirected to `/` (homepage)
- ✅ URL shows `/`
- ✅ Homepage displayed
- ✅ No admin content visible
- ✅ Toast message: "Access denied" (optional)

### Actual Result
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test Case 6: AdminRoute - Staff User

### Objective
Verify that staff users cannot access admin routes.

### Steps
1. Login as staff (`staff@hotel.com` / `Staff@123`)
2. Navigate to `http://localhost:5173/admin`

### Expected Result
- ✅ Redirected to `/` (homepage)
- ✅ URL shows `/`
- ✅ Homepage displayed
- ✅ No admin content visible

### Actual Result
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test Case 7: AdminRoute - Admin User

### Objective
Verify that admin users can access admin routes.

### Steps
1. Login as admin (`admin@hotel.com` / `Admin@123`)
2. Navigate to `http://localhost:5173/admin`

### Expected Result
- ✅ Admin dashboard displayed
- ✅ URL shows `/admin` or `/admin/dashboard`
- ✅ Admin sidebar visible
- ✅ Admin navigation menu visible
- ✅ Can access all admin sub-routes:
  - `/admin/users`
  - `/admin/rooms`
  - `/admin/bookings`
  - `/admin/payments`
  - `/admin/services`
  - `/admin/promotions`
  - `/admin/banners`
  - `/admin/reports`
  - `/admin/settings`

### Actual Result
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test Case 8: Loading State - Slow Network

### Objective
Verify that loading state is displayed during auth check.

### Steps
1. Open DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Refresh page at protected route
4. Observe loading behavior

### Expected Result
- ✅ Loading spinner displayed
- ✅ Text "Đang tải..." or "Đang xác thực..." visible
- ✅ No flash of redirect
- ✅ Smooth transition after loading

### Actual Result
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test Case 9: Token Expiration

### Objective
Verify that expired tokens are handled correctly.

### Steps
1. Login successfully
2. Manually modify token in localStorage to invalid value:
   ```javascript
   localStorage.setItem('token', 'invalid-token')
   ```
3. Navigate to protected route `/dashboard`
4. Observe behavior

### Expected Result
- ✅ Redirected to `/login`
- ✅ Toast message: "Session expired" (optional)
- ✅ Location state saved
- ✅ Can login again successfully

### Actual Result
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test Case 10: Direct URL Access - Admin

### Objective
Verify that direct URL access to admin routes is blocked for non-admin.

### Steps
1. Login as customer
2. Type in address bar: `http://localhost:5173/admin/users`
3. Press Enter

### Expected Result
- ✅ Redirected to `/` (homepage)
- ✅ Cannot access admin/users
- ✅ No admin content visible

### Actual Result
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test Case 11: Nested Admin Routes

### Objective
Verify that all nested admin routes are protected.

### Steps
1. Login as admin
2. Navigate to each admin route:
   - `/admin/dashboard`
   - `/admin/users`
   - `/admin/rooms`
   - `/admin/bookings`
   - `/admin/payments`
   - `/admin/services`
   - `/admin/promotions`
   - `/admin/banners`
   - `/admin/reports`
   - `/admin/settings`

### Expected Result
- ✅ All routes accessible
- ✅ Each page displays correctly
- ✅ No errors in console
- ✅ Admin layout consistent

### Actual Result
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test Case 12: Public Routes Access

### Objective
Verify that public routes are accessible without authentication.

### Steps
1. Logout (if logged in)
2. Navigate to public routes:
   - `/` (homepage)
   - `/rooms`
   - `/about`
   - `/login`
   - `/register`
   - `/forgot-password`

### Expected Result
- ✅ All public routes accessible
- ✅ No redirect to login
- ✅ Pages display correctly
- ✅ No errors in console

### Actual Result
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test Case 13: Logout Behavior

### Objective
Verify that logout clears auth and redirects properly.

### Steps
1. Login as any user
2. Navigate to protected route `/dashboard`
3. Click logout button
4. Observe behavior

### Expected Result
- ✅ User logged out
- ✅ Token removed from localStorage
- ✅ userInfo removed from localStorage
- ✅ Redirected to `/` or `/login`
- ✅ Navbar shows "Đăng nhập" button
- ✅ Cannot access protected routes anymore

### Actual Result
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test Case 14: Multiple Tabs - Logout Sync

### Objective
Verify that logout in one tab affects other tabs.

### Steps
1. Login in Tab 1
2. Open Tab 2 with same site
3. Logout in Tab 1
4. Switch to Tab 2
5. Try to access protected route

### Expected Result
- ✅ Tab 2 detects logout
- ✅ Redirected to login
- ✅ Auth state synced across tabs

### Actual Result
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test Case 15: Browser Refresh - Auth Persistence

### Objective
Verify that auth state persists after browser refresh.

### Steps
1. Login successfully
2. Navigate to protected route `/dashboard`
3. Press F5 (refresh)
4. Observe behavior

### Expected Result
- ✅ User still logged in
- ✅ Dashboard displays correctly
- ✅ No redirect to login
- ✅ userInfo still available
- ✅ Token still in localStorage

### Actual Result
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test Case 16: Role Change Detection

### Objective
Verify that role changes are detected and enforced.

### Steps
1. Login as admin
2. Access `/admin/dashboard` successfully
3. Manually change role in localStorage:
   ```javascript
   const user = JSON.parse(localStorage.getItem('userInfo'))
   user.role = 'customer'
   localStorage.setItem('userInfo', JSON.stringify(user))
   ```
4. Refresh page
5. Try to access `/admin`

### Expected Result
- ✅ Redirected to `/` (homepage)
- ✅ Cannot access admin routes
- ✅ Role validation working

### Actual Result
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test Case 17: 404 Route

### Objective
Verify that non-existent routes show 404 page.

### Steps
1. Navigate to `http://localhost:5173/non-existent-route`

### Expected Result
- ✅ 404 page displayed
- ✅ "404 - Không tìm thấy trang" message
- ✅ URL shows `/non-existent-route`
- ✅ No errors in console

### Actual Result
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test Case 18: Remember Me Feature

### Objective
Verify that "Remember Me" extends token duration.

### Steps
1. Login with "Remember Me" checked
2. Check token expiry in localStorage
3. Close browser
4. Reopen browser after 1 day
5. Navigate to protected route

### Expected Result
- ✅ User still logged in (if < 7 days)
- ✅ No need to login again
- ✅ Token valid

### Actual Result
- [ ] Pass
- [ ] Fail (describe issue):

---

## Performance Tests

### Test Case 19: Route Navigation Speed

### Steps
1. Login as user
2. Navigate between routes:
   - `/dashboard` → `/bookings` → `/profile` → `/rooms`
3. Measure navigation time

### Expected Result
- ✅ Navigation < 200ms
- ✅ No flickering
- ✅ Smooth transitions

### Actual Result
- [ ] Pass
- [ ] Fail (describe issue):

---

## Security Tests

### Test Case 20: XSS in Route Params

### Steps
1. Navigate to `/reset-password/<script>alert('xss')</script>`
2. Observe behavior

### Expected Result
- ✅ No alert popup
- ✅ Script not executed
- ✅ Token treated as string

### Actual Result
- [ ] Pass
- [ ] Fail (describe issue):

---

## Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC-01: ProtectedRoute - Unauth | ⏳ | |
| TC-02: ProtectedRoute - Auth | ⏳ | |
| TC-03: Redirect After Login | ⏳ | |
| TC-04: AdminRoute - Unauth | ⏳ | |
| TC-05: AdminRoute - Customer | ⏳ | |
| TC-06: AdminRoute - Staff | ⏳ | |
| TC-07: AdminRoute - Admin | ⏳ | |
| TC-08: Loading State | ⏳ | |
| TC-09: Token Expiration | ⏳ | |
| TC-10: Direct URL - Admin | ⏳ | |
| TC-11: Nested Admin Routes | ⏳ | |
| TC-12: Public Routes | ⏳ | |
| TC-13: Logout | ⏳ | |
| TC-14: Multi-tab Sync | ⏳ | |
| TC-15: Refresh Persistence | ⏳ | |
| TC-16: Role Change | ⏳ | |
| TC-17: 404 Route | ⏳ | |
| TC-18: Remember Me | ⏳ | |
| TC-19: Performance | ⏳ | |
| TC-20: XSS Security | ⏳ | |

**Overall Status**: ⏳ Pending Testing

---

## How to Run Tests

### Manual Testing
```bash
# 1. Start server
cd server
npm run dev

# 2. Start client
cd client
npm run dev

# 3. Open browser
http://localhost:5173

# 4. Follow test cases above
```

### Automated Testing (Optional - Future)
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Run tests
npm test
```

---

## Bug Report Template

```markdown
### Bug: [Short description]

**Test Case**: TC-XX

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected**: [What should happen]

**Actual**: [What actually happened]

**Environment**:
- Browser: Chrome 120
- OS: Windows 11
- Node: v18.17.0

**Screenshots**: [Attach if applicable]

**Console Errors**: [Copy-paste errors]

**Priority**: High/Medium/Low
```
