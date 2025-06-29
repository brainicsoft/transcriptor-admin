"use client"
import { FiLogOut, FiUser, FiX } from 'react-icons/fi';
import SidebarItem from './SidebarItem';


export default function AdminSidebar({
  isOpen = false,
  onClose = () => {}
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 h-full">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-primary">
            <div className="flex items-center justify-between flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            </div>
            <div className="mt-5 flex-1 flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                <SidebarItem href="/admin" icon={'dashboard'} title="Dashboard" />
                <SidebarItem href="/admin/users" icon={'users'} title="Users" />
                <SidebarItem href="/admin/module" icon={'settings'} title="Modules" />
              </nav>
            </div>
            
            {/* User Info & Logout at Bottom */}
            <div className="px-4 py-4 border-t border-secondary">
              <div className="flex items-center">
                <div className="bg-secondary p-2 rounded-full">
                  <FiUser className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Admin User</p>
                  <button 
                    onClick={() => {
                      onClose();
                    }}
                    className="flex items-center text-sm text-indigo-200 hover:text-white mt-1"
                  >
                    <FiLogOut className="mr-1" /> Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden transition duration-300 ease-in-out`}>
        <div className="flex flex-col h-full bg-primary">
          {/* Mobile Header with Close Button */}
          <div className="flex items-center justify-between px-4 pt-5 pb-2">
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <button 
              onClick={onClose}
              className="md:hidden text-gray-300 hover:text-white"
            >
              <FiX size={24} />
            </button>
          </div>
          
          {/* Mobile Menu Items */}
          <div className="flex-1 px-2 py-4 space-y-1">
            <SidebarItem 
              href="/admin" 
              icon={'dashboard'} 
              title="Dashboard" 
              onClick={onClose}
            />
            <SidebarItem 
              href="/admin/users" 
              icon={'users'} 
              title="Users" 
              onClick={onClose}
            />
            <SidebarItem 
              href="/admin/settings" 
              icon={'settings'} 
              title="Settings" 
              onClick={onClose}
            />
          </div>
          
          {/* Mobile User Info */}
          <div className="px-4 py-4 border-t border-secondary">
            <div className="flex items-center">
              <div className="bg-secondary p-2 rounded-full">
                <FiUser className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Admin User</p>
                <button 
                  onClick={() => {
                    onClose();
                  }}
                  className="flex items-center text-sm text-indigo-200 hover:text-white mt-1"
                >
                  <FiLogOut className="mr-1" /> Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}