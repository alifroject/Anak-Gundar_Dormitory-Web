import React from 'react';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { dbFire } from '@/app/firebase/config';
import AddHomes from '@/app/profile/[uid]/edit-homes/[id]/editHomes';
import { GeoPoint } from 'firebase/firestore';
interface Price {
    perBulan: number;
    perHari: number;
    perMinggu: number;
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
    [key: string]: boolean;
}

interface Images {
    image1: string; // Change from File | null to string
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
    Nomor_Rumah: string;
    Kode_Pos: string;
}

interface Peraturan {
    umum: string;
    tamu: string;
    kebersihan: string;
    pembayaran: string;
    lainnya: string;
    [key: string]: string;
}

interface KostanData {
    id: string;
    
    Price: Price; // Change this to Price type
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

interface HomeData {
    id: string;
    nama: string;
    alamat: {
        Jalan: string;
        kecamatan: string;
        kota_kabupaten: string;
    };
    ownerName: string;
    region: string;
    uid: string;
}

export const generateStaticParams = async () => {
    try {
        const homeCollectionRef = collection(dbFire, 'home');
        const homeSnapshot = await getDocs(homeCollectionRef);

        if (homeSnapshot.empty) {
            console.error("No homes found.");
            return [];
        }

        const params = homeSnapshot.docs.map((doc) => ({
            uid: "MFqxgnvEr0dqIKpxa7RVmSO4GyQ2",
            id: doc.id
        }));

        console.log("Generated Static Params:", params);
        return params;
    } catch (error) {
        console.error("Error in generateStaticParams:", error);
        return [];
    }
};

const HomeDetail = async ({ params }: { params: { uid: string; id: string } }) => {
    const { id } = params;

    if (!id) {
        return <div>Invalid home ID.</div>;
    }

    let home: KostanData | null = null;

    try {
        const docRef = doc(dbFire, 'home', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            home = {
                id: docSnap.id,
                ...(docSnap.data() as Omit<KostanData, 'id'>),
            };
        } else {
            return <div>Home not found.</div>;
        }
    } catch (error) {
        console.error('Error fetching document:', error);
        return <div>Error fetching home details.</div>;
    }

    return (
        <div>
            {home ? (
                <div>
                    <AddHomes useHome={home} />
                    
                </div>
            ) : (
                <div>Home not found</div>
            )}
        </div>
    );
};

export default HomeDetail;
