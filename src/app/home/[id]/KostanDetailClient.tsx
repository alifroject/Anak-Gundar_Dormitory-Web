"use client"; // This component runs on the client

import { useState } from 'react';

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

const KostanDetailClient = ({ initialData }: { initialData: Kostan | null }) => {
    const [kostan] = useState<Kostan | null>(initialData); // No need for setKostan since it's not being updated
    const [loading] = useState(false); // No need for setLoading

    if (loading) return <div>Loading...</div>; // Optional if you plan to use a loading state later
    if (!kostan) return <div>Kostan tidak ditemukan</div>;

    return (
        <div>
            <h1>{kostan.nama}</h1>
            <p>Harga: {kostan.Price}</p>
            <p>Alamat: {kostan.alamat.Jalan}, {kostan.alamat.Desa_Kelurahan}</p>
            <img src={kostan.image.image1} alt={kostan.nama} />
        </div>
    );
};

export default KostanDetailClient;
