"use client";
import React, { useState, DragEvent, ChangeEvent } from 'react';
import { collection, addDoc } from "firebase/firestore";
import { dbFire, storage } from "@/app/firebase/config";
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

export default function KostanPage() {

    const [images, setImages] = useState<(File | null)[]>([null, null, null, null]); // State untuk empat gambar
    const [latitude, setLatitude] = useState<number>(0); // New state for latitude
    const [longitude, setLongitude] = useState<number>(0); // New state for longitude

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
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0] || null; // Get the selected file
        setImages((prevImages) => {
            const newImages = [...prevImages];
            newImages[index] = file; // Update the image for the specified index
            return newImages;
        });
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
            setLatitude(0); // Reset latitude
            setLongitude(0); // Reset longitude
        } catch (error) {
            console.error("Error submitting data:", error);
        }
    };


    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Input Kostan Data</h1>
            <form onSubmit={handleSubmit} className="text-black">
                <div>
                    <label>Nama Kostan: </label>
                    <input
                        className="border border-black p-2 mb-4 w-full"
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Tipe: </label>
                    <input
                        className="border border-black p-2 mb-4 w-full"
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
                        className="border border-black p-2 mb-4 w-full"
                        type="text"
                        name="jenis"
                        value={formData.jenis}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Region: </label>
                    <input
                        className="border border-black p-2 mb-4 w-full"
                        type="text"
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Ukuran Kamar: </label>
                    <input
                        className="border border-black p-2 mb-4 w-full"
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
                        className="border border-black p-2 mb-4 w-full"
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
                        className="border border-black p-2 mb-4 w-full"
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
                        className="border border-black p-2 mb-4 w-full"
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
                        className="border border-black p-2 mb-4 w-full"
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
                        className="border border-black p-2 mb-4 w-full"
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
                        className="border border-black p-2 mb-4 w-full"
                        type="number"
                        name="Price.perBulan" // Nested name for perBulan
                        value={formData.Price.perBulan}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-4">
                    <h2 className="font-bold">Fasilitas:</h2>
                    {Object.keys(formData.fal).map(fasilitas => (
                        <div key={fasilitas}>
                            <label>
                                <input
                                    type="checkbox"
                                    name={fasilitas} // Hanya nama fasilitas, tanpa 'fal.'
                                    checked={formData.fal[fasilitas as keyof Fal]}
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
                        className="border border-black p-2 mb-2 w-full"
                        type="text"
                        name="alamat.provinsi"
                        placeholder="Provinsi"
                        value={formData.alamat.provinsi}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="border border-black p-2 mb-2 w-full"
                        type="text"
                        name="alamat.kota_kabupaten"
                        placeholder="Kota/Kabupaten"
                        value={formData.alamat.kota_kabupaten}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="border border-black p-2 mb-2 w-full"
                        type="text"
                        name="alamat.kecamatan"
                        placeholder="Kecamatan"
                        value={formData.alamat.kecamatan}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="border border-black p-2 mb-2 w-full"
                        type="text"
                        name="alamat.Desa_Kelurahan"
                        placeholder="Desa/Kelurahan"
                        value={formData.alamat.Desa_Kelurahan}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="border border-black p-2 mb-2 w-full"
                        type="text"
                        name="alamat.Jalan"
                        placeholder="Jalan"
                        value={formData.alamat.Jalan}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="border border-black p-2 mb-2 w-full"
                        type="text"
                        name="alamat.Nomor_Rumah"
                        placeholder="Nomor Rumah"
                        value={formData.alamat.Nomor_Rumah}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="border border-black p-2 mb-2 w-full"
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
                />

                <label>Longitude:</label>
                <input
                    type="number"
                    value={longitude}
                    onChange={handleLongitudeChange}
                    placeholder="Enter longitude"
                    required
                />

                <div>
                    <h2 className="font-bold text-black">Peraturan:</h2>
                    {Object.keys(formData.peraturan).map((key) => (
                        <div key={key}>
                            <label className='text-black'>{key}:</label>
                            <input
                                className="border border-black p-2 mb-2 w-full"
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
                    {images.map((image, index) => (
                        <div
                            key={index}
                            onDrop={(event) => handleDrop(event, index)}
                            onDragOver={handleDragOver}
                            className="border p-4 h-48 flex items-center justify-center"
                            style={{ border: '2px dashed #ccc', cursor: 'pointer' }}
                        >
                            {image ? (
                                <img
                                    src={URL.createObjectURL(image)}
                                    alt={`Preview ${index + 1}`}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <span>Drag and drop image here or click to upload</span>
                            )}
                            <input
                                type="file"
                                name={`image${index + 1}`}
                                onChange={(event) => handleInputChange(event, index)}
                                style={{ display: 'none' }}
                                accept="image/*" // Allows only image files
                            // Ensures only one file is selected at a time
                            />
                        </div>
                    ))}
                </div>

                {/* Form input lainnya di sini */}
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 mt-4"
                >
                    Submit
                </button>
            </form>
        </div>
    );
}
