import React, { useState } from 'react';
import { InspectIcon, Scan, ScanFace } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleEmailSubmit = () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    // Store email in FormData
    const formData = new FormData();
    formData.append('email', email);
    
    // Store in state for demo purposes (in real app, you'd send to API)
    console.log('Email stored:', email);
    
    // Redirect to signup page with email as parameter
    window.location.href = `/signup?email=${encodeURIComponent(email)}`;
  };

  const handleLinkClick = (path) => {
    window.location.href = path;
  };

  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Shop Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Shop</h3>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => handleLinkClick('/shop')}
                  className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                >
                  Shop all
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/new')}
                  className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                >
                  New
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/sale')}
                  className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                >
                  Sale
                </button>
              </li>
            </ul>
          </div>

          {/* Thriftshop Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Thriftshop</h3>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => handleLinkClick('/about')}
                  className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/#sell')}
                  className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                >
                  How selling works
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/#sell')}
                  className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                >
                  Sell your items
                </button>
              </li>
            </ul>
          </div>

          {/* Help Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Help</h3>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => handleLinkClick('/contact')}
                  className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                >
                  Contact
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/faq')}
                  className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Stay tuned!</h3>
            <p className="text-gray-600 text-sm mb-4">
              Sign up to our newsletter and stay up-to-date about new products, stories, and events.
            </p>
            <div className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              />
              <button
                onClick={handleEmailSubmit}
                className="px-4 py-2 bg-black text-white rounded-r-md hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Copyright and Links */}
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-8">
              <p className="text-gray-500 text-sm">© Thriftshop 2020</p>
              <div className="flex space-x-6">
                <button 
                  onClick={() => handleLinkClick('/terms')}
                  className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
                >
                  Terms & Conditions
                </button>
                <button 
                  onClick={() => handleLinkClick('/privacy')}
                  className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
                >
                  Privacy Policy
                </button>
                <button 
                  onClick={() => handleLinkClick('/disclaimer')}
                  className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
                >
                  Disclaimer
                </button>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex space-x-4 mt-4 md:mt-0">
              <button 
                onClick={() => window.open('https://instagram.com', '_blank')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Instagram"
              >
                <InspectIcon size={20} />
              </button>
              <button 
                onClick={() => window.open('https://facebook.com', '_blank')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Facebook"
              >
                <Scan size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;