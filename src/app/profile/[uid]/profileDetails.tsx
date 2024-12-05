"use client";
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Image from 'next/image';
import { FaBuilding, FaReceipt, FaHeart, FaUser } from 'react-icons/fa';
import KosSaya from '@/app/profile/[uid]/KosSaya';
import RiwayatKos from '@/app/profile/[uid]/RiwayatKos';
import RiwayatTransaksi from '@/app/profile/[uid]/RiwayatTransaksi';
import Pengaturan from '@/app/profile/[uid]/Pengaturan';
import UpdateProfile from '@/app/profile/[uid]/updateProfile';
import AddHomes from '@/app/profile/[uid]/Add-homes';
import Verify from '@/app/profile/[uid]/StatusVerify';
import UserVerify from '@/app/profile/[uid]/userStatusVerify';
import EditHomes from '@/app/profile/[uid]/EditHomes';
import { GeoPoint } from 'firebase/firestore';
import { FaCheckCircle, FaHome } from 'react-icons/fa'; // Import the icon

interface ProfileType {
    uid: string;
    displayName: string;
    photoURL: string;
    tanggalLahir?: { seconds: number };
}




interface Fal {
    AC: boolean;
    kasur: boolean;
    kipas: boolean;
    kursi: boolean;
    lemari: boolean;
    meja: boolean;
    ventilasi: boolean;
    kamar_mandi_dalam: boolean;
    kamar_mandi_luar: boolean;
    areaLoundryJemur: boolean;
    Free_Electricity: boolean;
    dapur: boolean;
    parkirMotor: boolean;
    parkirMobil: boolean;
}

interface Images {
    image1: string | null;
    image2: string | null;
    image3: string | null;
    image4: string | null;
}

interface Alamat {
    provinsi: string;
    kota_kabupaten: string;
    kecamatan: string;
    Desa_Kelurahan: string;
    Jalan: string;
    Nomor_Rumah: string;
    Kode_Pos: string;
}

interface Peraturan {
    umum: string;
    tamu: string;
    kebersihan: string;
    pembayaran: string;
    lainnya: string;
}

interface Price {
    perBulan: number;
    perHari: number;
    perMinggu: number;
}

interface KostanData {
    id: string;
    Price: Price;
    fal: Fal;
    images: Images;
    jenis: string;
    nama: string;
    region: string;
    sisaKamar: number;
    ukuranKamar: string;
    type: string;
    alamat: Alamat;
    peraturan: Peraturan;
    ownerName: string;
    ownerPhoneNumber: string;
    geolokasi: GeoPoint; // Geolocation
}

const Profile = ({ userProfile }: { userProfile: ProfileType | null }) => {
    const [selectedSection, setSelectedSection] = useState('Kos Saya');
    const [isAdmin, setIsAdmin] = useState(false);
    const initialData: KostanData | null = null;

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAdmin(user.email === 'admin12@gmail.com'); // Ganti dengan email admin sebenarnya
            }
        });
        return () => unsubscribe();
    }, []);

    const renderMainContent = () => {
        switch (selectedSection) {
            case 'Kos Saya':
                return <KosSaya />;
            case 'Riwayat Kos':
                return <RiwayatKos initialData={initialData} />;
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
            case 'Status Verifikasi':
                return <UserVerify />
            case 'Edit Homes':
                return <EditHomes />
            default:
                return null;
        }
    };

    return (
        <div className="flex  flex-col md:flex-row h-full bg-gradient-to-r from-blue-100 to-purple-200">
            <div className="w-full md:w-1/4 mt-20 bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 p-6 shadow-xl rounded-lg border border-gray-200">
                <ul className="space-y-1 text-gray-700">
                    <li
                        className="flex items-center cursor-pointer hover:bg-blue-50 p-3 rounded-lg transition-colors"
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
                                className="flex items-center text-sm hover:text-blue-500 cursor-pointer hover:bg-blue-50 p-3 rounded-lg transition-colors"
                                onClick={() => setSelectedSection('Admin Panel')}
                            >
                                <FaHome className="mr-3 text-red-500 w-6 h-6" /> {/* Ikon Edit Homes */}
                                <span>Add Homes</span>
                            </li>
                            <li
                                className="flex items-center text-sm hover:text-blue-500 cursor-pointer hover:bg-blue-50 p-3 rounded-lg transition-colors"
                                onClick={() => setSelectedSection('Verify')}
                            >
                                <FaUser className="mr-3 text-blue-500 w-6 h-6" />
                                <span>Verify</span>
                            </li>
                            <li
                                className="flex items-center text-sm hover:text-blue-500 cursor-pointer hover:bg-blue-50 p-3 rounded-lg transition-colors"
                                onClick={() => setSelectedSection('Edit Homes')}
                            >
                                <FaHome className="mr-3 text-purple-500 w-6 h-6" /> {/* Ikon Edit Homes */}
                                <span>Edit Homes</span>
                            </li>
                        </>
                    ) : (
                        // Tampilkan bagian lainnya jika pengguna bukan admin
                        <>
                            <li
                                className="flex items-center text-sm hover:text-blue-500 cursor-pointer hover:bg-blue-50 p-3 rounded-lg transition-colors"
                                onClick={() => setSelectedSection('Riwayat Kos')}
                            >
                                <FaBuilding className="mr-3 w-6 h-6 text-black-500" />
                                <span>Riwayat Kos</span>
                            </li>
                            <li
                                className="flex items-center text-sm font-medium hover:text-purple-600 cursor-pointer hover:bg-purple-50 p-3 rounded-lg transition-colors"
                                onClick={() => setSelectedSection('Pengaturan')}
                            >
                                <FaHeart className="mr-3 text-red-500 w-6 h-6" /> 
                                <span>Home yang Di Sukai</span>
                            </li>

                            <li
                                className="flex items-center text-sm hover:text-blue-500 cursor-pointer hover:bg-blue-50 p-3 rounded-lg transition-colors"
                                onClick={() => setSelectedSection('Status Verifikasi')}
                            >
                                <FaCheckCircle className="mr-3 w-6 h-6 text-blue-500" />
                                <span>Status Verifikasi</span>
                            </li>

                            <li
                                className="flex items-center text-sm hover:text-blue-500 cursor-pointer hover:bg-blue-50 p-3 rounded-lg transition-colors"
                                onClick={() => setSelectedSection('Riwayat Transaksi')}
                            >
                                <FaReceipt className="mr-3 text-green-500 w-6 h-6" />
                                <span>Riwayat Transaksi</span>
                            </li>
                        </>
                    )}
                </ul>
            </div>

         
            <div className="flex-1 mt-4 md:mt-20 md:p-8 min-h-full">
                <div>{renderMainContent()}</div>
            </div>
        </div>

    );
};

export default Profile;
