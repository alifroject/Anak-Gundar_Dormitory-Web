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
    type: string;
    geolokasi: {
        lat: number;
        lng: number;
    };
    alamat: {
        jalan: string;
        kota_kabupaten: string;
        provinsi: string;
        kecamatan?: string;
        Desa_Kelurahan: string;
        Nomor_Rumah: string;
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
    const [filteredKos, setFilteredKos] = useState<KosData[]>([]); // State for filtered kos list
    const [regions, setRegions] = useState<string[]>([]);
    const router = useRouter();
    const [, setKostanData] = useState<KostanData[]>([]);
    const [selectedRegion, setSelectedRegion] = useState<string>('');
    const [, setHomes] = useState<KostanData[]>([]);


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

        if (!selectedKos) {
            console.error("Kos belum dipilih.");
            return;
        }

        const bookingUrl = `/home/${selectedKos.id}?details=${encodeURIComponent(
            selectedKos.name.replace(/\s+/g, '-')
        )}&alamat=Kota/Kabupeten=${encodeURIComponent(
            selectedKos.alamat.kota_kabupaten
        )}&kecamatan=${encodeURIComponent(
            selectedKos.alamat?.kecamatan || 'N/A'
        )}&desa=${encodeURIComponent(
            selectedKos.alamat?.Desa_Kelurahan || 'N/A'
        )}&NO_Rumah=${encodeURIComponent(
            selectedKos.alamat?.Nomor_Rumah || 'N/A'
        )}`;

        console.log("Redirecting to:", bookingUrl);
        router.push(bookingUrl); // Redirect to the booking page
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
                        type: data.type || 'Kos',
                        geolokasi: {
                            lat: data.geolokasi?.latitude || 0,
                            lng: data.geolokasi?.longitude || 0,
                        },
                        alamat: {
                            jalan: data.alamat?.Jalan || 'Alamat tidak tersedia',
                            kota_kabupaten: data.alamat?.kota_kabupaten || '',
                            provinsi: data.alamat?.provinsi || '',
                            kecamatan: data.kecamatan || '',
                            Desa_Kelurahan: data.Desa_Kelurahan || '',
                            Nomor_Rumah: data.Nomor_Rumah || ''

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
            <div className="flex flex-col mt-20 items-center justify-center mt-[70px] bg-gradient-to-r from-blue-50 via-white to-blue-50 p-10 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                {/* Ikon */}
                <div className="text-blue-500 mb-6 animate-bounce">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path d="M10.707 1.293a1 1 0 00-1.414 0L4.293 6.293A1 1 0 004 7v6a1 1 0 001 1h2a1 1 0 011 1v2a1 1 0 001 1h4a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 001-1V7a1 1 0 00-.293-.707l-5-5z" />
                    </svg>
                </div>

                {/* Judul */}
                <h1 className="text-5xl font-extrabold text-blue-600 text-center leading-tight tracking-wide">
                    Kostan
                </h1>

                {/* Subjudul */}
                <p className="mt-4 text-gray-600 text-lg text-center">
                    Temukan kenyamanan di setiap sudutnya.
                </p>
            </div>


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
            <div className="flex flex-col h-full  md:flex-row gap-8 justify-center">
                {/* Map Section */}
                <div className="rounded-lg  md:w-1/2 w-full">
                    <KosMap kosList={filteredKos} onSelectKos={setSelectedKos} />
                </div>

                <div className="md:w-1/2 w-full md:h-full h-full p-6  shadow-lg">
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
                            <Link
                                href={`/home/${selectedKos.id}?House_Or_Apertment=${encodeURIComponent(selectedKos.name.replace(/\s+/g, '-'))}`}
                                onClick={handleNavigateToBooking}
                            >
                                <div className="bg-gray-50 rounded-lg shadow-lg p-6 hover:shadow-2xl transition duration-300 border border-gray-200 flex flex-col md:flex-row items-center">
                                    {/* Gambar */}
                                    {selectedKos.images[0] && (
                                        <div className="w-full md:w-32 md:h-32 md:mr-6 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
                                            <img
                                                src={selectedKos.images[0]}
                                                alt="Gambar Kos"
                                                className="w-full h-[200px] object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Konten Teks */}
                                    <div className="flex-1 mt-4 md:mt-0 text-center md:text-left">
                                        <h2 className="text-xl md:text-3xl font-semibold text-blue-900 mb-2 tracking-wide">
                                            {selectedKos.name}  <span className='text-red-500'>{selectedKos.type}</span>
                                        </h2>
                                        <p className="text-sm md:text-base text-gray-600 mb-3">
                                            📍 {selectedKos.alamat.jalan}, {selectedKos.alamat.kota_kabupaten}, {selectedKos.alamat.provinsi}
                                        </p>
                                        <p className="text-sm text-gray-500 font-medium">{selectedKos.region}</p>

                                        <div className="mt-4">
                                            <p className="text-lg text-gray-700">
                                                Harga per Bulan:{' '}
                                                <span className="font-bold text-green-600">
                                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(selectedKos.price.perBulan)}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>




                        </>

                    ) : (

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6 mt-12">
                            {filteredKos.map((kos) => (
                                <Link

                                    key={kos.id}
                                    href={`/home/${kos.id}?House_Or_Apertment=${encodeURIComponent(kos.name.replace(/\s+/g, '-'))}`}
                                >
                                    {kos.images[0] && (
                                        <div className="mt-auto overflow-hidden rounded-t-lg shadow-sm transition-transform transform hover:scale-105 duration-300">
                                            <img
                                                src={kos.images[0]}
                                                alt={`Gambar ${kos.name}`}
                                                className="w-full  h-[150px] object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex flex-col md:w-full rounded-b-lg md:h-[52%]  p-5 bg-white border border-gray-300 mb-5  shadow-md hover:shadow-lg transition-transform transform hover:scale-105 cursor-pointer">
                                        {/* Judul Kos */}


                                        <h2 className="text-base md:text-[14px] font-bold text-gray-800 hover:text-blue-600 transition-colors duration-300">
                                            {kos.name} <span className='text-red-500'>{kos.type}</span>
                                        </h2>

                                        {/* Alamat Kos */}
                                        <p className="text-gray-600 md:text-[8.4px] text-[9px] text-sm md:text-sm leading-relaxed ">
                                            {kos.alamat.jalan}, {kos.alamat.kota_kabupaten}, {kos.alamat.provinsi}
                                        </p>

                                        {/* Region */}
                                        <p className="text-xs md:text-sm  md:text-[8.6px] text-[10px] font-medium text-gray-700 ">
                                            Wilayah: <span className="text-blue-600 font-semibold">{kos.region}</span>
                                        </p>

                                        {/* Harga */}
                                        <div className="text-sm mt-2 md:text-sm md:text-[10px] text-gray-800 ">
                                            <p>
                                                Harga per Bulan:{" "}
                                                <span className="font-semibold text-green-700">
                                                    {new Intl.NumberFormat("id-ID", {
                                                        style: "currency",
                                                        currency: "IDR",
                                                    }).format(kos.price.perBulan)}
                                                </span>
                                            </p>
                                        </div>

                                        {/* Gambar Kos */}

                                    </div>
                                </Link>
                            ))}
                        </div>

                    )}
                </div>



            </div>


            <div className="border-t border-gray-400 mt-8 pt-6 px-4 text-center">
                <p className="text-white text-sm md:text-lg">Anak Gundar adalah platform yang membantu Anda menemukan tempat kos terbaik di berbagai region Universitas Gunadarma. Kami menyediakan informasi yang lengkap dan update mengenai harga, fasilitas, dan lokasi kos.</p>
            </div>
        </div>


    );
}
