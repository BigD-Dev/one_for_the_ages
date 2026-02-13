/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development'
const isCloudRun = process.env.BUILD_MODE === 'standalone'

const nextConfig = {
    output: isDev ? undefined : (isCloudRun ? 'standalone' : 'export'),
    distDir: isDev ? undefined : (isCloudRun ? '.next' : 'out'),
    images: {
        unoptimized: true,
    },
    // Trailing slash handled differently
    trailingSlash: !isCloudRun || isDev,
    // Capacitor compatibility
    assetPrefix: '',
}

export default nextConfig
