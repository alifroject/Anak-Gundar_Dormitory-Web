"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {collection, getDocs } from 'firebase/firestore';
import { dbFire } from '@/app/firebase/config';

interface KosData {
    id: string;
    name: string;
    geolokasi: {
        lat: number;
        lng: number;
    };
    address: {
        jalan: string;
        kota_kabupaten: string;
        provinsi: string;
    };
    price: {
        perHari: number;
        perMinggu: number;
        perBulan: number;
    };
    images: string[];
    region: string;
    fal: {
        [key: string]: boolean;
    };
}

const KosMap = dynamic(() => import('./Map'), { ssr: false });

export default function Career() {
    const [kosList, setKosList] = useState<KosData[]>([]);
    const [selectedKos, setSelectedKos] = useState<KosData | null>(null);
    const [, setDefaultKos] = useState<KosData[]>([]);
    const [searchKeyword, setSearchKeyword] = useState<string>(''); // State for search keyword
    const [filteredKos, setFilteredKos] = useState<KosData[]>([]); // State for filtered kos list

    useEffect(() => {
        const fetchKosData = async () => {
            const querySnapshot = await getDocs(collection(dbFire, 'home'));
            const kosData: KosData[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.jenis === 'Apartment') {
                    kosData.push({
                        id: doc.id,
                        name: data.nama || 'Kos',
                        geolokasi: {
                            lat: data.geolokasi?.latitude || 0,
                            lng: data.geolokasi?.longitude || 0,
                        },
                        address: {
                            jalan: data.alamat?.Jalan || 'Alamat tidak tersedia',
                            kota_kabupaten: data.alamat?.kota_kabupaten || '',
                            provinsi: data.alamat?.provinsi || '',
                        },
                        price: {
                            perHari: data.Price?.perHari || 0,
                            perMinggu: data.Price?.perMinggu || 0,
                            perBulan: data.Price?.perBulan || 0,
                        },
                        images: data.images ? Object.values(data.images) : [],
                        region: data.region || '',
                        fal: data.fal || {},
                    });
                }
            });

            setKosList(kosData);

            // Set the first 5 kos as default
            if (kosData.length > 0) {
                setDefaultKos(kosData.slice(0, 5));
                setFilteredKos(kosData.slice(0, 5)); // Set initial filtered kos to default kos
            }
        };

        fetchKosData();
    }, []);

    // Function to handle search
    const handleSearch = () => {
        const keyword = searchKeyword.toLowerCase().trim();
        if (keyword) {
            const filtered = kosList.filter((kos) =>
                kos.name.toLowerCase().includes(keyword) ||
                kos.address.jalan.toLowerCase().includes(keyword) ||
                kos.address.kota_kabupaten.toLowerCase().includes(keyword) ||
                kos.address.provinsi.toLowerCase().includes(keyword)
            );
            setFilteredKos(filtered);
        } else {
            setFilteredKos(kosList); // If no keyword, show all kos
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-purple-700 via-pink-600 to-orange-500 py-10 px-4">

            <div className="mt-20 flex justify-center mb-8">
                <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Cari kos..."
                    className="p-3 w-80 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleSearch}
                    className="ml-3 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Cari
                </button>
            </div>

            {/* Flex container for map and kos details */}
            <div className="flex flex-col md:flex-row gap-8 justify-center">
                {/* Map Section */}
                <div className="p-6 rounded-lg  md:w-1/2 w-full">
                    <KosMap kosList={filteredKos} onSelectKos={setSelectedKos} />
                </div>

                <div className="md:w-1/2 w-full p-0 rounded-lg shadow-lg">
                    {selectedKos ? (
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white-800 mb-4 hover:text-blue-500 transition-colors duration-300">{selectedKos.name}</h2>
                            <p className="text-white-700 text-sm md:text-lg mb-6">
                                {selectedKos.address.jalan}, {selectedKos.address.kota_kabupaten}, {selectedKos.address.provinsi}
                            </p>
                            <div className="space-y-4 text-sm md:text-lg text-gray-800">
                                <p className='text-white'>Harga per Hari: <span className="font-semibold text-green-600">Rp{selectedKos.price.perHari}</span></p>
                                <p className='text-white'>Harga per Minggu: <span className="font-semibold text-green-600">Rp{selectedKos.price.perMinggu}</span></p>
                                <p className='text-white'>Harga per Bulan: <span className="font-semibold text-green-600">Rp{selectedKos.price.perBulan}</span></p>
                            </div>
                            {selectedKos.images[0] && (
                                <div className="mt-6 overflow-hidden rounded-lg shadow-md transition-transform transform hover:scale-105 duration-300">
                                    <img
                                        src={selectedKos.images[0]}
                                        alt="Gambar Kos"
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-4 mt-8">
                            {filteredKos.map((kos) => (
                                <div key={kos.id} className="flex flex-col h-full p-6 bg-gray-200 border border-gray-400 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                                    <h2 className="text-sm md:text-4xl font-bold text-gray-800 mb-4 hover:text-blue-500 transition-colors duration-300">{kos.name}</h2>
                                    <p className="text-gray-600 text-sm md:text-lg mb-4">
                                        {kos.address.jalan}, {kos.address.kota_kabupaten}, {kos.address.provinsi}
                                    </p>
                                    <div className="space-y-3 text-sm md:text-lg text-gray-800">
                                        <p>Harga per Hari: <span className="font-semibold text-green-600">Rp{kos.price.perHari}</span></p>
                                        <p>Harga per Minggu: <span className="font-semibold text-green-600">Rp{kos.price.perMinggu}</span></p>
                                        <p>Harga per Bulan: <span className="font-semibold text-green-600">Rp{kos.price.perBulan}</span></p>
                                    </div>
                                    {kos.images[0] && (
                                        <div className="mt-6 overflow-hidden rounded-lg shadow-md transition-transform transform hover:scale-105 duration-300">
                                            <img
                                                src={kos.images[0]}
                                                alt="Gambar Kos"
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>


                    )}
                </div>



            </div>



            <div className="border-t border-gray-400 mt-8 pt-6 px-4 text-center">
                <p className="text-white text-sm md:text-lg">Kos Finder adalah platform yang membantu Anda menemukan tempat kos terbaik di berbagai daerah. Kami menyediakan informasi yang lengkap dan update mengenai harga, fasilitas, dan lokasi kos.</p>
            </div>
        </div>


    );
}
