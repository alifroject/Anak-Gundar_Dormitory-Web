"use client"; // Add this line

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDownIcon, HomeIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <nav className="bg-white w-full h-22 fixed top-0 left-0 flex justify-around items-center p-4 z-10 border-b border-gray-300">
                <div className="flex items-center">
                    <Link href="/">
                        <Image
                            src="/anakGundar.png" // Correct path
                            alt="Description of the image"
                            width={120} // Specify width
                            height={100} // Specify height
                            className='ml-10'
                        />
                    </Link>
                </div>

                {/* Centered List Items */}
                <ul className="flex items-center justify-center space-x-8 flex-grow" style={{ fontFamily: 'Lato, sans-serif' }}>

                    <div className="relative">
                        <button
                            onClick={toggleDropdown}
                            className="flex items-center text-black hover:text-gray-400"
                            aria-expanded={isOpen}
                        >
                            Masih Cari?
                            <ChevronDownIcon className="w-5 h-5 ml-1" />
                        </button>
                        {isOpen && (
                            <ul className="w-30 absolute bg-white text-black shadow-lg mt-2 rounded">
                                <li>
                                    <Link href="/item1" className="flex items-center px-4 py-2 hover:bg-gray-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                            <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                                            <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
                                        </svg>


                                        <span className='pl-4'>Kosan</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/item2" className="flex items-center px-4 py-2 hover:bg-gray-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                            <path fill-rule="evenodd" d="M3 2.25a.75.75 0 0 0 0 1.5v16.5h-.75a.75.75 0 0 0 0 1.5H15v-18a.75.75 0 0 0 0-1.5H3ZM6.75 19.5v-2.25a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75ZM6 6.75A.75.75 0 0 1 6.75 6h.75a.75.75 0 0 1 0 1.5h-.75A.75.75 0 0 1 6 6.75ZM6.75 9a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75ZM6 12.75a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75ZM10.5 6a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75Zm-.75 3.75A.75.75 0 0 1 10.5 9h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75ZM10.5 12a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75ZM16.5 6.75v15h5.25a.75.75 0 0 0 0-1.5H21v-12a.75.75 0 0 0 0-1.5h-4.5Zm1.5 4.5a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Zm.75 2.25a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75v-.008a.75.75 0 0 0-.75-.75h-.008ZM18 17.25a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" clip-rule="evenodd" />
                                        </svg>

                                        <span className='pl-4'>Apartment</span>
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </div>
                    <li>
                        <Link href="/rules" className="text-black hover:text-gray-400 border-b-2 border-transparent hover:border-blue-500 transition duration-300">
                            Syarat yang berlaku dan aturan
                        </Link>
                    </li>
                </ul>

                {/* Right Aligned Button */}
                <div className="ml-auto flex space-x-4">
                    <button className="text-blue-700 hover:bg-gray-100 hover:text-blue-400 border-2 border-blue-500 px-4 py-1 rounded font-Roboto mr-40">
                        Masuk
                    </button>
                </div>
            </nav>
            <div className="pt-14">
                {/* Your content here */}
            </div>
        </>
    );
}
