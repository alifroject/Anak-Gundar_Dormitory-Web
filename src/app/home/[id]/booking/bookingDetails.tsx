"use client";
import React, { useState, useEffect, ChangeEvent, DragEvent } from "react";
import { auth, dbFire, storage } from "@/app/firebase/config"; // Pastikan file konfigurasi Firebase Anda benar
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, QuerySnapshot, getDoc, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { v4 as uuidv4 } from 'uuid'; // pastikan kamu menginstal uuid
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";



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
    kostann: Kostan;


}
interface UploadedFile {
    file: File;       // The actual file
    name: string;     // The name of the file
    preview: string;  // The preview URL of the file
}


interface TenantInfo {
    displayName: string;
    phoneNumber: string;
    jenisKelamin: string;
    pekerjaan: string;
    kampus: string;
}

interface UserProfile {
    uid: string;
    email: string | null;
    displayName?: string | null;
    nama: string;
    jenisKelamin: string;
    tanggalLahir: Date | null;
    pekerjaan: string;
    namaKampus: string;
    kotaAsal: string;
    statusPernikahan: string;
    pendidikanTerakhir: string;
    kontakDarurat: string;
    photoURL: string;
}


interface Document {
    name: string;
    preview: string;
}

interface Tenant {
    displayName: string;
    jenisKelamin: string;
    kampus: string;
    pekerjaan: string;
    phoneNumber: string;
}

interface RentalData {
    id: string;
    documents: Document[];
    kostanId: string;
    priceOption: 'perBulan' | 'perMinggu' | 'perHari';
    startDate: string;
    tenant: Tenant;
    price: number;
    nama: string;
    uid: string;

}

const BookingDetails: React.FC<BookingDetailsProps> = ({ kostann }) => {
    const [tenant, setTenant] = useState<TenantInfo | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [, setKostans] = useState<Kostan[]>([]); // Tetapkan tipe state
    const [priceOption, setPriceOption] = useState<'perBulan' | 'perMinggu' | 'perHari'>('perBulan');
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [, setIsEditing] = useState(false); // Tambahkan state untuk mode edit
    const [editedData, setEditedData] = useState<RentalData | null>(null);




    const [displayedPrice, setDisplayedPrice] = useState<number>(0);


    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [, setDocumentFiles] = useState<(UploadedFile | null)[]>(Array(4).fill(null));
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [rentalData, setRentalData] = useState<RentalData[]>([]);
    const searchParams = useSearchParams(); // To access query parameters
    const draftId = searchParams.get('draftId'); // Retrieve 'draftId' from URL query


    useEffect(() => {
        const fetchRentalData = async () => {
            if (!draftId) {
                console.log("Draft ID is missing.");
                return;
            }

            try {
                const rentalDocRef = doc(dbFire, 'draft', draftId);
                const rentalSnapshot = await getDoc(rentalDocRef);

                if (rentalSnapshot.exists()) {
                    const data = rentalSnapshot.data();
                    const rentalDocument = {
                        id: rentalSnapshot.id,
                        documents: data.documents || [],
                        kostanId: data.kostanId || '',
                        priceOption: data.priceOption || 'perBulan',
                        startDate: data.startDate || new Date().toISOString().split("T")[0],
                        tenant: data.tenant || { displayName: '', jenisKelamin: '', kampus: '', pekerjaan: '', phoneNumber: '' },
                        price: data.price || 0,
                        nama: data.nama || '',
                        uid: data.uid || ''

                    };

                    setRentalData([rentalDocument]);
                    setEditedData(rentalDocument);

                    setDisplayedPrice(rentalDocument.price);
                    setPriceOption(rentalDocument.priceOption);
                    setStartDate(rentalDocument.startDate);
                } else {
                    console.log("No document found with the provided Draft ID.");
                }
            } catch (error) {
                console.error('Error fetching rental data:', error);
            }
        };

        fetchRentalData();
    }, [draftId]);



    const handleDrop = (event: DragEvent<HTMLDivElement>, index: number) => {
        event.preventDefault();
        const droppedFiles = Array.from(event.dataTransfer.files);
        handleFileUpload(droppedFiles, index);
    };

    const uploadImageToServer = async (file: File): Promise<File> => {
        // Convert file to base64 before sending
        const reader = new FileReader();
        reader.readAsDataURL(file);

        const compressedFile = await new Promise<File>((resolve, reject) => {
            reader.onload = async () => {
                const base64File = reader.result as string;
                const response = await fetch("/api/compressImage", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ fileBuffer: base64File }),  // Send base64 file
                });

                if (!response.ok) {
                    console.error("Server response error:", response.status, response.statusText);
                    reject(new Error("Error during image upload."));
                }

                const compressedBlob = await response.blob();
                resolve(new File([compressedBlob], file.name, { type: "image/jpeg" }));
            };

            reader.onerror = reject;
        });

        return compressedFile;
    };




    const handleFileChange = (event: ChangeEvent<HTMLInputElement>, index: number) => {
        const selectedFile = event.target.files?.[0]; // Dapatkan file yang dipilih
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const previewUrl = reader.result as string; // Simpan preview URL

                setDocumentFiles(prev => {
                    const newDocumentFiles = [...prev];
                    newDocumentFiles[index] = {
                        file: selectedFile,  // Sertakan file asli
                        name: selectedFile.name, // Gunakan nama file tanpa batasan panjang
                        preview: previewUrl,  // Simpan preview
                    } as UploadedFile; // Cast ke UploadedFile
                    return newDocumentFiles;
                });

                setFiles(prevFiles => {
                    const newFiles = [...prevFiles];
                    newFiles[index] = {
                        file: selectedFile,
                        name: selectedFile.name,
                        preview: previewUrl,
                    } as UploadedFile; // Cast ke UploadedFile
                    return newFiles;
                });
            };
            reader.readAsDataURL(selectedFile); // Baca file sebagai data URL untuk preview
        }
    };


    const handleFileUpload = async (newFiles: File[], index: number) => {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/heic'];
        const filteredFiles = newFiles.filter(file => validImageTypes.includes(file.type));

        if (filteredFiles.length === 0) {
            alert("Only image files are allowed!");
            return;
        }

        const fileArray = await Promise.all(filteredFiles.map(async (file) => {
            const compressedFile = await uploadImageToServer(file);
            const previewUrl = URL.createObjectURL(compressedFile);

            const shortName = `file_${index}_${Date.now()}`;

            return {
                file: compressedFile,
                name: shortName,
                originalName: file.name,
                preview: previewUrl,
            };
        }));

        setDocumentFiles(prev => {
            const newDocumentFiles = [...prev];
            newDocumentFiles[index] = fileArray[0];  // Replace the file at the specified index
            return newDocumentFiles;
        });

        setFiles(prevFiles => {
            const newFiles = [...prevFiles];
            newFiles[index] = fileArray[0];  // Replace the file at the specified index
            return newFiles;
        });
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
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setIsLoggedIn(true);
                // Fetch user profile data from Firestore
                const userDoc = doc(dbFire, 'user', user.uid);
                const userSnapshot = await getDoc(userDoc);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data() as UserProfile; // Cast to UserProfile
                    const userProfileData: UserProfile = {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || "Anonymous",
                        nama: userData.nama || "",
                        jenisKelamin: userData.jenisKelamin || "",
                        tanggalLahir: userData.tanggalLahir || null,
                        pekerjaan: userData.pekerjaan || "",
                        namaKampus: userData.namaKampus || "",
                        kotaAsal: userData.kotaAsal || "",
                        statusPernikahan: userData.statusPernikahan || "",
                        pendidikanTerakhir: userData.pendidikanTerakhir || "",
                        kontakDarurat: userData.kontakDarurat || "",
                        photoURL: userData.photoURL || user.photoURL || "", // Get from Firestore or Auth
                    };
                    setUserProfile(userProfileData);
                } else {
                    console.error("No such user document!");
                    // Handle the case when user data doesn't exist
                }
            } else {
                setIsLoggedIn(false);
                setUserProfile(null);
            }
        });

        return () => unsubscribe();
    }, []);


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
        const value = event.target.value as 'perBulan' | 'perMinggu' | 'perHari';
        setPriceOption(value);
        updateDisplayedPrice(value);
    };


    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(event.target.value);
    };



    const updateDisplayedPrice = (option: 'perBulan' | 'perMinggu' | 'perHari') => {
        let price: number;
        // Calculate price based on the selected option
        switch (option) {
            case 'perBulan':
                price = kostann.Price.perBulan;
                break;
            case 'perMinggu':
                price = kostann.Price.perMinggu;
                break;
            case 'perHari':
                price = kostann.Price.perHari;
                break;
            default:
                price = 0;  // Provide a default value or handle it accordingly
                break;
        }

        setDisplayedPrice(price); // Update the displayed price state
    };






    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const handleSave = async () => {
        if (editedData && draftId && userProfile && userProfile.uid) {
            const docRef = doc(dbFire, "draft", draftId);
            const priceToSave = displayedPrice;

            try {
                // Fetch the existing document to get old document URLs
                const docSnapshot = await getDoc(docRef);
                const existingData = docSnapshot.data();

                // Check if there are existing files and delete them from Firebase Storage
                if (existingData && existingData.documents) {
                    await Promise.all(existingData.documents.map(async (oldDoc: Document) => {
                        const oldFileRef = ref(storage, `drafts/${userProfile.uid}/${oldDoc.name}`);
                        await deleteObject(oldFileRef).catch((error) => {
                            console.warn(`Error deleting existing file ${oldDoc.name}: ${error.message}`);
                        });
                    }));
                }

                // Upload the new file and get the URL
                const documentURLs = await Promise.all(files.map(async (fileObj) => {
                    try {
                        const compressedFile = await uploadImageToServer(fileObj.file);
                        const url = await uploadFileToStorage(compressedFile, userProfile.uid);
                        console.log(`File ${fileObj.file.name} uploaded successfully with URL: ${url}`);
                        return { name: fileObj.file.name, url };
                    } catch (error) {
                        console.error(`Error processing file ${fileObj.file.name}:`, error);
                        throw error;
                    }
                }));

                // Ensure only the latest file is kept in Firestore
                await updateDoc(docRef, {
                    ...editedData,
                    price: priceToSave,
                    priceOption,
                    startDate,
                    documents: [documentURLs[documentURLs.length - 1]], // Store only the last uploaded file
                });

                alert("Draft updated successfully!");
                setIsEditing(false);

                setRentalData((prev) =>
                    prev.map((item) =>
                        item.id === editedData.id ? { ...editedData, price: priceToSave, priceOption } : item
                    )
                );
            } catch (error) {
                console.error("Error updating draft: ", error);
                alert("Failed to update draft.");
            }
        } else {
            alert("User profile or draft data is missing.");
        }
    };



    const generateUniqueFileName = (originalFileName: string): string => {
        const fileExtension = originalFileName.split('.').pop();  // Mendapatkan ekstensi file
        return `${uuidv4()}.${fileExtension}`;  // Menambahkan ekstensi ke nama file unik
    };


    const uploadFileToStorage = async (file: File, uid: string): Promise<string> => {
        const uniqueFileName = generateUniqueFileName(file.name);
        const fileRef = ref(storage, `drafts/${uid}/${uniqueFileName}`);

        try {
            await uploadBytes(fileRef, file);
            const downloadURL = await getDownloadURL(fileRef);
            console.log("File uploaded successfully, URL:", downloadURL);
            return downloadURL;
        } catch (error) {
            console.error("Error uploading file to Firebase Storage:", error);
            throw error; // Lempar ulang kesalahan untuk penanganan lebih lanjut
        }
    };


    const saveDraft = async () => {
        if (!tenant || files.length === 0 || displayedPrice <= 0 || !userProfile || !userProfile.uid) {
            alert("Please complete tenant information, upload documents, and ensure a price and user UID are available.");
            return;
        }

        console.log("Saving with user UID:", userProfile.uid);

        try {
            const documentURLs = await Promise.all(files.map(async fileObj => {


                // Cek jika ada gambar lama dan hapus
                const oldFileRef = ref(storage, `drafts/${userProfile.uid}/${fileObj.file.name}`);
                await deleteObject(oldFileRef).catch((error) => {
                    console.warn("No existing file to delete:", error);
                });

                // Unggah gambar baru
                const compressedFile = await uploadImageToServer(fileObj.file);
                const newFileUrl = await uploadFileToStorage(compressedFile, userProfile.uid);
                console.log(`File ${fileObj.file.name} uploaded successfully with URL: ${newFileUrl}`);
                return { name: fileObj.file.name, url: newFileUrl };
            }));

            const draftData = {
                tenant: tenant,
                kostanId: kostann.id,
                nama: kostann.nama,
                priceOption: priceOption,
                price: displayedPrice,
                startDate: startDate,
                documents: documentURLs,
                uid: userProfile.uid,
            };

            await addDoc(collection(dbFire, "draft"), draftData);
            alert("Draft saved successfully!");
            setIsEditing(false);
        } catch (error) {
            console.error("Error saving draft: ", error);
            alert("Failed to save draft.");
        }
    };



    const handleBooking = async () => {
        // Validate required fields
        if (!tenant || files.length === 0 || displayedPrice <= 0 || !userProfile || !userProfile.uid) {
            alert("Please complete all required fields.");
            return;
        }

        if (!startDate || !tenant || files.length === 0) {
            console.log("Missing required fields:", { startDate, tenant, files });
            alert("Some required fields are missing.");
            return;
        }

        const documentURLs = await Promise.all(files.map(async fileObj => {
            const oldFileRef = ref(storage, `drafts/${userProfile.uid}/${fileObj.file.name}`);
            await deleteObject(oldFileRef).catch((error) => {
                console.warn("No existing file to delete:", error);
            });

            const compressedFile = await uploadImageToServer(fileObj.file);
            const newFileUrl = await uploadFileToStorage(compressedFile, userProfile.uid);
            console.log(`File ${fileObj.file.name} uploaded successfully with URL: ${newFileUrl}`);
            return { name: fileObj.file.name, url: newFileUrl };
        }));

        const bookingData = {
            tenant: tenant,
            kostanId: kostann.id,
            nama: kostann.nama,
            priceOption: priceOption,
            price: displayedPrice,
            startDate: startDate,
            documents: documentURLs,
            uid: userProfile.uid,
            status: "unverified",
        };

        console.log("Booking Data:", bookingData);

        try {
            // Save booking data to Firestore
            const bookingRef = await addDoc(collection(dbFire, "booking"), bookingData);
            console.log("Booking data saved successfully with ID:", bookingRef.id);

            // Delete draft if booking data was saved successfully
            if (draftId) {
                const draftRef = doc(dbFire, "draft", draftId);
                await deleteDoc(draftRef);
                console.log("Draft data deleted successfully.");
            }

            alert("Booking request submitted successfully!");
        } catch (error) {
            console.error("Error submitting booking: ", error);
            alert("Failed to submit booking request.");
        }
    };



    const chooseSave = () => {
        if (draftId) {
            handleSave(); // Panggil saveEditDraft jika ada draftId
        } else {
            saveDraft(); // Panggil saveDraft jika tidak ada draftId
        }
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
                        <h1 className="text-3xl items-center mt-4   md:ml-[500px] md:text-green-500  text-green-500 font-bold mb-4 ">Pengajuan Sewa</h1>

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
                                            onChange={(e) => handleFileChange(e, index)} // Handle file change
                                        />

                                        <div
                                            className="border-2 border-dashed border-gray-300 p-4 rounded-lg w-full h-24 flex items-center justify-center"
                                            onDrop={(e) => handleDrop(e, index)} // Handle drop event
                                            onDragOver={handleDragOver} // Allow drag over
                                        >
                                            {/* Show uploaded image if available, else show placeholder text */}
                                            {editedData?.documents && editedData.documents[index]?.preview ? (
                                                <img
                                                    src={editedData.documents[index].preview}
                                                    alt={editedData.documents[index].name || 'Document Image'}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-gray-500">{doc}</div>
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
                                                    <img
                                                        src={fileObj.preview}
                                                        alt={fileObj.file.name}
                                                        className="w-12 h-12 object-cover mr-2"
                                                    />
                                                    {fileObj.file.name}
                                                </span>
                                                <button
                                                    className="text-red-500 ml-4"
                                                    onClick={() => handleRemoveFile(index)} // Handle file removal
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




                        {rentalData.length > 0 ? (
                            rentalData.map((data) => (
                                <section className="mb-6" key={data.id}>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-bold text-black">Biaya sewa kos</h2>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-black">Pilih biaya sewa:</span>
                                        <select
                                            onChange={handlePriceOptionChange}
                                            value={priceOption}
                                            className="border border-gray-300 text-black rounded-md"
                                        >
                                            <option className="text-black" value="perBulan">Per Bulan</option>
                                            <option className="text-black" value="perMinggu">Per Minggu</option>
                                            <option className="text-black" value="perHari">Per Hari</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-green-500">
                                            Harga sewa {priceOption === 'perBulan' ? 'per bulan' : priceOption === 'perMinggu' ? 'per minggu' : 'per hari'}
                                        </span>
                                        <span className="text-black">Rp {displayedPrice.toLocaleString('id-ID')}</span>
                                    </div>
                                </section>
                            ))
                        ) : (
                            <section className="mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-black">Biaya sewa kos</h2>
                                </div>
                                <div className="flex flex-col mb-2">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-black">Pilih biaya sewa:</span>
                                        <select
                                            onChange={handlePriceOptionChange}
                                            value={priceOption}
                                            className="border border-gray-300 text-black rounded-md"
                                        >
                                            <option className="text-black" value="perBulan">Per Bulan</option>
                                            <option className="text-black" value="perMinggu">Per Minggu</option>
                                            <option className="text-black" value="perHari">Per Hari</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-green-500">
                                            Harga sewa {priceOption === 'perBulan' ? 'per bulan' : priceOption === 'perMinggu' ? 'per minggu' : 'per hari'}
                                        </span>
                                        <span className="text-black">Rp {displayedPrice.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            </section>
                        )}




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

                        <Link href={`/profile/${userProfile?.uid}`} onClick={chooseSave} className="w-full  bg-green-500 text-white py-3 rounded-lg">Simpan Draft(Jika ingin melihat yang lainnya)</Link>

                        <button onClick={handleBooking} className="w-full mt-4 bg-green-500 text-white py-3 rounded-lg">Ajukan Sewa</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BookingDetails;
