import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  
  // Get user data from Redux store
//   const { user } = useSelector((state) => state.auth); // Uncomment when you have userSlice
  
  // Mock user data - replace with actual data from userSlice
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: null
  };

  const menuItems = [
    {
      path: '/dashboard/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: 'Profile',
      name: 'profile'
    },
    {
      path: '/dashboard/cart',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.8 9A1 1 0 006 23h12a1 1 0 00.8-.6L17 13M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
        </svg>
      ),
      label: 'Cart',
      name: 'cart'
    },
    {
      path: '/dashboard/orders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M8 11v6a2 2 0 002 2h4a2 2 0 002-2v-6M8 11h8" />
        </svg>
      ),
      label: 'Orders',
      name: 'orders'
    },
    {
      path: '/dashboard/address',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Address',
      name: 'address'
    }
  ];

  const getActiveMenuItem = () => {
    const currentPath = location.pathname;
    return menuItems.find(item => item.path === currentPath)?.name || 'profile';
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md border border-gray-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-40 ${
        isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'w-80 lg:w-80'
      }`}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${isCollapsed ? 'lg:justify-center' : ''}`}>
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-800 truncate">{user.name || 'User'}</h2>
                  <p className="text-sm text-gray-600 truncate">{user.email || 'user@example.com'}</p>
                </div>
              )}
            </div>
            
            {/* Collapse Button - Desktop */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-1 hover:bg-gray-100 rounded"
            >
              <svg className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    } ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}`
                  }
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <NavLink
            to="/dashboard/logout"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-red-600 text-white'
                  : 'text-red-600 hover:bg-red-50'
              } ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}`
            }
          >
            <span className="flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </NavLink>
        </div>

        {/* Back to Store */}
        {!isCollapsed && (
          <div className="absolute bottom-20 left-0 right-0 p-4">
            <a
              href="/shop"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Back to Store</span>
            </a>
          </div>
        )}
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};

export default Sidebar;