"use client"; // Add this line

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChevronDownIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';



interface NavbarProps { //button masuk si klik
    onLoginClick: () => void;
  }

const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);


    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    // Auto close sidebar when window is resized to desktop size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsSidebarOpen(false); // Tutup sidebar jika ukuran layar lebih dari 768px
            }
        };

        window.addEventListener('resize', handleResize);

        // Cleanup the event listener when component unmounts
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <>
            <nav className="bg-white w-full h-22 fixed top-0 left-0 flex justify-between items-center p-4 z-30 border-b border-gray-300">
                {/* Logo */}
                <div className="flex items-center">
                    <Link href="/">
                        <Image
                            src="/anakGundar.png"
                            alt="Description of the image"
                            width={120}
                            height={100}
                            className='ml-10'
                        />
                    </Link>
                </div>

                {/* Hamburger Menu for smaller screens */}
                <div className="md:hidden">
                    <button onClick={toggleSidebar} className="text-black hover:text-gray-400 focus:outline-none">
                        {isSidebarOpen ? (
                            <></>
                        ) : (
                            <Bars3Icon className="h-8 w-8" />
                        )}
                    </button>
                </div>

                {/* Centered List Items for larger screens */}
                <ul className="hidden md:flex items-center justify-center space-x-8 flex-grow" style={{ fontFamily: 'Lato, sans-serif' }}>
                    <div className="relative">
                        <button
                            onClick={toggleDropdown}
                            className="flex items-center text-black hover:text-gray-400"
                            aria-expanded={isDropdownOpen}
                        >
                            Masih Cari?
                            <ChevronDownIcon className="w-5 h-5 ml-1" />
                        </button>
                        {isDropdownOpen && (
                            <ul className="w-30 absolute bg-white text-black shadow-lg mt-2 rounded">
                                <li>
                                    <Link href="/item1" className="flex items-center px-4 py-2 hover:bg-gray-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                            <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                                            <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
                                        </svg>
                                        <span className='pl-5'>Kosan</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/item2" className="flex items-center px-4 py-2 hover:bg-gray-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                            <path fill-rule="evenodd" d="M3 2.25a.75.75 0 0 0 0 1.5v16.5h-.75a.75.75 0 0 0 0 1.5H15v-18a.75.75 0 0 0 0-1.5H3ZM6.75 19.5v-2.25a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75ZM6 6.75A.75.75 0 0 1 6.75 6h.75a.75.75 0 0 1 0 1.5h-.75A.75.75 0 0 1 6 6.75ZM6.75 9a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75ZM6 12.75a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75ZM10.5 6a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75Zm-.75 3.75A.75.75 0 0 1 10.5 9h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75ZM10.5 12a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75ZM16.5 6.75v15h5.25a.75.75 0 0 0 0-1.5H21v-12a.75.75 0 0 0 0-1.5h-4.5Zm1.5 4.5a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Zm.75 2.25a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75v-.008a.75.75 0 0 0-.75-.75h-.008ZM18 17.25a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" clip-rule="evenodd" />
                                        </svg>
                                        <span className='pl-5'>Apartment</span>
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </div>
                    <li>
                        <Link href="/rules" className="text-black hover:text-gray-400 block">
                            Syarat yang berlaku dan aturan
                        </Link>
                    </li>
                    <li>
                        <button onClick={onLoginClick} className="text-blue-700 hover:bg-gray-100 hover:text-blue-400  border-2 border-blue-500 px-4 py-1 rounded w-full">
                            Masuk
                        </button>
                    </li>

                </ul>
            </nav>

            {/* Sidebar */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-20 bg-black bg-opacity-50" onClick={closeSidebar}></div>
            )}
            <div className={`fixed top-0 left-0 h-full w-64 p-5 bg-white transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} z-30`}>
                <div className={`p-4  ${isSidebarOpen ? 'block' : 'hidden'}`}>
                    <Link href="/" onClick={closeSidebar}> {/* Panggil closeSidebar saat link di-klik */}
                        <Image
                            src="/anakGundar.png"
                            alt="Description of the image"
                            width={100}
                            height={90}
                            className='ml-6'
                        />
                    </Link>
                    {/* Tambahkan link lain di sidebar jika diperlukan */}
                </div>
                <div className="flex justify-end p-4">
                    <button onClick={closeSidebar}>
                        <XMarkIcon className="h-8 w-8 text-black" />
                    </button>
                </div>
                <ul className="space-y-4 mt-4">
                    <li>
                        {/* Masih Cari dropdown */}
                        <button
                            onClick={toggleDropdown}
                            className="flex items-center text-black hover:text-gray-400"
                            aria-expanded={isDropdownOpen}
                        >
                            Masih Cari?
                            <ChevronDownIcon className="w-5 h-5 ml-1" />
                        </button>

                        {/* Inline dropdown, elemen di bawah akan bergeser */}
                        {isDropdownOpen && (
                            <ul className="bg-white text-black shadow-lg mt-2 rounded w-full space-y-2">
                                <li>
                                    <Link href="/item1" onClick={toggleSidebar} className="flex items-center px-4 py-2 hover:bg-gray-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                            <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                                            <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
                                        </svg>
                                        <span className='ml-5'>Kosan</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/item2" onClick={toggleSidebar} className="flex items-center px-4 py-2 hover:bg-gray-200">

                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                            <path fill-rule="evenodd" d="M3 2.25a.75.75 0 0 0 0 1.5v16.5h-.75a.75.75 0 0 0 0 1.5H15v-18a.75.75 0 0 0 0-1.5H3ZM6.75 19.5v-2.25a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75ZM6 6.75A.75.75 0 0 1 6.75 6h.75a.75.75 0 0 1 0 1.5h-.75A.75.75 0 0 1 6 6.75ZM6.75 9a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75ZM6 12.75a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75ZM10.5 6a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75Zm-.75 3.75A.75.75 0 0 1 10.5 9h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75ZM10.5 12a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75ZM16.5 6.75v15h5.25a.75.75 0 0 0 0-1.5H21v-12a.75.75 0 0 0 0-1.5h-4.5Zm1.5 4.5a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Zm.75 2.25a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75v-.008a.75.75 0 0 0-.75-.75h-.008ZM18 17.25a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" clip-rule="evenodd" />
                                        </svg>
                                        <span className='ml-4'>Apartment</span>
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>
                    <li>
                        <Link href="/rules" onClick={toggleSidebar} className="text-black hover:text-gray-400 block">
                            Syarat yang berlaku dan aturan
                        </Link>
                    </li>
                    <li>
                        <button className="text-blue-700 hover:bg-gray-100 hover:text-blue-400 border-2 border-blue-500 px-4 py-1 rounded w-full">
                            Masuk
                        </button>
                    </li>
                </ul>
            </div>
        </>
    );
}


export default Navbar;