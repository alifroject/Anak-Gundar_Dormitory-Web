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
import { doc, getDoc } from 'firebase/firestore';
import { FaHome, FaBuilding } from 'react-icons/fa';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { MagnifyingGlassIcon, DocumentTextIcon } from "@heroicons/react/24/outline";


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
                            src="/anakGundar.png"
                            alt="Description of the image"
                            width={120}
                            height={100}
                            className="ml-10"
                        />
                    </Link>
                </div>

                <div className="md:hidden">
                    <button onClick={toggleSidebar} className="text-black hover:text-gray-400 focus:outline-none">
                        {isSidebarOpen ? (
                            <div
                                className="flex items-center justify-center p-2 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 hover:shadow-lg transition-all duration-300"
                                aria-label="Close"
                            >
                                <XMarkIcon className="h-8 w-8" />
                            </div>
                        ) : (
                            <div
                                className="flex items-center justify-center p-3 rounded-full bg-blue-500 text-white shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-300"
                                aria-label="Open Menu"
                            >
                                <Bars3Icon className="h-8 w-8" />
                            </div>
                        )}
                    </button>
                </div>


                {/* Centered List Items for larger screens */}
                <ul className="hidden md:flex items-center justify-center space-x-8 flex-grow" style={{ fontFamily: 'Lato, sans-serif' }}>
                    <div className="relative">
                        <button
                            onClick={toggleCariDropdown}
                            className="flex items-center text-gray-800 hover:text-blue-500 px-4 py-2 rounded-lg transition-all duration-200"
                            aria-expanded={isCariDropdownOpen}
                        >
                            Masih Cari?
                            <ChevronDownIcon className="w-5 h-5 ml-1" />
                        </button>
                        {isCariDropdownOpen && (
                            <ul className="w-48 absolute bg-white text-gray-800 shadow-lg mt-2 rounded-lg border border-gray-300">
                                <li>
                                    <Link href="/kostan" className="flex items-center px-4 py-3 hover:bg-blue-50 rounded-lg">
                                        <FaHome className="w-5 h-5 mr-2 text-blue-500" /> {/* Ikon rumah untuk Kostan */}
                                        Kostan
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/apartment" className="flex items-center px-4 py-3 hover:bg-blue-50 rounded-lg">
                                        <FaBuilding className="w-5 h-5 mr-2 text-blue-500" /> {/* Ikon gedung untuk Apartment */}
                                        Apartment
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </div>

                    <li>
                        <Link href="/rules" className="text-gray-800 hover:text-blue-500 block px-4 py-3 rounded-lg transition-all duration-200">
                            Syarat yang berlaku dan aturan
                        </Link>
                    </li>

                    {isLoggedIn ? (
                        <div className="relative">
                            <button
                                onClick={toggleProfileDropdown}
                                className="flex items-center text-gray-800 hover:text-blue-500 px-4 py-2 rounded-lg transition-all duration-200"
                                aria-expanded={isProfileDropdownOpen}
                            >
                                <Image
                                    src={userProfile?.photoURL || 'https://via.placeholder.com/40'} // Default image
                                    alt="Profile"
                                    width={40}
                                    height={40}
                                    className="rounded-full border-2 border-gray-300"
                                />
                                <ChevronDownIcon className="w-5 h-5 ml-1" />
                            </button>
                            {isProfileDropdownOpen && (
                                <ul className="absolute bg-white text-black shadow-md mt-2 rounded-lg w-48 border border-gray-200">
                                    <li>
                                        <Link
                                            href={`/profile/${userProfile?.uid}`}
                                            onClick={closeSidebar}
                                            className="flex items-center px-4 py-3 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 rounded-lg transition-all duration-300"
                                        >
                                            <FontAwesomeIcon icon={faUserCircle} className="w-5 h-5 mr-3 text-blue-500" />
                                            <span className="font-medium">Lihat Profil</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center px-4 py-3 hover:bg-gradient-to-r hover:from-red-100 hover:to-red-200 rounded-lg transition-all duration-300 w-full text-left"
                                        >
                                            <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 mr-3 text-red-500" />
                                            <span className="font-medium">Logout</span>
                                        </button>
                                    </li>
                                </ul>

                            )}
                        </div>
                    ) : (
                        <li>
                            <button onClick={onLoginClick} className="text-white bg-blue-500 hover:bg-blue-600 border-2 border-blue-500 px-6 py-2 rounded-lg transition-all duration-200 w-full">
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
                            src="https://firebasestorage.googleapis.com/v0/b/anak-gundar.appspot.com/o/anakGundar.png?alt=media&token=c2ebe51d-1eae-45de-ac86-4ff65a2b6661"
                            alt="Description of the image"
                            width={100}
                            height={90}
                            className='ml-6'
                        />
                    </Link>
                </div>

                <ul className="space-y-4 mt-4 h-full bg-blue-50 p-4">
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
                                <ul className="absolute bg-white text-black shadow-md mt-2 rounded-lg w-48 border border-gray-200">
                                    <li>
                                        <Link
                                            href={`/profile/${userProfile?.uid}`}
                                            onClick={closeSidebar}
                                            className="flex items-center px-4 py-3 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 rounded-lg transition-all duration-300"
                                        >
                                            <FontAwesomeIcon icon={faUserCircle} className="w-5 h-5 mr-3 text-blue-500" />
                                            <span className="font-medium">Lihat Profil</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center px-4 py-3 hover:bg-gradient-to-r hover:from-red-100 hover:to-red-200 rounded-lg transition-all duration-300 w-full text-left"
                                        >
                                            <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 mr-3 text-red-500" />
                                            <span className="font-medium">Logout</span>
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
                            className="flex items-center text-gray-900 hover:text-blue-600 mt-6 px-4 py-2 rounded-md font-medium transition-all duration-200 border-b-2 border-transparent hover:border-blue-500"
                            aria-expanded={isCariDropdownOpen}
                        >
                            <MagnifyingGlassIcon className="w-5 h-5 mr-2" /> {/* Ikon cari sebelum teks */}
                            Masih Cari?
                            <ChevronDownIcon className="w-5 h-5 ml-2" />
                        </button>
                        {isCariDropdownOpen && (
                            <ul className="bg-white text-gray-900 shadow-lg mt-2 rounded-md w-full space-y-2">
                                <li>
                                    <Link href="/kostan" onClick={closeSidebar} className="flex items-center px-6 py-3 hover:bg-blue-50 rounded-md transition-all duration-200 border-b-2 border-transparent hover:border-blue-500">
                                        <FaHome className="w-5 h-5 mr-3 text-blue-500" />
                                        Kostan
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/apartment" onClick={closeSidebar} className="flex items-center px-6 py-3 hover:bg-blue-50 rounded-md transition-all duration-200 border-b-2 border-transparent hover:border-blue-500">
                                        <FaBuilding className="w-5 h-5 mr-3 text-blue-500" />
                                        Apartment
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>
                    <li>
                        <Link href="/rules" onClick={closeSidebar} className="flex items-center text-gray-900 hover:text-blue-600 block px-4 py-3 font-medium transition-all duration-200 border-b-2 border-transparent hover:border-blue-500">
                            <DocumentTextIcon className="w-5 h-5 mr-2" />
                            Syarat  dan aturan
                        </Link>
                    </li>

                    {/* Conditional rendering for login/logout in the sidebar */}

                </ul>
            </div>
        </>
    );
};

export default Navbar;
