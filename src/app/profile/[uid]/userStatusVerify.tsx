"use client";
import React, { useEffect, useState } from 'react';
import { auth, dbFire, } from "@/app/firebase/config";
import { collection, getDocs, query, where, getDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { FaCheckCircle } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons';

interface Tenant {
    displayName: string;
    jenisKelamin: string;
    kampus: string;
    pekerjaan: string;
    phoneNumber: string;
    kotaAsal: string;
}

interface BookingData {
    id: string;
    nama: string;
    price: number;
    priceOption: string;
    startDate: string;
    status: string;
    tenant: Tenant;
    uid: string;
    kostanId: string;
}
interface SnapPaymentOptions {
    onSuccess: (result: SnapPaymentResult) => void;
    onPending: (result: SnapPaymentResult) => void;
    onError: (result: SnapPaymentResult) => void;
    onClose: () => void;
}

interface SnapPaymentResult {
    transaction_status: string;
    order_id: string;
    gross_amount: number;
    status_code: number;
    payment_type: string;
    bank: string;
    // Add other properties based on Midtrans Snap API response
}

interface Snap {
    pay: (token: string, options: SnapPaymentOptions) => void;
    // Add any other methods if needed, e.g., for handling payment status, etc.
}

declare global {
    interface Window {
        snap: Snap; // Add type declaration for Midtrans Snap
    }
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


const UserVerify: React.FC = () => {
    const [booking, setBooking] = useState<BookingData[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [, setUserProfile] = useState<UserProfile | null>(null);

    // Fetch user bookings
    useEffect(() => {
        const fetchUserBookings = async (uid: string) => {
            try {
                const bookingRef = collection(dbFire, 'booking');
                const userBookingQuery = query(bookingRef, where("uid", "==", uid));
                const snapshot = await getDocs(userBookingQuery);

                const userBookings = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as BookingData[];

                setBooking(userBookings);
            } catch (error) {
                console.error("Error fetching user bookings:", error);
            }
        };

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setIsLoggedIn(true);
                fetchUserBookings(user.uid);
            } else {
                setIsLoggedIn(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Load Midtrans Snap SDK
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // Handle payment button click
    const handleLanjutkanBayar = async (bookingId: string) => {
        try {
            // Fetch the payment token
            const response = await fetch("/api/midtransToken", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orderId: bookingId,
                    grossAmount: booking.find((b) => b.id === bookingId)?.price,
                    kostanId: booking.find((b) => b.id === bookingId)?.kostanId,
                    nama: booking.find((b) => b.id === bookingId)?.nama,

                    customerDetails: {
                        first_name: auth.currentUser?.displayName || "Guest",
                        email: auth.currentUser?.email || "guest@example.com",
                        kampus: booking.find((b) => b.id === bookingId)?.tenant.kampus,
                        phoneNumber: booking.find((b) => b.id === bookingId)?.tenant.phoneNumber,
                        kotaAsal: booking.find((b) => b.id === bookingId)?.tenant.kotaAsal
                    },

                }),
            });

            const data = await response.json();
            console.log('Token response:', data);
            console.log("client", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY)

            if (data.token) {
                // Temporarily prevent redirects in the Snap SDK by capturing the result and not triggering the default redirect
                window.snap.pay(data.token, {
                    onSuccess: async function (result: SnapPaymentResult) {
                        console.log("Payment success:", result);

                        const paymentData = {
                            ...result,
                            first_name: auth.currentUser?.displayName,
                            email: auth.currentUser?.email,
                            kampus: booking.find((b) => b.id === bookingId)?.tenant.kampus,
                            phoneNumber: booking.find((b) => b.id === bookingId)?.tenant.phoneNumber,
                            kotaAsal: booking.find((b) => b.id === bookingId)?.tenant.kotaAsal,
                            nama: booking.find((b) => b.id === bookingId)?.nama
                        };

                        const kostanId = booking.find((b) => b.id === bookingId)?.kostanId;

                        if (kostanId) {
                            // Reference to the kostan document
                            const kostanRef = doc(dbFire, "home", kostanId);

                            // Fetch the current sisaKamar value
                            const kostanDoc = await getDoc(kostanRef);
                            if (kostanDoc.exists()) {
                                const currentSisaKamar = kostanDoc.data().sisaKamar;

                                if (currentSisaKamar > 0) {
                                    // Decrement the sisaKamar by 1
                                    await updateDoc(kostanRef, {
                                        sisaKamar: currentSisaKamar - 1
                                    });

                                    console.log("Room availability updated, remaining rooms:", currentSisaKamar - 1);
                                } else {
                                    console.log("No rooms available.");
                                }
                            } else {
                                console.log("Kostan document not found.");
                            }
                        }
                        const bookingRef = doc(dbFire, "booking", bookingId); // Reference to the booking document
                        try {
                            await deleteDoc(bookingRef);
                            console.log("Booking deleted successfully");
                        } catch (e) {
                            console.error("Error deleting booking: ", e);
                        }

                        // Store the result in local storage for further use
                        localStorage.setItem('paymentResult', JSON.stringify(paymentData));

                        console.log(localStorage.getItem('paymentResult'));

                        const redirectUrl = `http://localhost:3000/dataTransaksi?order_id=${result.order_id}&status_code=${result.status_code}&transaction_status=${result.transaction_status}`;
                        window.location.href = redirectUrl;

                        // Display a custom success message (you can replace this with a modal or update the UI as you like)
                        alert('Payment was successful! You will not be redirected.');

                        // Show success message on the page
                        document.getElementById("payment-success-message")!.style.display = 'block';

                        // Delete the booking after successful payment


                    },
                    onPending: function (result: SnapPaymentResult) {
                        console.log("Payment pending:", result);
                        localStorage.setItem('paymentResultPending', JSON.stringify(result));
                        console.log(localStorage.getItem('paymentResultPending'));
                    },
                    onError: function (result: SnapPaymentResult) {
                        console.log("Payment error:", result);
                    },
                    onClose: function () {
                        console.log("Payment popup closed");
                    },
                } as SnapPaymentOptions);
            }

        } catch (error) {
            console.error("Error fetching payment token:", error);
        }
    };

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

    return (
        <div className="h-screen p-4 bg-gray-100  overflow-auto">
            {isLoggedIn ? (
                <>
                    <div className="bg-gradient-to-r   from-blue-500 via-indigo-600 to-purple-700 shadow-lg border border-indigo-800 rounded-xl p-6 md:p-10 w-full max-w-3xl mx-auto mt-10">
                        <div className="flex h-full flex-col items-center text-center">
                            {/* Judul */}
                            <h1 className="text-2xl md:text-3xl font-bold text-white-800 mb-6 drop-shadow-sm">
                                Status Verifikasi Booking
                            </h1>
                            {/* Ikon */}
                            <div className="mb-1 bg-gradient-to-r from-green-400 to-blue-500 p-4 rounded-full shadow-lg">
                                <FontAwesomeIcon icon={faClipboardCheck} className="text-white text-4xl" />
                            </div>
                            {/* Status */}

                        </div>
                    </div>

                    <div className="bg-white p-8 mt-10 rounded-xl shadow-xl w-full max-w-4xl mx-auto">
                        {booking.length > 0 ? (
                            booking.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="border-b-2 border-blue-500 pb-6 mb-6 text-gray-800"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-bold">{booking.nama}</h2>
                                        <div
                                            className={`px-3 py-1 rounded-full text-sm ${booking.status === "verified"
                                                    ? "bg-green-100 text-green-600"
                                                    : "bg-red-100 text-red-600"
                                                }`}
                                        >
                                            {booking.status === "verified" ? (
                                                <div className="flex items-center gap-1">
                                                    <FaCheckCircle className="text-green-600" />
                                                    <span>{booking.status}</span>
                                                </div>
                                            ) : (
                                                <span>{booking.status}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-sm mb-2">
                                        <p>
                                            <span className="font-semibold">Harga:</span> Rp{" "}
                                            {booking.price.toLocaleString("id-ID")}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Durasi:</span> {booking.priceOption}
                                        </p>
                                    </div>
                                    {booking.status === "verified" && (
                                        <button
                                            onClick={() => handleLanjutkanBayar(booking.id)}
                                            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 px-6 rounded-lg shadow hover:from-blue-700 hover:to-blue-600 transition-all"
                                        >
                                            Lanjutkan Bayar
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-500 text-center">
                                Belum ada data booking yang tersedia.
                            </div>
                        )}
                    </div>

                </>
            ) : (
                <div>Silakan login terlebih dahulu.</div>
            )}
        </div>
    );
};

export default UserVerify;
