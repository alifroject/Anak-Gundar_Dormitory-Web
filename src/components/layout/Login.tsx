import React, { useEffect, useRef } from 'react';

interface LoginProps {
    onClose: () => void; // Function to close the popup
}

const Login: React.FC<LoginProps> = ({ onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose(); // Call onClose function
            }
        };

        // Add event listener
        document.addEventListener('mousedown', handleClickOutside);
        
        // Cleanup event listener on component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <>
            {/* Modal Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-lg w-80">
                    <div className="flex items-center mb-6">
                        <button onClick={onClose} className="text-xl">
                            <i className="fas fa-arrow-left"></i>
                        </button>
                    </div>
                    <h1 className="text-2xl font-semibold mb-6">Login Pencari Kos</h1>
                    <button className="flex items-center justify-center w-full py-2 mb-4 border rounded-lg">
                        <img src="https://placehold.co/20x20" alt="Google logo" className="mr-2" />
                        Sign in with Google
                    </button>
                    <button className="flex items-center justify-center w-full py-2 mb-4 border rounded-lg">
                        <img src="https://placehold.co/20x20" alt="Facebook logo" className="mr-2" />
                        Sign in with Facebook
                    </button>
                    <div className="flex items-center mb-4">
                        <hr className="flex-grow border-gray-300" />
                        <span className="px-2 text-gray-500">atau</span>
                        <hr className="flex-grow border-gray-300" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Nomor Handphone</label>
                        <input type="text" placeholder="Nomor Handphone" className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2">Password</label>
                        <div className="relative">
                            <input type="password" placeholder="Masukkan password" className="w-full px-3 py-2 border rounded-lg" />
                            <i className="fas fa-eye absolute right-3 top-3 text-gray-500"></i>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-full py-2 bg-gray-200 text-gray-500 rounded-lg" disabled>
                        Login
                    </button>
                </div>
            </div>
        </>
    );
};

export default Login;
