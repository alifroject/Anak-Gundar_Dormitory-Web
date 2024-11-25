import React from 'react';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { dbFire } from '@/app/firebase/config';
import AddHomes from '@/app/profile/[uid]/edit-homes/[id]/editHomes';
import { KostanData } from '@/app/profile/[uid]/edit-homes/[id]/editHomes';


export const generateStaticParams = async () => {
    try {
        const homeCollectionRef = collection(dbFire, 'home');
        const homeSnapshot = await getDocs(homeCollectionRef);

        if (homeSnapshot.empty) {
            console.error("No homes found.");
            return [];
        }

        const params = homeSnapshot.docs.map((doc) => ({
            uid: "hlQWcXT1ITSjqHvVXhgr5iljMBI3",
            id: doc.id
        }));

        console.log("Generated Static Params:", params);
        return params;
    } catch (error) {
        console.error("Error in generateStaticParams:", error);
        return [];
    }
};

function isKostanData(data: unknown): data is KostanData {
    return (
        typeof data === 'object' && data !== null &&
        'Price' in data && 'fal' in data && 'images' in data
    );
}

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
            const data = docSnap.data();
            if (isKostanData(data)) {
                // Directly assign 'id' from docSnap.id and merge with data
                home = { ...data, id: docSnap.id };
            } else {
                return <div>Home data is incomplete.</div>;
            }
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
