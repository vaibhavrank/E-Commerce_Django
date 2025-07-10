import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
// import { logout } from '../../../slices/authSlice'; // Uncomment when you have authSlice

const Logout = () => {
  const [showModal, setShowModal] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user session/token
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Dispatch logout action if you have authSlice
    // dispatch(logout());
    
    // Navigate to home or login page
    navigate('/');
  };

  const handleCancel = () => {
    setShowModal(false);
    navigate('/dashboard/profile'); // Navigate back to profile or previous page
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Confirm Logout</h2>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Are you sure you want to logout?
              </h3>
              <p className="text-gray-600 text-sm">
                You will be signed out of your account and redirected to the home page.
              </p>
            </div>
          </div>

          {/* Security Note */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-800 mb-1">
                  Your cart will be saved
                </p>
                <p className="text-xs text-gray-600">
                  Don't worry, your items will be waiting for you when you return.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logout;