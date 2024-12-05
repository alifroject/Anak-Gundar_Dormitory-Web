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
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { MdHelp } from "react-icons/md"; // Import ikon baru

import { FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';


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

    const ownerPhone = process.env.NEXT_PUBLIC_OWNER_PHONE;

    // Format nomor untuk WhatsApp (menghapus simbol dan spasi jika perlu)
    const formatPhoneNumber = (phone: string | undefined) => {
        if (!phone) return '';
        return phone.replace(/[^0-9]/g, ''); // Menghapus karakter non-digit
    };
    const formattedPhone = formatPhoneNumber(ownerPhone);


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
            <nav className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-700 
              md:bg-gradient-to-r md:from-purple-700 md:via-indigo-700 md:to-pink-700 
              w-full h-[120px] fixed top-0 left-0 flex justify-between items-center z-30 shadow-lg border-b border-gray-300 hover:shadow-2xl">
                {/* Logo */}
                <div className="flex items-center">
                    <Link href="/">
                        <img
                            src="/anakGundar.png"
                            alt="Description of the image"

                            className="ml-10 w-[150px] md:w-[200px] md:h-[180px]"
                        />
                    </Link>
                </div>

                <div className="md:hidden mr-2">
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
                            <span className='text-white' style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: '500' }}>
                                Masih Cari?
                            </span>


                            <ChevronDownIcon className="w-5 h-5 ml-1 text-white" />
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
                            <span className='text-white' style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: '500' }}>
                                Syarat dan Aturan yang berlaku
                            </span>
                        </Link>
                    </li>
                    <li>
                        <a
                            href="https://www.instagram.com/gunadarma/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-500 hover:text-pink-800 text-2xl transition duration-300 ease-in-out"
                        >
                            <FaInstagram />
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://x.com/gunadarma_"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-800 text-2xl transition duration-300 ease-in-out"
                        >
                            <FaTwitter />
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://www.youtube.com/@ugtvofficial"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-500 hover:text-red-800 text-2xl transition duration-300 ease-in-out"
                        >
                            <FaYoutube />
                        </a>
                    </li>

                    {isLoggedIn ? (
                        <div className="relative">
                            <button
                                onClick={toggleProfileDropdown}
                                className="flex items-center ml-40 text-gray-800 hover:text-blue-500 px-4 py-2 rounded-lg transition-all duration-200"
                                aria-expanded={isProfileDropdownOpen}
                            >
                                <Image
                                    src={userProfile?.photoURL || 'https://via.placeholder.com/40'} // Default image
                                    alt="Profile"
                                    width={40}
                                    height={40}
                                    className="rounded-full border-2 border-gray-300"
                                />
                                <ChevronDownIcon className="w-5 h-5 ml-1 text-white" />
                            </button>
                            {isProfileDropdownOpen && (
                                <ul className="absolute bg-white text-black shadow-md ml-40 mt-2 rounded-lg w-48 border border-gray-200">
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
                        <li className='ml-40'>
                            <button onClick={onLoginClick} className="text-white ml-40 md:w-[100px] bg-blue-500 hover:bg-blue-600 border-2 border-blue-500 px-6 py-2 rounded-lg transition-all duration-200 w-full">
                                Masuk
                            </button>
                        </li>
                    )}
                </ul>

            </nav>

            {/* Sidebar */}
            {isSidebarOpen && (
                <div className="fixed  inset-0 z-20 bg-black bg-opacity-50" onClick={closeSidebar}></div>
            )}
            <div className={`fixed top-0 left-0 h-full  w-64 p-5 bg-white transition-transform transform overflow-y-auto scrollbar-hide ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} z-30`} style={{
                scrollbarWidth: 'none', /* Firefox */
                msOverflowStyle: 'none', /* IE and Edge */
            }}>

                <div className={`p-0 ${isSidebarOpen ? 'block' : 'hidden'}`}>
                    <Link href="/" onClick={closeSidebar}>
                        <Image
                            src="https://firebasestorage.googleapis.com/v0/b/anak-gundar.appspot.com/o/AnakGundarSideaa.png?alt=media&token=3a7584ad-0d4a-4340-84c6-995ef6e79c37"
                            alt="Description of the image"
                            width={180}
                            height={170}
                            className="ml-6"
                        />

                    </Link>
                </div>
                <hr className='text-black w-full border-t-4 border-black' />

                <ul className="space-y-4 mb-7 mt-4 h-full  p-4">
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
                            className="flex items-center text-gray-900 hover:text-blue-600 px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-md bg-gray-50 hover:bg-blue-50"
                            aria-expanded={isCariDropdownOpen}
                        >
                            <MagnifyingGlassIcon className="w-6 h-6 mr-2 text-blue-500" />
                            Masih Cari?
                            <ChevronDownIcon className="w-6 h-6 ml-auto text-gray-600" />
                        </button>
                        {isCariDropdownOpen && (
                            <ul className="bg-white text-gray-900 shadow-lg mt-2 rounded-lg p-4 space-y-3">
                                <li>
                                    <Link
                                        href="/kostan"
                                        onClick={closeSidebar}
                                        className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-sm border-b border-transparent hover:border-blue-500"
                                    >
                                        <FaHome className="w-6 h-6 mr-3 text-blue-500" />
                                        <span className="font-medium text-[15px]">Kostan</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/apartment"
                                        onClick={closeSidebar}
                                        className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-sm border-b border-transparent hover:border-blue-500"
                                    >
                                        <FaBuilding className="w-6 h-6 mr-3 text-blue-500" />
                                        <span className="font-medium text-[15px]">Apartment</span>
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>
                    <li>
                        <Link
                            href="/rules"
                            onClick={closeSidebar}
                            className="flex items-center text-gray-900 hover:text-blue-600 px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-md bg-gray-50 hover:bg-blue-100"
                        >
                            <DocumentTextIcon className="w-7 h-7 mr-3 text-blue-500" />
                            Syarat dan Aturan
                        </Link>
                    </li>

                    <li>
                        <Link
                            href={`https://wa.me/${formattedPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            <FontAwesomeIcon icon={faWhatsapp} style={{ color: 'green' }} className="w-7 h-7" />
                            <p className="text-[14px] font-medium text-green-800">
                                Contact Admin
                            </p>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="https://www.instagram.com/reel/DAi2aZKo3df/?igsh=OXd3NWFlODY5OTdv"
                            onClick={closeSidebar}
                            className="flex items-center text-gray-900 hover:text-blue-600 px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-md bg-gray-50 hover:bg-blue-100"
                        >
                            <MdHelp className="w-7 h-7 mr-3 text-blue-500" />
                            FAQ
                        </Link>
                    </li>

                    <li>
                        <a
                            href="https://www.instagram.com/gunadarma/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-500 hover:text-pink-800 flex items-center text-gray-900 hover:text-blue-600 px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-md bg-gray-50 hover:bg-pink-100"
                        >
                            <FaInstagram className='w-7 h-7' /> <span className='ml-4'>Instagram</span>
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://x.com/gunadarma_"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-300 hover:text-blue-800 flex items-center text-blue-500 hover:text-blue-600 px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-md bg-gray-50 hover:bg-blue-100"
                        >
                            <FaTwitter className='w-7 h-7' /> <span className='ml-4'>Twitter</span>
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://www.youtube.com/@ugtvofficial"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-500  hover:text-red-800 flex items-center text-gray-900 hover:text-blue-600 px-4 py-3 my-5 rounded-lg font-medium transition-all duration-200 shadow-md bg-gray-50 hover:bg-red-100"
                        >
                            <FaYoutube className='w-7 h-7' /> <span className='ml-4'>YouTube</span>
                        </a>
                    </li>

                    {/* Conditional rendering for login/logout in the sidebar */}

                </ul>
            </div>
        </>
    );
};

export default Navbar;
