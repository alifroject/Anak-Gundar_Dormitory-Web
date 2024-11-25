"use client"
import React, { useState } from 'react';
import { dbFire } from "@/app/firebase/config";
import { doc, updateDoc } from 'firebase/firestore';

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
    const [isStatusUpdated, setIsStatusUpdated] = useState(false); // State untuk mengontrol tampilan keterangan status

    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setStatus(event.target.value);
        setIsStatusUpdated(false); // Reset state saat status diubah
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
                setIsStatusUpdated(true); // Set state setelah update berhasil
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
        <div className="m-6 mt-16 h-full text-gray-900">
            {isSaving && (
                <div className="spinner-overlay absolute inset-0 flex justify-center items-center bg-opacity-50 bg-gray-800 z-50">
                    <div className="spinner-border animate-spin border-t-4 border-blue-500 border-solid rounded-full w-16 h-16"></div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-8 text-center max-w-sm transform scale-95 transition-all duration-300 ease-out hover:scale-100">
                        <div className="text-green-500 text-6xl mb-6">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <h1 className="text-3xl font-bold text-green-700 mb-4">Update berhasil</h1>
                        <p className="text-gray-700 mb-6 text-lg font-medium">{modalMessage}</p>
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

            <div className="m-6 mt-16 h-full text-gray-900">
                {/* Card with Booking Information */}
                <div className="border border-gray-300 p-6 rounded-lg shadow-xl mb-6 bg-white">
                    <div className="flex items-center m-10 space-x-2 p-4 border-4 border-indigo-500 rounded-lg shadow-md bg-white">
                        <i className="fas fa-user-circle  text-indigo-700 text-3xl"></i>
                        <h3 className="text-2xl font-semibold text-indigo-700">{useBooking.tenant.displayName}</h3>
                    </div>


                    {/* Images Section with Box and Shadow */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="w-full h-[300px] border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shadow-md hover:shadow-xl transition-all">
                                {useBooking.documents && useBooking.documents[index] ? (
                                    <img
                                        src={useBooking.documents[index].url}
                                        alt={useBooking.documents[index].name}
                                        className="object-cover w-full h-full cursor-pointer"
                                        onClick={() => handleImageClick(useBooking.documents[index])} // Handle click to view full image
                                    />
                                ) : (
                                    <span className="text-gray-400">No Image Available</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Status Section with Clear Background and Box Shadow */}
                    <div className="border-t-2 border-gray-200 pt-6 mt-6">
                        <label
                            htmlFor="status"
                            className="block text-lg font-semibold text-gray-900 mb-3 tracking-wider"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            Pilih Status Pengguna
                        </label>
                        <div className="relative group">
                            <select
                                id="status"
                                value={status}
                                onChange={handleStatusChange}
                                className="block w-full bg-gradient-to-r from-gray-100 via-white to-gray-100 border border-gray-300 rounded-xl shadow-md py-3 px-5 text-gray-800 font-medium text-base focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 hover:shadow-lg transition-all duration-300 ease-in-out"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                <option
                                    value="unverified"
                                    className="text-red-600 font-semibold"
                                >
                                    Unverified
                                </option>
                                <option
                                    value="verified"
                                    className="text-green-600 font-semibold"
                                >
                                    Verified
                                </option>
                            </select>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-all duration-300">

                            </div>
                        </div>
                    </div>



                    {isStatusUpdated && (
                        <p
                            className={`mt-4 text-sm ${status === "unverified" ? "text-red-600" : "text-green-600"
                                }`}
                        >
                            {status === "unverified"
                                ? "Status pengguna saat ini adalah 'Unverified'. Artinya, pengguna belum diverifikasi oleh sistem atau admin."
                                : "Status pengguna adalah 'Verified'. Ini menunjukkan bahwa pengguna telah diverifikasi oleh sistem atau admin."}
                        </p>
                    )}


                    {/* Update Button with Hover Effects and Transition */}
                    <button
                        onClick={updateStatusInFirestore}
                        className="w-full bg-blue-600 text-white py-3 rounded-md mt-6 text-lg font-semibold shadow-lg hover:bg-blue-700 transition-all duration-200"
                    >
                        Update Status
                    </button>
                </div>



            </div>

            {/* Image Modal */}
            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-70 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 relative max-w-3xl w-full mx-4">
                        {/* Tombol Close dengan Ikon */}
                        <button
                            className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-all duration-200 focus:ring-2 focus:ring-red-400"
                            onClick={closeImageModal}
                            aria-label="Close Modal"
                        >
                            <i className="fas fa-times text-lg"></i>
                        </button>

                        {/* Gambar */}
                        <img
                            src={selectedImage.url}
                            alt={selectedImage.name}
                            className="w-full max-h-[75vh] object-contain rounded-lg"
                        />
                    </div>
                </div>
            )}
        </div>

    );
};

export default BookingDetails;
