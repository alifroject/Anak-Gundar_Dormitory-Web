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

interface Price {
    perBulan: number;
    perHari: number;
    perMinggu: number;
}
interface KostanData {
    id: string;
    Price: Price;
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
    

    return (
        <div className="bg-gray-200">
            <div className="max-w-7xl mx-auto p-1 pr-5 mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
                {kostanData
                    .filter((kostan) => ["Depok Kampus D", "Depok Kampus G&E", "Kampus A,B,C"].includes(kostan.region)) // Filter untuk beberapa region
                    .map((kostan) => (
                        <Link
                            key={kostan.id}
                            href={`/home/${kostan.id}?House_Or_Apertment=${encodeURIComponent(kostan.nama.replace(/\s+/g, "-"))}`}
                            passHref
                        >
                            <div className="rounded-lg shadow-md overflow-hidden cursor-pointer m-2 w-full">
                                {kostan.images.image1 && (
                                    <img
                                        src={kostan.images.image1}
                                        alt="Room Image 1"
                                        className="rounded-lg w-full h-[120px] sm:h-[150px] md:h-[300px] object-cover mb-4"
                                    />
                                )}
                                <div className="p-4">
                                    <h3 className="text-md sm:text-lg text-center font-semibold text-black">{kostan.nama}</h3>
                                </div>
                            </div>
                        </Link>
                    ))}
            </div>



            <footer className="bg-black py-8 mt-10 text-white w-full">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-between">
                        <div className="w-full md:w-1/4 mb-6 md:mb-0">
                            <div className="flex items-center mb-4">
                                <img src="/anakGundar.png" alt="Anak Gundar logo" className="mr-2 w-[100px] bg-white" />
                                <span className="text-blue-600 text-xl font-bold">Anak Gundar</span>
                            </div>
                            <p className="text-white mb-4">Dapatkan info kost murah hanya di Anak Gundar App. Mau Sewa Kost Murah ?</p>

                        </div>
                        <div className="w-full md:w-1/4 mb-6 md:mb-0">
                            <h3 className="text-white font-bold mb-2">Anak Gundar</h3>
                            <ul className="text-white">
                                <li className="mb-1"><a href="https://www.instagram.com/reel/DAi2aZKo3df/?igsh=OXd3NWFlODY5OTdv">Tentang Kami</a></li>
                                <li className="mb-1"><a href="https://www.instagram.com/reel/DAi2aZKo3df/?igsh=OXd3NWFlODY5OTdv">Job Anak Gundar</a></li>
                                <li className="mb-1"><a href="https://www.instagram.com/reel/DAi2aZKo3df/?igsh=OXd3NWFlODY5OTdv">Promosikan Kost Anda</a></li>
                                <li className="mb-1"><a href="https://www.instagram.com/reel/DAi2aZKo3df/?igsh=OXd3NWFlODY5OTdv">Pusat Bantuan</a></li>
                            </ul>
                        </div>
                        <div className="w-full md:w-1/4 mb-6 md:mb-0">
                            <h3 className="text-white font-bold mb-2">KEBIJAKAN</h3>
                            <ul className="text-white">
                                <li className="mb-1"><a href="https://www.instagram.com/reel/DAi2aZKo3df/?igsh=OXd3NWFlODY5OTdv">Blog Anak Gundar</a></li>
                                <li className="mb-1"><a href="https://www.instagram.com/reel/DAi2aZKo3df/?igsh=OXd3NWFlODY5OTdv">Singgahsini</a></li>
                                <li className="mb-1"><a href="https://www.instagram.com/reel/DAi2aZKo3df/?igsh=OXd3NWFlODY5OTdv">Kebijakan Privasi</a></li>
                                <li className="mb-1"><a href="https://www.instagram.com/reel/DAi2aZKo3df/?igsh=OXd3NWFlODY5OTdv">Syarat dan Ketentuan Umum</a></li>
                            </ul>
                        </div>
                        <div className="w-full md:w-1/4">
                            <h3 className="text-white font-bold mb-2">HUBUNGI KAMI</h3>
                            <ul className="text-white">
                                <li className="mb-1"><i className="fas fa-envelope mr-2"></i>cs@Anak Gundar.com</li>
                                <li className="mb-1"><i className="fas fa-phone mr-2"></i>+6281325111171</li>
                                <li className="flex space-x-2 mt-2">
                                    <a href="https://www.instagram.com/reel/DAi2aZKo3df/?igsh=OXd3NWFlODY5OTdv"><i className="fab fa-facebook-f"></i></a>
                                    <a href="https://www.instagram.com/reel/DAi2aZKo3df/?igsh=OXd3NWFlODY5OTdv"><i className="fab fa-twitter"></i></a>
                                    <a href="https://www.instagram.com/reel/DAi2aZKo3df/?igsh=OXd3NWFlODY5OTdv"><i className="fab fa-instagram"></i></a>
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
