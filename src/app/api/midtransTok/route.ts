// src/app/api/midtransToken/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import midtransClient from 'midtrans-client';

interface TransactionParameters {
  orderId: string;
  grossAmount: number;
  customerDetails: {
    first_name: string;
    email: string;
  };
}

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  console.log('Request Body:', req.body);  // Log the incoming request

  const { orderId, grossAmount, customerDetails }: TransactionParameters = req.body;

  if (!orderId || !grossAmount || !customerDetails) {
    console.error('Missing parameters in the request body');
    return res.status(400).json({ error: 'Missing parameters in the request body' });
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
    res.status(200).json({ token: transaction.token });
  } catch (error) {
    console.error('Error generating Midtrans token:', error);
    res.status(500).json({ error: 'Failed to generate Midtrans token', message:  error });
  }
}
