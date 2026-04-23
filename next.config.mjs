/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Prevent webpack from bundling server-only native packages
  serverExternalPackages: ['pdfkit', 'fontkit', 'restructure', 'iconv-lite'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/participant',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
