// sidebar.tsx

import React from 'react';
import Link from 'next/link';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
    return (
        <div
            className={`fixed top-0 left-0 h-full bg-gray-900 text-white transform transition-transform duration-300 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            } w-64`} // Ensure the width is fixed
        >
            <div className="flex items-center justify-between h-20 border-b m-10 ml-20 border-gray-700">
                <div className="text-center">
                    <img
                        alt="User profile picture"
                        className="rounded-full mx-auto mb-2"
                        height={50}
                        src="https://storage.googleapis.com/a1aa/image/MekN6GSClfmIUEEdSrflA6qPpqDWNfriq4HYO7Ckik7EF5jOB.jpg"
                        width={50}
                    />
                    <div>Jhon Smith</div>
                    <div className="text-sm text-gray-400">Administrator</div>
                    <div className="text-sm text-green-400">Online</div>
                </div>
                <button onClick={toggleSidebar} className="p-2">
                    <i className={`fas fa-chevron-${isOpen ? 'left' : 'right'} text-white`}></i>
                </button>
            </div>
            <div className="p-4">
                <input className="w-full p-2 rounded bg-gray-800 text-gray-400" placeholder="Search..." type="text" />
            </div>
            <nav className="flex-1 px-4">
                <ul>
                    <li className="flex items-center justify-between py-2">
                        <Link  className="flex items-center text-gray-300 hover:text-white" href="main-app/chat">
                            <i className="fas fa-tachometer-alt mr-2"></i> Chat
                        </Link>
                    </li>
                    {/* Add other nav items here */}
                </ul>
            </nav>
            <div className="p-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                    <i className="fas fa-cog text-gray-400"></i>
                    <i className="fas fa-bell text-gray-400"></i>
                    <i className="fas fa-sign-out-alt text-gray-400"></i>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
