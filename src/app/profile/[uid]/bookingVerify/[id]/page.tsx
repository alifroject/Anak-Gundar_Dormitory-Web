import React from 'react';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { dbFire } from "@/app/firebase/config";
import VerifyBook from '@/app/profile/[uid]/bookingVerify/[id]/bookingDetailsVerify';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';

interface BookingData {
    id: string;
    nama: string;
    price: number;
    priceOption: string;
    startDate: string;
    status: string;
    tenant: {
        displayName: string;
        jenisKelamin: string;
        kampus: string;
        pekerjaan: string;
        phoneNumber: string;
    };
    uid: string;
}

// Function to generate static paths for SSG
// Updated generateStaticParams to properly handle dynamic paths
export async function generateStaticParams(): Promise<Params[]> {
    const bookingCollectionRef = collection(dbFire, 'booking');
    const snapshot = await getDocs(bookingCollectionRef);
    const params = snapshot.docs.map(doc => ({
        id: doc.id,
    }));
    return params;
}

// Server-side component to fetch booking details
const BookingDetail = async ({ params }: { params: { uid: string; id: string } }) => {
    const { uid, id } = params;

    // If missing params, show a fallback message
    if (!uid || !id) {
        return <div>Invalid parameters. Please check the URL.</div>;
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
            console.error('Booking document not found');
            return <div>Booking not found.</div>;
        }
    } catch (error) {
        console.error('Error fetching document:', error);
        return <div>Error fetching booking details.</div>;
    }

    // Render the booking details
    return booking ? (
        <div>
            <VerifyBook useBooking={booking} />
        </div>
    ) : (
        <div>Booking not found</div>
    );
};


export default BookingDetail;
