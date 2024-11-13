"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { dbFire } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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



const KosMap = dynamic(() => import('./Map'), { ssr: false });

export default function Career() {
    const [kosList, setKosList] = useState<KosData[]>([]);
    const [selectedKos, setSelectedKos] = useState<KosData | null>(null);
    const [, setDefaultKos] = useState<KosData[]>([]);
    const [searchKeyword, setSearchKeyword] = useState<string>(''); // State for search keyword
    const [filteredKos, setFilteredKos] = useState<KosData[]>([]); // State for filtered kos list
    const [regions, setRegions] = useState<string[]>([]);
    const router = useRouter();
    const [kostanData, setKostanData] = useState<KostanData[]>([]);
    const [selectedRegion, setSelectedRegion] = useState<string>('');
    const [homes, setHomes] = useState<KostanData[]>([]);
    const [isRegionSelected, setIsRegionSelected] = useState(false); // Tambahkan state baru

    useEffect(() => {
        const fetchKostanDataLink = async () => {
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

        fetchKostanDataLink();
    }, []);



    const handleNavigateToBooking = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent default anchor behavior
        if (kostanData && kostanData.length > 0) { // Ensure kostanData is an array and has items
            // Select the first item (or any specific item you want to pass to the booking URL)
            const selectedKostan = kostanData[0]; // Or use logic to choose which one to pick


            const bookingUrl = `/home/${selectedKostan.id}?details=${encodeURIComponent(
                selectedKostan.nama.replace(/\s+/g, '-')
            )}&alamat=Kota/Kabupeten=${encodeURIComponent(
                selectedKostan.alamat.kota_kabupaten
            )}&kecamatan=${encodeURIComponent(
                selectedKostan.alamat.kecamatan
            )}&desa=${encodeURIComponent(
                selectedKostan.alamat.Desa_Kelurahan
            )}&NO_Rumah=${encodeURIComponent(selectedKostan.alamat.Nomor_Rumah)}`;

            console.log("Redirecting to:", bookingUrl);
            router.push(bookingUrl); // Redirect to the booking page
        } else {
            console.error("Kostan data is not available or empty.");
        }
    };









    useEffect(() => {
        const fetchKosData = async () => {
            const querySnapshot = await getDocs(collection(dbFire, 'home'));
            const kosData: KosData[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.jenis === 'Kostan') {
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

    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const querySnapshot = await getDocs(collection(dbFire, 'home'));
                const regionsSet = new Set<string>(); // Set untuk memastikan nilai unik
                querySnapshot.forEach((doc) => {
                    const region = doc.data().region;
                    if (region) {
                        regionsSet.add(region);
                    }
                });
                setRegions(Array.from(regionsSet)); // Ubah Set menjadi array dan set ke state
            } catch (error) {
                console.error('Error fetching regions:', error);
            }
        };

        fetchRegions();
    }, []); // Hanya dipanggil sekali ketika komponen pertama kali di-render


    // Fetch unique regions from Firestore
    useEffect(() => {
        const fetchHomesByRegion = async () => {
            if (selectedRegion) {
                const q = query(collection(dbFire, 'home'), where('region', '==', selectedRegion));
                const querySnapshot = await getDocs(q);
                const homesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as KostanData[];
                setHomes(homesData);
            } else {
                setHomes([]);
            }
        };

        fetchHomesByRegion();
    }, [selectedRegion]);

    useEffect(() => {
        const filteredData = selectedRegion
            ? kosList.filter((kos) => kos.region === selectedRegion)
            : kosList;
        setFilteredKos(filteredData);
    }, [selectedRegion, kosList]); // Refresh ketika `selectedRegion` atau `kosList` berubah


    return (
        <div className="min-h-screen bg-gradient-to-r from-purple-700 via-pink-600 to-orange-500 py-10 px-4">
            <h1 className="text-5xl mt-[70px] font-extrabold text-blue-600 text-center">
                Kostan
            </h1>
            <div className="mt-20 flex justify-center mb-8">
                <select
                    id="region"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="border border-purple-400 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white rounded-lg px-6 py-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    <option value="" className="text-gray-700 bg-white">
                        Semua Region
                    </option>
                    {regions.map((region) => (
                        <option key={region} value={region} className="text-gray-700 bg-white">
                            {region}
                        </option>
                    ))}
                </select>
            </div>


            {/* Flex container for map and kos details */}
            <div className="flex flex-col md:flex-row gap-8 justify-center">
                {/* Map Section */}
                <div className="rounded-lg  md:w-1/2 w-full">
                    <KosMap kosList={filteredKos} onSelectKos={setSelectedKos} />
                </div>

                <div className="md:w-1/2 w-full p-0 rounded-lg shadow-lg">
                    {selectedKos ? (
                        <>
                            <button
                                onClick={() => setSelectedKos(null)}
                                className="flex mb-20 items-center text-gray-600 hover:text-gray-800 transition-colors duration-300 mb-4"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                                <span className='text-white'>Pilih Ulang Kos</span>
                            </button>
                            <Link href="#" onClick={handleNavigateToBooking}>
                                <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300 border border-gray-200">
                                    <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors duration-300 tracking-tight">
                                        {selectedKos.name}
                                    </h2>
                                    <p className="text-gray-500 text-base md:text-lg mb-5 italic">
                                        {selectedKos.address.jalan}, {selectedKos.address.kota_kabupaten}, {selectedKos.address.provinsi}
                                    </p>

                                    <div className="text-gray-700 text-base md:text-lg space-y-3 mb-6">
                                        <p>Harga per Hari: <span className="font-semibold text-green-700">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(selectedKos.price.perHari)}</span></p>
                                        <p>Harga per Hari: <span className="font-semibold text-green-700">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(selectedKos.price.perMinggu)}</span></p>
                                        <p>Harga per Hari: <span className="font-semibold text-green-700">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(selectedKos.price.perBulan)}</span></p>
                                    </div>

                                    {selectedKos.images[0] && (
                                        <div className="mt-5 overflow-hidden rounded-lg shadow-md transition-transform transform hover:scale-105 duration-300">
                                            <img
                                                src={selectedKos.images[0]}
                                                alt="Gambar Kos"
                                                className="w-full h-60 md:h-72 object-cover rounded-lg"
                                            />
                                        </div>
                                    )}
                                </div>
                            </Link>


                        </>

                    ) : (
                        <Link href="#" onClick={handleNavigateToBooking}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-4 mt-8">
                                {filteredKos.map((kos) => (
                                    <div key={kos.id} className="flex flex-col h-full p-6 bg-gray-200 border border-gray-400 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                                        <h2 className="text-sm md:text-4xl font-bold text-gray-800 mb-4 hover:text-blue-500 transition-colors duration-300">{kos.name}</h2>
                                        <p className="text-gray-600 text-sm md:text-lg mb-4">
                                            {kos.address.jalan}, {kos.address.kota_kabupaten}, {kos.address.provinsi}
                                        </p>
                                        <div className="space-y-3 text-sm md:text-lg text-gray-800">
                                        <p>Harga per Hari: <span className="font-semibold text-green-700">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(kos.price.perHari)}</span></p>
                                        <p>Harga per Hari: <span className="font-semibold text-green-700">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(kos.price.perMinggu)}</span></p>
                                        <p>Harga per Hari: <span className="font-semibold text-green-700">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(kos.price.perBulan)}</span></p>
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


                        </Link>
                    )}
                </div>



            </div>


            <div className="border-t border-gray-400 mt-8 pt-6 px-4 text-center">
                <p className="text-white text-sm md:text-lg">Anank Gundar adalah platform yang membantu Anda menemukan tempat kos terbaik di berbagai region Universitas Gunadarma. Kami menyediakan informasi yang lengkap dan update mengenai harga, fasilitas, dan lokasi kos.</p>
            </div>
        </div>


    );
}
