"use client"; // Add this line to declare this as a client component
import { signInWithPopup, FacebookAuthProvider, GoogleAuthProvider } from "firebase/auth";
import { auth } from '@/app/firebase/config'; // Import konfigurasi Firebase
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'; // Import the left arrow icon
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

    //google
    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider(); // Buat instance dari GoogleAuthProvider
        try {
            const result = await signInWithPopup(auth, provider); // Menggunakan instance auth yang diimpor
            console.log('User Info:', result.user); // Menampilkan info pengguna di konsol
            router.push('/main-app');
        } catch (error) {
            console.error('Login Error:'); // Menangani error jika login gagal
            alert(`Error: ${(error as Error).message}`);
        }
    };

    //facebook
    const handleFacebookLogin = async () => {
        const provider = new FacebookAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider); // Use imported auth instance
            console.log('User Info:', result.user);
        } catch (error) {
            console.error('Login Error:', error);
        }
    };


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









    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black  bg-opacity-50 flex items-center justify-center z-50">
                    <div
                        ref={modalRef}
                        className={`bg-white p-6 rounded-lg shadow-lg h-full  w-full md:h-100  md:max-w-md transform transition-all duration-300 ${isClosing ? 'scale-75 opacity-0' : isAnimating ? 'scale-100 opacity-0' : 'scale-100 opacity-100'
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
                        <button onClick={handleGoogleLogin} className="flex items-center justify-center w-full py-2 mb-4 border rounded-lg">
                            <img src="/google.jpg" style={{ width: '28px' }} className='mr-2' alt="" />
                            <span className='text-black'>Sign in with Google</span>
                        </button>
                        <button onClick={handleFacebookLogin} className="flex items-center justify-center w-full py-2 mb-4 border rounded-lg">
                            <FontAwesomeIcon icon={faFacebookF} className="mr-2 text-blue-600" style={{ width: '28px' }} />
                            <span className="text-black">Sign in with Facebook</span>
                        </button>
                        <div className="flex items-center mt-10 mb-18">
                            <hr className="flex-grow border-gray-300" />
                            <span className="px-2 text-gray-500">atau</span>
                            <hr className="flex-grow border-gray-300" />
                        </div>




                        <button className="w-full py-2 bg-gray-200 mb-4 text-gray-500 rounded-lg">
                            Login
                        </button>
                        <div className='text-center'>

                            <p className='text-black mb-5'>
                                Pastikan akun anda aktif
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Login;
