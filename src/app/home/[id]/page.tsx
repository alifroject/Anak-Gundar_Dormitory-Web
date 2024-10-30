// Your existing imports
import { dbFire } from '@/app/firebase/config';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import KostanDetailClient from './KostanDetailClient';
import { GeoPoint } from 'firebase/firestore';

// Update the Kostan interface to include geolokasi
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

interface Kostan {
    id: string;
    Price: number;
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
    geolokasi: GeoPoint; // Add the geolokasi property
}

// Server-side component that passes initial data to the client-side component
const KostanDetail = async ({ params }: { params: { id: string } }) => {
    const id = params.id;
    let kostan: Kostan | null = null;

    try {
        const docRef = doc(dbFire, 'home', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            kostan = {
                id: docSnap.id,
                ...(docSnap.data() as Omit<Kostan, 'id'>), // Ensure 'geolokasi' is included in the data
            };
        } else {
            console.error('Kostan tidak ditemukan');
        }
    } catch (error) {
        console.error('Error fetching document:', error);
    }

    return <KostanDetailClient initialData={kostan} />;
};

// Export this function to pre-generate static paths
export async function generateStaticParams() {
    const kostanCollectionRef = collection(dbFire, 'home');
    const snapshot = await getDocs(kostanCollectionRef);

    // Generate static params for each document in the 'home' collection
    return snapshot.docs.map((doc) => ({
        id: doc.id,
    }));
}

export default KostanDetail;
