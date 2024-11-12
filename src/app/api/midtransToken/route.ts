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
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        const headers = new Headers();
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Allow-Methods', 'POST');
        headers.set('Access-Control-Allow-Headers', 'Content-Type');
        return new Response(null, { status: 200, headers });
    }

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
        return new Response(JSON.stringify(transaction), { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
}
