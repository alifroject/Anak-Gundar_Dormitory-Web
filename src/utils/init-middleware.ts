import { NextApiRequest, NextApiResponse } from 'next';

// Fungsi untuk menginisialisasi middleware CORS
export default function initMiddleware(
    middleware: (req: NextApiRequest, res: NextApiResponse, next: (result: unknown) => void) => void
) {
    return (req: NextApiRequest, res: NextApiResponse) =>
        new Promise<void>((resolve, reject) => {
            middleware(req, res, (result: unknown) => {
                if (result instanceof Error) {
                    return reject(result);
                }
                return resolve();
            });
        });
}
