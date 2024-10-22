import { dbFire } from '@/app/firebase/config';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import KostanDetailClient from './KostanDetailClient';


interface Kostan {
    id: string;
    nama: string;
    Price: number;
    alamat: {
        Jalan: string;
        Desa_Kelurahan: string;
    };
    image: {
        image1: string;
    };
}

// Server-side component that passes initial data to the client-side component
const KostanDetail = async ({ params }: { params: { id: string } }) => {
    const id = params.id;
    let kostan = null;

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
