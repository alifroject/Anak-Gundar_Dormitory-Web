import { useEffect, useState } from 'react';
import { dbFire } from '@/app/firebase/config';
import { collection, getDocs, query, where, doc, getDoc, deleteDoc } from 'firebase/firestore';
import Link from 'next/link';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FaEdit } from 'react-icons/fa';

interface images {
    image1: string | null;
    image2: string | null;
    image3: string | null;
    image4: string | null;
}
interface Price {
    perBulan: number;
    perHari: number;
    perMinggu: number;
}
interface Home {
    id: string;
    nama: string;
    alamat: {
        Jalan: string;
        kecamatan: string;
        kota_kabupaten: string;
    };
    ownerName: string;
    region: string;
    images: images;
    Price: Price;
    jenis: string;
}


interface UserProfile {
    uid: string;
    email: string | null;
    displayName?: string | null;
    nama: string;
    role: string;
}

export default function EditHomes() {
    const [regions, setRegions] = useState<string[]>([]);
    const [selectedRegion, setSelectedRegion] = useState<string>('');
    const [homes, setHomes] = useState<Home[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  

    // Fetch unique regions from Firestore
    useEffect(() => {
        const fetchRegions = async () => {
            const regionSet = new Set<string>();
            const querySnapshot = await getDocs(collection(dbFire, 'home'));

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.region) {
                    regionSet.add(data.region);
                }
            });

            setRegions(Array.from(regionSet));
        };

        fetchRegions();
    }, []);

    // Handle user authentication and profile data fetching
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = doc(dbFire, 'user', user.uid);
                const userSnapshot = await getDoc(userDoc);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data() as UserProfile;
                    setUserProfile({
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || 'Anonymous',
                        nama: userData.nama,
                        role: userData.role,
                    });
                }
            }
        });
        return () => unsubscribe();
    }, []);

    // Fetch homes based on selected region
    useEffect(() => {
        const fetchHomesByRegion = async () => {
            if (selectedRegion) {
                const q = query(collection(dbFire, 'home'), where('region', '==', selectedRegion));
                const querySnapshot = await getDocs(q);
                const homesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Home[];
                setHomes(homesData);
            } else {
                setHomes([]);
            }
        };

        fetchHomesByRegion();
    }, [selectedRegion]);

    // Handle delete home
    const handleDeleteHome = async (id: string) => {
        const confirm = window.confirm("Apakah Anda yakin ingin menghapus rumah ini?");
        if (confirm) {
            try {
                await deleteDoc(doc(dbFire, 'home', id));
                setHomes((prevHomes) => prevHomes.filter((home) => home.id !== id));
                alert("Rumah berhasil dihapus.");
            } catch (error) {
                console.error("Gagal menghapus rumah:", error);
                alert("Terjadi kesalahan saat menghapus rumah.");
            }
        }
    };

    return (
        <div className="p-6 md:p-10 min-h-screen flex flex-col 
             bg-gradient-to-b from-blue-300 to-purple-100 
             shadow-md border-t-10 border-blue-600 rounded-lg z-10">
            <h1
                className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 mb-6 text-center drop-shadow-lg">
                Edit Homes
            </h1>



            <div className="mb-4 border-4 border-gray-900 rounded-lg p-4 flex items-center justify-center space-x-4">
                <FaEdit className="text-gray-700 text-2xl" />
                <select
                    id="region"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="border border-gray-300 text-white rounded-lg px-3 py-2 text-sm md:text-base w-full md:w-[200px] focus:ring focus:ring-blue-500 bg-gradient-to-r from-gray-700 to-gray-900"
                    aria-label="Pilih region"
                >
                    <option value="" disabled>
                        Pilih region
                    </option>
                    {regions.map((region) => (
                        <option key={region} value={region} className='text-black'>
                            {region}
                        </option>
                    ))}
                </select>
            </div>



            <ul className="flex-grow overflow-y-auto">
                {homes.map((home) => (
                    <li
                        key={home.id}
                        className="border-2 border-blue-500 hover:border-blue-700 shadow-lg rounded-lg py-4 px-4 md:px-6 flex flex-col md:flex-row items-start md:items-center mb-4 transition-colors duration-300"
                    >
                       
                        {home.images.image1 && (
                            <img
                                src={home.images.image1}
                                alt="Room Image 1"
                                className="rounded-lg w-full h-[150px] md:w-[200px] md:h-[100px] object-cover mb-4 md:mb-0 md:ml-10"
                            />
                        )}

                       
                        <div className="flex flex-col w-full md:ml-10">
                            <h2 className="text-base md:text-xl font-semibold text-black">{home.nama} <span className='text-blue-800 ml-4'>{home.jenis}</span></h2>
                            <p className="text-sm md:text-base text-gray-600">
                                Address: {home.alamat?.Jalan}, {home.alamat?.kecamatan}, {home.alamat?.kota_kabupaten}
                            </p>
                            <p className="text-gray-600 text-sm">Owner: {home.ownerName}</p>
                            <span className="text-green-600 text-lg md:text-xl font-bold">
                                Rp {parseFloat(home.Price.perBulan.toString()).toLocaleString('id-ID')} <span className="text-red-900">perbulan</span>
                            </span>
                        </div>

                      
                        <div className="flex flex-col items-start md:items-center gap-2 mt-4 md:mt-0 md:mr-20">
                            <Link href={`/profile/${userProfile?.uid}/edit-homes/${home.id}`}>
                                <button className="text-blue-500 hover:underline text-sm md:text-base">Edit Homes</button>
                            </Link>
                            <button
                                onClick={() => handleDeleteHome(home.id)}
                                className="text-red-500 mt-2 hover:underline text-sm md:text-base"
                                aria-label="Hapus Rumah"
                            >
                                <FontAwesomeIcon icon={faTrash} className="text-base md:text-xl" />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>

    );
}
