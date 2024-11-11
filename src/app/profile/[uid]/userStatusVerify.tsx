"use client";
import React, { useEffect, useState } from 'react';
import { auth, dbFire } from "@/app/firebase/config";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FaCheckCircle } from 'react-icons/fa';

interface Tenant {
    displayName: string;
    jenisKelamin: string;
    kampus: string;
    pekerjaan: string;
    phoneNumber: string;
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
const UserVerify: React.FC = () => {
    const [booking, setBooking] = useState<BookingData[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

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
                    customerDetails: {
                        first_name: auth.currentUser?.displayName || "Guest",
                        email: auth.currentUser?.email || "guest@example.com",
                    },
                }),
            });

            const data = await response.json();

            if (data.token) {
                // Open the Snap popup
                window.snap.pay(data.token, {
                    onSuccess: function (result: SnapPaymentResult) {
                        alert("Payment successful!");
                        console.log(result);
                    },
                    onPending: function (result: SnapPaymentResult) {
                        alert("Payment pending...");
                        console.log(result);
                    },
                    onError: function (result: SnapPaymentResult) {
                        alert("Payment failed.");
                        console.log(result);
                    },
                    onClose: function () {
                        alert("You closed the payment popup.");
                    },
                });
            }
        } catch (error) {
            console.error("Error fetching payment token:", error);
        }
    };

    return (
        <div className="min-h-screen p-4 bg-gray-100">
            {isLoggedIn ? (
                <>
                    <h1 className="text-2xl font-semibold text-black mb-6">Status Verifikasi Booking</h1>
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full">
                        {booking.length > 0 ? (
                            booking.map((booking) => (
                                <div key={booking.id} className="border-b pb-4 mb-4 text-black">
                                    <h2 className="text-lg font-semibold mb-2">{booking.nama}</h2>
                                    <div className="flex items-center text-sm text-gray-600 mb-2">
                                        <span>Status: </span>
                                        {booking.status === 'verified' && (
                                            <div className="flex items-center ml-2 text-green-600">
                                                <FaCheckCircle className="mr-2" />
                                                <span>{booking.status}</span>
                                            </div>
                                        )}
                                        {booking.status !== 'verified' && (
                                            <span className="ml-2 text-red-600">{booking.status}</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500 mb-2">
                                        Harga: Rp {booking.price.toLocaleString('id-ID')}
                                    </div>
                                    <div className="text-sm text-gray-500 mb-4">Durasi: {booking.priceOption}</div>

                                    {/* Display "Lanjutkan Bayar" button for Verified status */}
                                    <button
                                        onClick={() => handleLanjutkanBayar(booking.id)}
                                        className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition"
                                    >
                                        Lanjutkan Bayar
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-500">Belum ada data booking yang tersedia.</div>
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
