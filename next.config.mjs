/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,  // Disable Next.js image optimization globally
        domains: ['firebasestorage.googleapis.com'],  // Allow images from Firebase
    },
};

export default nextConfig;
