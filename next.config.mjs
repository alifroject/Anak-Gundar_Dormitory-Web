/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true,
        domains: ['firebasestorage.googleapis.com'],
    },
    reactStrictMode: true,
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
