"use client";
import { signInWithPopup, FacebookAuthProvider, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '@/app/firebase/config';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF } from '@fortawesome/free-brands-svg-icons';
import Cookies from 'js-cookie';



interface LoginProps {
    onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isAdminLogin, setIsAdminLogin] = useState(false);
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const router = useRouter();

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const token = await result.user.getIdToken();
            Cookies.set('authToken', token, { expires: 1 });
            router.push('/main-app');
        } catch (error) {
            console.error('Login Error:', error);
            alert(`Error: ${(error as Error).message}`);
        }
    };

    const handleFacebookLogin = async () => {
        const provider = new FacebookAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const token = await result.user.getIdToken();
            Cookies.set('authToken', token, { expires: 1 });
            router.push('/main-app');
        } catch (error) {
            console.error('Login Error:', error);
        }
    };

    useEffect(() => {
        setIsOpen(true);
        const handleOutsideClick = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                handleClose();
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(onClose, 300); // Delay to allow fade-out animation
    };

    const toggleAdminLogin = () => {
        setIsOpen(false);
        setTimeout(() => {
            setIsAdminLogin((prev) => !prev);
            setLoginError('');
            setAdminEmail('');
            setAdminPassword('');
            setIsOpen(true);
        }, 300); // Delay to match fade-out transition
    };

    const handleAdminLogin = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            // Sign in with email and password
            const result = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
            const token = await result.user.getIdToken();
            Cookies.set('authToken', token, { expires: 1 });
            router.push('/main-app');


        } catch (error) {
            console.error("Kesalahan saat melakukan login:", error);
            setLoginError("Email atau password salah.");
        }
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                {isOpen && (
                    <div
                        ref={modalRef}
                        className={`bg-white p-6 rounded-lg shadow-lg h-screen w-full md:max-w-md relative transition-transform transform duration-300 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                    >
                        <button className="absolute top-4 right-4 text-gray-500" onClick={handleClose} aria-label="Close">
                            <FontAwesomeIcon icon={faTimes} size="lg" />
                        </button>

                        <h1 className="text-2xl text-black mt-8 text-center font-semibold mb-6">
                            {isAdminLogin ? 'Login Admin' : 'Login Pencari Kos'}
                        </h1>

                        <div className={`transition-opacity duration-300 ease-in-out ${isAdminLogin ? 'opacity-0 hidden' : 'opacity-100 block'}`}>
                            <button onClick={handleGoogleLogin} className="flex items-center justify-center w-full py-2 mb-4 border rounded-lg">
                                <img src="/google.jpg" style={{ width: '28px' }} className='mr-2' alt="Google" />
                                <span className='text-black'>Sign in with Google</span>
                            </button>
                            <button onClick={handleFacebookLogin} className="flex items-center justify-center w-full py-2 mb-4 border rounded-lg">
                                <FontAwesomeIcon icon={faFacebookF} className="mr-2 text-blue-600" style={{ width: '28px' }} />
                                <span className="text-black">Sign in with Facebook</span>
                            </button>
                            <div className="flex items-center mt-10 mb-4">
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

                        <div className={`transition-opacity duration-300 ease-in-out ${isAdminLogin ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
                            <form onSubmit={handleAdminLogin} className="flex flex-col">
                                <input type="email" placeholder="Email" required className="p-2 mb-4 border rounded-lg" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
                                <input type="password" placeholder="Password" required className="p-2 mb-4 border rounded-lg" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
                                <button type="submit" className="w-full py-2 bg-gray-200 mb-4 text-gray-500 rounded-lg">
                                    Login Admin
                                </button>
                                {loginError && <p className="text-red-500 text-center">{loginError}</p>}
                            </form>
                        </div>

                        <div className="text-center mt-4">
                            <p className='text-blue-500 cursor-pointer' onClick={toggleAdminLogin}>
                                {isAdminLogin ? 'Kembali ke login user' : 'Apakah Anda admin?'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Login;
