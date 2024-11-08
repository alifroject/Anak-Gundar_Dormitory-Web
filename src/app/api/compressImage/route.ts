import { NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: Request) {
    try {
        const { fileBuffer } = await req.json(); // Get base64 file from JSON
        
        if (!fileBuffer) {
            return new NextResponse('No file provided', { status: 400 });
        }

        // Strip the base64 prefix if it's present
        const base64Data = fileBuffer.split(',')[1]; // Extracts the part after the comma
        const buffer = Buffer.from(base64Data, 'base64');

        // Compress the image with sharp
        const compressedBuffer = await sharp(buffer)
            .resize(800)
            .jpeg({ quality: 80 })
            .toBuffer();

        return new NextResponse(compressedBuffer, {
            status: 200,
            headers: { 'Content-Type': 'image/jpeg' },
        });
    } catch (error) {
        console.error('Error processing image:', error);
        return new NextResponse(JSON.stringify({ message: 'Error processing image' }), {
            status: 500,
        });
    }
}
