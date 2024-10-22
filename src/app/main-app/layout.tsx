"use client"; // Ensure client-side rendering

import React, { ReactNode, useState } from 'react';
import Sidebar from '@/app/main-app/sidebar';
import Chat from '@/app/main-app/chat/page';

// Define layout props
interface LayoutProps {
  children: ReactNode;
}

// Use LayoutProps directly in AppLayout
const AppLayout = ({ children}: LayoutProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-0'}`}>
        <button
          onClick={toggleSidebar}
          className="p-2 bg-gray-800 text-white absolute z-10"
        >
          {isOpen ? (
            <i className="fas fa-chevron-left"></i>
          ) : (
            <i className="fas fa-chevron-right"></i>
          )}
        </button>

        {/* Render children */}
        {children}

        {/* Conditionally render the chat component */}
        
          <div className="fixed bottom-0 right-0 m-4">
            <Chat />
          </div>
    
      </div>
    </div>
  );
};

export default AppLayout;
