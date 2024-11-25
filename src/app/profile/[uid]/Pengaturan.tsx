import { useEffect, useState } from "react";
import { collection, getDocs, query, where, deleteDoc, doc, getDoc } from "firebase/firestore";
import { auth, dbFire } from "@/app/firebase/config";
import Link from 'next/link';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faHeart } from "@fortawesome/free-solid-svg-icons";

interface LikedHouse {
    id: string;
    uid: string;
    homeId: string;
}

interface HouseDetail {
    id: string;
    nama: string;
    jenis: string;
    region: string;
    harga: {
        perHari: number;
        perMinggu: number;
        perBulan: number;
    };
    alamat: {
        Desa_Kelurahan: string;
        Jalan: string;
        Kode_Pos: string;
        kecamatan: string;
        kota_kabupaten: string;
        provinsi: string;
    };
    fasilitas: {
        AC: boolean;
        kipas: boolean;
        lemari: boolean;
        meja: boolean;
        kursi: boolean;
        ventilasi: boolean;
    };
    images: {
        image1: string;
        image2?: string;
        image3?: string;
        image4?: string;
    };
    sisaKamar: number;
    ukuranKamar: string;
    type: string;
}

export default function Career() {
    const [likedHouses, setLikedHouses] = useState<LikedHouse[]>([]);
    const [houseDetails, setHouseDetails] = useState<HouseDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [refresh, setRefresh] = useState(false); // State untuk memicu refetch
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedHouse, setSelectedHouse] = useState<{ likedHouseId: string; homeId: string } | null>(null);


    useEffect(() => {
        const fetchLikedHouses = async () => {
            try {
                const user = auth.currentUser;
                if (!user) {
                    setIsLoggedIn(false);
                    setIsLoading(false);
                    return;
                }
                setIsLoggedIn(true);

                // Ambil data LikedHouse untuk user yang login
                const likedHouseQuery = query(
                    collection(dbFire, "LikedHouse"),
                    where("uid", "==", user.uid)
                );
                const likedHouseSnapshot = await getDocs(likedHouseQuery);
                const likedHouseData = likedHouseSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as LikedHouse[];

                setLikedHouses(likedHouseData);

                // Fetch detail rumah berdasarkan homeId di LikedHouse
                const houseDetailPromises = likedHouseData.map(async (liked) => {
                    const houseDocRef = doc(dbFire, "home", liked.homeId);
                    const houseDocSnap = await getDoc(houseDocRef);

                    if (houseDocSnap.exists()) {
                        const houseData = houseDocSnap.data();
                        return {
                            id: liked.homeId,
                            nama: houseData.nama,
                            jenis: houseData.jenis,
                            region: houseData.region,
                            harga: {
                                perHari: houseData.Price.perHari,
                                perMinggu: houseData.Price.perMinggu,
                                perBulan: houseData.Price.perBulan,
                            },
                            alamat: {
                                Desa_Kelurahan: houseData.alamat.Desa_Kelurahan,
                                Jalan: houseData.alamat.Jalan,
                                Kode_Pos: houseData.alamat.Kode_Pos,
                                kecamatan: houseData.alamat.kecamatan,
                                kota_kabupaten: houseData.alamat.kota_kabupaten,
                                provinsi: houseData.alamat.provinsi,
                            },
                            fasilitas: houseData.fal,
                            images: houseData.images,
                            sisaKamar: houseData.sisaKamar,
                            ukuranKamar: houseData.ukuranKamar,
                            type: houseData.type
                        };
                    } else {
                        console.warn(`House with ID ${liked.homeId} not found.`);
                        return null;
                    }
                });

                const houses = await Promise.all(houseDetailPromises);
                setHouseDetails(houses.filter((house) => house !== null) as HouseDetail[]);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLikedHouses();
    }, [refresh]);  // Tambahkan `refresh` sebagai dependency agar useEffect dipicu ulang saat `refresh` berubah

    const handleDeleteRequest = (likedHouseId: string, homeId: string) => {
        setSelectedHouse({ likedHouseId, homeId });
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedHouse) return;

        try {
            await deleteDoc(doc(dbFire, "LikedHouse", selectedHouse.homeId));

            

            setLikedHouses((prev) => prev.filter((house) => house.id !== selectedHouse.likedHouseId));
            setHouseDetails((prev) => prev.filter((house) => house.id !== selectedHouse.homeId));

            setRefresh((prev) => !prev);
        } catch (error) {
            console.error("Error saat menghapus rumah dari favorit:", error);
            alert("Terjadi kesalahan saat menghapus rumah. Silakan coba lagi.");
        } finally {
            setShowDeleteModal(false);
            setSelectedHouse(null);
        }
    };





    return (
        <div className="min-h-screen">
            <div className="p-6 md:p-10   w-full flex flex-col 
             bg-gradient-to-b from-blue-300 to-purple-100 
             shadow-md border-t-10 border-blue-600 rounded-lg z-10">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 shadow-xl rounded-lg p-6 md:p-10 w-full max-w-4xl mx-auto ">
                    <div className="flex items-center justify-center mb-6">
                        <FontAwesomeIcon icon={faHeart} className="text-red-500 text-3xl mr-3" />
                        <h1 className="text-3xl font-extrabold text-white">
                            Rumah yang Disukai
                        </h1>
                    </div>
                    {/* Konten lainnya */}
                </div>

                {showDeleteModal && (
                    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 text-center max-w-sm transform transition-transform duration-300 ease-out">
                            <h2 className="text-xl font-semibold text-red-600 mb-4">
                                Konfirmasi Penghapusan
                            </h2>
                            <p className="text-gray-700 mb-6">
                                Apakah Anda yakin ingin menghapus rumah ini dari daftar favorit?
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-400 transition-all duration-200"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Batal
                                </button>
                                <button
                                    className="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition-all duration-200"
                                    onClick={confirmDelete}
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                )}




                {houseDetails.length === 0 ? (
                    <></>
                ) : (
                    <ul className="grid h-full grid-cols-2 md:grid-cols-3  lg:grid-cols-4 gap-6">
                        {houseDetails.map((house) => (
                            <li key={house.id} className="pt-8 md:pt-12 mt-5 rounded-lg  hover:border-blue-500 transition-all duration-300 relative flex flex-col shadow-lg hover:shadow-xl">
                                {/* Tombol Hapus */}
                                <button
                                    onClick={() => handleDeleteRequest(house.id, likedHouses.find(lh => lh.homeId === house.id)?.id || '')}
                                    className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 focus:outline-none"
                                >
                                    <FontAwesomeIcon icon={faTrashAlt} className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                </button>

                                {/* Link ke halaman detail */}
                                <Link href={`/home/${house.id}?House_Or_Apertment=${encodeURIComponent(house.nama.replace(/\s+/g, "-"))}`} passHref>
                                    {/* Gambar */}
                                    <div className="relative overflow-hidden mt-4 rounded-t-lg">
                                        <img src={house.images.image1} alt={house.nama} className="w-full md:h-48 object-cover rounded-t-lg" />
                                    </div>

                                    {/* Konten */}
                                    <div className="p-4 bg-white rounded-b-lg">
                                        <h2 className="md:text-lg text-[12px] font-semibold text-gray-800 truncate">{house.nama} <span className="text-sm ml-2 text-red-500">{house.type}</span></h2>
                                        <p className="md:text-sm text-[10px] text-gray-500">{house.jenis} - {house.region}</p>
                                        <p className="md:text-lg text-[9px] font-semibold text-green-600">Rp {house.harga.perBulan.toLocaleString()} / bulan</p>
                                        <p className="md:text-sm text-[9px] text-gray-700">{house.alamat.Jalan}, {house.alamat.Desa_Kelurahan}, {house.alamat.kecamatan}, {house.alamat.kota_kabupaten}</p>
                                        <div className="md:text-sm text-[9px] text-gray-600 mt-2">
                                            <p className="md:text-sm text-[9px]">Sisa Kamar: <span className="font-semibold">{house.sisaKamar}</span></p>
                                            <p className="md:text-sm text-[9px]">Ukuran Kamar: <span className="font-semibold">{house.ukuranKamar}</span></p>
                                        </div>
                                    </div>
                                </Link>
                            </li>

                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
