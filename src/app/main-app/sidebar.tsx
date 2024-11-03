// src/app/main-app/sidebar.tsx

import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { app } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@/app/main-app/ConfirmationModal';
import Cookies from 'js-cookie';
import '@fortawesome/fontawesome-free/css/all.min.css';

interface SidebarProps {
    isOpen: boolean;
    onPageChange: (page: 'dashboard' | 'chat' | 'add-homes') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onPageChange }) => {
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>('User');
    const [userImage, setUserImage] = useState<string | null>(null);
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(getAuth(app), (user) => {
            if (user) {
                setUserEmail(user.email);
                setUserName(user.displayName);
                setUserImage(user.photoURL || null);
            } else {
                setUserEmail(null);
                setUserName('User');
                setUserImage(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        setModalOpen(true);
    };

    const confirmLogout = async () => {
        try {
            Cookies.remove('authToken'); // replace with your actual cookie name
            await signOut(getAuth(app));
            router.push('/');
        } catch (error) {
            console.error('Logout Error:', error);
        } finally {
            setModalOpen(false);
        }
    };

    return (
        <div className={`fixed right-0 top-0 left-0 h-full bg-gray-900 text-white transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-64 w-48 xs:w-full sm:w-full md:w-72 lg:w-72`}>
            <div className="flex items-center justify-center h-20 ml-8 m-10 xs:ml-4 sm:ml-15 md:ml-20 770px:ml-8 1026px:ml-8">
                <div className="text-center">
                    <img
                        alt=""
                        className="rounded-full mx-auto mb-2"
                        height={50}
                        src={userImage || 'https://defaultimage.com/default.jpg'}
                        width={50}
                    />
                    <div className="xs:text-[16px] text-gray-400 sm:text-base md:text-lg lg:text-lg">{userName}</div>
                    <div className="xs:text-[16px] text-gray-400 sm:text-base md:text-lg lg:text-lg">{userEmail}</div>
                    <div className="text-green-400 xs:text-[14px] sm:text-base md:text-lg lg:text-lg">Online</div>
                </div>
            </div>
            <hr className='border-b border-gray-700' />

            <nav className="flex-1 px-4">
                <ul className='m-5'>
                    {/* Conditionally render the "User" option for admin email */}
                    {userEmail === 'admin@gmail.com' && (
                        <li className="flex items-center justify-between py-2 sm:py-3 md:py-4 lg:py-5">
                            <button
                                className="flex items-center text-gray-300 hover:text-white w-full xs:text-sm sm:text-base md:text-sm lg:text-sm"
                                onClick={() => onPageChange('dashboard')}
                            >
                                <i className="fas fa-user-cog mr-2 text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-white"></i>
                                User
                            </button>
                        </li>
                    )}
                    {userEmail === 'admin@gmail.com' && (
                        <li className="flex items-center justify-between py-2 sm:py-3 md:py-4 lg:py-5">
                            <button
                                className="flex items-center text-gray-300 hover:text-white w-full xs:text-sm sm:text-base md:text-sm lg:text-sm"
                                onClick={() => onPageChange('add-homes')}
                            >
                                <i className="fas fa-plus-circle mr-2 text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl"></i>
                                Add Homes
                            </button>
                        </li>
                    )}
                    <li className="flex items-center justify-between py-5">
                        <button className="flex items-center text-gray-300 hover:text-white w-full xs:text-sm sm:text-base md:text-sm lg:text-sm" onClick={() => onPageChange('dashboard')}>
                            <i className="fas fa-home mr-2 xs:text-sm sm:text-base md:text-sm lg:text-sm"></i> Dashboard
                        </button>
                    </li>
                    <li className="flex items-center justify-between py-5">
                        <button className="flex items-center text-gray-300 hover:text-white w-full xs:text-sm sm:text-base md:text-sm lg:text-sm" onClick={() => onPageChange('chat')}>
                            <i className="fas fa-comments mr-2 xs:text-sm sm:text-base md:text-lg lg:text-xl"></i> Chat
                        </button>
                    </li>
                    <li className="flex items-center justify-between py-5">
                        <button className="flex items-center text-gray-300 hover:text-white w-full xs:text-sm sm:text-base md:text-sm lg:text-sm" onClick={() => onPageChange('dashboard')}>
                            <i className="fas fa-credit-card mr-2 xs:text-sm sm:text-base md:text-lg lg:text-xl"></i> Payment
                        </button>
                    </li>
                    <li className="flex items-center justify-between py-5">
                        <button className="flex items-center text-gray-300 hover:text-white w-full xs:text-sm sm:text-base md:text-sm lg:text-sm" onClick={() => onPageChange('dashboard')}>
                            <i className="fas fa-calendar-check mr-2 xs:text-sm sm:text-base md:text-lg lg:text-xl"></i> Booking
                        </button>
                    </li>
                    {/* Logout button */}
                    <li className="flex items-center justify-between py-5">
                        <button className="flex items-center text-red-500 hover:text-white w-full xs:text-sm sm:text-base md:text-sm lg:text-sm" onClick={handleLogout}>
                            <i className="fas fa-sign-out-alt mr-2 xs:text-sm sm:text-base md:text-lg lg:text-xl"></i> Logout
                        </button>
                    </li>
                </ul>
            </nav>
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <i className="fas fa-cog text-gray-400"></i>
                    <i className="fas fa-bell text-gray-400"></i>
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal 
                isOpen={isModalOpen} 
                onClose={() => setModalOpen(false)} 
                onConfirm={confirmLogout} 
            />
        </div>
    );
};

export default Sidebar;
