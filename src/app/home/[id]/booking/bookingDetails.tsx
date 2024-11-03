"use client";
import React, { useState, useEffect, ChangeEvent, DragEvent } from "react";
import { auth, dbFire } from "@/app/firebase/config"; // Pastikan file konfigurasi Firebase Anda benar
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, QuerySnapshot, getDoc, doc } from 'firebase/firestore';




interface Price {
    perBulan: number;
    perHari: number;
    perMinggu: number;
}
interface Kostan {
    id: string;
    Price: Price;
    nama: string;
    alamat: {
        kota_kabupaten: string;
        kecamatan: string;
        Desa_Kelurahan: string;
        Nomor_Rumah: string;
    };
}

interface BookingDetailsProps {
    kostan: Kostan;
}
interface UploadedFile {
    file: File;
    preview: string;
}


interface TenantInfo {
    displayName: string;
    phoneNumber: string;
    jenisKelamin: string;
    pekerjaan: string;
    kampus: string;
}


const BookingDetails = ({ kostan }: BookingDetailsProps) => {
    const [tenant, setTenant] = useState<TenantInfo | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [kostans, setKostans] = useState<Kostan[]>([]); // Tetapkan tipe state
    const [priceOption, setPriceOption] = useState<'perBulan' | 'perMinggu' | 'perHari'>('perBulan');
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);

    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [documentFiles, setDocumentFiles] = useState<(UploadedFile | null)[]>(Array(4).fill(null));
    const handleDrop = (event: DragEvent<HTMLDivElement>, index: number) => {
        event.preventDefault();
        const droppedFiles = Array.from(event.dataTransfer.files);
        handleFileUpload(droppedFiles, index);
    };

    // Pastikan hanya ada satu definisi handleFileChange
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>, index: number) => {
        const selectedFiles = Array.from(event.target.files || []);
        handleFileUpload(selectedFiles, index);
    };

    const handleFileUpload = (newFiles: File[], index: number) => {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/heic'];
        const filteredFiles = newFiles.filter(file => validImageTypes.includes(file.type));

        if (filteredFiles.length === 0) {
            alert("Hanya file gambar yang diperbolehkan!");
            return; // Tidak melakukan apa-apa jika tidak ada file valid
        }

        const fileArray = filteredFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setDocumentFiles(prev => {
            const newDocumentFiles = [...prev];
            newDocumentFiles[index] = fileArray[0];
            return newDocumentFiles;
        });

        setFiles(prevFiles => [...prevFiles, ...fileArray]);
    };


    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleRemoveFile = (index: number) => {
        setDocumentFiles(prev => {
            const newDocumentFiles = [...prev];
            newDocumentFiles[index] = null; // Set file ke null untuk menghapusnya
            return newDocumentFiles;
        });

        // Hapus juga file dari state `files`
        setFiles(prevFiles => {
            return prevFiles.filter((_, i) => i !== index);
        });
    };



    useEffect(() => {
        const fetchKostans = async () => {
            const snapshot: QuerySnapshot = await getDocs(collection(dbFire, 'home'));
            const kostanData: Kostan[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Kostan));
            setKostans(kostanData);
        };

        fetchKostans();
    }, []);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setIsLoggedIn(true);
                const userDocRef = doc(dbFire, "user", user.uid); // Ambil dokumen pengguna berdasarkan uid
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setTenant({
                        displayName: userData.displayName || "Nama belum terisi",
                        phoneNumber: userData.phoneNumber || "Nomor HP belum terisi",
                        jenisKelamin: userData.jenisKelamin || "Jenis kelamin belum terisi",
                        pekerjaan: userData.pekerjaan || "Pekerjaan belum terisi",
                        kampus: userData.kampus || "Perguruan tinggi belum terisi",
                    });
                } else {
                    console.log("No such document!");
                }
            } else {
                setIsLoggedIn(false);
                setTenant(null);
            }
        });

        return () => unsubscribe();
    }, []);


    if (!isLoggedIn) {
        return <p>Silakan login untuk melihat informasi penyewa.</p>;
    }

    const handlePriceOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setPriceOption(event.target.value as 'perBulan' | 'perMinggu' | 'perHari');
    };

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(event.target.value);
    };

    const displayedPrice = priceOption === 'perBulan'
        ? kostan.Price.perBulan
        : priceOption === 'perMinggu'
            ? kostan.Price.perMinggu
            : kostan.Price.perHari;


    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };


    return (
        <div className="max-w-7xl mx-auto p-4 m-4">
            <main className="bg-white p-6 rounded-lg shadow-md">
                {/* Right Sidebar - moved to the top */}
                {/* Right Sidebar - moved to the top
                  <div className="w-[600px] bg-gray-50 p-6 rounded-lg shadow-md mb-6">
                    <div className="flex items-center mb-4">
                        <img src="https://placehold.co/80x80" alt="Room Image" className="w-20 h-20 rounded-lg" />
                        <div className="ml-4">
                            <h3 className="text-lg font-bold">Kos Bebas Cinta</h3>
                            <p className="text-gray-500">Pondok Kelapa</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xl font-bold">Rp680.000</span>
                        <button className="text-green-500">Lihat Kos</button>
                    </div>
                    <p className="text-gray-600 mb-2">Tempat nyaman dan aman untuk tinggal</p>
                    <p className="text-gray-500 mb-2">Berada dekat kampus dan pusat perbelanjaan</p>
                </div>
                 */}

                <div className="flex justify-between items-start">
                    <div className="w-full">
                        <h1 className="text-3xl items-center font-bold mb-4">Pengajuan Sewa</h1>
                       
                        {/* Tenant Information */}
                        <section className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-black">Informasi penyewa</h2>
                                <button className="text-green-500">Ubah</button>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <span className="font-bold  text-green-600">Nama penyewa</span>
                                    <p className="text-gray-600">{tenant?.displayName}</p>
                                </div>
                                <div>
                                    <span className="font-bold  text-green-600">Nomor HP</span>
                                    <p className={tenant?.phoneNumber === "Nomor HP belum terisi" ? "text-red-500" : "text-red-500"}>
                                        {tenant?.phoneNumber}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-bold text-green-500">Jenis kelamin</span>
                                    <p className="text-gray-500">{tenant?.jenisKelamin}</p>
                                </div>
                                <div>
                                    <span className="font-bold text-green-500">Pekerjaan</span>
                                    <p className="text-gray-500">{tenant?.pekerjaan}</p>
                                </div>
                                <div>
                                    <span className="font-bold text-green-500">Nama perguruan tinggi</span>
                                    <p className="text-gray-500">{tenant?.kampus}</p>
                                </div>
                            </div>
                        </section>
                        {/* Document Requirements */}
                        <section className="mb-6">
                            <h2 className="text-xl font-bold mb-4 text-black">Dokumen persyaratan masuk kos</h2>
                            <p className="mb-4 text-gray-500">
                                Mohon melengkapi dokumen berikut yang diperlukan pemilik kos untuk verifikasi.
                                <a href="#" className="text-green-500">Apakah data saya aman?</a>
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {['Foto KTP', 'Foto diri dengan KTP', 'Foto kartu keluarga (opsional)', 'Foto buku nikah (opsional)'].map((doc, index) => (
                                    <div key={index} className="flex flex-col items-center border-2 border-dashed border-gray-300 p-4 rounded-lg">
                                        <i className="fas fa-upload text-gray-500 text-2xl mb-2"></i>
                                        <div
                                            className="text-green-500 cursor-pointer mb-2 h-12 flex items-center justify-center border border-green-500 rounded-lg"
                                            style={{ height: '50px' }} // Tinggi yang diinginkan
                                            onClick={() => document.getElementById(`file-input-${index}`)?.click()}
                                        >
                                            Upload di sini
                                        </div>
                                        <input
                                            type="file"
                                            id={`file-input-${index}`}
                                            className="hidden"
                                            accept=".jpg, .jpeg, .png, .heic"
                                            onChange={(e) => handleFileChange(e, index)}
                                        />

                                        <div
                                            className="border-2 border-dashed border-gray-300 p-4 rounded-lg w-full h-24 flex items-center justify-center"
                                            onDrop={(e) => handleDrop(e, index)}
                                            onDragOver={handleDragOver}
                                        >
                                            {documentFiles[index] ? (
                                                <img src={documentFiles[index]?.preview} alt={documentFiles[index]?.file.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <p className="text-gray-500">{doc}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
        
                            <div className="mt-4">
                                <h3 className="text-lg font-bold text-black">File yang diupload:</h3>
                                {files.length > 0 ? (
                                    <ul>
                                        {files.map((fileObj, index) => (
                                            <li key={index} className="text-gray-600 flex justify-between items-center">
                                                <span className="flex items-center">
                                                    <img src={fileObj.preview} alt={fileObj.file.name} className="w-12 h-12 object-cover mr-2" />
                                                    {fileObj.file.name}
                                                </span>
                                                <button
                                                    className="text-red-500 ml-4"
                                                    onClick={() => handleRemoveFile(index)}
                                                >
                                                    Hapus
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500">Belum ada file yang diupload.</p>
                                )}
                            </div>
                        </section>

                        {/* Rent Cost */}
                        <section className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-black">Biaya sewa kos</h2>
                                <button className="text-green-500">Ubah</button>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-black">Pilih biaya sewa:</span>
                                <select onChange={handlePriceOptionChange} value={priceOption} className="border border-gray-300 text-black rounded-md">
                                    <option className="text-black" value="perBulan">Per Bulan</option>
                                    <option className="text-black" value="perMinggu">Per Minggu</option>
                                    <option className="text-black" value="perHari">Per Hari</option>
                                </select>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-green-500">Harga sewa {priceOption === 'perBulan' ? 'per bulan' : priceOption === 'perMinggu' ? 'per minggu' : 'per hari'}</span>
                                <span className="text-black">Rp {displayedPrice ? parseFloat(displayedPrice.toString()).toLocaleString('id-ID') : '0'}</span>
                            </div>
                        </section>

                        {/* <section className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Metode pembayaran pertama</h2>
                                <button className="text-green-500">Ubah</button>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between"><span>Pembayaran penuh</span><span>Rp802.000</span></div>
                            </div>
                        </section> */}

                        {/*  <section className="mb-6">
                            <h2 className="text-xl font-bold mb-4">Catatan tambahan</h2>
                            <p className="mb-4">Penjelasan terkait pengajuan sewa dan transaksimu</p>
                            <div className="flex items-center space-x-2 mb-4">
                                <i className="fas fa-box-open text-gray-500 text-2xl"></i>
                                <button className="text-green-500">Pilih tambahan barang/fasilitas</button>
                            </div>
                            <p className="text-gray-500">Pilih di sini, dan pemilik akan memastikan biayanya setelah kamu ajukan sewa</p>
                        </section>*/}

                        {/* Start Date */}
                        <section className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-black">Tanggal mulai ngekos</h2>

                            </div>
                            <div className="flex flex-col">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={handleDateChange}
                                    className="border text-green-700 border-gray-300 rounded-md p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-150"
                                />
                                <p className="text-gray-700 text-lg">{formatDate(startDate)}</p>
                            </div>
                        </section>

                        {/*  <section className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Voucher</h2>
                                <button className="text-green-500">Masukkan</button>
                            </div>
                            <p>Pilih atau masukkan voucher</p>
                        </section> */}

                        {/*  <section className="mb-6">
                            <h2 className="text-xl font-bold mb-4">FAQ tentang pengajuan sewa</h2>
                            <button className="text-green-500">&gt;</button>
                        </section> */}

                        <button className="w-full  bg-green-500 text-white py-3 rounded-lg">Simpan Draft(Jika ingin melihat yang lainnya)</button>

                        <button className="w-full mt-4 bg-green-500 text-white py-3 rounded-lg">Ajukan Sewa</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BookingDetails;
