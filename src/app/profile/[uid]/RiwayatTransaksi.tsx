import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { dbFire } from "@/app/firebase/config";
import { jsPDF } from "jspdf";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReceipt, faMoneyBillWave, faDownload } from '@fortawesome/free-solid-svg-icons';

interface Transaksi {
    id: string;
    order_id: string;
    first_name: string;
    gross_amount: string;
    transaction_time: string;
    bca_va_number: string;
    email: string;
    kampus: string;
    kotaAsal: string;
    payment_type: string;
    nama: string;
}

export default function Career() {
    const [riwayatTransaksi, setRiwayatTransaksi] = useState<Transaksi[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchRiwayatTransaksi = async () => {
            const auth = getAuth();
            const user = auth.currentUser; // Ambil pengguna yang sedang login

            if (user) {
                try {
                    const allTransactions = await getDocs(collection(dbFire, "bukti_transaksi"));
                    const userEmail = user.email; // Ambil email pengguna dari autentikasi

                    const data = allTransactions.docs
                        .map((doc) => ({
                            id: doc.id,
                            ...(doc.data() as Omit<Transaksi, "id">),
                        }))
                        .filter((transaksi) => transaksi.email === userEmail); // Filter transaksi berdasarkan email pengguna

                    setRiwayatTransaksi(data);
                } catch (error) {
                    console.error("Error fetching transaction history:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                console.error("User not authenticated");
                setLoading(false);
            }
        };

        fetchRiwayatTransaksi();
    }, []);



    const generatePDF = (transaksi: Transaksi) => {
        const doc = new jsPDF();
    
        // Tambahkan Background
        doc.setFillColor(240, 248, 255);
        doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, "F");
    
        // Header
        doc.setFont("times", "bold");
        doc.setFontSize(24);
        doc.setTextColor(0, 102, 204);
        doc.text("Bukti Transaksi", 105, 20, { align: "center" });
    
        // Menambahkan logo gambar di atas garis pemisah
        const logoImageUrl = "/AnakGundarSide.png";  // Ganti dengan path logo Anda
        doc.addImage(logoImageUrl, 'PNG', 80, 30, 50, 40);  // Posisi logo, sesuaikan ukuran jika perlu
    
        // Garis bawah header (setelah logo)
        doc.setDrawColor(0, 102, 190);
        doc.setLineWidth(2);
        doc.line(20, 70, 190, 70); // Garis dibawah judul dan logo
    
        // Informasi Pelanggan
        doc.setFont("times", "bold");
        doc.setFontSize(16);
        doc.setTextColor(51, 51, 51);
        doc.text("Informasi Pelanggan", 80, 80);
    
        doc.setFont("times", "normal");
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`Nama: ${transaksi.first_name}`, 20, 90);
        doc.text(`Email: ${transaksi.email}`, 20, 98);
        doc.text(`Kampus: ${transaksi.kampus}`, 20, 106);
        doc.text(`Kota Asal: ${transaksi.kotaAsal}`, 20, 114);
    
        // Garis bawah informasi pelanggan
        doc.setDrawColor(51, 51, 51);
        doc.setLineWidth(1);
        doc.line(20, 118, 190, 118);
    
        // Informasi Transaksi
        doc.setFont("times", "bold");
        doc.setFontSize(16);
        doc.setTextColor(51, 51, 51);
        doc.text("Detail Transaksi", 80, 130);
    
        doc.setFont("times", "normal");
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
    
        const formatRupiah = (amount: string) => {
            const numericAmount = Number(amount);
            if (isNaN(numericAmount)) {
                return "Rp 0";
            }
            return `Rp ${numericAmount.toLocaleString('id-ID')}`;
        };
    
        const detailData = [
            ["Order ID", transaksi.order_id],
            ["Nama Kos/Apartment", transaksi.nama],
            ["Jumlah", formatRupiah(transaksi.gross_amount)],
            ["Tanggal Mulai", new Date(transaksi.transaction_time).toLocaleDateString()],
            ["BCA VA Number", transaksi.bca_va_number || "N/A"],
            ["Metode Pembayaran", transaksi.payment_type],
        ];
    
        const startX = 20;
        const startY = 140;
        const lineSpacing = 10;
    
        detailData.forEach(([label, value], index) => {
            const yPosition = startY + index * lineSpacing;
            doc.setFont("times", "bold");
            doc.text(`${label}:`, startX, yPosition);
            doc.setFont("times", "normal");
            doc.text(value, startX + 60, yPosition);
        });
    
        // Garis bawah informasi transaksi
        doc.setDrawColor(51, 51, 51);
        doc.setLineWidth(1);
        doc.line(20, startY + detailData.length * lineSpacing + 5, 190, startY + detailData.length * lineSpacing + 5);
    
        // Footer
        doc.setFont("times", "italic");
        doc.setFontSize(12);
        doc.setTextColor(128, 128, 128);
        doc.text("Terima kasih telah menggunakan layanan kami!", 105, 270, { align: "center" });
    
        // Garis bawah footer
        doc.setDrawColor(128, 128, 128);
        doc.setLineWidth(0.5);
        doc.line(20, 275, 190, 275);
    
        // Simpan file PDF
        doc.save(`invoice_${transaksi.order_id}.pdf`);
    };
    



    return (
        <div className="p-4 md:p-6 min-h-screen bg-gray-50">
            <div className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 shadow-md rounded-lg p-6 md:p-8 w-full max-w-4xl mx-auto mt-8">
                <div className="flex flex-col md:flex-row items-center md:items-start">

                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-full shadow-lg flex items-center justify-center mr-4 md:mr-6">
                        <FontAwesomeIcon icon={faReceipt} className="text-white text-3xl md:text-4xl" />
                    </div>

                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 text-center md:text-left drop-shadow-sm">
                        Riwayat Transaksi
                    </h1>
                </div>
            </div>

            {loading ? (
                <p className="text-center">Loading...</p>
            ) : riwayatTransaksi.length > 0 ? (
                <div className="overflow-x-auto  mt-10">
                    <table className="table-auto w-full border-collapse border border-gray-300 shadow-lg rounded-lg overflow-hidden bg-white">
                        <thead>
                            <tr className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 text-white">
                                <th className="border border-gray-200 px-3 md:px-6 py-3 text-sm md:text-base font-semibold">
                                    Order ID
                                </th>
                                <th className="border border-gray-200 px-3 md:px-6 py-3 text-sm md:text-base font-semibold">
                                    Nama
                                </th>
                                <th className="border border-gray-200 px-3 md:px-6 py-3 text-sm md:text-base font-semibold">
                                    Jumlah
                                </th>
                                <th className="border border-gray-200 px-3 md:px-6 py-3 text-sm md:text-base font-semibold">
                                    Tanggal
                                </th>
                                <th className="border border-gray-200 px-3 md:px-6 py-3 text-sm md:text-base font-semibold">
                                    Invoice
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {riwayatTransaksi.map((transaksi, index) => (
                                <tr
                                    key={transaksi.id}
                                    className={`text-center ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-50'
                                        } hover:bg-gray-200 transition-colors duration-300`}
                                >
                                    <td className="border border-gray-300 text-black px-3 md:px-6 py-3 text-sm md:text-base">
                                        {transaksi.order_id}
                                    </td>
                                    <td className="border border-gray-300 text-black px-3 md:px-6 py-3 text-sm md:text-base">
                                        {transaksi.first_name}
                                    </td>
                                    <td className="border border-gray-300 px-3 md:px-6 py-3 text-sm md:text-base font-semibold text-green-600 flex items-center justify-center">
                                        <FontAwesomeIcon
                                            icon={faMoneyBillWave}
                                            className="text-green-500 text-lg mr-2"
                                        />
                                        Rp {Number(transaksi.gross_amount).toLocaleString('id-ID')}
                                    </td>
                                    <td className="border border-gray-300 text-black px-3 md:px-6 py-3 text-sm md:text-base">
                                        {new Date(transaksi.transaction_time).toLocaleDateString('id-ID', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </td>
                                    <td className="border border-gray-300 px-3 md:px-6 py-3">
                                        <button
                                            onClick={() => generatePDF(transaksi)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm md:text-base hover:bg-blue-700 transition-colors duration-300 shadow-md"
                                        >
                                            <FontAwesomeIcon icon={faDownload} className="mr-2" />
                                            Download PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
            ) : (
                <p className="text-center text-gray-500">Tidak ada transaksi ditemukan.</p>
            )}
        </div>

    );
}
