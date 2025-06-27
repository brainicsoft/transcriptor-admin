"use client"
import { FiMenu, FiBell, FiUser, FiLogOut } from 'react-icons/fi';
import { useState } from 'react';

export default function AdminNavbar({ 
  setSidebarOpen 
}: { 
  setSidebarOpen: (open: boolean) => void 
}) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
      <button
        type="button"
        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 md:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <FiMenu className="h-6 w-6" />
      </button>
      
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex"></div>
        
        <div className="ml-4 flex items-center md:ml-6">
          <button
            type="button"
            className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span className="sr-only">View notifications</span>
            <FiBell className="h-6 w-6" />
          </button>

          {/* User Dropdown */}
          <div className="ml-3 relative">
            <div>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <div className="bg-indigo-600 p-2 rounded-full">
                  <FiUser className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">Admin User</span>
              </button>
            </div>
            
            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <button
                  onClick={() => console.log('Logout')}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <FiLogOut className="mr-2" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}