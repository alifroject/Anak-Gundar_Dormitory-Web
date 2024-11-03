"use client"; // Add this line

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChevronDownIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { auth } from '@/app/firebase/config';
import Cookies from 'js-cookie';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { dbFire } from '@/app/firebase/config';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

interface NavbarProps {
    onLoginClick: () => void;
}

interface UserProfile {
    uid: string;
    email: string | null;
    displayName?: string | null;
    nama: string;
    jenisKelamin: string;
    tanggalLahir: Date | null;
    pekerjaan: string;
    namaKampus: string;
    kotaAsal: string;
    statusPernikahan: string;
    pendidikanTerakhir: string;
    kontakDarurat: string;
    photoURL: string;
}


const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {
    const [isCariDropdownOpen, setIsCariDropdownOpen] = useState<boolean>(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setIsCariDropdownOpen(false);
        setIsProfileDropdownOpen(false);
        setIsSidebarOpen(false);
    }, [pathname]); // Trigger effect on path change

    const toggleCariDropdown = () => {
        setIsCariDropdownOpen(!isCariDropdownOpen);
    };

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setIsLoggedIn(true);
                // Fetch user profile data from Firestore
                const userDoc = doc(dbFire, 'user', user.uid);
                const userSnapshot = await getDoc(userDoc);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data() as UserProfile; // Cast to UserProfile
                    const userProfileData: UserProfile = {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || "Anonymous",
                        nama: userData.nama || "",
                        jenisKelamin: userData.jenisKelamin || "",
                        tanggalLahir: userData.tanggalLahir || null,
                        pekerjaan: userData.pekerjaan || "",
                        namaKampus: userData.namaKampus || "",
                        kotaAsal: userData.kotaAsal || "",
                        statusPernikahan: userData.statusPernikahan || "",
                        pendidikanTerakhir: userData.pendidikanTerakhir || "",
                        kontakDarurat: userData.kontakDarurat || "",
                        photoURL: userData.photoURL || user.photoURL || "", // Get from Firestore or Auth
                    };
                    setUserProfile(userProfileData);
                } else {
                    console.error("No such user document!");
                    // Handle the case when user data doesn't exist
                }
            } else {
                setIsLoggedIn(false);
                setUserProfile(null);
            }
        });

        return () => unsubscribe();
    }, []);



    const handleLogout = async () => {
        try {
            Cookies.remove('authToken'); // replace with your actual cookie name
            await signOut(getAuth(app));
            router.push('/');
        } catch (error) {
            console.error('Logout Error:', error);
        }
    };

    return (
        <>
            <nav className="bg-white w-full h-22 fixed top-0 left-0 flex justify-between items-center p-4 z-30 border-b border-gray-300">
                {/* Logo */}
                <div className="flex items-center">
                    <Link href="/">
                        <Image
                            src="https://firebasestorage.googleapis.com/v0/b/anak-gundar.appspot.com/o/anakGundar.png?alt=media"
                            alt="Description of the image"
                            width={120}
                            height={100}
                            className="ml-10"
                        />
                    </Link>
                </div>

                {/* Hamburger Menu for smaller screens */}
                <div className="md:hidden">
                    <button onClick={toggleSidebar} className="text-black hover:text-gray-400 focus:outline-none">
                        {isSidebarOpen ? (
                            <XMarkIcon className="h-8 w-8" />
                        ) : (
                            <Bars3Icon className="h-8 w-8" />
                        )}
                    </button>
                </div>

                {/* Centered List Items for larger screens */}
                <ul className="hidden md:flex items-center justify-center space-x-8 flex-grow" style={{ fontFamily: 'Lato, sans-serif' }}>
                    <div className="relative">
                        <button
                            onClick={toggleCariDropdown}
                            className="flex items-center text-black hover:text-gray-400"
                            aria-expanded={isCariDropdownOpen}
                        >
                            Masih Cari?
                            <ChevronDownIcon className="w-5 h-5 ml-1" />
                        </button>
                        {isCariDropdownOpen && (
                            <ul className="w-30 absolute bg-white text-black shadow-lg mt-2 rounded">
                                <li>
                                    <Link href="/item1" className="flex items-center px-4 py-2 hover:bg-gray-200">
                                        Kostan
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/item2" className="flex items-center px-4 py-2 hover:bg-gray-200">
                                        Apartment
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </div>
                    <li>
                        <Link href="/rules" className="text-black hover:text-gray-400 block" passHref>
                            Syarat yang berlaku dan aturan
                        </Link>
                    </li>
                    {isLoggedIn ? (
                        <div className="relative">
                            <button
                                onClick={toggleProfileDropdown}
                                className="flex items-center text-black hover:text-gray-400"
                                aria-expanded={isProfileDropdownOpen}
                            >
                                <Image
                                    src={userProfile?.photoURL || 'https://via.placeholder.com/40'} // Default image
                                    alt="Profile"
                                    width={40}
                                    height={40}
                                    className="rounded-full" // Makes the image circular
                                />

                                <ChevronDownIcon className="w-5 h-5 ml-1" />
                            </button>
                            {isProfileDropdownOpen && (
                                <ul className="absolute bg-white text-black shadow-lg mt-2 rounded w-40">
                                    <li>
                                        <Link href={`/profile/${userProfile?.uid}`} className="block px-4 py-2 hover:bg-gray-200" passHref>
                                            Lihat Profil
                                        </Link>
                                    </li>
                                    <li>
                                        <button
                                            onClick={handleLogout}
                                            className="block px-4 py-2 hover:bg-gray-200 w-full text-left"
                                        >
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            )}
                        </div>
                    ) : (
                        <li>
                            <button onClick={onLoginClick} className="text-blue-700 hover:bg-gray-100 hover:text-blue-400 border-2 border-blue-500 px-4 py-1 rounded w-full">
                                Masuk
                            </button>
                        </li>
                    )}
                </ul>
            </nav>

            {/* Sidebar */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-20 bg-black bg-opacity-50" onClick={closeSidebar}></div>
            )}
            <div className={`fixed top-0 left-0 h-full w-64 p-5 bg-white transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} z-30`}>
                <div className={`p-4 ${isSidebarOpen ? 'block' : 'hidden'}`}>
                    <Link href="/" onClick={closeSidebar}>
                        <img
                            src="https://firebasestorage.googleapis.com/v0/b/anak-gundar.appspot.com/o/anakGundar.png?alt=media"
                            alt="Description of the image"
                            width={100}
                            height={90}
                            className='ml-6'
                        />
                    </Link>
                </div>
                <div className="flex justify-end p-4">
                    <button onClick={closeSidebar}>
                        <XMarkIcon className="h-8 w-8 text-black" />
                    </button>
                </div>
                <ul className="space-y-4 mt-4">
                    {isLoggedIn ? (
                        <div className="relative">
                            <button
                                onClick={toggleProfileDropdown}
                                className="flex items-center text-black hover:text-gray-400"
                                aria-expanded={isProfileDropdownOpen}
                            >
                                <Image
                                    src={userProfile?.photoURL || 'https://via.placeholder.com/40'} // Default image
                                    alt="Profile"
                                    width={40}
                                    height={40}
                                    className="rounded-full" // Makes the image circular
                                />

                                <ChevronDownIcon className="w-5 h-5 ml-1" />
                            </button>
                            {isProfileDropdownOpen && (
                                <ul className="absolute bg-white text-black shadow-lg mt-2 rounded w-40">
                                    <li>
                                        <Link href={`/profile/${userProfile?.uid}`} onClick={closeSidebar} className="block px-4 py-2 hover:bg-gray-200">
                                            Lihat Profil
                                        </Link>
                                    </li>
                                    <li>
                                        <button
                                            onClick={handleLogout}
                                            className="block px-4 py-2 hover:bg-gray-200 w-full text-left"
                                        >
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            )}
                        </div>
                    ) : (
                        <li>
                            <button onClick={() => { onLoginClick(); closeSidebar(); }} className="text-blue-700 hover:bg-gray-100 hover:text-blue-400 border-2 border-blue-500 px-4 py-1 rounded w-full">
                                Masuk
                            </button>
                        </li>
                    )}
                    <li>
                        <button
                            onClick={toggleCariDropdown}
                            className="flex items-center text-black hover:text-gray-400 mt-20"
                            aria-expanded={isCariDropdownOpen}
                        >
                            Masih Cari?
                            <ChevronDownIcon className="w-5 h-5 ml-1" />
                        </button>
                        {isCariDropdownOpen && (
                            <ul className="bg-white text-black shadow-lg mt-2 rounded w-full space-y-2">
                                <li>
                                    <Link href="/item1" onClick={closeSidebar} className="flex items-center px-4 py-2 hover:bg-gray-200">
                                        Kostan
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/item2" onClick={closeSidebar} className="flex items-center px-4 py-2 hover:bg-gray-200">
                                        Apartment
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>
                    <li>
                        <Link href="/rules" onClick={closeSidebar} className="text-black hover:text-gray-400 block">
                            Syarat yang berlaku dan aturan
                        </Link>
                    </li>
                    {/* Conditional rendering for login/logout in the sidebar */}

                </ul>
            </div>
        </>
    );
};

export default Navbar;
