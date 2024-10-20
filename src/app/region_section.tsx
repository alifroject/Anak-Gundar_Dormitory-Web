"use client";
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { dbFire } from '@/app/firebase/config';
import Link from 'next/link'; // Import Link dari Next.js

// Define the interfaces (same as before)
interface Fal {
    contoh: boolean;
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
    parkirMobil: boolean;
    parkirMotor: boolean;
}

interface Images {
    image1: string;
    image2: string;
    image3: string;
    image4: string;
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
    image: Images;
    jenis: string;
    nama: string;
    region: string;
    sisaKamar: number;
    ukuranKamar: string;
    type: string;
    alamat: Alamat;
    peraturan: Peraturan;
}

export default function PromoComponent() {
    const [kostanData, setKostanData] = useState<KostanData[]>([]);

    // Fetch data from Firestore
    useEffect(() => {
        const fetchKostanData = async () => {
            try {
                const querySnapshot = await getDocs(collection(dbFire, 'home'));
                const data = querySnapshot.docs.map((doc) => {
                    const kostan = doc.data();
                    return {
                        id: doc.id,
                        Price: kostan.Price ?? 0,
                        fal: kostan.fal ?? {},
                        image: kostan.image ?? {},
                        jenis: kostan.jenis ?? '',
                        nama: kostan.nama ?? '',
                        region: kostan.region ?? '',
                        sisaKamar: kostan.sisaKamar ?? 0,
                        ukuranKamar: kostan.ukuranKamar ?? '',
                        type: kostan.type ?? '',
                        alamat: kostan.alamat ?? {},
                        peraturan: kostan.peraturan ?? {}
                    };
                });
                setKostanData(data);
            } catch (error) {
                console.error("Error fetching kostan data:", error);
            }
        };

        fetchKostanData();
    }, []);

    // Separate kostan data by region
    const regions = Array.from(new Set(kostanData.map(kostan => kostan.region)));

    return (
        <div className="bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-black mb-4">Kostan List</h1>

                {regions.map((region) => (
                    <div key={region}>
                        <h2 className="text-xl font-semibold text-black mt-6">{region}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {kostanData
                                .filter(kostan => kostan.region === region)
                                .slice(0, 4)  // Limit to 4 items
                                .map((kostan) => (
                                    <Link key={kostan.id} href={`/home/${kostan.id}`} passHref>
                                        <div className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer">
                                            <img src={kostan.image.image1} alt={kostan.nama} className="w-full h-48 object-cover" />
                                            <div className="p-4">
                                                <h3 className="text-lg font-semibold">{kostan.nama}</h3>
                                                <p className="text-gray-500">{kostan.region}</p>
                                                <p className="text-gray-500 text-sm">{kostan.jenis}</p>
                                                <p className="text-gray-500 text-sm">Sisa Kamar: {kostan.sisaKamar}</p>
                                                <p className="text-red-500 font-semibold">Harga: {kostan.Price}</p>
                                                <p className="text-sm text-gray-600 mt-2">Ukuran Kamar: {kostan.ukuranKamar}</p>
                                                <p className="text-sm text-gray-600">Tipe: {kostan.type}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
