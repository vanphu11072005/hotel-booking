import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface LayoutMainProps {
  isAuthenticated?: boolean;
  userInfo?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  } | null;
  onLogout?: () => void;
}

const LayoutMain: React.FC<LayoutMainProps> = ({ 
  isAuthenticated = false,
  userInfo = null,
  onLogout
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with Navigation and Auth */}
      <Header 
        isAuthenticated={isAuthenticated}
        userInfo={userInfo}
        onLogout={onLogout}
      />
      
      {/* Main Content Area - Outlet renders child routes */}
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LayoutMain;
