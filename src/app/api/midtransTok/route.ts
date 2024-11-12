// src/app/api/midtransToken/route.ts

import { NextRequest, NextResponse } from 'next/server';  // Importing from 'next/server'
import midtransClient from 'midtrans-client';

interface TransactionParameters {
  orderId: string;
  grossAmount: number;
  customerDetails: {
    first_name: string;
    email: string;
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log('Request Body:', body);  // Log the incoming request body

  const { orderId, grossAmount, customerDetails }: TransactionParameters = body;

  if (!orderId || !grossAmount || !customerDetails) {
    console.error('Missing parameters in the request body');
    // Return a response with status code 400 and a JSON message
    return NextResponse.json(
      { error: 'Missing parameters in the request body' },
      { status: 400 }
    );
  }

  const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: "SB-Mid-server-DKxXZ0SL9yAPYufosHJNjXrI",
  });

  try {
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: customerDetails,
    };

    const transaction = await snap.createTransaction(parameter);
    console.log('Transaction response:', transaction);
    return NextResponse.json({ token: transaction.token });
  } catch (error) {
    console.error('Error generating Midtrans token:', error);
    return NextResponse.json(
      { error: 'Failed to generate Midtrans token', message: error },
      { status: 500 }
    );
  }
}
