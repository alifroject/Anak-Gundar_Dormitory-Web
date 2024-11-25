"use client";
import React, { useEffect, useState, ChangeEvent, DragEvent } from 'react';
import { dbFire, storage } from "@/app/firebase/config";
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { GeoPoint } from 'firebase/firestore';


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
    [key: string]: boolean;
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
    [key: string]: string;
}

export interface KostanData {
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
    ownerName: string;
    ownerPhoneNumber: string;
    geolokasi: GeoPoint;
    [key: string]: string | number | boolean | Price | Fal | Images | Alamat | Peraturan | GeoPoint; // Tambahkan tipe yang sesuai
    // Allow for any additional string-based keys
}

const HomeDetails = ({ useHome }: { useHome: KostanData }) => {
    const [formData, setFormData] = useState<KostanData>(
        useHome || {
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
        }
    );
    const [latitude, setLatitude] = useState<number>(0);
    const [longitude, setLongitude] = useState<number>(0);
    const [images, setImages] = useState<(File | null)[]>([null, null, null, null]);
    const [imageUrls, setImageUrls] = useState<(string | null)[]>([null, null, null, null]);
    const [isModalOpen, setIsModalOpen] = useState(false); // State untuk modalfform

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,) => {
        const { name, value, type, checked, files } = e.target as HTMLInputElement;
        const nameParts = name.split('.');

        setFormData((prevFormData) => {
            const updatedData = { ...prevFormData }; // Spread to create new state reference
            const fieldName = nameParts[0] as keyof KostanData;

            if (type === 'file' && files) {
                const file = files[0];
                if (file) {
                    const index = parseInt(nameParts[1], 10);
                    if (!isNaN(index)) {
                        const updatedImages = [...images];
                        const updatedUrls = [...imageUrls];
                        updatedImages[index] = file;
                        updatedUrls[index] = URL.createObjectURL(file);
                        setImages(updatedImages);
                        setImageUrls(updatedUrls);
                    }
                }
                return updatedData; // Return without further updates for file uploads
            }

            // Handle nested fields
            if (nameParts.length === 2) {
                if (fieldName === 'fal' && typeof updatedData[fieldName] === 'object') {
                    (updatedData[fieldName] as Fal)[nameParts[1] as keyof Fal] = type === 'checkbox' ? checked : value === "true";
                } else if (fieldName === 'Price' && typeof updatedData[fieldName] === 'object') {
                    (updatedData[fieldName] as Price)[nameParts[1] as keyof Price] = Number(value);
                } else if (fieldName === 'alamat' && typeof updatedData[fieldName] === 'object') {
                    (updatedData[fieldName] as Alamat)[nameParts[1] as keyof Alamat] = value;
                } else if (fieldName === 'peraturan' && typeof updatedData[fieldName] === 'object') {
                    (updatedData[fieldName] as Peraturan)[nameParts[1] as keyof Peraturan] = value;
                }
            } else {
                // Directly update primitive fields, e.g., `nama`
                updatedData[name as keyof KostanData] = type === 'checkbox' ? checked : value;
            }

            return updatedData;
        });
    };

    useEffect(() => {
        setLatitude(formData.geolokasi.latitude || 0);
        setLongitude(formData.geolokasi.longitude || 0);
    }, [formData]);

    const handleLatitudeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLatitude(parseFloat(e.target.value));
        const value = parseFloat(e.target.value);
        setLatitude(value);
        setFormData((prev) => ({
            ...prev,
            geolokasi: new GeoPoint(isNaN(value) ? prev.geolokasi.latitude : value, prev.geolokasi.longitude),
        }));
    };

    const handleLongitudeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLongitude(parseFloat(e.target.value));
        const value = parseFloat(e.target.value);
        setLongitude(value);
        setFormData((prev) => ({
            ...prev,
            geolokasi: new GeoPoint(prev.geolokasi.latitude, isNaN(value) ? prev.geolokasi.longitude : value),
        }));
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>): void => {
        event.preventDefault();
    };
    const handleClick = (index: number): void => {
        const inputElement = document.getElementById(`fileInput-${index}`) as HTMLInputElement | null;
        if (inputElement) {
            inputElement.click();
        }
    };


    useEffect(() => {
        if (formData.images) {
            setImageUrls([
                formData.images.image1 || null,
                formData.images.image2 || null,
                formData.images.image3 || null,
                formData.images.image4 || null,
            ]);
        }
    }, [formData.images]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsModalOpen(true);

        try {
            // 1. Upload new images if they are provided
            const imageUploadPromises = images.map(async (file, index) => {
                if (file) {
                    const uniqueImageName = `images/image_${Date.now()}_${index + 1}`;
                    const imageRef = ref(storage, uniqueImageName);
                    await uploadBytes(imageRef, file);
                    return await getDownloadURL(imageRef);
                }
                return imageUrls[index] || ""; // Use existing URL if no new file is uploaded
            });

            const updatedImageUrls = await Promise.all(imageUploadPromises);

            // 2. Create the updated data object with the new image URLs (if any)
            const updatedKostanData = {
                ...formData,
                geolokasi: new GeoPoint(latitude, longitude),
                images: {
                    image1: updatedImageUrls[0],
                    image2: updatedImageUrls[1],
                    image3: updatedImageUrls[2],
                    image4: updatedImageUrls[3],
                },
            };

            // 3. Update data in Firestore
            const kostanRef = doc(dbFire, 'home', formData.id);
            await updateDoc(kostanRef, updatedKostanData);


            console.log("Updated data:", updatedKostanData);

        } catch (error) {
            console.error("Error updating data:", error);
            alert("Failed to update data");
        }
    };
    const closeModal = () => {
        setIsModalOpen(false); // Sembunyikan modal
    };


    const handleDrop = (event: DragEvent<HTMLDivElement>, index: number): void => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            const updatedImages = [...images];
            const updatedUrls = [...imageUrls];

            updatedImages[index] = file;
            updatedUrls[index] = URL.createObjectURL(file);

            setImages(updatedImages);
            setImageUrls(updatedUrls);
        }
    };


    const handleInputChange = (event: ChangeEvent<HTMLInputElement>, index: number): void => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file) {
            const updatedImages = [...images];
            const updatedUrls = [...imageUrls];

            updatedImages[index] = file;
            updatedUrls[index] = URL.createObjectURL(file);

            setImages(updatedImages);
            setImageUrls(updatedUrls);
        }
    };


    return (
        <div className="bg-blue-800 p-8 rounded-lg shadow-md text-white">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-400 mb-6 mt-20 text-center">
                Input Kostan Data
            </h1>

            <form onSubmit={handleSubmit} className="bg-gradient-to-br md:p-20 from-blue-100 to-blue-50 p-10 rounded-lg shadow-xl text-gray-800  mx-auto">
                <div>
                    <label>Nama Kostan: </label>
                    <input
                        className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4"
                        type="text"
                        name="nama"
                        value={formData.nama || ""}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Tipe: </label>
                    <input
                        className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4"
                        type="text"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Jenis: </label>
                    <input
                        className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4"
                        type="text"
                        name="jenis"
                        value={formData.jenis}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-6">
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
                        name="Price.perHari"
                        value={formData.Price.perHari}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Owner Name: </label>
                    <input
                        className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4"
                        type="text"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Owner Phone Number: </label>
                    <input
                        className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4"
                        type="text"
                        name="ownerPhoneNumber"
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
                        name="Price.perMinggu"
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
                        name="Price.perBulan"
                        value={formData.Price.perBulan}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <h2 className="font-bold">Fasilitas:</h2>
                    {Object.keys(formData.fal).map((fasilitas) => (
                        <div key={fasilitas}>
                            <label>
                                <input
                                    type="checkbox"
                                    name={`fal.${fasilitas}`}
                                    checked={formData.fal[fasilitas]}
                                    onChange={handleChange}
                                />
                                {fasilitas.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')}
                            </label>
                        </div>
                    ))}
                </div>

                <div>
                    <h2 className="font-bold text-black">Alamat:</h2>
                    <input
                        className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4"
                        type="text"
                        name="alamat.provinsi"
                        placeholder="Provinsi"
                        value={formData.alamat.provinsi}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4"
                        type="text"
                        name="alamat.kota_kabupaten"
                        placeholder="Kota/Kabupaten"
                        value={formData.alamat.kota_kabupaten}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4"
                        type="text"
                        name="alamat.kecamatan"
                        placeholder="Kecamatan"
                        value={formData.alamat.kecamatan}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4"
                        type="text"
                        name="alamat.Desa_Kelurahan"
                        placeholder="Desa/Kelurahan"
                        value={formData.alamat.Desa_Kelurahan}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4"
                        type="text"
                        name="alamat.Jalan"
                        placeholder="Jalan"
                        value={formData.alamat.Jalan}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4"
                        type="text"
                        name="alamat.Nomor_Rumah"
                        placeholder="Nomor Rumah"
                        value={formData.alamat.Nomor_Rumah}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4"
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
                    type="number"
                    value={latitude}
                    onChange={handleLatitudeChange}
                    placeholder="Enter latitude"
                    required
                    className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4"
                />

                <label>Longitude:</label>
                <input
                    type="number"
                    value={longitude}
                    onChange={handleLongitudeChange}
                    placeholder="Enter longitude"
                    className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4"
                    required
                />

                <div>
                    <h2 className="font-bold text-black">Peraturan:</h2>
                    {Object.keys(formData.peraturan).map((key) => (
                        <div key={key}>
                            <label>{key}:</label>
                            <input
                                className="border text-black border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 md:m-4"
                                type="text"
                                name={`peraturan.${key}`}
                                value={formData.peraturan[key]}
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
                            onDrop={(event) => handleDrop(event, index)}
                            onDragOver={handleDragOver}
                            className="border p-4 h-48 flex items-center justify-center"
                            style={{ border: '2px dashed #ccc', cursor: 'pointer' }}
                            onClick={() => handleClick(index)}
                        >
                            {imageUrls[index] ? (
                                <img
                                    src={imageUrls[index] || ''}
                                    alt={`Preview ${index + 1}`}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <span>Drag and drop image here or click to upload</span>
                            )}
                            <input
                                type="file"
                                id={`fileInput-${index}`}
                                onChange={(event) => handleInputChange(event, index)}
                                style={{ display: 'none' }}
                                accept="image/*"
                            />
                        </div>
                    ))}
                </div>



                <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-3 mt-4 rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                    Submit
                </button>

                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
                        <div className="bg-white rounded-xl p-8 shadow-2xl transform transition-all scale-95 opacity-0 duration-500 ease-out max-w-lg w-full"
                            style={{
                                animation: 'popUpAnimation 0.5s forwards',
                            }}
                        >
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
                                    Dormitory berhasil di edit.
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
};

export default HomeDetails;
