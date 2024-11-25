"use client";
import React, { useEffect, useState } from 'react';
import { auth, dbFire } from "@/app/firebase/config";
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

import { getAuth, onAuthStateChanged } from 'firebase/auth';

import Link from 'next/link';


interface Tenant {
    displayName: string;
    jenisKelamin: string;
    kampus: string;
    pekerjaan: string;
    phoneNumber: string;
}



interface adminProfile {
    uid: string;
    email: string | null;
    username?: string | null;
    nama: string;
    role: string;
}


interface bookingData {
    id: string;
    nama: string;
    price: number;
    priceOption: string;
    startDate: string;
    status: string;
    tenant: Tenant;
    uid: string;
    kostanId: string; // ID kosan yang dipesan
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
interface KostanData {
    id: string;

    jenis: string;
    nama: string;
    region: string;
    sisaKamar: number;
    ukuranKamar: string;
    type: string;


}


const Verify = () => {
    const [booking, setBooking] = useState<bookingData[]>([]);
    const [adminProfile, setAdminProfile] = useState<adminProfile | null>(null);
    const [, setIsAdmin] = useState(false);
    const [kostanData, setKostanData] = useState<KostanData[]>([]);


    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);



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


    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAdmin(user.email === 'admin@gmail.com');
                setAdminProfile({ uid: user.uid, email: user.email, username: '', nama: '', role: '' });
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchBookingDoc = async (): Promise<void> => {
            try {
                const bookingDocument = collection(dbFire, 'booking');
                const bookingSnapshot = await getDocs(bookingDocument);
                const bookingDocs = bookingSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }) as bookingData)
                    // Remove the filter by adminProfile?.uid since admin views all bookings
                    .filter(doc => doc.status === "unverified");  // Example: Filter by status (unverified)

                if (bookingDocs.length > 0) {
                    setBooking(bookingDocs);
                } else {
                    console.log('No booking data found');
                }
            } catch (error) {
                console.error('Error fetching booking data:', error);
            }
        };

        if (adminProfile?.uid) {
            fetchBookingDoc();
        }
    }, [adminProfile]); // Trigger when adminProfile is updated


    useEffect(() => {
        const fetchKostanData = async () => {
            try {
                const querySnapshot = await getDocs(collection(dbFire, 'home'));
                const data = querySnapshot.docs.map((doc) => {
                    const kostan = doc.data();
                    console.log("Data Kosan:", kostan); // Menampilkan data kosan di konsol
                    return {
                        id: doc.id,
                        nama: kostan.nama ?? '',
                        region: kostan.region ?? '',
                        sisaKamar: kostan.sisaKamar ?? 0,
                        ukuranKamar: kostan.ukuranKamar ?? '',
                        type: kostan.type ?? '',
                        jenis: kostan.jenis ?? '' // Menambahkan properti jenis dengan nilai default
                    };
                });
                setKostanData(data); // Set data yang sudah ditambahkan properti 'jenis'
            } catch (error) {
                console.error("Error fetching kostan data:", error);
            }
        };

        fetchKostanData();
    }, []);




    return (
        <div>
            {isLoggedIn ? (

                <>

                    <div className="min-h-screen flex flex-col items-center">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 mb-6 text-center drop-shadow-lg">
                            Verifikasi
                        </h1>


                        <div className="h-full w-full flex flex-col">
                            {booking.length > 0 ? (
                                booking.map((bookingItem) => (
                                    <div key={bookingItem.id} className="border border-gray-300 p-6 rounded-lg mb-6 flex flex-col bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200">
                                        <h2 className="text-2xl font-extrabold text-indigo-700 mb-2">{bookingItem.nama}</h2>
                                        <h2 className="text-sm font-semibold text-gray-800">Nama penyewa: {bookingItem.tenant.displayName}</h2>

                                        {kostanData
                                            .filter(kostan => kostan.id === bookingItem.kostanId)
                                            .map(matchedKostan => (
                                                <div key={matchedKostan.id} className="mt-4 p-4 bg-white rounded-lg shadow-md md:w-[400px]">
                                                    <p className="text-sm text-gray-700 font-medium">Nama Kosan: <span className="font-semibold text-indigo-600">{matchedKostan.nama}</span></p>
                                                    <p className="text-sm text-gray-700 font-medium">Sisa Kamar: <span className="font-semibold text-green-600">{matchedKostan.sisaKamar}</span></p>
                                                    <p className="text-sm text-gray-700 font-medium">Ukuran Kamar: <span className="font-semibold text-orange-600">{matchedKostan.ukuranKamar}</span></p>
                                                </div>
                                            ))}
                                        <div className="text-sm text-gray-500 mt-4">Hitungan Sewa</div>
                                        <div className="text-xl font-semibold text-red-600 mt-2">
                                            Rp {bookingItem.price.toLocaleString('id-ID')} <span className="text-sm text-gray-500">(Pembayaran pertama)</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-4">
                                            <div>
                                                <div className="text-sm text-gray-500">Tanggal Masuk</div>
                                                <div className="text-sm font-semibold text-gray-700">{new Date(bookingItem.startDate).toLocaleDateString()}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500">Durasi Sewa</div>
                                                <div className="text-sm font-semibold text-gray-700">{bookingItem.priceOption}</div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-6">
                                            <Link className="bg-indigo-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200" href={`/profile/${userProfile?.uid}/bookingVerify/${bookingItem.id}`}>

                                                <span className="text-lg font-semibold">Lanjut izinkan pengguna</span>

                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col justify-center items-center">
                                    <div className="text-gray-500 mb-4 text-lg">Tidak ada data booking tersedia.</div>
                                    <hr className="border-t-4 mb-6 border-gray-900 w-full" />
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div>Please log in</div>
            )}
        </div>
    );
};

export default Verify;


