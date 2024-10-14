"use client"; // Add this line to declare this as a client component

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'; // Import the left arrow icon
import Image from 'next/image';

import { faGoogle } from '@fortawesome/free-brands-svg-icons'; // Google icon
import { faFacebookF } from '@fortawesome/free-brands-svg-icons'; // Facebook icon

interface LoginProps {
    onClose: () => void; // Function to close the popup
}

const Login: React.FC<LoginProps> = ({ onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const router = useRouter(); // Call useRouter at the top level

    // Open modal with animation
    useEffect(() => {
        setIsOpen(true);
        setIsAnimating(true);

        const timeoutId = setTimeout(() => {
            setIsAnimating(false);
        }, 300); // Adjust this duration as necessary

        return () => clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                handleClose(); // Close modal if clicking outside
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleClose = () => {
        if (isClosing) return; // Prevent multiple closing calls
        setIsClosing(true);

        const timeoutId = setTimeout(() => {
            setIsOpen(false);
            onClose(); // Call onClose function after closing animation
        }, 300); // Match this duration with the animation duration

        return () => clearTimeout(timeoutId);
    };

    const handleRegister = () => {
        router.push('/registrasi?source=homepage'); // Navigate to the registration page
    };

    const hendleForget = () => {
        router.push('/forget-password'); // Navigate to the registration page
    };


    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div
                        ref={modalRef}
                        className={`bg-white p-6 rounded-lg shadow-lg h-full  w-full md:max-w-md transform transition-all duration-300 ${isClosing ? 'scale-75 opacity-0' : isAnimating ? 'scale-100 opacity-0' : 'scale-100 opacity-100'
                            }`}
                    >
                        {/* Button to close the popup with a left arrow */}
                        <button
                            className="absolute top-4 left-4 text-black"
                            onClick={handleClose}
                            aria-label="Close"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} size="lg" />
                        </button>

                        <h1 className="text-2xl text-black mt-8 text-center font-semibold mb-6">Login Pencari Kos</h1>
                        <button className="flex items-center justify-center w-full py-2 mb-4 border rounded-lg">
                            <img src="/google.jpg" style={{ width: '28px' }} className='mr-2' alt="" />
                            <span className='text-black'>Sign in with Google</span>
                        </button>
                        <button className="flex items-center justify-center w-full py-2 mb-4 border rounded-lg">
                            <FontAwesomeIcon icon={faFacebookF} className="mr-2 text-blue-600" style={{ width: '28px' }} /> {/* Facebook icon with color */}
                            <span className='text-black'>Sign in with Facebook</span>
                        </button>
                        <div className="flex items-center mt-10 mb-18">
                            <hr className="flex-grow border-gray-300" />
                            <span className="px-2 text-gray-500">atau</span>
                            <hr className="flex-grow border-gray-300" />
                        </div>
                        <div className="mb-10 bg-transparent">
                            <label className="block text-gray-700 font-semibold mb-2">Nomor Handphone</label>
                            <input
                                type="text"
                                placeholder="Nomor Handphone"
                                className="w-full text-gray-600 px-3 py-2 border-b border-gray-300 bg-transparent focus:outline-none" // Ganti bg-gray-100 dengan bg-transparent
                            />
                        </div>
                        <div className="mb-20">
                            <label className="block text-gray-700 font-semibold mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="Masukkan password"
                                    className="w-full px-3 py-2 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500" // Ganti bg-gray-100 dengan bg-transparent
                                />
                                <i className="fas fa-eye absolute right-3 top-3 text-gray-500"></i>
                            </div>
                        </div>


                        <button className="w-full py-2 bg-gray-200 mb-4 text-gray-500 rounded-lg" onClick={handleClose}>
                            Login
                        </button>
                        <div className='text-center'>
                            <p className="text-black mb-4">
                                Belum punya akun Anak Gundar?
                                <button onClick={handleRegister} className="text-blue-500  ml-1">Daftar sekarang</button>
                            </p>
                            <p className='text-black mb-5'>
                                <button onClick={hendleForget} className="text-blue-500  ml-1">Lupa Password?</button>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Login;
