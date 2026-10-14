import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Permite HMR quando o dev é aberto pelo IP da rede (ex.: Radmin/VPN)
  allowedDevOrigins: ['26.155.43.222', 'localhost'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

export default nextConfig
