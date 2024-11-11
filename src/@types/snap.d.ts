// global.d.ts
declare global {
    interface Window {
        snap: {
            pay: (token: string, options: {
                onSuccess: (result: SnapPaymentResult) => void;
                onPending: (result: SnapPaymentResult) => void;
                onError: (result: SnapPaymentResult) => void;
                onClose: () => void;
            }) => void;
        };
    }
}

interface SnapPaymentResult {
    transaction_status: string;
    order_id: string;
    gross_amount: number;
    payment_type: string;
    bank: string;
    // Add other fields you expect from the Snap response
}
