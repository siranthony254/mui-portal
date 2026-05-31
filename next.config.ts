import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol:'https', hostname:'cdn.sanity.io' },
      { protocol:'https', hostname:'img.youtube.com' },
      { protocol:'https', hostname:'i.ytimg.com' },
    ],
    formats: ['image/avif','image/webp'],
  },
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [
      { source:'/(.*)', headers:[
        {key:'X-Content-Type-Options',value:'nosniff'},
        {key:'X-Frame-Options',value:'DENY'},
        {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
      ]},
      { source:'/(.*)\\.(ico|png|svg|jpg|jpeg|webp|avif|woff|woff2)', headers:[
        {key:'Cache-Control',value:'public, max-age=31536000, immutable'},
      ]},
    ]
  },
}
export default nextConfig
