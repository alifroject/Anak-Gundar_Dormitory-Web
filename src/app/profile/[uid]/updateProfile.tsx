import { useEffect, useState } from 'react';
import { dbFire, storage } from '@/app/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ProfileType for user data structure
interface ProfileType {
    uid: string;
    displayName: string;
    photoURL: string;
    email: string | null;
    phoneNumber?: string;
    tanggalLahir?: { seconds: number } | null;
    kotaAsal?: string;
    kampus?: string;
    pekerjaan?: string;
    jenisKelamin?: string;
    statusPernikahan?: string;

    pendidikanTerakhir: string;
}

export default function UpdateProfile() {
    const [userData, setUserData] = useState<ProfileType | null>(null);
    const [loading, setLoading] = useState(true);
    const [, setIsLoggedIn] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState<string>('');

    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setIsLoggedIn(true);

                const userDoc = doc(dbFire, 'user', user.uid);
                const userSnapshot = await getDoc(userDoc);

                if (userSnapshot.exists()) {
                    const data = userSnapshot.data() as ProfileType;
                    setUserData({
                        ...data,
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || 'Anonymous',
                        photoURL: data.photoURL || user.photoURL || '',
                    });
                } else {
                    console.error("No such user document!");
                }
            } else {
                setIsLoggedIn(false);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value,
        } as ProfileType));
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // Set preview URL
        }
    };


    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userData) return;
        setIsSaving(true);
        try {
            // If a new file is selected, upload it to Firebase Storage
            if (selectedFile) {
                const storageRef = ref(storage, `profile_pictures/${userData.uid}`);
                await uploadBytes(storageRef, selectedFile);
                const photoURL = await getDownloadURL(storageRef);
                userData.photoURL = photoURL; // Update photoURL in userData
                setPreviewUrl(photoURL); // Update previewUrl to reflect the saved image
            }

            // Save changes to Firestore
            const userDocRef = doc(dbFire, 'user', userData.uid);
            await setDoc(userDocRef, userData, { merge: true });
            setIsSaving(false);
            setModalMessage('Data berhasil diperbarui');
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error saving user data:", error);
            setModalMessage('Gagal memperbarui data, coba lagi nanti');
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false); // Close modal when clicked
    };
    return (
        <>
            isLoggedIn ? (
            <div className="form-container relative">
                {isSaving && (
                    <div className="spinner-overlay absolute inset-0 flex justify-center items-center bg-opacity-50 bg-gray-800 z-50">
                        <div className="spinner-border animate-spin border-t-4 border-blue-500 border-solid rounded-full w-16 h-16"></div>
                    </div>
                )}

                {isModalOpen && (
                    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 z-50">
                        <div className="bg-white rounded-lg shadow-2xl p-8 text-center max-w-sm transform scale-95 transition-all duration-300 ease-out hover:scale-100">
                            <div className="text-green-500 text-6xl mb-6">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <h1 className="text-3xl font-bold text-green-700 mb-4 font-poppins">Completed</h1>
                            <p className="text-green-800 mb-6 text-lg font-inter">{modalMessage}</p>
                            <div className="flex justify-center space-x-6">
                                <button
                                    className="bg-green-600 text-white px-6 py-3 rounded-md text-lg font-semibold shadow-md hover:bg-green-700 transition-colors duration-200 transform hover:scale-105"
                                    onClick={closeModal}
                                >
                                    Ok, Close
                                </button>
                            </div>
                        </div>
                    </div>


                )}

                <div className="bg-gray-100 min-h-screen flex flex-col items-center overflow-x-hidden">
                    <main className="w-full flex-grow py-6">
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
                                    src={previewUrl || userData?.photoURL || "https://placehold.co/100x100"}
                                    alt="Profile picture"
                                    className="rounded-full w-24 h-24 object-cover mr-4"
                                />
                                <input type="file" accept="image/*" onChange={handleFileChange} />
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
                                                value={userData?.statusPernikahan || ""}
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

            </div>
            ) : (null)
        </>
    );
}
