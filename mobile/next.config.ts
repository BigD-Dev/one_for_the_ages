/** @type {import('next').NextConfig} */

const isCloudRun = process.env.BUILD_MODE === 'standalone'

const nextConfig = {
    output: isCloudRun ? 'standalone' : 'export',
    distDir: isCloudRun ? '.next' : 'out',
    images: {
        unoptimized: true,
    },
    // Trailing slash handled differently
    trailingSlash: !isCloudRun,
    // Capacitor compatibility
    assetPrefix: process.env.NODE_ENV === 'production' && !isCloudRun ? '' : '',
}

export default nextConfig
