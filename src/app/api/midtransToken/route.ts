import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';

interface CustomerDetails {
    first_name: string;
    email: string;
    phone: string;
}

interface TransactionRequestBody {
    orderId: string;
    grossAmount: number;
    customerDetails: CustomerDetails;
}

export async function POST(req: Request) {
    const headers = new Headers();

    // Dynamically set CORS origin based on environment
    const allowedOrigin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '*';
    headers.set('Access-Control-Allow-Origin', allowedOrigin);  // Allow the current Vercel deployment domain
    headers.set('Access-Control-Allow-Methods', 'POST');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return new NextResponse(null, { status: 200, headers });
    }

    // Handle POST request for transaction
    if (req.method === 'POST') {
        const { orderId, grossAmount, customerDetails }: TransactionRequestBody = await req.json();

        const snap = new midtransClient.Snap({
            isProduction: false,
            serverKey: process.env.MIDTRANS_SERVER_KEY || '',
        });

        const transactionDetails = {
            transaction_details: {
                order_id: orderId,
                gross_amount: grossAmount,
            },
            customer_details: customerDetails,
        };

        try {
            const transaction = await snap.createTransaction(transactionDetails);
            return new NextResponse(JSON.stringify(transaction), { status: 200, headers });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return new NextResponse(JSON.stringify({ error: errorMessage }), { status: 500, headers });
        }
    } else {
        return new NextResponse(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers });
    }
}
