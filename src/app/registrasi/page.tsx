"use client";

import { useState } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config'; // Import konfigurasi Firebase
import { UserCredential } from 'firebase/auth'; // Import UserCredential
import { db } from '@/app/firebase/config'; // Import konfigurasi Firebase Realtime Database
import {  ref, set } from 'firebase/database'; // Import ref dan set dari Firebase
import { useRouter } from 'next/navigation'; // Import useRouter from 'next/navigation'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'; // Import the left arrow icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const SignUp: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>(''); // State untuk konfirmasi password
    const [name, setName] = useState<string>(''); // State untuk nama lengkap
    const [phone, setPhone] = useState<string>(''); // State untuk nomor telepon
    const [createUserWithEmailAndPassword, , loading, error] = useCreateUserWithEmailAndPassword(auth);
    const router = useRouter(); // Call useRouter at the top level

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Mencegah refresh page

        if (password !== confirmPassword) {
            console.error("Passwords do not match!");
            return; // Menangani kesalahan konfirmasi password
        }

        try {
            const res: UserCredential | undefined = await createUserWithEmailAndPassword(email, password);

            if (res) {
                console.log({ user: res.user }); // Menampilkan akun yang sudah terdaftar di console
                
                // Simpan data pengguna ke Firebase Realtime Database dengan role 'user'
                const userID = res.user.uid; // Ambil UID pengguna
                await set(ref(db, 'users/' + userID), {
                    name: name,
                    phone: phone,
                    email: email,
                    role: "user"  // Tambahkan role 'user'
                });

                // Simpan status pengguna di sessionStorage
                sessionStorage.setItem('user', JSON.stringify(true));
                // Reset field input
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setName('');
                setPhone('');
                
                // Arahkan pengguna ke halaman lain setelah sukses
                router.push('/'); // Ganti dengan halaman tujuan yang diinginkan
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleBack = () => {
        router.push('/'); // Navigasi kembali ke halaman sebelumnya
    };

    return (
        <div className="min-h-screen h-screen flex flex-col md:flex-row bg-gray-800">
            {/* Bagian Kiri - Form Registrasi */}
            <button
                className="absolute top-4 left-4 text-white"
                onClick={handleBack}
                aria-label="Close"
            >
                <FontAwesomeIcon icon={faArrowLeft} size="lg" />
            </button>
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <h1 className="text-2xl font-semibold text-center mb-6 text-white">Buat Akun</h1>

                    <form onSubmit={handleSignUp}>
                        {/* Nama Lengkap Field */}
                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm font-bold mb-2">Nama Lengkap:</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Nomor Telepon Field */}
                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm font-bold mb-2">Nomor Telepon:</label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

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

                        {/* Konfirmasi Password Field */}
                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm font-bold mb-2">Konfirmasi Password:</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                    <p className="mb-2">Daftar untuk memulai pengalaman Anda untuk mencari kos terdekat Universitas Gunadarma.</p>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
