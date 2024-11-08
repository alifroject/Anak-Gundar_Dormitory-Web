import { useEffect, useState } from 'react';
import { dbFire } from '@/app/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// ProfileType untuk struktur data pengguna
interface ProfileType {
    uid: string;
    displayName: string;
    photoURL: string;
    email?: string;
    phoneNumber?: string;
    tanggalLahir?: { seconds: number };
    kotaAsal?: string;
    kampus?: string;
    pekerjaan?: string;
    jenisKelamin?: string; // Tambahkan jenisKelamin
    statusNikah?: string; // Tambahkan statusNikah
    pendidikanTerakhir: string
}


export default function UpdateProfile() {
    const [userData, setUserData] = useState<ProfileType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            const uid = user.uid;

            const fetchUserData = async () => {
                try {
                    const userDocRef = doc(dbFire, 'user', uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        setUserData({
                            uid: userDoc.id,
                            ...userDoc.data() as Omit<ProfileType, 'uid'>,
                        });
                    } else {
                        console.error("User not found");
                    }
                } catch (error) {
                    console.error("Error fetching user data from Firestore:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchUserData();
        } else {
            console.error("User is not authenticated");
            setLoading(false);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData((prevData) => {
            if (!prevData) return null;
            return {
                ...prevData,
                [name]: value,
            } as ProfileType;
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userData) return;

        try {
            const userDocRef = doc(dbFire, 'user', userData.uid);
            await setDoc(userDocRef, userData, { merge: true });
            alert("Data berhasil diperbarui");
        } catch (error) {
            console.error("Error saving user data:", error);
            alert("Gagal memperbarui data, coba lagi nanti");
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col items-center">
            <main className="container mx-auto flex-grow py-6">
                <div className="bg-white shadow w-full  rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4 text-blue-700">Informasi Pribadi</h2>
                    <div className="bg-green-100 p-4 rounded mb-4">
                        <p className="text-sm text-gray-700 flex items-center">
                            <i className="fas fa-info-circle mr-2"></i>
                            Pemilik kos lebih menyukai calon penyewa dengan profil yang jelas dan lengkap.
                        </p>
                    </div>
                    <div className="flex items-center mb-6">
                        <img
                            src={userData?.photoURL || "https://placehold.co/100x100"}
                            alt="Profile picture"
                            className="rounded-full w-24 h-24 object-cover mr-4"
                        />
                        <button className="bg-blue-500 text-white px-4 py-2 rounded">Ubah Foto</button>
                    </div>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <form className="space-y-4" onSubmit={handleSave}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-500">
                                <div>
                                    <label className="block text-red-700">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={userData?.displayName || ""}
                                        onChange={handleChange}
                                        className="border rounded w-full px-4 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-green-700">Jenis Kelamin</label>
                                    <select
                                        name="jenisKelamin"
                                        value={userData?.jenisKelamin || ""}
                                        onChange={handleChange}
                                        className="border rounded w-full px-4 py-2"
                                    >
                                        <option value="">Pilih Jenis Kelamin</option>
                                        <option value="Laki-laki">Laki-laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-green-700">Status Nikah</label>
                                    <select
                                        name="statusNikah"
                                        value={userData?.statusNikah || ""}
                                        onChange={handleChange}
                                        className="border rounded w-full px-4 py-2"
                                    >
                                        <option>Menikah</option>
                                        <option>Belum Menikah</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-purple-700">Tanggal Lahir</label>
                                    <input
                                        type="date"
                                        name="tanggalLahir"
                                        value={
                                            userData?.tanggalLahir
                                                ? new Date(userData.tanggalLahir.seconds * 1000).toISOString().split('T')[0]
                                                : ""
                                        }
                                        onChange={(e) => {
                                            const { value } = e.target;
                                            setUserData((prevData) => ({
                                                ...(prevData as ProfileType),
                                                tanggalLahir: { seconds: Math.floor(new Date(value).getTime() / 1000) },
                                            }));
                                        }}
                                        className="border rounded w-full px-4 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-blue-700">Pekerjaan</label>
                                    <input
                                        type="text"
                                        name="pekerjaan"
                                        value={userData?.pekerjaan || ""}
                                        onChange={handleChange}
                                        className="border rounded w-full px-4 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-teal-700">Pendidikan Terakhir</label>
                                    <select
                                        name="pendidikanTerakhir"
                                        value={userData?.pendidikanTerakhir || ""}
                                        onChange={handleChange}
                                        className="border rounded w-full px-4 py-2"
                                    >
                                        <option value="">Pilih Pendidikan Terakhir</option>
                                        <option value="SD">SD</option>
                                        <option value="SMP">SMP</option>
                                        <option value="SMA">SMA</option>
                                        <option value="D3">Diploma (D3)</option>
                                        <option value="S1">Sarjana (S1)</option>
                                        <option value="S2">Magister (S2)</option>
                                        <option value="S3">Doktor (S3)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-indigo-700">Nama Kampus/Sekolah</label>
                                    <input
                                        type="text"
                                        name="kampus"
                                        value={userData?.kampus || ""}
                                        onChange={handleChange}
                                        className="border rounded w-full px-4 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-orange-700">Kota Asal</label>
                                    <input
                                        type="text"
                                        name="kotaAsal"
                                        value={userData?.kotaAsal || ""}
                                        onChange={handleChange}
                                        className="border rounded w-full px-4 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Nomor Kontak Darurat</label>
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={userData?.phoneNumber || ""}
                                        onChange={handleChange}
                                        className="border rounded w-full px-4 py-2"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button type="button" className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Batal</button>
                                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Simpan</button>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}
