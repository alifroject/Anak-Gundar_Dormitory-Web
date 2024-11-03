import { dbFire } from '@/app/firebase/config';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import BookingDetails from '@/app/home/[id]/booking/bookingDetails';

export async function generateStaticParams() {
    const profilesCollectionRef = collection(dbFire, 'home');
    const snapshot = await getDocs(profilesCollectionRef);

    return snapshot.docs.map(doc => ({ id: doc.id }));
}

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
    const docRef = doc(dbFire, 'home', params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return <div>Kostan tidak ditemukan</div>;
    }

    const kostan = { id: docSnap.id, ...docSnap.data() } as Kostan;

    return (
        <div>
            <h1>Booking untuk {kostan.nama}</h1>
            
            <BookingDetails kostan={kostan} />
        </div>
    );
};

export default BookingPage;
