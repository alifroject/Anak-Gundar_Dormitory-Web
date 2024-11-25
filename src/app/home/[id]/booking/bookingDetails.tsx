"use client";
import React, { useState, useEffect, ChangeEvent, DragEvent } from "react";
import { auth, dbFire, storage } from "@/app/firebase/config"; // Pastikan file konfigurasi Firebase Anda benar
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, QuerySnapshot, getDoc, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
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
    tanggalLahir: Date;
    statusNikah: string;
    kotaAsal: string;
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
    tanggalLahir: Date;
    statusNikah: string;
    kotaAsal: string;
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

    const [isSaving, setIsSaving] = useState(false);
    const [showModalUpdated, setModalUpdated] = useState(false);
    const [modalMessageodalUpdated, setModalMessageodalUpdated] = useState("");

    const [showModalBooking, setModalBooking] = useState(false);
    const [modalMessageodalBoking, setModalMessageodalBooking] = useState("");


    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState<string>('');

    const [displayedPrice, setDisplayedPrice] = useState<number>(0);


    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [documentFiles, setDocumentFiles] = useState<(UploadedFile | null)[]>(Array(4).fill(null));
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [rentalData, setRentalData] = useState<RentalData[]>([]);
    const searchParams = useSearchParams(); // To access query parameters
    const draftId = searchParams.get('draftId'); // Retrieve 'draftId' from URL query
    const router = useRouter();

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
                        tanggalLahir: new Date(),
                        statusNikah: userData.statusNikah || "Status belum terisi", // Include this line
                        kotaAsal: userData.kotaAsal || "Kota asala belum diisi",
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
            setIsSaving(true);
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

                setModalUpdated(true)
                setModalMessageodalUpdated("Berhasil update data anda")
                setTimeout(() => {
                    // After 2 seconds, stop the spinner and perform the save action
                    setIsSaving(false);
                    console.log('Save completed!');
                    // Add your actual save logic here
                }, 2000);  // 2000 milliseconds = 2 seconds

                setIsEditing(false);

                setRentalData((prev) =>
                    prev.map((item) =>
                        item.id === editedData.id ? { ...editedData, price: priceToSave, priceOption } : item
                    )
                );
            } catch (error) {
                console.error("Error updating draft: ", error);
                setTimeout(() => {
                    // After 2 seconds, stop the spinner and perform the save action
                    setIsSaving(false);
                    console.log('Save completed!');
                    // Add your actual save logic here
                }, 2000);  // 2000 milliseconds = 2 seconds
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
            
            return downloadURL;
        } catch (error) {
            console.error("Error uploading file to Firebase Storage:", error);
            throw error; // Lempar ulang kesalahan untuk penanganan lebih lanjut
        }
    };


    const saveDraft = async () => {
        if (!tenant || files.length === 0 || displayedPrice <= 0 || !userProfile || !userProfile.uid) {

            alert("Harap isi semua data document anda!.");
            return;
        }

       

        setIsSaving(true);
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
            setTimeout(() => {
                // After 2 seconds, stop the spinner and perform the save action
                setIsSaving(false);
               
                // Add your actual save logic here
            }, 2000);  // 2000 milliseconds = 2 seconds
            setIsEditing(false);
        } catch (error) {
            console.error("Error saving draft: ", error);
            alert("Failed to save draft.");
        }
    };



    const handleBooking = async () => {
        // Validate required fields
        if (!tenant || files.length === 0 || displayedPrice <= 0 || !userProfile || !userProfile.uid) {
            setModalMessage("Harap isi semua data document anda!");
            setShowModal(true); // Show modal// Show an alert or use another notification method
            return;
        }

        if (!startDate || !tenant || files.length === 0) {
            console.log("Missing required fields:", { startDate, tenant, files });
            setModalMessage("Harap isi semua data document anda!");
            setShowModal(true); // Show modal// Show an alert or use another notification method
            return;
        }
        setIsSaving(true);

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
            tanggalLahir: userProfile.tanggalLahir,
            statusPernikahan: userProfile.statusPernikahan,
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
            setModalBooking(true)
            setModalMessageodalBooking("Booking berhasil, tunggu hingga dokument di verifikasi dalam 1 hari kerja.")

            setTimeout(() => {
                // After 2 seconds, stop the spinner and perform the save action
                setIsSaving(false);
                console.log('Booking completed!');
                const bookingUrl = `/profile/${userProfile?.uid}`;
                router.push(bookingUrl); // Redirect to the booking page
                // Add your actual save logic here
            }, 3000);  // 2000 milliseconds = 2 seconds
        } catch (error) {
            console.error("Error submitting booking: ", error);
            alert("Failed to submit booking request.");
        }
    };

    const closeModal = () => {
        setShowModal(false); // Close the modal
        setModalUpdated(false)
    };

    const chooseSave = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Check if all necessary data is provided
        if (!tenant || files.length === 0 || displayedPrice <= 0 || !userProfile || !userProfile.uid) {
            e.preventDefault(); // Prevent navigation if data is missing
            setModalMessage("Harap isi semua data document anda!");
            setShowModal(true); // Show modal// Show an alert or use another notification method
            return; // Stop further action if data is incomplete
        }

        if (!startDate || !documentFiles.length || !priceOption) {
            e.preventDefault(); // Prevent navigation if data is missing
            alert("Semua data wajib diisi sebelum melanjutkan!"); // Show an alert or use another notification method
            return; // Stop further action if any of these fields are missing
        }

        // Proceed with saving or editing the draft if the data is valid
        if (draftId) {
            handleSave(); // Call saveEditDraft if there is a draftId
        } else {
            saveDraft(); // Call saveDraft if there is no draftId
        }
    };






    return (
        <div className="max-w-7xl mx-auto p-4 m-4">
            {isSaving && (
                <div className="spinner-overlay absolute inset-0 flex justify-center items-center bg-opacity-50 bg-gray-800 z-50">
                    <div className="spinner-border animate-spin border-t-4 border-blue-500 border-solid rounded-full w-16 h-16"></div>
                </div>
            )}

            {showModalUpdated && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <div className="bg-green-100 rounded-lg shadow-xl p-8 text-center max-w-sm transform scale-95 transition-all duration-300 ease-out">
                        <h2 className="text-xl font-semibold text-green-600 mb-4">Update Data berhasil</h2>
                        <p className="text-green-700 mb-6">{modalMessageodalUpdated}</p>
                        <div className="flex justify-center">
                            <button
                                className="bg-green-600 text-white px-6 py-3 rounded-md text-lg font-medium shadow-lg hover:bg-green-700 transition-colors duration-200"
                                onClick={closeModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showModalBooking && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <div className="bg-green-100 rounded-lg shadow-xl p-8 text-center max-w-sm transform scale-95 transition-all duration-300 ease-out">
                        <h2 className="text-xl font-semibold text-green-600 mb-4">Booking berhasil</h2>
                        <p className="text-green-700 mb-6">{modalMessageodalBoking}</p>
                        <div className="flex justify-center">
                            <button
                                className="bg-green-600 text-white px-6 py-3 rounded-md text-lg font-medium shadow-lg hover:bg-green-700 transition-colors duration-200"
                                onClick={closeModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-sm transform scale-95 transition-all duration-300 ease-out">
                        <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
                        <p className="text-gray-700 mb-6">{modalMessage}</p>
                        <div className="flex justify-center">
                            <button
                                className="bg-red-500 text-white px-6 py-3 rounded-md text-lg font-medium shadow-lg hover:bg-red-600 transition-colors duration-200"
                                onClick={closeModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="bg-white p-6 rounded-lg shadow-md">
           

                <div className="flex justify-between items-start">
                    <div className="w-full mt-10">
                        <h1 className="text-3xl items-center mt-4   md:ml-[500px] md:text-green-500  text-green-500 font-bold mb-4 ">Pengajuan Sewa</h1>

                        {/* Tenant Information */}
                        <section className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-black">Informasi penyewa</h2>
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
                                            style={{ height: '50px' }} // Height for the upload button
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
                                            style={{ height: '200px', width: '100%', position: 'relative' }}
                                        >
                                            {/* Show uploaded image if available, else show placeholder text */}
                                            {documentFiles[index]?.preview ? (
                                                <img
                                                    src={documentFiles[index].preview}
                                                    alt={documentFiles[index].name || 'Uploaded File'}
                                                    className="object-contain w-full h-full"
                                                    style={{ objectFit: 'contain' }} // Ensure image fits within the container
                                                />
                                            ) : (
                                                <div className="text-gray-500">
                                                    {doc}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 overflow-x-auto">
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
                                    className="border border-gray-300 rounded-md p-3 mb-2 text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out shadow-sm hover:border-green-400"
                                />
                                <p className="text-gray-700 text-lg">{formatDate(startDate)}</p>
                            </div>
                        </section>


                
                        <Link
                            href={`/profile/${userProfile?.uid}`}
                            onClick={(e) => chooseSave(e)}
                            className=" bg-green-400 text-white py-3 px-6 rounded-lg text-center font-semibold transition-all duration-300 ease-in-out transform hover:bg-green-500 hover:shadow-md active:bg-green-600"
                        >
                            Simpan Draft
                        </Link>

                        <button
                            onClick={handleBooking}
                            className="mt-4 m-[3px] md:m-5 bg-green-600 text-white py-3 px-6 rounded-lg text-center font-semibold transition-all duration-300 ease-in-out transform hover:bg-green-700 hover:shadow-md active:bg-green-800"
                        >
                            Ajukan Sewa
                        </button>
                        

                    </div>
                </div>
            </main>
        </div>
    );
};

export default BookingDetails;
