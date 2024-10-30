"use client";
import { useState, useEffect } from 'react';
import { GeoPoint } from 'firebase/firestore';

import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/app/MapComponent'), { ssr: false });

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

interface KostanData {
    id: string;
    Price: number;
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
    geolokasi: GeoPoint; // Geolocation
}
interface TransformedKostanData {
    id: string;
    nama: string;
    geolokasi: {
        latitude: number;
        longitude: number;
    };
    Price: number; // Add Price here
    images: {
        image1: string | null;
        image2: string | null;
        image3: string | null;
        image4: string | null;
    }; // Add images here
    fal: Fal; // Add fal if needed
    peraturan: Peraturan; // Add peraturan if needed
    alamat: Alamat; // Add alamat if needed
    region: string;
    jenis: string;
    sisaKamar: number;
    ukuranKamar: string;
    type: string
}
const KostanDetailClient = ({ initialData }: { initialData: KostanData | null }) => {
    const [kostan] = useState<KostanData | null>(initialData);
    const [loading] = useState(false);


    useEffect(() => {
        console.log("Kostan data:", kostan);
    }, [kostan]);

    const transformedKostan: TransformedKostanData | null = kostan
        ? {
            id: kostan.id,
            nama: kostan.nama,
            geolokasi: kostan.geolokasi ? {
                latitude: kostan.geolokasi.latitude, // Directly accessing latitude and longitude
                longitude: kostan.geolokasi.longitude,
            } : { latitude: 0, longitude: 0 },
            Price: kostan.Price,
            images: {
                image1: kostan.images.image1,
                image2: kostan.images.image2,
                image3: kostan.images.image3,
                image4: kostan.images.image4,
            },
            fal: {
                AC: kostan.fal.AC,
                kasur: kostan.fal.kasur,
                kipas: kostan.fal.kipas,
                kursi: kostan.fal.kursi,
                lemari: kostan.fal.lemari,
                meja: kostan.fal.meja,
                ventilasi: kostan.fal.ventilasi,
                kamar_mandi_dalam: kostan.fal.kamar_mandi_dalam,
                kamar_mandi_luar: kostan.fal.kamar_mandi_luar,
                areaLoundryJemur: kostan.fal.areaLoundryJemur,
                Free_Electricity: kostan.fal.Free_Electricity,
                dapur: kostan.fal.dapur,
                parkirMotor: kostan.fal.parkirMotor,
                parkirMobil: kostan.fal.parkirMobil,
            },
            peraturan: {
                umum: kostan.peraturan.umum,
                tamu: kostan.peraturan.tamu,
                kebersihan: kostan.peraturan.kebersihan,
                pembayaran: kostan.peraturan.pembayaran,
                lainnya: kostan.peraturan.lainnya,
            },
            alamat: {
                provinsi: kostan.alamat.provinsi,
                kota_kabupaten: kostan.alamat.kota_kabupaten,
                kecamatan: kostan.alamat.kecamatan,
                Desa_Kelurahan: kostan.alamat.Desa_Kelurahan,
                Jalan: kostan.alamat.Jalan,
                Nomor_Rumah: kostan.alamat.Nomor_Rumah,
                Kode_Pos: kostan.alamat.Kode_Pos,
            },
            region: kostan.region,
            jenis: kostan.jenis,
            sisaKamar: kostan.sisaKamar,
            ukuranKamar: kostan.ukuranKamar,
            type: kostan.type,
        }
        : null;

    if (loading) return <div>Loading...</div>;
    if (!kostan) return <div>Kostan tidak ditemukan</div>;

    return (

        <div className="container mx-auto p-4">

            <main className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row">
                    <div className="md:w-2/3 w-full">
                        {kostan.images.image1 && (
                            <img
                                src={kostan.images.image1}
                                alt="Room Image 1"
                                className="rounded-lg w-[740px] h-[400px] md:h-[500px] sm:h-[300px] mb-4 object-cover"
                            />
                        )}
                        <div className="grid grid-cols-3 gap-4">
                            {kostan.images.image2 && (
                                <img
                                    src={kostan.images.image2}
                                    alt="Room Image 1"
                                    className="rounded-lg w-60 h-40 object-cover"
                                />
                            )}
                            {kostan.images.image3 && (
                                <img
                                    src={kostan.images.image3}
                                    alt="Room Image 2"
                                    className="rounded-lg w-60 h-40 object-cover"
                                />
                            )}
                            {kostan.images.image4 && (
                                <img
                                    src={kostan.images.image4}
                                    alt="Room Image 3"
                                    className="rounded-lg w-60 h-40 object-cover"
                                />
                            )}


                        </div>
                    </div>
                    <div className="md:w-1/3 w-full md:pl-4 mt-4 md:mt-0">
                        <h1 className="text-2xl font-bold mb-2 text-gray-500">
                            <i className="fas fa-map-marker-alt  mr-2"></i>{kostan.nama}
                        </h1>
                        <div className="flex items-center mb-4">
                            <span className="text-green-600 text-xl font-bold">
                                Rp {parseFloat(kostan.Price.toString()).toLocaleString('id-ID')}
                            </span>


                            <span className="text-gray-600 ml-2">/ bulan</span>
                        </div>
                        <button className="bg-green-600 text-white py-2 px-4 rounded-lg mb-4">Ajukan Sewa</button>
                        <div className="flex items-start mb-4">
                            <i className="fas fa-map-marker-alt text-gray-600 mr-2 mt-1"></i>
                            <div className="flex flex-col">
                                <h2 className="text-gray-600">Jl. {kostan.alamat.Jalan}</h2>
                                <h2 className="text-gray-600">{kostan.alamat.Desa_Kelurahan}</h2>
                                <h2 className="text-gray-600">{kostan.alamat.kota_kabupaten}</h2>
                                <h2 className="text-gray-600">{kostan.alamat.provinsi}</h2>
                            </div>
                        </div>
                        <div className="flex items-center mb-4">
                            <i className="fas fa-user text-gray-600 mr-2"></i>
                            <span className="text-gray-600">Dikelola oleh <span className="text-green-600">Alif Yang Ganteng ngaku dewek</span></span>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <h2 className="text-xl font-bold mb-2 text-gray-500">Yang kamu dapatkan di {kostan.nama}</h2>
                    <ul className="list-disc list-inside text-black">
                        {kostan.fal.AC && <li className="mb-2">AC</li>}
                        {kostan.fal.Free_Electricity && <li className="mb-2">Free Electricity</li>}
                        {kostan.fal.areaLoundryJemur && <li className="mb-2">Area Laundry & Jemur</li>}
                        {kostan.fal.dapur && <li className="mb-2">Dapur</li>}
                        {kostan.fal.kamar_mandi_dalam && <li className="mb-2">Kamar Mandi Dalam</li>}
                        {kostan.fal.kamar_mandi_luar && <li className="mb-2">Kamar Mandi Luar</li>}
                        {kostan.fal.kasur && <li className="mb-2">Kasur</li>}
                        {kostan.fal.kipas && <li className="mb-2">Kipas</li>}
                        {kostan.fal.kursi && <li className="mb-2">Kursi</li>}
                        {kostan.fal.lemari && <li className="mb-2">Lemari</li>}
                        {kostan.fal.meja && <li className="mb-2">Meja</li>}
                        {kostan.fal.parkirMobil && <li className="mb-2">Parkir Mobil</li>}
                        {kostan.fal.parkirMotor && <li className="mb-2">Parkir Motor</li>}
                        {kostan.fal.ventilasi && <li className="mb-2">Ventilasi</li>}
                    </ul>

                </div>
                <div className="mt-6">
                    <h2 className="text-xl font-bold mb-2 text-gray-500">Peraturan khusus tipe kamar ini</h2>
                    <ul className="list-disc list-inside text-black">
                        <li className="mb-2">Kebersihan({kostan.peraturan.kebersihan})</li>
                        <li className="mb-2">Tamu({kostan.peraturan.tamu})</li>
                        <li className="mb-2">Pembayaran({kostan.peraturan.pembayaran})</li>
                        <li className="mb-2">Lainnya({kostan.peraturan.lainnya})</li>
                    </ul>
                </div>

                <div className="mt-6">
                    <h2 className="text-xl font-bold mb-2">Lokasi dan lingkungan sekitar</h2>
                    <div style={{ width: '100%', height: '400px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }} className="w-full h-64 bg-gray-200 rounded-lg mb-4">
                        <div className="map-box">
                            {transformedKostan && (
                                <MapComponent
                                    key={transformedKostan.id} // Ensure unique key
                                    kostanData={[transformedKostan]} // Only pass the necessary data
                                />
                            )}
                        </div>
                    </div>

                </div>
                <div className="mt-6">
                </div>
                <div className="mt-6">
                    <h2 className="text-xl font-bold mb-2">4.9/5 dari 1914 review</h2>
                    <div className="space-y-4">
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                                <img src="https://placehold.co/40x40" alt="Reviewer 1" className="rounded-full mr-2" />
                                <div>
                                    <h3 className="text-lg font-bold">Sinta</h3>
                                    <div className="flex items-center">
                                        <i className="fas fa-star text-yellow-500"></i>
                                        <i className="fas fa-star text-yellow-500"></i>
                                        <i className="fas fa-star text-yellow-500"></i>
                                        <i className="fas fa-star text-yellow-500"></i>
                                        <i className="fas fa-star text-yellow-500"></i>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600">Kost ini sangat nyaman dan bersih. Pemiliknya juga sangat ramah dan membantu.</p>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                                <img src="https://placehold.co/40x40" alt="Reviewer 2" className="rounded-full mr-2" />
                                <div>
                                    <h3 className="text-lg font-bold">Andi</h3>
                                    <div className="flex items-center">
                                        <i className="fas fa-star text-yellow-500"></i>
                                        <i className="fas fa-star text-yellow-500"></i>
                                        <i className="fas fa-star text-yellow-500"></i>
                                        <i className="fas fa-star text-yellow-500"></i>
                                        <i className="fas fa-star text-yellow-500"></i>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-600">Lokasinya sangat strategis, dekat dengan kampus dan pusat perbelanjaan.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default KostanDetailClient;
