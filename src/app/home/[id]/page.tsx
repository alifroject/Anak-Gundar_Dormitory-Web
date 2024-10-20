// app/home/[id]/page.tsx

import { dbFire } from '@/app/firebase/config';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

// Define the interface for the Kostan data structure
interface Kostan {
    id: string;
    nama: string;
    Price: number; // Changed to number for consistency
    alamat: {
        Jalan: string;
        Desa_Kelurahan: string;
    };
    image: {
        image1: string;
    };
}

// Fetch and display the specific kostan details using the document ID
const KostanDetail = async ({ params }: { params: { id: string } }) => {
    console.log('Rendering KostanDetail for ID:', params.id); // Log the rendering ID

    try {
        const docRef = doc(dbFire, 'home', params.id);
        const docSnap = await getDoc(docRef);
        
        console.log('Document snapshot:', docSnap); // Log snapshot for debugging

        if (!docSnap.exists()) {
            console.log('Document does not exist:', params.id);
            return <div>Kostan tidak ditemukan</div>;
        }

        const kostan: Kostan = {
            id: docSnap.id,
            ...(docSnap.data() as Omit<Kostan, 'id'>), // Ensure data matches the interface
        };

        return (
            <div>
                <h1>{kostan.nama}</h1>
                <img src={kostan.image.image1} alt={kostan.nama} />
                <p>Harga: {kostan.Price}</p>
                <p>Alamat: {kostan.alamat.Jalan}, {kostan.alamat.Desa_Kelurahan}</p>
            </div>
        );
    } catch (error) {
        console.error('Error fetching document:', error);
        return <div>Terjadi kesalahan saat memuat kostan.</div>;
    }
};

// Generate static parameters for each document in the "home" collection
// Generate static parameters for each document in the "home" collection
export async function generateStaticParams() {
    try {
        const snapshot = await getDocs(collection(dbFire, 'home'));
        if (snapshot.empty) {
            console.log('No documents found in the "home" collection');
            return [];
        }

        const paramsArray = snapshot.docs.map(doc => ({ params: { id: doc.id } }));
        console.log('Generated static params:', paramsArray); // Log the generated params
        return paramsArray;
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}


export default KostanDetail;
