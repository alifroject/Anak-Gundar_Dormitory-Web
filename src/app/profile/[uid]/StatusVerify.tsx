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

const Verify = () => {
    const [booking, setBooking] = useState<bookingData[]>([]);
    const [adminProfile, setAdminProfile] = useState<adminProfile | null>(null);
    const [admin, setIsAdmin] = useState(false);


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





    return (
        <div>
            {isLoggedIn ? (

                <>
                    <div>Welcome, {admin ? "Admin" : "User"}!</div>
                    <div className="bg-gray-100 min-h-screen flex flex-col items-center">
                        <h1 className="text-2xl font-semibold mb-4 text-black">Verifikasi</h1>

                        <div className="bg-white p-4 rounded-lg mb-4 flex-1 w-full">
                            <div className="h-full flex flex-col">
                                {booking.length > 0 ? (
                                    booking.map((booking) => (
                                        <div key={booking.id} className="border p-4 rounded-lg mb-4 flex flex-col text-black">
                                            <h2 className="text-lg font-semibold">{booking.nama}</h2>
                                            <div className="flex items-center text-sm text-gray-500 mb-2">
                                                <span className="text-green-500">Tersedia 2 Kamar</span>
                                            </div>
                                            <div className="text-sm text-gray-500 mb-2">Hitungan Sewa</div>
                                            <div className="text-lg font-semibold text-red-500 mb-2">
                                                Rp {booking.price.toLocaleString('id-ID')} <span className="text-sm text-gray-500">(Pembayaran pertama)</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="text-sm text-gray-500">Tanggal Masuk</div>
                                                    <div className="text-sm font-semibold">{new Date(booking.startDate).toLocaleDateString()}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Durasi Sewa</div>
                                                    <div className="text-sm font-semibold">{booking.priceOption}</div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-4">
                                                <Link href={`/profile/${userProfile?.uid}/bookingVerify/${booking.id}`}>Lanjut izinkan pengguna</Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex justify-center items-center">
                                        <div className="text-gray-500">No booking data available.</div>
                                    </div>
                                )}
                            </div>
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


