import { BrowserRouter, Routes, Route, Navigate } 
  from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { ROUTES, ROLES } from '@/constants';

// Pages
import { HomePage } from '@/pages/customer/HomePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/customer/DashboardPage';

import 'react-toastify/dist/ReactToastify.css';
import '@/styles/index.css';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} 
          element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path={ROUTES.DASHBOARD} 
            element={<DashboardPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<PrivateRoute 
          allowedRoles={[ROLES.ADMIN]} />}>
          <Route path={ROUTES.ADMIN_DASHBOARD} 
            element={<div>Admin Dashboard</div>} />
        </Route>

        {/* Staff Routes */}
        <Route element={<PrivateRoute 
          allowedRoles={[ROLES.ADMIN, ROLES.STAFF]} />}>
          <Route path={ROUTES.STAFF_CHECKIN} 
            element={<div>Staff Check-in</div>} />
        </Route>

        {/* Fallback */}
        <Route path="*" 
          element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </BrowserRouter>
  );
}

export default App;
