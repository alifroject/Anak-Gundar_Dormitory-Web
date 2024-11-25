"use client";
import React, { useEffect, useState, DragEvent, ChangeEvent } from 'react';
import { collection, addDoc } from "firebase/firestore";
import { dbFire, storage } from "@/app/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { GeoPoint } from 'firebase/firestore';
import Papa from 'papaparse';

interface Price {
    perBulan: number;
    perHari: number;
    perMinggu: number;
}


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
    image1: string; // Change from File | null to string
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
    Price: Price; // Change this to Price type
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
    ownerName: string;
    ownerPhoneNumber: string;
    geolokasi: GeoPoint; // Geolocation
}
interface Province {
    province: string;
    code: string;
}
interface Regencies {
    type: string;
    regency: string;
    province_code: string;
    code: string;
}
interface Districts {
    district: string;    // Nama kecamatan atau desa
    regency_code: string;     // Kode Kabupaten/Kota
    Kode_Wilayah: string;    // Kode untuk sub-kecamatan/desa
    provinceCode: string;    // Kode untuk provinsi
    code: string
}

interface Village {

    village: string;        // Nama desa
    kode_wilayah: string;   // Kode wilayah (optional)
    code: string;           // Kode desa/kelurahan
    district_code: string;  // Kode kecamatan
}





export default function KostanPage() {

    const [images, setImages] = useState<(File | null)[]>([null, null, null, null]); // State untuk empat gambar
    const [latitude, setLatitude] = useState<number>(0); // New state for latitude
    const [longitude, setLongitude] = useState<number>(0); // New state for longitude
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [regencies, setRegencies] = useState<Regencies[]>([]);
    const [districts, setDistricts] = useState<Districts[]>([]);
    const [villages, setVillages] = useState<Village[]>([]);

    const [selectedProvince, setSelectedProvince] = useState<string>('');
    const [selectedRegency, setSelectedRegency] = useState<string>('');
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [selectedVillage, setSelectedVillage] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false); // State untuk modal





    // Fungsi untuk mendapatkan nama provinsi berdasarkan kode
    const getProvinceName = (provinceCode: string, provinces: Province[]): string => {
        const province = provinces.find(p => p.code === provinceCode);
        return province ? province.province : 'Unknown Province';
    };

    // Fungsi untuk mendapatkan nama kabupaten/kota berdasarkan kode
    const getRegencyName = (regencyCode: string, regencies: Regencies[]): string => {
        const regency = regencies.find(r => r.code === regencyCode);
        return regency ? regency.regency : 'Unknown Regency';
    };

    // Fungsi untuk mendapatkan nama kecamatan berdasarkan kode
    const getDistrictName = (districtCode: string, districts: Districts[]): string => {
        const district = districts.find(d => d.code === districtCode);
        return district ? district.district : 'Unknown District';
    };

    // Fungsi untuk mendapatkan nama desa/kelurahan berdasarkan kode
    const getVillageName = (villageCode: string, villages: Village[]): string => {
        const village = villages.find(v => v.code === villageCode);
        return village ? village.village : 'Unknown Village';
    };


    useEffect(() => {
        const selectedProvinceName = getProvinceName(selectedProvince, provinces);
        const selectedRegencyName = getRegencyName(selectedRegency, regencies);
        const selectedDistrictName = getDistrictName(selectedDistrict, districts);
        const selectedVillageName = getVillageName(selectedVillage, villages);

        // Menampilkan alamat lengkap berdasarkan nama
        console.log("Selected Address:", {
            province: selectedProvinceName,
            regency: selectedRegencyName,
            district: selectedDistrictName,
            village: selectedVillageName,
        });
    }, [selectedProvince, selectedRegency, selectedDistrict, selectedVillage]);





    const handleDrop = (event: DragEvent<HTMLDivElement>, index: number) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        if (files.length > 0) {
            setImages((prevImages) => {
                const newImages = [...prevImages];
                newImages[index] = files[0]; // Mengambil hanya gambar pertama
                return newImages;
            });
        }
    };

    useEffect(() => {
        const loadProvincesData = async () => {
            const provinceResponse = await fetch('/2022/provinces.csv');
            const provinceData = await provinceResponse.text();
            Papa.parse(provinceData, {
                header: true,
                complete: (result) => {
                    setProvinces(result.data as Province[]);
                },
            });
        };
        loadProvincesData();
    }, []);

    // Load Regencies based on selected province
    useEffect(() => {
        const loadRegenciesData = async () => {
            const regencyResponse = await fetch('/2022/regencies.csv');
            const regencyData = await regencyResponse.text();
            Papa.parse(regencyData, {
                header: true,
                complete: (result) => {
                    const filteredRegencies = (result.data as Regencies[]).filter(
                        (regency) => regency.province_code === selectedProvince
                    );
                    setRegencies(filteredRegencies);
                },
            });
        };
        if (selectedProvince) {
            loadRegenciesData();
        }
    }, [selectedProvince]);
    
    useEffect(() => {
        console.log("Selected Address:", {
            province: selectedProvince,
            regency: selectedRegency,
            district: selectedDistrict,
            village: selectedVillage,
        });
    }, [selectedProvince, selectedRegency, selectedDistrict, selectedVillage]);


    // Load Districts based on selected regency
    useEffect(() => {
        const loadDistrictsData = async () => {
            const districtResponse = await fetch('/2022/districts.csv');
            const districtData = await districtResponse.text();
            Papa.parse(districtData, {
                header: true,
                complete: (result) => {
                    const filteredDistricts = (result.data as Districts[]).filter(
                        (district) => district.regency_code === selectedRegency
                    );
                    setDistricts(filteredDistricts);
                },
            });
        };
        if (selectedRegency) {
            loadDistrictsData();
        }
    }, [selectedRegency]);

    // Load Villages based on selected district
    useEffect(() => {
        const loadVillagesData = async () => {
            const villageResponse = await fetch('/2022/villages.csv');
            const villageData = await villageResponse.text();

            Papa.parse(villageData, {
                header: true, // Pastikan header CSV dibaca dengan benar
                complete: (result) => {
                    // Debugging: Cek apakah kolom sudah benar
                    console.log(result.data);  // Cek apakah hasil parsing sesuai ekspektasi

                    // Pastikan nama kolomnya sesuai dengan yang ada pada CSV
                    const filteredVillages = (result.data as Village[]).filter(
                        (village) => village.district_code === selectedDistrict
                    );
                    setVillages(filteredVillages);
                },
            });
        };

        if (selectedDistrict) {
            loadVillagesData();
        } else {
            setVillages([]); // Reset villages jika district belum dipilih
        }
    }, [selectedDistrict]);  // Trigger effect jika selectedDistrict berubah


    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedProvince(value);
        setFormData((prevData) => ({
            ...prevData,
            alamat: {
                ...prevData.alamat,
                provinsi: getProvinceName(value, provinces), // Simpan nama provinsi
                kota_kabupaten: "",
                kecamatan: "",
                Desa_Kelurahan: "",
            },
        }));
    };



    const handleRegencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedRegency(value);
        setFormData((prevData) => ({
            ...prevData,
            alamat: {
                ...prevData.alamat,
                kota_kabupaten: getRegencyName(value, regencies), // Simpan nama kabupaten
                kecamatan: "",
                Desa_Kelurahan: "",
            },
        }));
    };


    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedDistrict(value);
        setFormData((prevData) => ({
            ...prevData,
            alamat: {
                ...prevData.alamat,
                kecamatan: getDistrictName(value, districts), // Simpan nama kecamatan
                Desa_Kelurahan: "",
            },
        }));
    };


    const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedVillage(value);
        setFormData((prevData) => ({
            ...prevData,
            alamat: {
                ...prevData.alamat,
                Desa_Kelurahan: getVillageName(value, villages), // Simpan nama desa
            },
        }));
    };




    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };


    const [formData, setFormData] = useState<KostanData>({
        Price: { perBulan: 0, perHari: 0, perMinggu: 0 },
        fal: {
            AC: false,
            kasur: false,
            kipas: false,
            kursi: false,
            lemari: false,
            meja: false,
            ventilasi: false,
            kamar_mandi_dalam: false,
            kamar_mandi_luar: false,
            areaLoundryJemur: false,
            Free_Electricity: false,
            dapur: false,
            parkirMotor: false,
            parkirMobil: false,

        },
        geolokasi: new GeoPoint(0, 0), // Initialize with default latitude and longitude
        images: {
            image1: "",
            image2: "",
            image3: "",
            image4: "",
        },
        jenis: "",
        nama: "",
        region: "",
        sisaKamar: 0,
        ukuranKamar: "",
        ownerName: "",
        ownerPhoneNumber: "",
        type: "",
        alamat: {
            provinsi: "",
            kota_kabupaten: "",
            kecamatan: "",
            Desa_Kelurahan: "",
            Jalan: "",
            Nomor_Rumah: "",
            Kode_Pos: "",
        },
        peraturan: {
            umum: "",
            tamu: "",
            kebersihan: "",
            pembayaran: "",
            lainnya: "",
        },
    });

    const facilities = [
        { name: 'AC', icon: 'fa-snowflake' },
        { name: 'kasur', icon: 'fa-bed' },
        { name: 'kipas', icon: 'fa-fan' },
        { name: 'kursi', icon: 'fa-chair' },
        { name: 'lemari', icon: 'fa-archive' },
        { name: 'meja', icon: 'fa-table' },
        { name: 'ventilasi', icon: 'fa-wind' },
        { name: 'kamar_mandi_dalam', icon: 'fa-bath' },
        { name: 'kamar_mandi_luar', icon: 'fa-shower' },
        { name: 'area_Loundry_Jemur', icon: 'fa-tshirt' },
        { name: 'Free_Electricity', icon: 'fa-plug' },
        { name: 'dapur', icon: 'fa-utensils' },
        { name: 'parkir_Motor', icon: 'fa-motorcycle' },
        { name: 'parkir_Mobil', icon: 'fa-car' },
    ];

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>, index: number) => {
        const file = event.target.files?.[0] || null; // Ambil file yang dipilih
        if (file) {
            setImages((prevImages) => {
                const updatedImages = [...prevImages];
                updatedImages[index] = file; // Update gambar pada index tertentu
                return updatedImages;
            });
        }
    };


    const handleLatitudeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLatitude(parseFloat(e.target.value));
    };

    const handleLongitudeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLongitude(parseFloat(e.target.value));
    };
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        const nameParts = name.split(".");

        setFormData((prevData) => {
            const updatedData: KostanData = { ...prevData };

            if (type === "checkbox") {
                const facilityKey = name as keyof Fal;
                updatedData.fal = {
                    ...updatedData.fal,
                    [facilityKey]: checked,
                };
            } else if (name.includes("image")) {
                const imageKey = name as keyof Images;
                updatedData.images[imageKey] = ""; // Initialize with an empty string
            } else {
                const firstLevel = nameParts[0] as keyof KostanData;

                if (firstLevel in updatedData) {
                    if (firstLevel === "alamat" && nameParts.length > 1) {
                        updatedData.alamat = {
                            ...updatedData.alamat,
                            [nameParts[1] as keyof Alamat]: value,
                        };
                    } else if (firstLevel === "peraturan" && nameParts.length > 1) {
                        updatedData.peraturan = {
                            ...updatedData.peraturan,
                            [nameParts[1] as keyof Peraturan]: value,
                        };
                    } else {
                        switch (firstLevel) {
                            case 'Price':
                                const priceKey = nameParts[1] as keyof Price;
                                updatedData.Price[priceKey] = Number(value);
                                break;
                            case 'sisaKamar':
                                updatedData.sisaKamar = Number(value);
                                break;
                            case 'jenis':
                            case 'nama':
                            case 'region':
                            case 'ukuranKamar':
                            case 'ownerName':
                            case 'ownerPhoneNumber':
                            case 'type':
                                updatedData[firstLevel] = value;
                                break;
                            default:
                                console.warn(`Unhandled field: ${firstLevel}`);
                                break;
                        }
                    }
                }
            }
            return updatedData;
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
 
        if (!formData.alamat.provinsi || !formData.alamat.kota_kabupaten) {
            console.error("Alamat belum lengkap!");
            return;
        }

        try {
            // 1. Upload images to Firebase Storage with unique names
            const imageUploadPromises = images.map(async (file, index) => {
                if (file) {
                    // Membuat nama file unik berdasarkan timestamp
                    const uniqueImageName = `images/image_${Date.now()}_${index + 1}`;
                    const imageRef = ref(storage, uniqueImageName);
                    await uploadBytes(imageRef, file);
                    return await getDownloadURL(imageRef);
                }
                return ""; // Return an empty string for missing images
            });

            const imageUrls = await Promise.all(imageUploadPromises);

            // 2. Create a new data object with the image URLs
            const kostanDataWithImageUrls = {
                ...formData,
                geolokasi: new GeoPoint(latitude, longitude), // Set the GeoPoint here
                images: {
                    image1: imageUrls[0],
                    image2: imageUrls[1],
                    image3: imageUrls[2],
                    image4: imageUrls[3],
                },
            };

            // 3. Save data to Firestore
            await addDoc(collection(dbFire, "home"), kostanDataWithImageUrls);
            console.log("Data submitted successfully:", kostanDataWithImageUrls);

            // Optionally reset the form
            setFormData({
                ...formData,
                Price: { perHari: 0, perMinggu: 0, perBulan: 0 },
                sisaKamar: 0,
                nama: "",
                jenis: "",
                region: "",
                ukuranKamar: "",
                images: {
                    image1: "",
                    image2: "",
                    image3: "",
                    image4: "",
                },
                alamat: {
                    provinsi: "",
                    kota_kabupaten: "",
                    kecamatan: "",
                    Desa_Kelurahan: "",
                    Jalan: "",
                    Nomor_Rumah: "",
                    Kode_Pos: "",
                },
                peraturan: {
                    umum: "",
                    tamu: "",
                    kebersihan: "",
                    pembayaran: "",
                    lainnya: "",
                },
                fal: {
                    AC: false,
                    kasur: false,
                    kipas: false,
                    kursi: false,
                    lemari: false,
                    meja: false,
                    ventilasi: false,
                    kamar_mandi_dalam: false,
                    kamar_mandi_luar: false,
                    areaLoundryJemur: false,
                    Free_Electricity: false,
                    dapur: false,
                    parkirMotor: false,
                    parkirMobil: false,
                },
            });
            setIsModalOpen(true)
            setLatitude(0); // Reset latitude
            setLongitude(0); // Reset longitude
        } catch (error) {
            console.error("Error submitting data:", error);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false); // Sembunyikan modal
    };


    return (
        <div className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-xl mx-auto">
            <h1 className="text-3xl font-bold mb-6  text-center  text-white-800">Input Kostan Data</h1>
            <form onSubmit={handleSubmit} className="text-white-800 md:m-20">
                <div>
                    <label className="block font-medium">Nama Kostan</label>
                    <input
                        className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4"
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-6 ml-4">
                    <label className="font-medium block mb-3">Jenis</label>
                    <div className="relative">
                        <select
                            className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            name="jenis"
                            value={formData.jenis}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>
                                Pilih Tipe
                            </option>
                            {["Kostan", "Apartment"].map((jenis) => (
                                <option key={jenis} value={jenis}>
                                    {jenis}
                                </option>
                            ))}
                        </select>
                        <div className="absolute top-0 right-4 h-full flex items-center pointer-events-none">
                            <svg
                                className="w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 9l-7 7-7-7"
                                ></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="mb-6 ml-4">
                    <label className="font-medium block mb-3">Tipe</label>
                    <div className="relative">
                        <select
                            className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>
                                Pilih Tipe
                            </option>
                            {["Cewek", "Cowok", "Campur"].map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                        <div className="absolute top-0 right-4 h-full flex items-center pointer-events-none">
                            <svg
                                className="w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 9l-7 7-7-7"
                                ></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="mb-6 ml-4">
                    <label className="font-semibold text-lg block mb-3 text-white-700">
                        Region
                    </label>
                    <div className="relative">
                        <select
                            className="border text-gray-700 border-gray-300 p-4 rounded-lg w-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none"
                            name="region"
                            value={formData.region}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>
                                Pilih Region
                            </option>
                            {[
                                "Kampus A,B,C",
                                "Depok Kampus D",
                                "Depok Kampus G&E",
                                "Kampus J",
                                "Kampus K",
                            ].map((region) => (
                                <option key={region} value={region}>
                                    {region}
                                </option>
                            ))}
                        </select>
                        <div className="absolute top-0 right-4 h-full flex items-center pointer-events-none">
                            <svg
                                className="w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 9l-7 7-7-7"
                                ></path>
                            </svg>
                        </div>
                    </div>
                </div>


                <div>
                    <label>Ukuran Kamar: </label>
                    <input
                        className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4"
                        type="text"
                        name="ukuranKamar"
                        value={formData.ukuranKamar}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Sisa Kamar: </label>
                    <input
                        className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4"
                        type="number"
                        name="sisaKamar"
                        value={formData.sisaKamar}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Harga Per Hari: </label>
                    <input
                        className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4"
                        type="number"
                        name="Price.perHari" // Nested name for perHari
                        value={formData.Price.perHari}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="">Owner Name</label>
                    <input
                        className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4"
                        type="text"
                        name="ownerName" // Nested name for perHari
                        value={formData.ownerName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="">Owner Phone Number</label>
                    <input
                        className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4"
                        type="text"
                        name="ownerPhoneNumber" // Nested name for perHari
                        value={formData.ownerPhoneNumber}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Harga Per Minggu: </label>
                    <input
                        className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4"
                        type="number"
                        name="Price.perMinggu" // Nested name for perMinggu
                        value={formData.Price.perMinggu}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Harga Per Bulan: </label>
                    <input
                        className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4"
                        type="number"
                        name="Price.perBulan" // Nested name for perBulan
                        value={formData.Price.perBulan}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-6">
                    <h2 className="font-bold text-2xl mb-4">Fasilitas:</h2>
                    {facilities.map((facility) => (
                        <div key={facility.name} className="flex items-center space-x-4 mb-3">
                            <input
                                type="checkbox"
                                name={facility.name}
                                checked={formData.fal[facility.name as keyof Fal]}
                                onChange={handleChange}
                                className="w-6 h-6 accent-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <i className={`fa ${facility.icon} text-xl`}></i> {/* Ikon Font Awesome */}
                            <label className="text-lg font-semibold capitalize">
                                {facility.name.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')}
                            </label>
                        </div>
                    ))}
                </div>



                <div>

                    <h2>Pilih Provinsi</h2>
                    <select name="alamat.provinsi" value={selectedProvince} onChange={handleProvinceChange} className='border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4'>
                        <option value="">Pilih Provinsi</option>
                        {provinces.map((provinsi) => (
                            <option key={provinsi.code} value={provinsi.code}>
                                {provinsi.province}
                            </option>
                        ))}
                    </select>

                    {/* Kabupaten Select */}
                    <h2>Pilih Kabupaten/Kota</h2>
                    <select name="alamat.kota_kabupaten" value={selectedRegency} onChange={handleRegencyChange} disabled={!selectedProvince} className='border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4'>
                        <option value="">Pilih Kabupaten/Kota</option>
                        {regencies.map((regency) => (
                            <option key={regency.code} value={regency.code}>
                                {regency.regency}
                            </option>
                        ))}
                    </select>

                    {/* Kecamatan Select */}
                    <h2>Pilih Kecamatan</h2>
                    <select name="alamat.kecamatan" value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedRegency} className='border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4'>
                        <option value="">Pilih Kecamatan</option>
                        {districts.map((district) => (
                            <option key={district.code} value={district.code} className='border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4'>
                                {district.district}
                            </option>
                        ))}
                    </select>

                    {/* Desa/Kelurahan Select */}
                    <h2>Pilih Desa/Kelurahan</h2>
                    <select name="alamat.Desa_Kelurahan" value={selectedVillage} onChange={handleVillageChange} disabled={!selectedDistrict} className='border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4'>
                        <option value="">Pilih Desa/Kelurahan</option>
                        {villages.length > 0 ? (
                            villages.map((village) => (
                                <option key={village.code} value={village.code}>
                                    {village.village}
                                </option>
                            ))
                        ) : (
                            <option value="">Loading...</option> // Menampilkan loading saat desa/kelurahan sedang dimuat
                        )}
                    </select>
                    <h2>Jalan:</h2>
                    <input
                        className='border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4'
                        type="text"
                        name="alamat.Jalan"
                        placeholder="Jalan"
                        value={formData.alamat.Jalan}
                        onChange={handleChange}
                        required
                    />
                    <h2>Nomor Rumah</h2>
                    <input
                        className='border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4'
                        type="text"
                        name="alamat.Nomor_Rumah"
                        placeholder="Nomor Rumah"
                        value={formData.alamat.Nomor_Rumah}
                        onChange={handleChange}
                        required
                    />
                    <h2>Kode Pos</h2>
                    <input
                        className='border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4'
                        type="text"
                        name="alamat.Kode_Pos"
                        placeholder="Kode Pos"
                        value={formData.alamat.Kode_Pos}
                        onChange={handleChange}
                        required
                    />
                </div>
                <label>Latitude:</label>
                <input
                    className='border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4'
                    type="number"
                    value={latitude}
                    onChange={handleLatitudeChange}
                    placeholder="Enter latitude"
                    required
                />

                <label>Longitude:</label>
                <input
                    className='border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4'
                    type="number"
                    value={longitude}
                    onChange={handleLongitudeChange}
                    placeholder="Enter longitude"
                    required
                />

                <div className='text-white'>
                    <h2 className="font-bold text-white">Peraturan:</h2>
                    {Object.keys(formData.peraturan).map((key) => (
                        <div key={key}>
                            <label className='text-white'>{key}:</label>
                            <input
                                className="border text-black border-black p-2 mb-2 w-full"
                                type="text"
                                name={`peraturan.${key}`}
                                value={formData.peraturan[key as keyof Peraturan]}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    {Array(4).fill(null).map((_, index) => (
                        <div
                            key={index}
                            onDrop={(event) => handleDrop(event, index)} // Drag drop event handler
                            onDragOver={handleDragOver} // Handle drag over event
                            className="border p-4 h-48 flex items-center justify-center"
                            style={{ border: '2px dashed #ccc', cursor: 'pointer' }}
                            onClick={() => document.getElementById(`fileInput-${index}`)?.click()} // Trigger file input click
                        >
                            {images[index] ? (
                                <img
                                    src={URL.createObjectURL(images[index])} // Preview image if available
                                    alt={`Preview ${index + 1}`}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <span>Drag and drop image here or click to upload</span>
                            )}

                            {/* File input for choosing file */}
                            <input
                                type="file"
                                id={`fileInput-${index}`} // Unique ID per index
                                onChange={(event) => handleInputChange(event, index)} // Handle file input change
                                style={{ display: 'none' }} // Hide the actual file input
                                accept="image/*" // Allow only image files
                            />
                        </div>
                    ))}
                </div>

                {/* Form input lainnya di sini */}
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-3 mt-4 rounded-lg shadow-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 transition-all duration-300"
                >
                    Submit
                </button>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
                        <div className="bg-white rounded-xl p-8 shadow-2xl transform transition-transform scale-100 max-w-lg w-full">
                            {/* Header */}
                            <div className="flex justify-between items-center pb-4 border-b">
                                <h3 className="text-xl font-bold text-gray-800">Berhasil!</h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 transition duration-200"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Body */}
                            <div className="py-6 text-center">
                                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full mb-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-8 w-8 text-green-500"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm4.28-10.72a.75.75 0 10-1.06-1.06L9 11.44l-2.22-2.22a.75.75 0 00-1.06 1.06l3 3a.75.75 0 001.06 0l5-5z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <p className="text-lg text-gray-600">
                                    Dormitory berhasil di tambahkan.
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={closeModal}
                                    className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600 focus:outline-none transition duration-300"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </form>
        </div>
    );
}
