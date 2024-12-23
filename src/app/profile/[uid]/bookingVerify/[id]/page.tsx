import React from 'react';
import { doc, getDoc, getDocs, collection} from 'firebase/firestore';
import { dbFire } from '@/app/firebase/config';
import VerifyBook from '@/app/profile/[uid]/bookingVerify/[id]/bookingDetailsVerify';

interface Tenant {
    displayName: string;
    jenisKelamin: string;
    kampus: string;
    pekerjaan: string;
    phoneNumber: string;
    statusNikah: string;
    tanggalLahir: Date

}

interface Document {
    name: string;
    url: string;
}

interface BookingData {
    id: string;
    nama: string;
    price: number;
    priceOption: string;
    startDate: string;
    status: string;
    tenant: Tenant;
    uid: string;
    documents: Document[];
}

export const generateStaticParams = async () => {
    try {
        const adminUID = "hlQWcXT1ITSjqHvVXhgr5iljMBI3";
        const bookingCollectionRef = collection(dbFire, 'booking');
        const bookingSnapshot = await getDocs(bookingCollectionRef);

        if (bookingSnapshot.empty) {
            console.error("No bookings found.");
            return [];
        }

        // Generate params with admin UID for all booking IDs
        const params = bookingSnapshot.docs.map((doc) => {
            const uid = adminUID; // Use admin UID
            const id = doc.id;    // Document ID as booking ID
            return { uid, id };
        });

        // Debug log for each generated parameter
        console.log("Generated Static Params:", params);

        // Ensure params are generated correctly and return
        return params;
    } catch (error) {
        console.error("Error in generateStaticParams:", error);
        return [];
    }
};




const BookingDetail = async ({ params }: { params: { uid: string; id: string } }) => {
    const { id, uid } = params;  // Fetch both uid and id from params

    if (!id || !uid) {
        return <div>Invalid booking ID or UID.</div>;
    }

    let booking: BookingData | null = null;

    try {
        const docRef = doc(dbFire, 'booking', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            booking = {
                id: docSnap.id,
                ...(docSnap.data() as Omit<BookingData, 'id'>),
            };
        } else {
            return <div>Booking not found.</div>;
        }
    } catch (error) {
        console.error('Error fetching document:', error);
        return <div>Error fetching booking details.</div>;
    }

    return (
        <div>
            {booking ? (
                <div className='h-[100%]'>
                    <VerifyBook useBooking={booking} />
                </div>
            ) : (
                <div>Booking not found</div>
            )}
        </div>
    );
};

export default BookingDetail;