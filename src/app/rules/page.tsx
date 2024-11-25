"use client"

import { useState } from "react";

export default function Rules() {
    const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});

    const toggleSection = (key: string) => {
        setOpenSections((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Aturan Kos</h1>
            <div className="bg-white shadow-md rounded-lg p-6">
                <div>
                    <div
                        className="cursor-pointer flex justify-between items-center bg-blue-100 p-4 rounded-md mb-4"
                        onClick={() => toggleSection("security")}
                    >
                        <h2 className="text-xl font-semibold text-blue-700">1. Keamanan Akun</h2>
                        <span className="text-blue-500">{openSections["security"] ? "▼" : "▶"}</span>
                    </div>
                    {openSections["security"] && (
                        <ul className="pl-6 list-disc text-gray-700">
                            <li>1a. Jangan membagikan kata sandi kepada siapapun.</li>
                            <li>1b. Aktifkan autentikasi dua faktor untuk akun Anda.</li>
                            <li>1c. Jika mencurigai akses tidak sah, segera ubah kata sandi.</li>
                        </ul>
                    )}
                </div>
                <div>
                    <div
                        className="cursor-pointer flex justify-between items-center bg-blue-100 p-4 rounded-md mb-4"
                        onClick={() => toggleSection("tenant")}
                    >
                        <h2 className="text-xl font-semibold text-blue-700">2. Hak dan Kewajiban Pencari Kos</h2>
                        <span className="text-blue-500">{openSections["tenant"] ? "▼" : "▶"}</span>
                    </div>
                    {openSections["tenant"] && (
                        <ul className="pl-6 list-disc text-gray-700">
                            <li>2a. Melengkapi profil dengan informasi yang benar.</li>
                            <li>2b. Menjaga komunikasi sopan dengan pemilik kos.</li>
                            <li>2c. Membaca deskripsi kos dengan teliti sebelum melakukan reservasi.</li>
                        </ul>
                    )}
                </div>
                <div>
                    <div
                        className="cursor-pointer flex justify-between items-center bg-blue-100 p-4 rounded-md mb-4"
                        onClick={() => toggleSection("owner")}
                    >
                        <h2 className="text-xl font-semibold text-blue-700">3. Hak dan Kewajiban Pemilik Kos</h2>
                        <span className="text-blue-500">{openSections["owner"] ? "▼" : "▶"}</span>
                    </div>
                    {openSections["owner"] && (
                        <ul className="pl-6 list-disc text-gray-700">
                            <li>3a. Menyediakan informasi yang akurat mengenai fasilitas kos.</li>
                            <li>3b. Tidak membedakan pencari kos berdasarkan suku, agama, ras, atau gender.</li>
                            <li>3c. Bertanggung jawab atas kenyamanan dan keamanan penghuni.</li>
                        </ul>
                    )}
                </div>
                <div>
                    <div
                        className="cursor-pointer flex justify-between items-center bg-blue-100 p-4 rounded-md mb-4"
                        onClick={() => toggleSection("payments")}
                    >
                        <h2 className="text-xl font-semibold text-blue-700">4. Aturan Pembayaran</h2>
                        <span className="text-blue-500">{openSections["payments"] ? "▼" : "▶"}</span>
                    </div>
                    {openSections["payments"] && (
                        <ul className="pl-6 list-disc text-gray-700">
                            <li>4a. Pembayaran dilakukan melalui metode resmi yang disediakan.</li>
                            <li>4b. Semua pembayaran harus dilakukan sebelum tanggal jatuh tempo.</li>
                            <li>4c. Simpan bukti pembayaran untuk keperluan verifikasi.</li>
                        </ul>
                    )}
                </div>
                <div>
                    <div
                        className="cursor-pointer flex justify-between items-center bg-blue-100 p-4 rounded-md mb-4"
                        onClick={() => toggleSection("penalties")}
                    >
                        <h2 className="text-xl font-semibold text-blue-700">5. Sanksi dan Pelanggaran</h2>
                        <span className="text-blue-500">{openSections["penalties"] ? "▼" : "▶"}</span>
                    </div>
                    {openSections["penalties"] && (
                        <ul className="pl-6 list-disc text-gray-700">
                            <li>5a. Pelanggaran aturan kos dapat dikenai denda atau pengusiran.</li>
                            <li>5b. Pelaporan pelanggaran akan ditinjau oleh pihak pengelola.</li>
                            <li>5c. Penghuni bertanggung jawab atas kerusakan yang disebabkan secara langsung.</li>
                        </ul>
                    )}
                </div>

                {/* Aturan tambahan */}
                <div>
                    <div
                        className="cursor-pointer flex justify-between items-center bg-blue-100 p-4 rounded-md mb-4"
                        onClick={() => toggleSection("environment")}
                    >
                        <h2 className="text-xl font-semibold text-blue-700">6. Kebersihan dan Lingkungan</h2>
                        <span className="text-blue-500">{openSections["environment"] ? "▼" : "▶"}</span>
                    </div>
                    {openSections["environment"] && (
                        <ul className="pl-6 list-disc text-gray-700">
                            <li>6a. Penghuni wajib menjaga kebersihan kamar dan area bersama.</li>
                            <li>6b. Sampah harus dibuang pada tempat yang telah disediakan.</li>
                            <li>6c. Dilarang merusak fasilitas seperti taman atau tempat parkir.</li>
                        </ul>
                    )}
                </div>
                <div>
                    <div
                        className="cursor-pointer flex justify-between items-center bg-blue-100 p-4 rounded-md mb-4"
                        onClick={() => toggleSection("visitors")}
                    >
                        <h2 className="text-xl font-semibold text-blue-700">7. Kunjungan Tamu</h2>
                        <span className="text-blue-500">{openSections["visitors"] ? "▼" : "▶"}</span>
                    </div>
                    {openSections["visitors"] && (
                        <ul className="pl-6 list-disc text-gray-700">
                            <li>7a. Penghuni bertanggung jawab atas tamu yang berkunjung.</li>
                            <li>7b. Tamu hanya diizinkan berada di area bersama hingga pukul 22.00.</li>
                            <li>7c. Tamu dilarang menggunakan fasilitas pribadi penghuni lain tanpa izin.</li>
                        </ul>
                    )}
                </div>
                <div>
                    <div
                        className="cursor-pointer flex justify-between items-center bg-blue-100 p-4 rounded-md mb-4"
                        onClick={() => toggleSection("maintenance")}
                    >
                        <h2 className="text-xl font-semibold text-blue-700">8. Pemeliharaan Fasilitas</h2>
                        <span className="text-blue-500">{openSections["maintenance"] ? "▼" : "▶"}</span>
                    </div>
                    {openSections["maintenance"] && (
                        <ul className="pl-6 list-disc text-gray-700">
                            <li>8a. Setiap kerusakan fasilitas harus segera dilaporkan ke pengelola.</li>
                            <li>8b. Perbaikan fasilitas hanya dapat dilakukan oleh teknisi resmi kos.</li>
                            <li>8c. Biaya perbaikan akibat kelalaian penghuni akan dibebankan kepada yang bersangkutan.</li>
                        </ul>
                    )}
                </div>
                <div>
                    <div
                        className="cursor-pointer flex justify-between items-center bg-blue-100 p-4 rounded-md mb-4"
                        onClick={() => toggleSection("noise")}
                    >
                        <h2 className="text-xl font-semibold text-blue-700">9. Kebisingan</h2>
                        <span className="text-blue-500">{openSections["noise"] ? "▼" : "▶"}</span>
                    </div>
                    {openSections["noise"] && (
                        <ul className="pl-6 list-disc text-gray-700">
                            <li>9a. Hindari membuat kebisingan yang mengganggu penghuni lain.</li>
                            <li>9b. Jam tenang berlaku dari pukul 22.00 hingga 06.00.</li>
                            <li>9c. Aktivitas seperti karaoke atau pesta harus mendapat izin dari pengelola.</li>
                        </ul>
                    )}
                </div>
                <div>
                    <div
                        className="cursor-pointer flex justify-between items-center bg-blue-100 p-4 rounded-md mb-4"
                        onClick={() => toggleSection("emergency")}
                    >
                        <h2 className="text-xl font-semibold text-blue-700">10. Situasi Darurat</h2>
                        <span className="text-blue-500">{openSections["emergency"] ? "▼" : "▶"}</span>
                    </div>
                    {openSections["emergency"] && (
                        <ul className="pl-6 list-disc text-gray-700">
                            <li>10a. Setiap penghuni wajib mengetahui jalur evakuasi darurat.</li>
                            <li>10b. Segera laporkan kebakaran, banjir, atau situasi darurat lainnya kepada pengelola.</li>
                            <li>10c. Dilarang menggunakan alat pemadam kebakaran untuk keperluan non-darurat.</li>
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
