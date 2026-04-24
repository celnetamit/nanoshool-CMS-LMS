import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const useStandaloneOutput = process.env.NEXT_OUTPUT_STANDALONE === '1'

const nextConfig = {
  output: useStandaloneOutput ? 'standalone' : undefined,
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

export default withPayload(nextConfig)
