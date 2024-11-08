"use client";
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { auth, dbFire } from "@/app/firebase/config";
import { collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { GeoPoint } from 'firebase/firestore';

interface Document {
    name: string;
    preview: string;
}

interface Tenant {
    displayName: string;
    jenisKelamin: string;
    kampus: string;
    pekerjaan: string;
    phoneNumber: string;
}

interface RentalData {
    id: string;
    documents: Document[];
    kostanId: string;
    priceOption: string;
    startDate: string;
    tenant: Tenant;
    price: number;
    nama: string;
    uid: string;
}

interface adminProfile {
    uid: string;
    email: string | null;
    username?: string | null;
    nama: string;
    role: string;
}

interface Fal {
    AC: boolean;
    kasur: boolean;
    kipas: boolean;
    kursi: boolean;
    lemari: boolean;
    meja: boolean;
    ventilasi: boolean;
    kamar_mandi_dalam: boolean;
    kamar_mandi_luar: boolean;
    areaLoundryJemur: boolean;
    Free_Electricity: boolean;
    dapur: boolean;
    parkirMotor: boolean;
    parkirMobil: boolean;
}

interface Images {
    image1: string | null;
    image2: string | null;
    image3: string | null;
    image4: string | null;
}

interface Alamat {
    provinsi: string;
    kota_kabupaten: string;
    kecamatan: string;
    Desa_Kelurahan: string;
    Jalan: string;
    Nomor_Rumah: string;
    Kode_Pos: string;
}

interface Peraturan {
    umum: string;
    tamu: string;
    kebersihan: string;
    pembayaran: string;
    lainnya: string;
}

interface Price {
    perBulan: number;
    perHari: number;
    perMinggu: number;
}

interface KostanData {
    id: string;
    Price: Price;
    fal: Fal;
    images: Images;
    jenis: string;
    nama: string;
    region: string;
    sisaKamar: number;
    ukuranKamar: string;
    type: string;
    alamat: Alamat;
    peraturan: Peraturan;
    ownerName: string;
    ownerPhoneNumber: string;
    geolokasi: GeoPoint;
}

interface bookingData {
    id: string;
    nama: string;
    price: number;
    priceOption: string;
    startDate: string;
    status: string;
    tenant: Tenant;
    uid: string;
}




const BookingDetails = ({ useBooking }: { useBooking: bookingData }) => {
    const [bookingg] = useState<bookingData | null>(useBooking)
   

    return (
        <div>
            <h3>{useBooking.nama}</h3>
            <p>Price: {useBooking.price}</p>
            <p>Status: {useBooking.status}</p>
            <p>Start Date: {useBooking.startDate}</p>
            <p>Tenant: {useBooking.tenant.displayName}</p>
            {/* Add other details about the booking here */}
        </div>
    );
}

export default BookingDetails;