"use client";

import React, { ReactNode, useState } from 'react';
import Sidebar from './sidebar';

interface LayoutProps {
    children: ReactNode;
}

const AppLayout = ({ children }: LayoutProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen((prev) => !prev);
    };

    const onPageChange = (page: 'dashboard' | 'chat' | 'add-homes') => {
        console.log(`Navigating to ${page}`);
        window.location.href = `/main-app/${page}`; 
    };

    return (
        <div className="flex m-0 h-screen">
            <Sidebar isOpen={isOpen} onPageChange={onPageChange} />
            <div className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-0 xs:ml-40 md:ml-48' : 'ml-0'}`}>
                
                <button
                    onClick={toggleSidebar}
                    className="p-2 bg-gray-800 text-white absolute z-10"
                    style={{ top: '10px', left: '10px' }}
                >
                    {isOpen ? (
                        <i className="fas fa-chevron-left"></i>
                    ) : (
                        <i className="fas fa-chevron-right"></i>
                    )}
                </button>
                
                <div className={`bg-gray-100  transition-all duration-300 ${isOpen ? 'pl-20' : 'p-5'}`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AppLayout;
