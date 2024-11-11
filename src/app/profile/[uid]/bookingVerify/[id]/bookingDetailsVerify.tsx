"use client";
import React, { useState } from 'react';
import { dbFire } from "@/app/firebase/config";
import { doc, updateDoc } from 'firebase/firestore';
interface Tenant {
    displayName: string;
    jenisKelamin: string;
    kampus: string;
    pekerjaan: string;
    phoneNumber: string;
}

interface Document {
    name: string;
    url: string;
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
    documents?: Document[];
}

const BookingDetails = ({ useBooking }: { useBooking: BookingData }) => {
    // State untuk status
    const [status, setStatus] = useState(useBooking.status);

    // Fungsi untuk mengubah status
    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setStatus(event.target.value);
    };

    // Fungsi untuk mengupdate status di Firestore
    const updateStatusInFirestore = async () => {
        try {
            const bookingRef = doc(dbFire, "booking", useBooking.id); // Mengakses dokumen booking berdasarkan id
            await updateDoc(bookingRef, { status: status }); // Mengupdate status
            alert("Status updated successfully!"); // Menampilkan notifikasi
        } catch (error) {
            console.error("Error updating status: ", error);
            alert("Failed to update status.");
        }
    };

    return (
        <div className="m-5 mt-20 h-screen text-black">
            {/* Box untuk menampilkan detail booking */}
            <div className="border border-gray-300 p-4 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-semibold mb-2">{useBooking.nama}</h3>
                <p className="mb-2">Price: {useBooking.price}</p>
                <p className="mb-2">Start Date: {useBooking.startDate}</p>
                <p className="mb-2">Tenant: {useBooking.tenant.displayName}</p>

                {/* Status dengan dropdown untuk mengubah status */}
                <div className="mb-4">
                    <label htmlFor="status" className="block text-lg font-medium mb-2">Status:</label>
                    <select
                        id="status"
                        value={status}
                        onChange={handleStatusChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="unverified">Unverified</option>
                        <option value="verified">Verified</option>
                    </select>
                </div>

                {/* Tombol untuk mengupdate status */}
                <button
                    onClick={updateStatusInFirestore}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md mt-4"
                >
                    Update Status
                </button>
            </div>
        </div>
    );
};

export default BookingDetails;
