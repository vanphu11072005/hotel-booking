import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarAdmin } from '../components/layout';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Admin Sidebar */}
      <SidebarAdmin />
      
      {/* Admin Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
