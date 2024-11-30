import Profile from './profileDetails';
import { dbFire } from '@/app/firebase/config';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';


export async function generateStaticParams(): Promise<Params[]> {
    const profilesCollectionRef = collection(dbFire, 'user');
    const snapshot = await getDocs(profilesCollectionRef);

    const params = snapshot.docs.map(doc => ({
        uid: doc.id,
    }));
    return params;
}

interface User {
    uid: string;
    displayName: string;
    photoURL: string;
    tanggalLahir?: { seconds: number };
}

const UserProfile = async ({ params }: { params: { uid: string } }) => {
    const uid = params.uid;

    if (!uid) {
        return <div>User not found</div>;
    }

    let user: User | null = null;

    try {
       
        const userDocRef = doc(dbFire, 'user', uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            user = {
                uid: userDoc.id,
                ...userDoc.data() as Omit<User, 'uid'>,
            };
        } else {
            console.error('User not found');
        }
    } catch (error) {
        console.error('Error fetching document:', error);
    }

    return user ? (
        <div>
            <Profile userProfile={user} />
        </div>
    ) : (
        <div>User not found</div>
    );
};





export default UserProfile;
