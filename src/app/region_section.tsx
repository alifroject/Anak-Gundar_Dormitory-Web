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
                        images: kostan.images ?? { image1: null, image2: null, image3: null, image4: null }, // Ubah 'image' menjadi 'images'
                        jenis: kostan.jenis ?? '',
                        nama: kostan.nama ?? '',
                        region: kostan.region ?? '',
                        sisaKamar: kostan.sisaKamar ?? 0,
                        ukuranKamar: kostan.ukuranKamar ?? '',
                        type: kostan.type ?? '',
                        alamat: kostan.alamat ?? {},
                        peraturan: kostan.peraturan ?? {},

                    } as KostanData; // Casting ke tipe KostanData
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
        <div className="bg-gray-100">
            <div className="max-w-7xl mx-auto">


                {regions.map((region) => (
                    <div key={region}>
                        <h2 className="text-xl font-semibold text-black mt-6">{region}</h2>
                        <div className="grid grid-cols-1 xs:w-full sm:w-80 md:w-96 lg:w-1/4 gap-6 ">
                            {kostanData
                                .filter(kostan => kostan.region === region)
                                .slice(0, 4)  // Limit to 4 items
                                .map((kostan) => (
                                    <Link key={kostan.id} href={`/home/${kostan.id}?details=${encodeURIComponent(kostan.nama.replace(/\s+/g, '-'))}&alamat=Kota/Kabupeten=${encodeURIComponent(kostan.alamat.kota_kabupaten)}&kecamatan=${encodeURIComponent(kostan.alamat.kecamatan)}&desa=${encodeURIComponent(kostan.alamat.Desa_Kelurahan)}&NO_Rumah=${encodeURIComponent(kostan.alamat.Nomor_Rumah)}`} passHref>
                                        <div className="bg-white rounded-lg m-2 shadow-md overflow-hidden cursor-pointer 240px:h-[350px]">
                                            {kostan.images.image1 && (
                                                <img
                                                    src={kostan.images.image1}
                                                    alt="Room Image 1"
                                                    className="rounded-lg w-full h-[400px] md:h-[300px] sm:h-[300px] 240px:h-[150px] mb-4 object-cover"
                                                />
                                            )}
                                            <div className="p-4">
                                                <h3 className="text-lg font-semibold text-black">{kostan.nama}</h3>
                                                <p className="text-gray-500">{kostan.region}</p>
                                                <p className="text-gray-500 text-sm">{kostan.jenis}</p>
                                                <p className="text-gray-500 text-sm">Sisa Kamar: {kostan.sisaKamar}</p>
                                                <span className="text-green-600 text-xl font-bold">
                                                    Rp {parseFloat(kostan.Price.toString()).toLocaleString('id-ID')}
                                                </span>
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

            <footer className="bg-black py-8 mt-10 text-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-between">
                        <div className="w-full md:w-1/4 mb-6 md:mb-0">
                            <div className="flex items-center mb-4">
                                <img src="https://placehold.co/40x40" alt="Anak Gundar logo" className="mr-2" />
                                <span className="text-blue-600 text-xl font-bold">Anak Gundar</span>
                            </div>
                            <p className="text-white mb-4">Dapatkan info kost murah hanya di Anak Gundar App. Mau Sewa Kost Murah ?</p>

                        </div>
                        <div className="w-full md:w-1/4 mb-6 md:mb-0">
                            <h3 className="text-white font-bold mb-2">Anak Gundar</h3>
                            <ul className="text-white">
                                <li className="mb-1"><a href="#">Tentang Kami</a></li>
                                <li className="mb-1"><a href="#">Job Anak Gundar</a></li>
                                <li className="mb-1"><a href="#">Promosikan Kost Anda</a></li>
                                <li className="mb-1"><a href="#">Pusat Bantuan</a></li>
                            </ul>
                        </div>
                        <div className="w-full md:w-1/4 mb-6 md:mb-0">
                            <h3 className="text-white font-bold mb-2">KEBIJAKAN</h3>
                            <ul className="text-white">
                                <li className="mb-1"><a href="#">Blog Anak Gundar</a></li>
                                <li className="mb-1"><a href="#">Singgahsini</a></li>
                                <li className="mb-1"><a href="#">Kebijakan Privasi</a></li>
                                <li className="mb-1"><a href="#">Syarat dan Ketentuan Umum</a></li>
                            </ul>
                        </div>
                        <div className="w-full md:w-1/4">
                            <h3 className="text-white font-bold mb-2">HUBUNGI KAMI</h3>
                            <ul className="text-white">
                                <li className="mb-1"><i className="fas fa-envelope mr-2"></i>cs@Anak Gundar.com</li>
                                <li className="mb-1"><i className="fas fa-phone mr-2"></i>+6281325111171</li>
                                <li className="flex space-x-2 mt-2">
                                    <a href="#"><i className="fab fa-facebook-f"></i></a>
                                    <a href="#"><i className="fab fa-twitter"></i></a>
                                    <a href="#"><i className="fab fa-instagram"></i></a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-center mt-8">
                        <div className="flex items-center">

                            <div>
                                <p className="text-white">ISO/IEC 27001:2013</p>
                                <p className="text-white">Information Security Management Systems Certification</p>
                            </div>
                        </div>
                        <div className="text-white">
                            © 2024 Anak Gundar.com. All rights reserved
                        </div>
                    </div>
                </div>
            </footer>
        </div>

    );
}
