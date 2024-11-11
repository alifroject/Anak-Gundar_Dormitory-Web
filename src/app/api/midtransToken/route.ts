import { NextApiRequest, NextApiResponse } from 'next';
import midtransClient from 'midtrans-client';
import initMiddleware from '@/utils/init-middleware';  // Path import sesuai dengan lokasi file utils
import Cors from 'cors';

// Inisialisasi middleware CORS
const cors = Cors({
    methods: ['GET', 'POST', 'OPTIONS'],
    origin: '*', // Ganti dengan origin yang diizinkan jika diperlukan
});

// Fungsi handler API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Menjalankan middleware CORS
    await initMiddleware(cors)(req, res);

    // Cek method request
    if (req.method === 'POST') {
        const { orderId, grossAmount, customerDetails } = req.body;

        // Inisialisasi Midtrans Snap API dengan konfigurasi yang benar
        const snap = new midtransClient.Snap({
            isProduction: false,  // Set ke true jika di produksi
            serverKey: process.env.MIDTRANS_SERVER_KEY || '',  // Gunakan server key yang sesuai
        });

        try {
            // Parameter transaksi
            const parameter = {
                transaction_details: {
                    order_id: orderId,
                    gross_amount: grossAmount,
                },
                customer_details: customerDetails,
            };

            // Membuat transaksi
            const transaction = await snap.createTransaction(parameter);

            // Mengirimkan token transaksi sebagai response
            res.status(200).json({ token: transaction.token });
        } catch (error) {
            console.error("Error generating Midtrans token:", error);
            res.status(500).json({ error: 'Failed to generate Midtrans token' });
        }
    } else {
        // Jika method bukan POST
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
