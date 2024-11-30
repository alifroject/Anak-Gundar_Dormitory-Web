

import { dbFire } from '@/app/firebase/config';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import KostanDetailClient from './KostanDetailClient';
import { GeoPoint } from 'firebase/firestore';
interface Price {
    perBulan: number;
    perHari: number;
    perMinggu: number;
}
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

interface Kostan {
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
    ownerName: string;
    ownerPhoneNumber: string;
    peraturan: Peraturan;
    geolokasi: GeoPoint; 
}


const KostanDetail = async ({ params }: { params: { id: string } }) => {
    const id = params.id;
    let kostan: Kostan | null = null;

    try {
        const docRef = doc(dbFire, 'home', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            kostan = {
                id: docSnap.id,
                
                ...(docSnap.data() as Omit<Kostan, 'id'>), 
                
            };
        } else {
            console.error('Kostan tidak ditemukan');
        }
    } catch (error) {
        console.error('Error fetching document:', error);
    }

    return <KostanDetailClient initialData={kostan} />;
};


export async function generateStaticParams() {
    const kostanCollectionRef = collection(dbFire, 'home');
    const snapshot = await getDocs(kostanCollectionRef);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
    }));
}

export default KostanDetail;