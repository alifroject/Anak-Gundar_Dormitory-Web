/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone', 
    images: {
        unoptimized: true,
        domains: ['firebasestorage.googleapis.com'],
    },
};

export default nextConfig;
