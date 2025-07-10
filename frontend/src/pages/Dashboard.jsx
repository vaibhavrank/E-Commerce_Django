import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/core/Dashboard/Sidebar';

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      '/dashboard/profile': 'Profile',
      '/dashboard/cart': 'Shopping Cart',
      '/dashboard/orders': 'My Orders',
      '/dashboard/address': 'Manage Addresses',
      '/dashboard/logout': 'Logout'
    };
    return titles[path] || 'Dashboard';
  };

  // Get breadcrumb items
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs = [
      { label: 'Home', path: '/' },
      { label: 'Dashboard', path: '/dashboard' }
    ];

    const pageTitles = {
      '/dashboard/profile': 'Profile',
      '/dashboard/cart': 'Cart',
      '/dashboard/orders': 'Orders',
      '/dashboard/address': 'Address',
      '/dashboard/logout': 'Logout'
    };

    if (pageTitles[path]) {
      breadcrumbs.push({ label: pageTitles[path], path });
    }

    return breadcrumbs;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-80'
      }`}>
        
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              
              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 text-sm">
                {getBreadcrumbs().map((crumb, index) => (
                  <React.Fragment key={crumb.path}>
                    {index > 0 && (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                    <span className={`${
                      index === getBreadcrumbs().length - 1 
                        ? 'text-gray-900 font-medium' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}>
                      {crumb.label}
                    </span>
                  </React.Fragment>
                ))}
              </div>

              {/* Page Actions */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Help */}
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
              <p className="mt-2 text-gray-600">
                {location.pathname === '/dashboard/profile' && 'Manage your account settings and preferences'}
                {location.pathname === '/dashboard/cart' && 'Review items in your shopping cart'}
                {location.pathname === '/dashboard/orders' && 'Track your order history and status'}
                {location.pathname === '/dashboard/address' && 'Manage your shipping and billing addresses'}
                {location.pathname === '/dashboard/logout' && 'Sign out of your account'}
              </p>
            </div>

            {/* Content Area */}
            <div className="bg-white shadow-sm border border-gray-200 min-h-[600px]">
              <Outlet />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <a href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
                <a href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</a>
                <a href="/support" className="hover:text-gray-900 transition-colors">Support</a>
              </div>
              <div className="mt-4 sm:mt-0 text-sm text-gray-500">
                © 2024 Your Store. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;