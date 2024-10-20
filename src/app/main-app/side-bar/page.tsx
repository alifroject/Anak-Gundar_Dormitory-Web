"use client";
import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { dbFire } from '@/app/firebase/config';

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
    Free_Electricity: boolean,
    dapur: boolean;
    parkirMotor: boolean;
    parkirMobil: boolean;
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
    [key: string]: string | number | Fal | Images | Alamat | Peraturan | undefined;
    id?: string;
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

export default function KostanPage() {
    const [formData, setFormData] = useState<KostanData>({
        Price: 0,
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
        image: {
            image1: '',
            image2: '',
            image3: '',
            image4: '',
        },
        jenis: '',
        nama: '',
        region: '',
        sisaKamar: 0,
        ukuranKamar: '',
        type: '',
        alamat: {
            provinsi: '',
            kota_kabupaten: '',
            kecamatan: '',
            Desa_Kelurahan: '',
            Jalan: '',
            Nomor_Rumah: '',
            Kode_Pos: '',
        },
        peraturan: {
            umum: '',
            tamu: '',
            kebersihan: '',
            pembayaran: '',
            lainnya: '',
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        const nameParts = name.split('.');

        setFormData((prevData) => {
            const updatedData: KostanData = {
                ...prevData, ...prevData, alamat: {
                    ...prevData.alamat,
                    [name]: value, // Memperbarui nilai berdasarkan nama input
                }
            };

            // Handle checkbox input
            if (type === 'checkbox') {
                const facilityKey = name as keyof Fal;
                updatedData.fal = {
                    ...updatedData.fal,
                    [facilityKey]: checked,
                };
            } else {
                const firstLevel = nameParts[0] as keyof KostanData;

                if (firstLevel in updatedData) {
                    if (nameParts.length > 1) {
                        const secondLevel = nameParts[1] as keyof KostanData[typeof firstLevel];

                        if (typeof updatedData[firstLevel] === 'object' && updatedData[firstLevel] !== null) {
                            updatedData[firstLevel] = {
                                ...updatedData[firstLevel],
                                [secondLevel]: type === 'number' ? Number(value) : value,
                            } as KostanData[typeof firstLevel];
                        }
                    } else {
                        updatedData[firstLevel] = type === 'number' ? Number(value) : value;
                    }
                }
            }

            return updatedData;
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            // Add the data to Firestore
            await addDoc(collection(dbFire, 'home'), formData);
            console.log('Data submitted successfully:', formData);
            // Optionally reset the form or show a success message
            setFormData({
                ...formData,
                Price: 0,
                sisaKamar: 0,
                nama: '',
                jenis: '',
                region: '',
                ukuranKamar: '',
                alamat: {
                    provinsi: '',
                    kota_kabupaten: '',
                    kecamatan: '',
                    Desa_Kelurahan: '',
                    Jalan: '',
                    Nomor_Rumah: '',
                    Kode_Pos: '',
                },
                peraturan: {
                    umum: '',
                    tamu: '',
                    kebersihan: '',
                    pembayaran: '',
                    lainnya: '',
                },
                image: {
                    image1: '',
                    image2: '',
                    image3: '',
                    image4: '',
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
        } catch (error) {
            console.error('Error submitting data:', error);
        }
    };




    return (
        <div className="p-4">
            <h1 className="text-2xl text-black font-bold mb-4">Input Kostan Data</h1>
            <form onSubmit={handleSubmit} className='text-black'>
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
                    <label>Harga: </label>
                    <input
                        className="border border-black p-2 mb-4 w-full"
                        type="text"
                        name="Price"
                        value={formData.Price}
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
                        name="provinsi"
                        placeholder="Provinsi"
                        value={formData.alamat.provinsi}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="border border-black p-2 mb-2 w-full"
                        type="text"
                        name="kota_kabupaten"
                        placeholder="Kota/Kabupaten"
                        value={formData.alamat.kota_kabupaten}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="border border-black p-2 mb-2 w-full"
                        type="text"
                        name="kecamatan"
                        placeholder="Kecamatan"
                        value={formData.alamat.kecamatan}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="border border-black p-2 mb-2 w-full"
                        type="text"
                        name="Desa_Kelurahan"
                        placeholder="Desa/Kelurahan"
                        value={formData.alamat.Desa_Kelurahan}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="border border-black p-2 mb-2 w-full"
                        type="text"
                        name="Jalan"
                        placeholder="Jalan"
                        value={formData.alamat.Jalan}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="border border-black p-2 mb-2 w-full"
                        type="text"
                        name="Nomor_Rumah"
                        placeholder="Nomor Rumah"
                        value={formData.alamat.Nomor_Rumah}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="border border-black p-2 mb-2 w-full"
                        type="text"
                        name="Kode_Pos"
                        placeholder="Kode Pos"
                        value={formData.alamat.Kode_Pos}
                        onChange={handleChange}
                        required
                    />
                </div>
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
                <div>
                    <h2 className="font-bold text-black">Images:</h2>
                    {Object.keys(formData.image).map((key) => (
                        <div key={key}>
                            <label className='text-black'>{key}:</label>
                            <input
                                className="border text-black border-black p-2 mb-2 w-full"
                                type="text"
                                name={`image.${key}`}
                                value={formData.image[key as keyof Images]}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    ))}
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 mt-4"
                >
                    Submit
                </button>
            </form>
        </div>
    );
}
