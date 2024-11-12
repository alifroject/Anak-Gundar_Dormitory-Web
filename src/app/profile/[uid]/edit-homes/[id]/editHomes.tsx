"use client";
import React, { useEffect, useState, ChangeEvent, DragEvent } from 'react';
import { dbFire, storage } from "@/app/firebase/config";
import { doc, updateDoc  } from 'firebase/firestore';
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
    ownerName: string;
    ownerPhoneNumber: string;
    geolokasi: GeoPoint;
    [key: string]: any;  // Allow for any additional string-based keys
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

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked, files } = e.target;
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


    const handleLatitudeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLatitude(parseFloat(e.target.value));
    };

    const handleLongitudeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLongitude(parseFloat(e.target.value)); 106.84052841560502

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

            alert("Data updated successfully");
            console.log("Updated data:", updatedKostanData);

        } catch (error) {
            console.error("Error updating data:", error);
            alert("Failed to update data");
        }
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
    const handleFileUpload = (file: File, index: number) => {
        const newImages = [...images];
        newImages[index] = file;
        setImages(newImages);
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
        <div className="bg-gray-50 p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Input Kostan Data</h1>
            <form onSubmit={handleSubmit} className="text-gray-800">
                <div>
                    <label>Nama Kostan: </label>
                    <input
                        className="border border-black p-2 mb-4 w-full"
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
                        name="Price.perHari"
                        value={formData.Price.perHari}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Owner Name: </label>
                    <input
                        className="border border-black p-2 mb-4 w-full"
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
                        className="border border-black p-2 mb-4 w-full"
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
                        className="border border-black p-2 mb-4 w-full"
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
                        className="border border-black p-2 mb-4 w-full"
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
                            <label>{key}:</label>
                            <input
                                className="border border-black p-2 mb-2 w-full"
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
                    className="bg-blue-500 text-white px-4 py-2 mt-4"
                >
                    Submit
                </button>
            </form>
        </div>

    );
};

export default HomeDetails;
