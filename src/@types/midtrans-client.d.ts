// src/@types/midtrans-client.d.ts

declare module 'midtrans-client' {
    export class Snap {
        constructor(options: { isProduction: boolean; serverKey: string });
        createTransaction(parameters: {
            transaction_details: {
                order_id: string;
                gross_amount: number;
            };
            customer_details?: {
                first_name?: string;
                last_name?: string;
                email?: string;
                phone?: string;
            };
        }): Promise<{ token: string; redirect_url: string }>;
    }
}
