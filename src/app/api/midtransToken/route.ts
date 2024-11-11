import { NextApiRequest, NextApiResponse } from 'next';
import midtransClient from 'midtrans-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { orderId, grossAmount, customerDetails } = req.body;

    // Initialize Midtrans Snap API with proper configuration
    const snap = new midtransClient.Snap({
      isProduction: false,  // Set to true in production
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',  // Set the server key here
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
      res.status(200).json({ token: transaction.token });
    } catch (error) {
      console.error("Error generating Midtrans token:", error);
      res.status(500).json({ error: 'Failed to generate Midtrans token' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
