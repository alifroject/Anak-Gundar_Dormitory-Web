"use client";
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { dbFire } from '@/app/firebase/config';


interface Fal {
    contoh: boolean,
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
    Free_Electricity: boolean
    dapur: boolean
    parkirMobil: boolean;
    parkirMotor: boolean;
}

interface Images {
    image1: string;
    image2: string;
    image3: string;
    image4: string;
}

interface Alamat {
    provinsi: string;
    kota_kabupaten: string;
    kecamatan: string;
    Desa_Kelurahan: string;
    Jalan: string;
    Nomor_Rumah: string
    Kode_Pos: string;
}
interface Peraturan {
    umum: string;
    tamu: string;
    kebersihan: string;
    pembayaran: string;
    lainnya: string;

}

interface KostanData {
    id: string;
    Price: number;
    fal: Fal;
    image: Images;
    jenis: string;
    nama: string;
    region: string;
    sisaKamar: number;
    ukuranKamar: string;
    type: string;
    alamat: Alamat;
    peraturan: Peraturan;
}

export default function KostanPage() {
    const [kostanData, setKostanData] = useState<KostanData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchKostanData = async () => {
            setLoading(true);
            setError(null);

            try {
                const querySnapshot = await getDocs(collection(dbFire, 'home'));
                const data = querySnapshot.docs.map(doc => {
                    const {Price, jenis, nama, region, sisaKamar, ukuranKamar, type, fal, image, alamat, peraturan } = doc.data();

                    return {
                        id: doc.id,
                        Price: Price ?? 0,
                        fal: {
                            contoh: fal?.contoh ?? false,
                            AC: fal?.AC ?? false,
                            kasur: fal?.kasur ?? false,
                            kipas: fal?.kipas ?? false,
                            kursi: fal?.kursi ?? false,
                            lemari: fal?.lemari ?? false,
                            meja: fal?.meja ?? false,
                            ventilasi: fal?.ventilasi ?? false,
                            kamar_mandi_dalam: fal?.kamar_mandi_dalam ?? false,
                            kamar_mandi_luar: fal?.kamar_mandi_luar ?? false,
                            areaLoundryJemur: fal?.areaLoundryJemur ?? false,
                            Free_Electricity: fal?.Free_Electricity ?? false,
                            dapur: fal?.dapur ?? false,
                            parkirMobil: fal?.parkirMobil ?? false,
                            parkirMotor: fal?.parkirMotor ?? false,
                        },
                        image: {
                            image1: image?.image1 || "", // pastikan ini adalah URL valid
                            image2: image?.image2 || "",
                            image3: image?.image3 || "",
                            image4: image?.image4 || "",
                        },
                        jenis: jenis || "Not Specified",
                        nama: nama || "Unnamed Kostan",
                        region: region || "Not Specified",
                        sisaKamar: sisaKamar ?? 0,
                        ukuranKamar: ukuranKamar || "Not Specified",
                        type: type || "Not Specified",
                        alamat: {
                            provinsi: alamat?.provinsi ?? "",
                            kota_kabupaten: alamat?.kota_kabupaten ?? "",
                            kecamatan: alamat?.kecamatan ?? "",
                            Desa_Kelurahan: alamat?.Desa_Kelurahan ?? "",
                            Jalan: alamat?.Jalan ?? "",
                            Nomor_Rumah: alamat?.Nomor_Rumah ?? "",
                            Kode_Pos: alamat?.Kode_Pos ?? ""

                        },
                        peraturan: {
                            umum: peraturan?.umum ?? "",
                            tamu: peraturan?.tamu ?? "",
                            kebersihan: peraturan?.kebersihan ?? "",
                            pembayaran: peraturan?.pembayaran ?? "",
                            lainnya: peraturan?.lainnya ?? "",
                        }

                    } as KostanData;
                });

                if (data.length > 0) {
                    setKostanData(data);
                } else {
                    setError('No Kostan data available.');
                }
            } catch (error) {
                console.error('Error fetching kostan data:', error);
                setError('Failed to fetch Kostan data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchKostanData();
    }, []);

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-red-500 text-center">{error}</div>;
    if (kostanData.length === 0) return <div>No data found</div>;

    return (
        <div className="text-black">
            {kostanData.map(kostan => (
                <div key={kostan.id} className="border p-4 mb-4 rounded-lg shadow-lg">
                    <h1 className="text-xl font-bold">{kostan.nama}</h1>
                    <p>Jenis: {kostan.jenis}</p>
                    <p>Region: {kostan.region}</p>
                    <p>Ukuran Kamar: {kostan.ukuranKamar}</p>
                    <p>Sisa Kamar: {kostan.sisaKamar}</p>
                    <p>Harga: Rp {kostan.Price.toLocaleString()}</p>
                    <p>Tipe: {kostan.type}</p>


                    <ul>
                        {Object.entries(kostan.fal).map(([key, value]) => (
                            <li key={key}>
                                {key.replace(/-/g, ' ').replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')}: {value ? 'Yes' : 'No'}
                            </li>
                        ))}
                    </ul>
                    <h2 className='text-xl font-bold'>Alamat</h2>
                    <ul>
                        {Object.entries(kostan.alamat).map(([key, value]) => (
                            <li key={key}>
                                {key} = {value}
                            </li>
                        ))}
                    </ul>

                    <h2 className='text-xl font-bold'>Peraturan</h2>
                    <ul>
                        {Object.entries(kostan.peraturan).map(([key, value]) => (
                            <li key={key}>
                                {key} = {value}
                            </li>
                        ))}
                    </ul>
                    <h2 className='font-bold'>Images</h2>
                    <div className="grid grid-cols-2 gap-2">
                        {kostan.image.image1 && (
                            <img
                                src={kostan.image.image1}
                                alt={`Image 1 of ${kostan.nama}`}
                                className="w-full h-auto mb-2"
                            />
                        )}
                        {kostan.image.image2 && (
                            <img
                                src="https://firebasestorage.googleapis.com/v0/b/anak-gundar.appspot.com/o/anakGundar.png?alt=media"
                                alt={`Image 2 of ${kostan.nama}`}
                                className="w-full h-auto mb-2"
                            />
                        )}
                        {kostan.image.image3 && (
                            <img
                                src={kostan.image.image3}
                                alt={`Image 3 of ${kostan.nama}`}
                                className="w-full h-auto mb-2"
                            />
                        )}
                        {kostan.image.image4 && (
                            <img
                                src={kostan.image.image4}
                                alt={`Image 4 of ${kostan.nama}`}
                                className="w-full h-auto mb-2"
                            />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
