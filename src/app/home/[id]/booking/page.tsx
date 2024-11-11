import { dbFire } from '@/app/firebase/config';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import BookingDetails from '@/app/home/[id]/booking/bookingDetails';
import { Suspense } from 'react';
interface Price {
    perBulan: number;
    perHari: number;
    perMinggu: number;
}

interface Kostan {
    id: string;
    Price: Price;
    nama: string;
    alamat: {
        kota_kabupaten: string;
        kecamatan: string;
        Desa_Kelurahan: string;
        Nomor_Rumah: string;
    };
}

const BookingPage = async ({ params }: { params: { id: string } }) => {
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

    if (kostan) {
        return (
            <Suspense fallback={<div>Loading...</div>}>
            {/* Place your dynamic content inside Suspense */}
            {kostan ? (
              <BookingDetails kostann={kostan} />
            ) : (
              <p>Kostan not found.</p>
            )}
          </Suspense>
        );
    }

    return (
        <div>
            <p>Kostan not found.</p>
        </div>
    );
};

export const generateStaticParams = async () => {
    const kostanCollectionRef = collection(dbFire, 'home');
    const snapshot = await getDocs(kostanCollectionRef);

    // Generate static params for each document in the 'home' collection
    return snapshot.docs.map((doc) => ({
        id: doc.id,
    }));
};

export default BookingPage;
