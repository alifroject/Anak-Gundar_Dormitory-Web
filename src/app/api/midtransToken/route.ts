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
        return NextResponse.json(transaction);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
