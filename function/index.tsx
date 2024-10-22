import * as functions from 'firebase-functions';
import { Request, Response } from 'express';

// Fungsi untuk menangani permintaan API
export const yourFunctionName = functions.https.onRequest((request: Request, response: Response) => {
    const data = {
        message: "Hello from Firebase Functions!",
        timestamp: new Date().toISOString()
    };

    // Menanggapi dengan data JSON
    response.json(data);
});
