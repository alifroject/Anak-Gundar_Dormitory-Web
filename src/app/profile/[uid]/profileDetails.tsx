"use client"; // This indicates it's a client component

import React, { useState } from 'react';
import Image from 'next/image';
import { FaHome, FaBuilding, FaReceipt, FaCog, FaUser, FaTimes } from 'react-icons/fa';
import KosSaya from '@/app/profile/[uid]/KosSaya';
import RiwayatKos from '@/app/profile/[uid]/RiwayatKos';
import RiwayatTransaksi from '@/app/profile/[uid]/RiwayatTransaksi';
import Pengaturan from '@/app/profile/[uid]/Pengaturan';
import UpdateProfile from '@/app/profile/[uid]/updateProfile';

interface ProfileType {
    uid: string;
    displayName: string;
    photoURL: string;
    tanggalLahir?: { seconds: number };
}

const Profile = ({ userProfile }: { userProfile: ProfileType }) => {
    const [selectedSection, setSelectedSection] = useState('Kos Saya');

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
                return <UpdateProfile/>;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-full bg-gray-100">
            {/* Sidebar */}
            <div className="w-full md:w-1/4 mt-20 bg-white p-6 shadow-lg">
                <ul className="space-y-5 text-gray-700">
                    {/* Profile Section */}
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

                    {/* Navigation Sections */}
                    {['Kos Saya', 'Riwayat Kos', 'Riwayat Transaksi', 'Pengaturan'].map((section) => (
                        <li
                            key={section}
                            className="flex items-center text-sm hover:text-blue-500 cursor-pointer"
                            onClick={() => setSelectedSection(section)}
                        >
                            {section === 'Kos Saya' && <FaHome className="mr-3" />}
                            {section === 'Riwayat Kos' && <FaBuilding className="mr-3" />}
                            {section === 'Riwayat Transaksi' && <FaReceipt className="mr-3" />}
                            {section === 'Pengaturan' && <FaCog className="mr-3" />}
                            <span>{section}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-1 mt-4 md:mt-20  md:p-8 min-h-full">
                <div>
                    {renderMainContent()}
                </div>
            </div>
        </div>
    );
};

export default Profile;
