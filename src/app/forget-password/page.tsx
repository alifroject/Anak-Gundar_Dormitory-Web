"use client";

import { useState } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config'; // Import konfigurasi Firebase
import { UserCredential } from 'firebase/auth'; // Import UserCredential

const SignUp: React.FC = () => {
    const [email, setEmail] = useState<string>(''); // Menentukan tipe state sebagai string
    const [password, setPassword] = useState<string>(''); // Menentukan tipe state sebagai string
    const [createUserWithEmailAndPassword, , loading, error] = useCreateUserWithEmailAndPassword(auth);

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Mencegah refresh page

        try {
            const res: UserCredential | undefined = await createUserWithEmailAndPassword(email, password);

            // Memastikan bahwa res tidak undefined sebelum mengakses properti user
            if (res) {
                console.log({ user: res.user }); // Menampilkan akun yang sudah terdaftar di console
                sessionStorage.setItem('user', JSON.stringify(true));
                setEmail('');
                setPassword('');
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen h-screen flex flex-col md:flex-row bg-gray-800">
            {/* Bagian Kiri - Form Registrasi */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <h1 className="text-2xl font-semibold text-center mb-6 text-white">Buat Akun</h1>

                    <form onSubmit={handleSignUp}>
                        {/* Email Field */}
                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm font-bold mb-2">Email:</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm font-bold mb-2">Password:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Error Handling */}
                        {error && <p className="text-red-500 mb-4">{error.message}</p>}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Buat Akun'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Bagian Kanan - Konten Tambahan */}
            <div className="flex-1 bg-gray-900 flex items-center justify-center">
                <div className="text-white text-center">
                    <h2 className="text-3xl font-semibold mb-4">Selamat Datang</h2>
                    <p className="mb-2">Daftar untuk memulai pengalaman Anda.</p>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
