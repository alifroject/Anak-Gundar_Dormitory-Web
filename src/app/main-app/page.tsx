// App.tsx

"use client";
import React, { useState } from 'react';
import Sidebar from '@/app/main-app/sidebar';
import Layout from '@/app/main-app/layout';
import Chat from '@/app/main-app/chat/page'

const App = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
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

            </div >
            <Layout>
                <Chat/>
            </Layout></>
    );
};

export default App;
