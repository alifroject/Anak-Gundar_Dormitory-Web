import React from 'react';
import { doc, getDoc, getDocs, collection} from 'firebase/firestore';
import { dbFire } from '@/app/firebase/config';
import VerifyBook from '@/app/profile/[uid]/bookingVerify/[id]/bookingDetailsVerify';

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
export const generateStaticParams = async () => {
    try {
        const adminUID = "MFqxgnvEr0dqIKpxa7RVmSO4GyQ2";
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

        return params; // Return array of parameters
    } catch (error) {
        console.error("Error in generateStaticParams:", error);
        return [];
    }
};



const BookingDetail = async ({ params }: { params: { uid: string; id: string } }) => {
    const { id } = params;  // Fetch the booking ID from the params

    if (!id) {
        return <div>Invalid booking ID.</div>;
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

    // Now we can pass the booking data to the verification component
    return (
        <div>
            {booking ? (
                <div>
                    <VerifyBook useBooking={booking} />
                    <div>
                        <strong>User UID:</strong> {booking.uid} {/* User's UID from the booking */}
                    </div>
                </div>
            ) : (
                <div>Booking not found</div>
            )}
        </div>
    );
};

export default BookingDetail;
