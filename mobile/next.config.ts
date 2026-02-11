/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    distDir: 'out',
    images: {
        unoptimized: true,
    },
    // Disable server-side features for static export
    trailingSlash: true,
    // Capacitor compatibility
    assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
}

export default nextConfig
