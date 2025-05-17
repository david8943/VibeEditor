import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['react-mobile-picker'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader'
    })
    return config
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://chaing.site/api/v1/:path*',
      },
      {
        source: '/fintTechApi/:path*',
        destination: 'https://finopenapi.ssafy.io/ssafy/api/v1/edu/:path*',
      },
    ]
  },
}

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})

module.exports = withPWA(nextConfig)
