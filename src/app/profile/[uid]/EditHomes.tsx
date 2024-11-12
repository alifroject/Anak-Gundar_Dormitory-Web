import { useEffect, useState } from 'react';
import { dbFire } from '@/app/firebase/config';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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
}

interface AdminProfile {
    uid: string;
    email: string | null;
    username?: string | null;
    nama: string;
    role: string;
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
    const [admin, setIsAdmin] = useState(false);
    const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);

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
                setIsAdmin(user.email === 'admin@gmail.com');
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
                    setAdminProfile({ uid: user.uid, email: user.email, username: '', nama: userData.nama, role: userData.role });
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

    return (
        <div className="p-8 min-h-screen flex flex-col">
            <h1 className="text-2xl font-bold text-black mb-6">Edit Homes</h1>

            <div className="mb-4">
                <label htmlFor="region" className="block mb-2 text-gray-700 font-medium">Select Region:</label>
                <select
                    id="region"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                >
                    <option value="" disabled>Select a region</option>
                    {regions.map((region) => (
                        <option key={region} value={region}>
                            {region}
                        </option>
                    ))}
                </select>
            </div>

            <ul className="flex-grow overflow-y-auto">
                {homes.map((home) => (
                    <li key={home.id} className="border-b border-gray-300 py-4 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-black">{home.nama}</h2>
                            <p className="text-gray-600">Address: {home.alamat?.Jalan}, {home.alamat?.kecamatan}, {home.alamat?.kota_kabupaten}</p>
                            <p className="text-gray-600">Owner: {home.ownerName}</p>
                        </div>
                        {userProfile?.uid && (
                            <Link href={`/profile/${userProfile.uid}/edit-homes/${home.id}`}>
                                <button className="text-blue-500 hover:underline">Edit Homes</button>
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
