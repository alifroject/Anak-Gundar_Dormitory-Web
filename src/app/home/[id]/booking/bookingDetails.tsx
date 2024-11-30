"use client";
import React, { useState, useEffect, ChangeEvent, DragEvent } from "react";
import { auth, dbFire, storage } from "@/app/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, QuerySnapshot, getDoc, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPhone, faVenusMars, faBriefcase, faUniversity } from '@fortawesome/free-solid-svg-icons';


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
    file: File;
    name: string;
    preview: string;
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
    const [, setKostans] = useState<Kostan[]>([]);
    const [priceOption, setPriceOption] = useState<'perBulan' | 'perMinggu' | 'perHari'>('perBulan');
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [, setIsEditing] = useState(false);
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
    const searchParams = useSearchParams();
    const draftId = searchParams.get('draftId');
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
                    body: JSON.stringify({ fileBuffer: base64File }),
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
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const previewUrl = reader.result as string;

                setDocumentFiles(prev => {
                    const newDocumentFiles = [...prev];
                    newDocumentFiles[index] = {
                        file: selectedFile,
                        name: selectedFile.name,
                        preview: previewUrl,
                    } as UploadedFile;
                    return newDocumentFiles;
                });

                setFiles(prevFiles => {
                    const newFiles = [...prevFiles];
                    newFiles[index] = {
                        file: selectedFile,
                        name: selectedFile.name,
                        preview: previewUrl,
                    } as UploadedFile;
                    return newFiles;
                });
            };
            reader.readAsDataURL(selectedFile);
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
            newDocumentFiles[index] = fileArray[0];
            return newDocumentFiles;
        });

        setFiles(prevFiles => {
            const newFiles = [...prevFiles];
            newFiles[index] = fileArray[0];
            return newFiles;
        });
    };





    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleRemoveFile = (index: number) => {
        setDocumentFiles(prev => {
            const newDocumentFiles = [...prev];
            newDocumentFiles[index] = null;
            return newDocumentFiles;
        });


        setFiles(prevFiles => {
            return prevFiles.filter((_, i) => i !== index);
        });
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setIsLoggedIn(true);

                const userDoc = doc(dbFire, 'user', user.uid);
                const userSnapshot = await getDoc(userDoc);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data() as UserProfile;
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
                        photoURL: userData.photoURL || user.photoURL || "",
                    };
                    setUserProfile(userProfileData);
                } else {
                    console.error("No such user document!");

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
                const userDocRef = doc(dbFire, "user", user.uid);
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
                        statusNikah: userData.statusNikah || "Status belum terisi",
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
                price = 0;
                break;
        }

        setDisplayedPrice(price);
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

                    setIsSaving(false);
                    console.log('Save completed!');

                }, 2000);

                setIsEditing(false);

                setRentalData((prev) =>
                    prev.map((item) =>
                        item.id === editedData.id ? { ...editedData, price: priceToSave, priceOption } : item
                    )
                );
            } catch (error) {
                console.error("Error updating draft: ", error);
                setTimeout(() => {

                    setIsSaving(false);
                    console.log('Save completed!');

                }, 2000);
            }
        } else {
            alert("User profile or draft data is missing.");
        }
    };



    const generateUniqueFileName = (originalFileName: string): string => {
        const fileExtension = originalFileName.split('.').pop();
        return `${uuidv4()}.${fileExtension}`;
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
            throw error;
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

                setIsSaving(false);


            }, 2000);
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
            setShowModal(true);
            return;
        }

        if (!startDate || !tenant || files.length === 0) {
            console.log("Missing required fields:", { startDate, tenant, files });
            setModalMessage("Harap isi semua data document anda!");
            setShowModal(true);
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

            const bookingRef = await addDoc(collection(dbFire, "booking"), bookingData);
            console.log("Booking data saved successfully with ID:", bookingRef.id);


            if (draftId) {
                const draftRef = doc(dbFire, "draft", draftId);
                await deleteDoc(draftRef);
                console.log("Draft data deleted successfully.");
            }
            setModalBooking(true)
            setModalMessageodalBooking("Booking berhasil, tunggu hingga dokument di verifikasi dalam 1 hari kerja.")

            setTimeout(() => {

                setIsSaving(false);
                console.log('Booking completed!');
                const bookingUrl = `/profile/${userProfile?.uid}`;
                router.push(bookingUrl);

            }, 3000);
        } catch (error) {
            console.error("Error submitting booking: ", error);
            alert("Failed to submit booking request.");
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setModalUpdated(false)
    };

    const chooseSave = (e: React.MouseEvent<HTMLAnchorElement>) => {

        if (!tenant || files.length === 0 || displayedPrice <= 0 || !userProfile || !userProfile.uid) {
            e.preventDefault();
            setModalMessage("Harap isi semua data document anda!");
            setShowModal(true);
            return;
        }

        if (!startDate || !documentFiles.length || !priceOption) {
            e.preventDefault();
            alert("Semua data wajib diisi sebelum melanjutkan!");
            return;
        }


        if (draftId) {
            handleSave();
        } else {
            saveDraft();
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
                        <div className="flex flex-col items-center justify-center mt-8 mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200 max-w-md">
                            <div className="flex items-center mb-4">
                                {/* Icon: Dokumen */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="green"
                                    className="w-8 h-8 mr-3">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12h6m2 4H7m12-9V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2h8a2 2 0 002-2v-5l4-4z"
                                    />
                                </svg>
                                {/* Judul */}
                                <h1 className="md:text-3xl text-[20px] text-green-500 font-bold">
                                    Pengajuan Sewa
                                </h1>
                            </div>
                        </div>



                        <section className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-black">Informasi Penyewa</h2>
                            </div>
                            <div className="space-y-4">
                                {/* Nama Penyewa */}
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faUser} className="text-red-600 w-6 h-6 mr-3" />
                                    <div>
                                        <span className="font-bold text-green-600">Nama Penyewa</span>
                                        <p className="text-gray-600">{tenant?.displayName}</p>
                                    </div>
                                </div>

                                {/* Nomor HP */}
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faPhone} className="text-red-600 w-6 h-6 mr-3" />
                                    <div>
                                        <span className="font-bold text-green-600">Nomor HP</span>
                                        <p
                                            className={
                                                tenant?.phoneNumber === "Nomor HP belum terisi"
                                                    ? "text-red-500"
                                                    : "text-gray-600"
                                            }
                                        >
                                            {tenant?.phoneNumber}
                                        </p>
                                    </div>
                                </div>

                                {/* Jenis Kelamin */}
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faVenusMars} className="text-red-600 w-6 h-6 mr-3" />
                                    <div>
                                        <span className="font-bold text-green-500">Jenis Kelamin</span>
                                        <p className="text-gray-500">{tenant?.jenisKelamin}</p>
                                    </div>
                                </div>

                                {/* Pekerjaan */}
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faBriefcase} className="text-red-600 w-6 h-6 mr-3" />
                                    <div>
                                        <span className="font-bold text-green-500">Pekerjaan</span>
                                        <p className="text-gray-500">{tenant?.pekerjaan}</p>
                                    </div>
                                </div>

                                {/* Nama Perguruan Tinggi */}
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faUniversity} className="text-red-600 w-6 h-6 mr-3" />
                                    <div>
                                        <span className="font-bold text-green-500">Nama Perguruan Tinggi</span>
                                        <p className="text-gray-500">{tenant?.kampus}</p>
                                    </div>
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
                                            onChange={(e) => handleFileChange(e, index)}
                                        />

                                        <div
                                            className="border-2 border-dashed border-gray-300 p-4 rounded-lg w-full h-24 flex items-center justify-center"
                                            onDrop={(e) => handleDrop(e, index)}
                                            onDragOver={handleDragOver}
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
