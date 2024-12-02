"use client";

import { useState, useEffect } from 'react';
import { GeoPoint } from 'firebase/firestore';
import { auth, dbFire } from "@/app/firebase/config"; // Import db for Firestore
import { onAuthStateChanged } from 'firebase/auth';
import Login from '@/app/Login'; // Import komponen login
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { FaShareAlt, FaWhatsapp, FaEnvelope, FaFacebook, FaTwitter, FaCopy } from 'react-icons/fa';
import { getDoc, doc, updateDoc, arrayUnion, addDoc, collection } from "firebase/firestore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import './ShareButtons.css'; // Pastikan untuk mengimpor file CSS
import { Timestamp } from 'firebase/firestore';


const MapComponent = dynamic(() => import('@/app/MapComponent'), { ssr: false });
import Link from 'next/link';



// types.ts
export interface Review {
    id: string;
    review: string;
    rating: number;
    timestamp: Date;
}


type PeraturanS = string;

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
    parkir_Motor: boolean;
    parkir_Mobil: boolean;
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
interface TransformedKostanData {
    id: string;
    nama: string;
    geolokasi: {
        latitude: number;
        longitude: number;
    };
    Price: Price; // Add Price here
    images: {
        image1: string | null;
        image2: string | null;
        image3: string | null;
        image4: string | null;
    }; // Add images here
    fal: Fal; // Add fal if needed
    peraturan: Peraturan; // Add peraturan if needed
    ownerName: string;
    ownerPhoneNumber: string;
    alamat: Alamat; // Add alamat if needed
    region: string;
    jenis: string;
    sisaKamar: number;
    ukuranKamar: string;
    type: string
}
const KostanDetailClient = ({ initialData }: { initialData: KostanData | null }) => {
    const [kostan] = useState<KostanData | null>(initialData);
    const [loading] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Assume you have a way to determine if the user is logged in
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [copySuccess, setCopySuccess] = useState('');

    const [isFadingOut, setIsFadingOut] = useState(false);
    const router = useRouter(); // Initialize router

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isModalOpenRule, setIsModalOpenRule] = useState<boolean>(false);
    const [selectedPeraturan, setSelectedPeraturan] = useState<PeraturanS | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewText, setReviewText] = useState("");
    const [rating, setRating] = useState(5);

    const [showModalBooking, setModalBooking] = useState(false);

    const openModal = (peraturan: PeraturanS): void => {
        setSelectedPeraturan(peraturan);
        setIsModalOpenRule(true);
    };

    const closeModal = (): void => {
        setIsModalOpenRule(false);
        setSelectedPeraturan(null);
        setModalBooking(false);
    };


    useEffect(() => {
        if (kostan?.id) {
            fetchReviews(kostan.id); // Memanggil fetchReviews saat kostan.id tersedia
        }
    }, [kostan]); // Hanya dipanggil ketika kostan berubah

    const fetchReviews = async (kostanId: string) => {
        const docRef = doc(dbFire, "home", kostanId);
        try {
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                const kostanData = docSnapshot.data();
                const fetchedReviews: Review[] = kostanData?.reviews || [];
                setReviews(fetchedReviews);
            } else {
                console.log("Dokumen kostan tidak ditemukan.");
            }
        } catch (error) {
            console.error("Error fetching reviews: ", error);
        }
    };

    const handleSubmitReview = async () => {
        if (!isLoggedIn) {
            // Jika pengguna belum login, buka modal untuk login
            setIsLoginModalOpen(true);
            return;
        }

        if (reviewText.trim() === "") return;
        if (!kostan?.id) return;

        const newReview: Review = {
            id: `${Date.now()}`,
            review: reviewText,
            rating: rating,
            timestamp: new Date(),
        };

        try {
            const docRef = doc(dbFire, "home", kostan.id);
            await updateDoc(docRef, {
                reviews: arrayUnion(newReview),
            });

            setReviews((prevReviews) => [...prevReviews, newReview]);
            setReviewText('');
            setRating(5);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error adding review: ", error);
        }
    };

    const timeAgo = (timestamp: Timestamp | Date) => {


        // Cek jika timestamp adalah Firestore Timestamp dan konversi ke Date
        const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;

        // Pastikan timestamp sudah menjadi objek Date yang valid
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            return "Waktu tidak valid";  // Menangani kasus jika timestamp tidak valid
        }

        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);
        const diffInMonths = Math.floor(diffInDays / 30);
        const diffInYears = Math.floor(diffInMonths / 12);

        if (diffInSeconds < 60) {
            return `${diffInSeconds} detik yang lalu`;
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes} menit yang lalu`;
        } else if (diffInHours < 24) {
            return `${diffInHours} jam yang lalu`;
        } else if (diffInDays < 30) {
            return `${diffInDays} hari yang lalu`;
        } else if (diffInMonths < 12) {
            return `${diffInMonths} bulan yang lalu`;
        } else {
            return `${diffInYears} tahun yang lalu`;
        }
    };



    const handleSaveAsLikeClick = async () => {
        if (!isLoggedIn) {
            console.log("User not logged in. Opening login modal...");
            setIsLoginModalOpen(true);
            return;
        }

        if (!kostan?.id) {
            console.error("No home ID available to save as like.");
            return;
        }

        try {
            const user = auth.currentUser; // Mendapatkan user yang sedang login
            if (!user) {
                console.error("User is not authenticated.");
                return;
            }

            const likedHouse = {
                uid: user.uid, // UID pengguna yang login
                homeId: kostan.id, // ID dari rumah yang disukai
            };

           const likeData =  await addDoc(collection(dbFire, "LikedHouse"), likedHouse);
           console.log(likeData)

            setModalBooking(true)

            setTimeout(() => {

                const bookingUrl = `/profile/${user?.uid}`;
                router.push(bookingUrl);
            }, 1500)


        } catch (error) {
            console.error("Error saving liked house:", error);
            alert("Failed to save as Like.");
        }
    };



    useEffect(() => {
        // Membuat elemen script
        const script = document.createElement('script');
        script.src = 'https://platform-api.sharethis.com/js/sharethis.js#property=YOUR_PROPERTY_ID&product=inline-share-buttons';
        script.async = true;

        // Menambahkan script ke dalam body
        document.body.appendChild(script);

        // Clean up saat komponen dibuang
        return () => {
            document.body.removeChild(script);
        };
    }, []);





    const toggleShareModal = () => {
        setIsOpen(!isOpen);
    };

    const handleShare = (platform: 'whatsapp' | 'email' | 'facebook' | 'twitter' | 'copy'): void => {
        const url: string = window.location.href; // Get current page URL
        const text: string = "Check this out!"; // Customize your message here

        switch (platform) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${text} ${url}`, '_blank');
                break;
            case 'email':
                window.location.href = `mailto:?subject=Check this out&body=${text} ${url}`;
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
                break;
            case 'copy':
                navigator.clipboard.writeText(url).then(() => {
                    setCopySuccess('Berhasil copy Link');
                    setTimeout(() => setCopySuccess(''), 3000); // Clear message after 3 seconds
                    setTimeout(() => {
                        setCopySuccess('');
                        setIsFadingOut(false);
                    }, 3000); // Clear message after 3s

                }).catch(() => {
                    setCopySuccess('Berhasil copy Link');
                });
                break;
            default:
                break;
        }
        setIsOpen(false); // Close the modal after sharing
    };



    const handleLoginSubmit = () => {
        // Add your login submit logic here
        console.log("Login submitted");
    };




    // Listen for authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoggedIn(true);
                setIsLoginModalOpen(false); // Close modal if logged in
                
            } else {
                setIsLoggedIn(false);
                console.log("No user is logged in.");
            }
        });

        return () => unsubscribe(); // Clean up the subscription on unmount
    }, [auth]);

    const handleAjukanSewaClick = () => {
        console.log("Check login status:", isLoggedIn);

        if (!isLoggedIn) {
            console.log("User not logged in. Opening login modal...");
            setIsLoginModalOpen(true);
        } else {
            console.log("User is logged in. Proceeding with rental application...");

            const bookingUrl = `/home/${kostan?.id}/booking?details=${encodeURIComponent(
                kostan?.nama?.replace(/\s+/g, '-') ?? 'Unnamed')}`;

            
            router.push(bookingUrl); // Redirect to the booking page
        }
    };



    // Handle login success
    const handleLoginSuccess = () => {
        setIsLoginModalOpen(false); // Close modal immediately
        console.log("Login successful.");
    };

    // Close modal handler
    const closeLoginModal = () => {
        setIsLoginModalOpen(false);
    };

    const formatPhoneNumber = (phoneNumber: string) => {
  
        const cleaned = ('' + phoneNumber).replace(/\D/g, '');


        if (cleaned.startsWith('0')) {
            return `62${cleaned.slice(1)}`;
        }

 
        return cleaned;
    };

    const transformedKostan: TransformedKostanData | null = kostan
        ? {
            id: kostan.id,
            nama: kostan.nama,
            geolokasi: kostan.geolokasi ? {
                latitude: kostan.geolokasi.latitude, 
                longitude: kostan.geolokasi.longitude,
            } : { latitude: 0, longitude: 0 },
            Price: {
                perBulan: kostan.Price.perBulan,
                perMinggu: kostan.Price.perMinggu,
                perHari: kostan.Price.perHari,
            },
            images: {
                image1: kostan.images.image1,
                image2: kostan.images.image2,
                image3: kostan.images.image3,
                image4: kostan.images.image4,
            },
            fal: {
                AC: kostan.fal.AC,
                kasur: kostan.fal.kasur,
                kipas: kostan.fal.kipas,
                kursi: kostan.fal.kursi,
                lemari: kostan.fal.lemari,
                meja: kostan.fal.meja,
                ventilasi: kostan.fal.ventilasi,
                kamar_mandi_dalam: kostan.fal.kamar_mandi_dalam,
                kamar_mandi_luar: kostan.fal.kamar_mandi_luar,
                areaLoundryJemur: kostan.fal.areaLoundryJemur,
                Free_Electricity: kostan.fal.Free_Electricity,
                dapur: kostan.fal.dapur,
                parkir_Motor: kostan.fal.parkir_Motor,
                parkir_Mobil: kostan.fal.parkir_Mobil,
            },
            peraturan: {
                umum: kostan.peraturan.umum,
                tamu: kostan.peraturan.tamu,
                kebersihan: kostan.peraturan.kebersihan,
                pembayaran: kostan.peraturan.pembayaran,
                lainnya: kostan.peraturan.lainnya,
            },
            alamat: {
                provinsi: kostan.alamat.provinsi,
                kota_kabupaten: kostan.alamat.kota_kabupaten,
                kecamatan: kostan.alamat.kecamatan,
                Desa_Kelurahan: kostan.alamat.Desa_Kelurahan,
                Jalan: kostan.alamat.Jalan,
                Nomor_Rumah: kostan.alamat.Nomor_Rumah,
                Kode_Pos: kostan.alamat.Kode_Pos,
            },
            ownerName: kostan.ownerName,
            ownerPhoneNumber: kostan.ownerPhoneNumber,
            region: kostan.region,
            jenis: kostan.jenis,
            sisaKamar: kostan.sisaKamar,
            ukuranKamar: kostan.ukuranKamar,
            type: kostan.type,
        }
        : null;

    if (loading) return <div>Loading...</div>;
    if (!kostan) return <div>Kostan tidak ditemukan</div>;

    return (

        <div className="mx-0 p-2 mt-16">

            {showModalBooking && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <div className="bg-green-100 rounded-lg shadow-2xl p-6 sm:p-8 text-center max-w-sm transform scale-95 transition-transform duration-300 ease-out animate-scale-up">
                        {/* Icon Love */}
                        <div className="flex justify-center mb-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                className="w-12 h-12 text-red-500 animate-bounce"
                            >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6.42 3.42 5 5.5 5c1.74 0 3.41 1.01 4.5 2.09C11.09 6.01 12.76 5 14.5 5 16.58 5 18 6.42 18 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-bold text-green-600 mb-4 animate-fade-in">
                            Anjay berhasil tambah favorite lu bro
                        </h2>

                        {/* Button */}
                        <div className="flex justify-center">
                        </div>
                    </div>
                </div>
            )}



            <main className="bg-white p-6 xs:m-2  rounded-lg shadow-md w-full">
                <div className="flex flex-col  md:flex-row">
                    <div className="md:w-2/3  w-full">
                        {kostan.images.image1 && (
                            <img
                                src={kostan.images.image1}
                                alt="Room Image 1"
                                className="rounded-lg w-[740px] h-[400px] md:w-[900px] md:h-[500px] sm:h-[300px] mb-4 object-cover"
                            />
                        )}
                        <div className="grid grid-cols-3 gap-4">
                            {kostan.images.image2 && (
                                <img
                                    src={kostan.images.image2}
                                    alt="Room Image 1"
                                    className="rounded-lg w-60 h-40 object-cover"
                                />
                            )}
                            {kostan.images.image3 && (
                                <img
                                    src={kostan.images.image3}
                                    alt="Room Image 2"
                                    className="rounded-lg w-60 h-40 object-cover"
                                />
                            )}
                            {kostan.images.image4 && (
                                <img
                                    src={kostan.images.image4}
                                    alt="Room Image 3"
                                    className="rounded-lg w-60 h-40 object-cover"
                                />
                            )}


                        </div>
                    </div>
                    <div className="md:w-1/3 w-full md:pl-4 mt-4 md:mt-0">
                        <h1 className="text-2xl font-bold mb-2 text-gray-500">
                            <i className="fas fa-map-marker-alt  mr-2"></i>{kostan.nama} <span className='text-red-500 text-[12px]'>{kostan.type}</span>
                        </h1>
                        <div className="flex flex-col mb-4">
                            {/* Monthly Price */}
                            <div className="flex items-center mb-2">
                                <span className="text-green-600 text-xl font-bold">
                                    Rp {kostan.Price?.perBulan ? parseFloat(kostan.Price.perBulan.toString()).toLocaleString('id-ID') : '0'}
                                </span>
                                <span className="text-gray-600 ml-2">/ bulan</span>
                            </div>

                            {/* Weekly Price */}
                            <div className="flex items-center mb-2">
                                <span className="text-green-600 text-xl font-bold">
                                    Rp {kostan.Price?.perMinggu ? parseFloat(kostan.Price.perMinggu.toString()).toLocaleString('id-ID') : '0'}
                                </span>
                                <span className="text-gray-600 ml-2">/ Minggu</span>
                            </div>

                            {/* Daily Price */}
                            <div className="flex items-center mb-2">
                                <span className="text-green-600 text-xl font-bold">
                                    Rp {kostan.Price?.perHari ? parseFloat(kostan.Price.perHari.toString()).toLocaleString('id-ID') : '0'}
                                </span>
                                <span className="text-gray-600 ml-2">/ Hari</span>
                            </div>
                        </div>

                        <div className="mt-4">
                            {kostan.sisaKamar > 0 ? (
                                <>
                                    <button
                                        className="flex mt-10 items-center bg-blue-500 text-white mb-4 px-4 py-2 rounded-lg shadow hover:bg-blue-600"
                                        onClick={handleAjukanSewaClick}
                                    >
                                        <i className="fas fa-briefcase mr-2"></i> {/* Ikon koper */}
                                        Ajukan Sewa
                                    </button>

                                    {/* Tombol Save as Like */}
                                    <button
                                        className="flex mb-10 items-center bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600"
                                        onClick={handleSaveAsLikeClick}
                                    >
                                        <i className="fas fa-heart mr-2"></i> {/* Ikon hati */}
                                        Save as Like
                                    </button>
                                </>

                            ) : (
                                <div className="flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-lg shadow-md">
                                    <i className="fas fa-door-closed text-white text-lg mr-3"></i>
                                    <span className="font-semibold text-sm">Kamar ini sudah penuh</span>
                                </div>
                            )}
                        </div>



                        {isLoginModalOpen && (
                            <Login
                                onLoginSubmit={handleLoginSubmit}
                                onClose={closeLoginModal}
                                onLoginSuccess={handleLoginSuccess}
                                originPath={`/home/${kostan?.id}?details=${encodeURIComponent(
                                    kostan?.nama.replace(/\s+/g, '-')
                                )}&alamat=Kota/Kabupaten=${encodeURIComponent(
                                    kostan?.alamat.kota_kabupaten
                                )}&kecamatan=${encodeURIComponent(
                                    kostan?.alamat.kecamatan
                                )}&desa=${encodeURIComponent(
                                    kostan?.alamat.Desa_Kelurahan
                                )}&NO_Rumah=${encodeURIComponent(kostan?.alamat.Nomor_Rumah)}`}
                            />
                        )}

                        <div className="flex items-start mb-4">
                            <i className="fas fa-map-marker-alt text-gray-600 mr-2 mt-1"></i>
                            <div className="flex flex-col">
                                <h2 className="text-gray-600">Jl. {kostan.alamat.Jalan}</h2>
                                <h2 className="text-gray-600">{kostan.alamat.Desa_Kelurahan}</h2>
                                <h2 className="text-gray-600">{kostan.alamat.kota_kabupaten}</h2>
                                <h2 className="text-gray-600">{kostan.alamat.provinsi}</h2>
                            </div>
                        </div>
                        <div className="flex items-center mb-2">
                            <span className="text-green-600 text-xl font-bold">
                                Sisa Kamar  <span className='text-red-500'>{kostan.sisaKamar}</span>
                            </span>
                            <br />

                        </div>
                        <div className="flex items-center mb-2">
                            <span className="text-green-600 text-xl font-bold">
                                Region  <span className='text-red-500'>{kostan.region}</span>
                            </span>
                            <br />

                        </div>
                        <div className="flex items-center mb-2">
                            <span className="text-green-600 text-xl font-bold">
                                Jenis  <span className='text-red-500'>{kostan.jenis}</span>
                            </span>
                            <br />

                        </div>



                        <div className="mb-4 mt-10">
                            <div className="flex items-center mb-2">
                                <i className="fas fa-user text-gray-600 mr-2"></i>
                                <span className="text-gray-600">
                                    Dikelola oleh <span className="text-green-600">{kostan.ownerName}</span>
                                </span>
                            </div>
                            <Link
                                href={`https://wa.me/${transformedKostan?.ownerPhoneNumber ? formatPhoneNumber(transformedKostan.ownerPhoneNumber) : ''}`}
                                target="_blank"
                                className="flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faWhatsapp} style={{ color: 'green' }} className="h-12 w-12" />
                                <p className='text-black'>Chat Owner</p>
                            </Link>
                            <button
                                className="text-gray-800 flex items-center space-x-2 mt-10"
                                onClick={toggleShareModal}
                            >
                                <FaShareAlt className="text-xl" />
                                <span>Bagikan</span>
                            </button>
                        </div>

                        {isOpen && (
                            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 z-50 backdrop-blur-sm">
                                <div className="bg-white p-8 rounded-2xl shadow-2xl w-80">
                                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Share This</h2>
                                    <div className="flex justify-around mb-6">
                                        <button
                                            className="text-green-600 hover:text-green-700 transition-colors duration-200 p-2"
                                            onClick={() => handleShare('whatsapp')}
                                        >
                                            <FaWhatsapp className="text-3xl" />
                                        </button>
                                        <button
                                            className="text-blue-700 hover:text-blue-800 transition-colors duration-200 p-2"
                                            onClick={() => handleShare('facebook')}
                                        >
                                            <FaFacebook className="text-3xl" />
                                        </button>
                                        <button
                                            className="text-blue-500 hover:text-blue-600 transition-colors duration-200 p-2"
                                            onClick={() => handleShare('twitter')}
                                        >
                                            <FaTwitter className="text-3xl" />
                                        </button>
                                        <button
                                            className="text-red-500 hover:text-red-600 transition-colors duration-200 p-2"
                                            onClick={() => handleShare('email')}
                                        >
                                            <FaEnvelope className="text-3xl" />
                                        </button>
                                        <button
                                            className="text-gray-600 hover:text-gray-700 transition-colors duration-200 p-2"
                                            onClick={() => handleShare('copy')}
                                        >
                                            <FaCopy className="text-2xl" /> Copy Link
                                        </button>
                                    </div>
                                    <div className="flex justify-center">
                                        <button
                                            className="bg-green-500 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-green-600 transition-all duration-200"
                                            onClick={toggleShareModal}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {copySuccess && (
                            <p className={`fade-in-out ${isFadingOut ? 'fade-out' : ''} text-black`}>{copySuccess}</p>
                        )}



                    </div>
                </div>

                <div className="mt-20">
                    <h2 className="text-xl font-bold mb-4 text-gray-700 text-center">Yang kamu dapatkan di <span className='text-green-500'>{kostan.nama}</span></h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {kostan.fal.AC && (
                            <div className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                <i className="fas fa-snowflake text-blue-500 mr-2 text-xl"></i>
                                <span className="text-gray-700 font-medium">AC</span>
                            </div>
                        )}
                        {kostan.fal.Free_Electricity && (
                            <div className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                <i className="fas fa-bolt text-yellow-500 mr-2 text-xl"></i>
                                <span className="text-gray-700 font-medium">Free Electricity</span>
                            </div>
                        )}
                        {kostan.fal.areaLoundryJemur && (
                            <div className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                <i className="fas fa-tshirt text-green-500 mr-2 text-xl"></i>
                                <span className="text-gray-700 font-medium">Area Laundry & Jemur</span>
                            </div>
                        )}
                        {kostan.fal.dapur && (
                            <div className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                <i className="fas fa-utensils text-orange-500 mr-2 text-xl"></i>
                                <span className="text-gray-700 font-medium">Dapur</span>
                            </div>
                        )}
                        {kostan.fal.kamar_mandi_dalam && (
                            <div className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                <i className="fas fa-bath text-blue-400 mr-2 text-xl"></i>
                                <span className="text-gray-700 font-medium">Kamar Mandi Dalam</span>
                            </div>
                        )}
                        {kostan.fal.kamar_mandi_luar && (
                            <div className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                <i className="fas fa-bath text-green-400 mr-2 text-xl"></i>
                                <span className="text-gray-700 font-medium">Kamar Mandi Luar</span>
                            </div>
                        )}
                        {kostan.fal.kasur && (
                            <div className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                <i className="fas fa-bed text-purple-500 mr-2 text-xl"></i>
                                <span className="text-gray-700 font-medium">Kasur</span>
                            </div>
                        )}
                        {kostan.fal.kipas && (
                            <div className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                <i className="fas fa-fan text-gray-400 mr-2 text-xl"></i>
                                <span className="text-gray-700 font-medium">Kipas</span>
                            </div>
                        )}
                        {kostan.fal.kursi && (
                            <div className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                <i className="fas fa-chair text-indigo-500 mr-2 text-xl"></i>
                                <span className="text-gray-700 font-medium">Kursi</span>
                            </div>
                        )}
                        {kostan.fal.lemari && (
                            <div className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                <i className="fas fa-box text-yellow-700 mr-2 text-xl"></i>

                                <span className="text-gray-700 font-medium">Lemari</span>
                            </div>
                        )}
                        {kostan.fal.meja && (
                            <div className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                <i className="fas fa-table text-teal-500 mr-2 text-xl"></i>
                                <span className="text-gray-700 font-medium">Meja</span>
                            </div>
                        )}
                        {kostan.fal.parkir_Mobil && (
                            <div className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                <i className="fas fa-car text-red-500 mr-2 text-xl"></i>
                                <span className="text-gray-700 font-medium">Parkir Mobil</span>
                            </div>
                        )}
                        {kostan.fal.parkir_Motor && (
                            <div className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                <i className="fas fa-motorcycle text-orange-500 mr-2 text-xl"></i>
                                <span className="text-gray-700 font-medium">Parkir Motor</span>
                            </div>
                        )}
                        {kostan.fal.ventilasi && (
                            <div className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                <i className="fas fa-wind text-cyan-500 mr-2 text-xl"></i>
                                <span className="text-gray-700 font-medium">Ventilasi</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-20">
                    <h2 className="text-xl font-bold mb-4 text-gray-700 text-center">Peraturan khusus tipe kamar ini</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {kostan.peraturan.umum && (
                            <div
                                className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                                onClick={() => openModal(kostan.peraturan.umum)}
                            >
                                <i className="fas fa-home text-green-500 mr-2 text-xl"></i>
                                <span className="text-gray-700 font-medium">Umum</span>
                            </div>
                        )}
                        {kostan.peraturan.kebersihan && (
                            <div
                                className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                                onClick={() => openModal(kostan.peraturan.kebersihan)}
                            >
                                <i className="fas fa-broom text-yellow-500 mr-2 text-xl"></i>
                                <span className="text-gray-700 font-medium">Kebersihan</span>
                            </div>
                        )}
                        {kostan.peraturan.tamu && (
                            <div
                                className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                                onClick={() => openModal(kostan.peraturan.tamu)}
                            >
                                <i className="fas fa-user-friends text-blue-500 mr-2 text-xl"></i>
                                <span className="text-gray-700 font-medium">Tamu</span>
                            </div>
                        )}
                        {kostan.peraturan.pembayaran && (
                            <div
                                className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                                onClick={() => openModal(kostan.peraturan.pembayaran)}
                            >
                                <i className="fas fa-credit-card text-green-500 mr-2 text-xl"></i>
                                <span className="text-gray-700 font-medium">Pembayaran</span>
                            </div>
                        )}
                        {kostan.peraturan.lainnya && (
                            <div
                                className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                                onClick={() => openModal(kostan.peraturan.lainnya)}
                            >
                                <i className="fas fa-ellipsis-h text-gray-500 mr-2 text-xl"></i>
                                <span className="text-gray-700 font-medium">Lainnya</span>
                            </div>
                        )}
                    </div>

                    {/* Modal */}
                    {isModalOpenRule && (
                        <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center items-center z-50 transition-all duration-300 ease-in-out">
                            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-8 rounded-2xl shadow-xl w-full max-w-lg">
                                <h3 className="text-2xl font-semibold text-white mb-4">Detail Peraturan</h3>
                                <p className="text-white text-lg">{selectedPeraturan}</p>
                                <div className="mt-6 flex justify-center">
                                    <button
                                        onClick={closeModal}
                                        className="bg-pink-500 text-white py-2 px-6 rounded-full hover:bg-pink-600 transition duration-300 transform hover:scale-105"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>


                <div className="mt-20">
                    <h2 className="text-xl text-black font-bold mb-4 text-center flex items-center justify-center">
                        <i className="fas fa-map-marker-alt text-blue-500 mr-3 text-2xl"></i>
                        Lokasi dan Lingkungan Sekitar
                    </h2>
                    <div style={{ width: '100%', height: '400px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', position: 'relative', zIndex: 1 }} className="w-full h-64 bg-gray-200 rounded-lg mb-4">
                        <div className="map-box" style={{ width: '100%', height: '100%' }}>
                            {transformedKostan && (
                                <MapComponent
                                    kostanData={[transformedKostan]} // Only pass the necessary data

                                />
                            )}
                        </div>
                    </div>

                </div>
                <div className="mt-6">
                </div>
                <div className="mt-20">
                    <div className="flex justify-center items-center">
                        <button
                            onClick={() => {
                                if (!isLoggedIn) {
                                    // Jika belum login, tampilkan modal login
                                    setIsLoginModalOpen(true);
                                } else {
                                    // Jika sudah login, buka modal untuk menulis review
                                    setIsModalOpen(true);
                                }
                            }}
                            className="mb-4 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
                        >
                            Write a Review
                        </button>
                    </div>



                    {isModalOpen && (
                        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                                <h3 className="text-xl font-semibold mb-4 text-black">Tulis Review</h3>

                                <textarea
                                    className="w-full p-4 mb-4 border rounded-lg text-black"
                                    placeholder="Tulis review kamu disini"
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                />

                                <div className="flex items-center mb-4">
                                    <span className="mr-2 text-black">Rating:</span>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className={`text-xl ${star <= rating ? 'text-yellow-500' : 'text-gray-400'}`}
                                        >
                                            <i className="fas fa-star"></i>
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleSubmitReview}
                                    className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300"
                                >
                                    Submit Review
                                </button>

                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="mt-4 w-full bg-gray-300 text-black py-2 rounded-lg hover:bg-gray-400 transition duration-300"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 md:mt-2 md:mb-0 md:m-40">
                        {reviews.map((review, index) => (
                            <div key={review.id} className="bg-gray-100 p-4 rounded-lg">
                                <div className="flex items-center mb-2">
                                    <div>
                                        <div className="flex items-center">

                                            <i className="fas fa-user-circle text-gray-500 mr-2"></i>

                                            <h3 className="text-lg font-bold text-blue-800 text-[15px]">Unknown User {index + 1}</h3>
                                        </div>
                                        <div className="flex items-center">
                                            {[...Array(review.rating)].map((_, i) => (
                                                <i key={i} className="fas fa-star text-yellow-500"></i>
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-500">{timeAgo(review.timestamp)}</span>
                                    </div>
                                </div>
                                <p className="text-gray-600">{review.review}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default KostanDetailClient;
