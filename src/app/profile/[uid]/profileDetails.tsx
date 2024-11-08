"use client";
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Image from 'next/image';
import { FaHome, FaBuilding, FaReceipt, FaCog, FaUser } from 'react-icons/fa';
import KosSaya from '@/app/profile/[uid]/KosSaya';
import RiwayatKos from '@/app/profile/[uid]/RiwayatKos';
import RiwayatTransaksi from '@/app/profile/[uid]/RiwayatTransaksi';
import Pengaturan from '@/app/profile/[uid]/Pengaturan';
import UpdateProfile from '@/app/profile/[uid]/updateProfile';
import AddHomes from '@/app/profile/[uid]/Add-homes';
import Verify from '@/app/profile/[uid]/StatusVerify';
import BookPageVerify from '@/app/profile/[uid]/bookingVerify/[id]/bookingDetailsVerify';

interface ProfileType {
    uid: string;
    displayName: string;
    photoURL: string;
    tanggalLahir?: { seconds: number };
}

const Profile = ({ userProfile }: { userProfile: ProfileType | null }) => {
    const [selectedSection, setSelectedSection] = useState('Kos Saya');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAdmin(user.email === 'admin@gmail.com'); // Ganti dengan email admin sebenarnya
            }
        });
        return () => unsubscribe();
    }, []);

    const renderMainContent = () => {
        switch (selectedSection) {
            case 'Kos Saya':
                return <KosSaya />;
            case 'Riwayat Kos':
                return <RiwayatKos />;
            case 'Riwayat Transaksi':
                return <RiwayatTransaksi />;
            case 'Pengaturan':
                return <Pengaturan />;
            case 'Update Profile':
                return <UpdateProfile />;
            case 'Admin Panel':
                return <AddHomes />
            case 'Verify':
                return <Verify />
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-full bg-gray-100">
            <div className="w-full md:w-1/4 mt-20 bg-white p-6 shadow-lg">
                <ul className="space-y-5 text-gray-700">
                    <li
                        className="flex items-center cursor-pointer"
                        onClick={() => setSelectedSection('Update Profile')}
                    >
                        <Image
                            src={userProfile?.photoURL || 'https://via.placeholder.com/40'}
                            alt="Profile"
                            width={40}
                            height={40}
                            className="rounded-full mr-3"
                        />
                        <div>
                            <h2 className="font-semibold text-lg text-black">
                                {userProfile?.displayName || 'User'}
                            </h2>
                            {userProfile?.tanggalLahir && (
                                <p className="text-sm text-gray-500">
                                    Tanggal Lahir: {new Date(userProfile.tanggalLahir.seconds * 1000).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </li>

                    {/* Tampilkan hanya "Admin Panel" jika pengguna adalah admin */}
                    {isAdmin ? (
                        <>
                            <li
                                className="flex items-center text-sm hover:text-blue-500 cursor-pointer"
                                onClick={() => setSelectedSection('Admin Panel')}
                            >
                                <FaUser className="mr-3" />
                                <span>Admin Panel</span>
                            </li>
                            <li
                                className="flex items-center text-sm hover:text-blue-500 cursor-pointer"
                                onClick={() => setSelectedSection('Verify')}
                            >
                                <FaUser className="mr-3" />
                                <span>Verify</span>
                            </li>
                        </>

                    ) : (
                        // Tampilkan bagian lainnya jika pengguna bukan admin
                        <>
                            <li
                                className="flex items-center text-sm hover:text-blue-500 cursor-pointer"
                                onClick={() => setSelectedSection('Kos Saya')}
                            >
                                <FaHome className="mr-3" />
                                <span>Kos Saya</span>
                            </li>
                            <li
                                className="flex items-center text-sm hover:text-blue-500 cursor-pointer"
                                onClick={() => setSelectedSection('Riwayat Kos')}
                            >
                                <FaBuilding className="mr-3" />
                                <span>Riwayat Kos</span>
                            </li>
                            <li
                                className="flex items-center text-sm hover:text-blue-500 cursor-pointer"
                                onClick={() => setSelectedSection('Riwayat Transaksi')}
                            >
                                <FaReceipt className="mr-3" />
                                <span>Riwayat Transaksi</span>
                            </li>
                            <li
                                className="flex items-center text-sm hover:text-blue-500 cursor-pointer"
                                onClick={() => setSelectedSection('Pengaturan')}
                            >
                                <FaCog className="mr-3" />
                                <span>Pengaturan</span>
                            </li>
                        </>
                    )}
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-1 mt-4 md:mt-20 md:p-8 min-h-full">
                <div>{renderMainContent()}</div>
            </div>
        </div>
    );
};

export default Profile;
