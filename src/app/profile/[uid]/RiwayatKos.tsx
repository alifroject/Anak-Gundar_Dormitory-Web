// components/RentalApplication.tsx

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSort, faSearch } from '@fortawesome/free-solid-svg-icons';

const RentalApplication: React.FC = () => {
    return (
        <div className="bg-gray-100 min-h-screen flex flex-col items-center">
            <h1 className="text-2xl font-semibold mb-4 text-black">Pengajuan Sewa</h1>
            
            <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex-1 w-full">
                <div className="flex items-center mb-2">
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Promo Ngebut</span>
                </div>
                <div className="flex">
                    <img src="https://placehold.co/100x100" alt="Image of a room" className="w-24 h-24 rounded-lg mr-4" />
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold">Kost Apik Rumah Deka Tipe A Pondok Aren Tangerang...</h2>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                            <span className="text-green-500">Tersedia 12 Kamar</span>
                            <span className="mx-2">•</span>
                            <span className="text-blue-500">Putra</span>
                        </div>
                        <div className="text-sm text-gray-500 mb-2">Hitungan Sewa</div>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                            <span className="text-red-500">Diskon 68rb</span>
                            <span className="line-through ml-2">Rp705.000</span>
                        </div>
                        <div className="text-lg font-semibold text-red-500 mb-2">Rp637.000 <span className="text-sm text-gray-500">(Bulan pertama)</span></div>
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="text-sm text-gray-500">Tanggal Masuk</div>
                                <div className="text-sm font-semibold">2 Nov 2024</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Durasi Sewa</div>
                                <div className="text-sm font-semibold">1 Bulan</div>
                            </div>
                            <a href="#" className="text-green-500 text-sm font-semibold">Lihat Detail</a>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <button className="text-gray-500"><FontAwesomeIcon icon={faTrash} /></button>
                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg">Ajukan Sewa</button>
                </div>
            </div>
        </div>
    );
};

export default RentalApplication;
