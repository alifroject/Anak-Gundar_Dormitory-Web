"use client";
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { auth, dbFire } from "@/app/firebase/config";
import { collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { GeoPoint } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
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
    priceOption: string;
    startDate: string;
    tenant: Tenant;
    price: number; // Add the price field
    nama: string
    uid: string; // Tambahkan uid ke dalam tipe
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

interface Price {
    perBulan: number;
    perHari: number;
    perMinggu: number;
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
    geolokasi: GeoPoint; // Geolocation
}
interface RiwayatKosProps {
    initialData: KostanData | null;
}


const RiwayatKos: React.FC<RiwayatKosProps> = ({ initialData }) => {
    const [rentalData, setRentalData] = useState<RentalData[]>([]); // Store an array of rental data
    const [, setLoading] = useState<boolean>(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();
    const [kostan, setKostan] = useState<KostanData | null>(initialData);



    useEffect(() => {
        const fetchRentalData = async (): Promise<void> => {
            try {
                const rentalCollection = collection(dbFire, 'draft');
                const rentalSnapshot = await getDocs(rentalCollection);
                const rentalDocuments = rentalSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }) as RentalData)
                    .filter(doc => doc.uid === userProfile?.uid); // Filter berdasarkan uid

                if (rentalDocuments.length > 0) {
                    setRentalData(rentalDocuments);
                } else {
                    console.log('No rental data found for this user');
                }
            } catch (error) {
                console.error('Error fetching rental data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userProfile) {
            fetchRentalData(); // Hanya panggil fetch jika ada userProfile
        }
    }, [userProfile]); // Tambahkan userProfile sebagai dependensi


    useEffect(() => {
        const fetchKostanData = async () => {
            try {
                const querySnapshot = await getDocs(collection(dbFire, 'home'));

                // Check if any documents were returned
                if (querySnapshot.empty) {
                    console.error("No kostan documents found."); // Log error if no documents are found
                    return; // Exit the function early
                }

                // Map over the documents to extract data
                const kostanData = querySnapshot.docs.map((doc) => {
                    const kostan = doc.data();
                    return {
                        id: doc.id,
                        // Extract other properties as needed
                        nama: kostan.nama,
                        alamat: kostan.alamat,
                        // add other properties...
                    } as KostanData;
                });

                // Set the first kostan object to state (or choose the specific one you want)
                setKostan(kostanData[0]);
            } catch (error) {
                console.error("Error fetching kostan data:", error); // Log any error that occurs during the fetch
            }
        };

        fetchKostanData();
    }, []);



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

    const handleDeleteDraft = async (id: string) => {
        try {
            const draftRef = doc(dbFire, 'draft', id);
            await deleteDoc(draftRef);
            setRentalData(prevData => prevData.filter(rental => rental.id !== id)); // Remove the draft from the state
            console.log('Draft deleted successfully');
        } catch (error) {
            console.error('Error deleting draft:', error);
        }
    };

    const handleNavigateToBooking = () => {
        if (isLoggedIn) {
            console.log("User is logged in. Proceeding with rental application...");

            if (kostan) { // Ensure kostan is not null
                // Get the draft id to pass along with the booking URL
                const draftId = rentalData.length > 0 ? rentalData[0].id : null; // Or another way to select the draft

                // Construct the booking URL with kostan.id and draftId
                const bookingUrl = `/home/${kostan.id}/booking?details=${encodeURIComponent(
                    kostan.nama?.replace(/\s+/g, '-') ?? 'Unnamed'
                )}&alamat=Kota/Kabupaten=${encodeURIComponent(
                    kostan.alamat?.kota_kabupaten ?? 'Kota Tidak Diketahui'
                )}&kecamatan=${encodeURIComponent(
                    kostan.alamat?.kecamatan ?? 'Kecamatan Tidak Diketahui'
                )}&desa=${encodeURIComponent(
                    kostan.alamat?.Desa_Kelurahan ?? 'Desa Tidak Diketahui'
                )}&NO_Rumah=${encodeURIComponent(
                    kostan.alamat?.Nomor_Rumah ?? 'Nomor Tidak Diketahui'
                )}&draftId=${draftId}`;

              
                router.push(bookingUrl); // Redirect to the booking page
            } else {
                console.error("Kostan data is not available.");
            }
        } else {
            console.log("User is not logged in. Redirecting to login page...");
            router.push('/login'); // Redirect to login if not authenticated
        }
    };




    return (

        <div className='h-screen'>
            <>
                {isLoggedIn ? (
                    <div className="p-6 md:p-10   w-full flex flex-col 
             bg-gradient-to-b from-blue-300 to-purple-100 
             shadow-md border-t-10 border-blue-600 rounded-lg z-10">
                        <div className="bg-white shadow-xl mb-10 border-t-4 border-blue-500 rounded-lg p-8 w-full max-w-3xl mx-auto mt-10">
                            <div className="flex flex-col items-center text-center">
                               
                                <div className="mb-4">
                                    <FontAwesomeIcon icon={faFileAlt} className="text-blue-500 text-5xl" />
                                </div>
                             
                                <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
                                    Pengajuan Sewa
                                </h1>
                               
                                <p className="text-gray-600 text-lg">
                                    Ajukan permohonan sewa dengan mudah dan cepat.
                                </p>
                            </div>
                        </div>


                        <div className="bg-white p-4 rounded-lg mb-4 flex-1 w-full">
                            <div className="h-full flex flex-col">
                                {rentalData.length > 0 ? (
                                    rentalData.map((rental) => (
                                        <div key={rental.id} className="border p-4 rounded-lg mb-4 flex flex-col text-black">
                                            <div className="flex">
                                                
                                            </div>
                                            <h2 className="text-lg font-semibold">{rental.nama}</h2>
                                            <div className="flex items-center text-sm text-gray-500 mb-2">
                                                <span className="text-green-500">Tersedia 2 Kamar</span>
                                            </div>
                                            <div className="text-sm text-gray-500 mb-2">Hitungan Sewa</div>
                                            <div className="text-lg font-semibold text-red-500 mb-2">
                                                Rp {rental.price.toLocaleString('id-ID')} <span className="text-sm text-gray-500">(Pembayaran pertama)</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="text-sm text-gray-500">Tanggal Masuk</div>
                                                    <div className="text-sm font-semibold">{new Date(rental.startDate).toLocaleDateString()}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Durasi Sewa</div>
                                                    <div className="text-sm font-semibold">{rental.priceOption}</div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-4 space-x-4">
                                               
                                                <button
                                                    className="p-3 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                                                    onClick={() => handleDeleteDraft(rental.id)}
                                                    aria-label="Hapus Draft"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="w-5 h-5" />
                                                    <span className="hidden md:inline font-medium">Hapus</span>
                                                </button>

                                              
                                                <button
                                                    onClick={handleNavigateToBooking}
                                                    className="py-3 px-6 rounded-full bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 hover:shadow-xl transform transition-transform duration-300 hover:-translate-y-1 flex items-center gap-2"
                                                    aria-label="Lanjutkan ke Booking"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                        className="w-5 h-5"
                                                    >
                                                        <path d="M14.29 8.7a1 1 0 0 0 0 1.4L16.17 12H4a1 1 0 1 0 0 2h12.17l-1.88 1.88a1 1 0 1 0 1.42 1.42l3.59-3.59a1 1 0 0 0 0-1.42l-3.59-3.59a1 1 0 0 0-1.42 0z" />
                                                    </svg>
                                                    <span>Lanjutkan</span>
                                                </button>
                                            </div>

                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full  flex justify-center items-center">
                                        <div className="text-gray-500">No rental data available.</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>Silakan login terlebih dahulu.</div>
                )}

            </>
        </div>

    );
};

export default RiwayatKos;
