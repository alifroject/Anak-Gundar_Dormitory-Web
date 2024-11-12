"use client"
import React, { useState } from 'react';
import { dbFire } from "@/app/firebase/config";
import { doc, updateDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp from Firestore
interface Tenant {
    displayName: string;
    jenisKelamin: string;
    kampus: string;
    pekerjaan: string;
    phoneNumber: string;
    statusNikah: string;
    tanggalLahir: Date

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
    documents: Document[];
}

const BookingDetails = ({ useBooking }: { useBooking: BookingData }) => {
    const [status, setStatus] = useState(useBooking.status);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState<string>('');
    const [selectedImage, setSelectedImage] = useState<Document | null>(null);  // Track the selected image

    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setStatus(event.target.value);
    };

    const updateStatusInFirestore = async () => {
        setIsSaving(true);
        try {
            const bookingRef = doc(dbFire, "booking", useBooking.id);
            await updateDoc(bookingRef, { status: status });
            setTimeout(() => {
                setIsSaving(false);
                setModalMessage('Data berhasil diperbarui');
                setIsModalOpen(true);
            }, 2000);
        } catch (error) {
            console.error("Error updating status: ", error);
            setModalMessage('Gagal memperbarui data, coba lagi nanti');
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleImageClick = (document: Document) => {
        setSelectedImage(document);  // Set the selected image
    };

    const closeImageModal = () => {
        setSelectedImage(null);  // Close the image modal
    };

    return (
        <div className="m-5 mt-20 h-full text-black">
            {isSaving && (
                <div className="spinner-overlay absolute inset-0 flex justify-center items-center bg-opacity-50 bg-gray-800 z-50">
                    <div className="spinner-border animate-spin border-t-4 border-blue-500 border-solid rounded-full w-16 h-16"></div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-8 text-center max-w-sm transform scale-95 transition-all duration-300 ease-out hover:scale-100">
                        <div className="text-green-500 text-6xl mb-6">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <h1 className="text-3xl font-bold text-green-700 mb-4 font-poppins">User Berhasil Di Verifikasi</h1>
                        <p className="text-green-800 mb-6 text-lg font-inter">{modalMessage}</p>
                        <div className="flex justify-center space-x-6">
                            <button
                                className="bg-green-600 text-white px-6 py-3 rounded-md text-lg font-semibold shadow-md hover:bg-green-700 transition-colors duration-200 transform hover:scale-105"
                                onClick={closeModal}
                            >
                                Ok, Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="border border-gray-300 p-4 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-semibold mb-2">{useBooking.nama}</h3>
                <p className="mb-2">Price: {useBooking.price}</p>
                <p className="mb-2">Tanggal masuk: {useBooking.startDate}</p>
                <p className="mb-2">Nama: {useBooking.tenant.tanggalLahir.toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric' })}</p>






                

                {/* Display up to 4 image boxes */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="w-full h-[400px] border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            {useBooking.documents && useBooking.documents[index] ? (
                                <img
                                    src={useBooking.documents[index].url}
                                    alt={useBooking.documents[index].name}
                                    className="object-cover w-full h-full cursor-pointer"
                                    onClick={() => handleImageClick(useBooking.documents[index])}  // Handle click
                                />
                            ) : (
                                <span className="text-gray-400">No Image</span>
                            )}
                        </div>
                    ))}
                </div>

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

                <button
                    onClick={updateStatusInFirestore}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md mt-4"
                >
                    Update Status
                </button>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-6 relative">
                        <button
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-lg"
                            onClick={closeImageModal}
                        >
                            ×
                        </button>
                        <img src={selectedImage.url} alt={selectedImage.name} className="w-full h-[700px] object-cover" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingDetails;
