/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
    async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          { 
            key: 'Cache-Control', 
            value: 'public, max-age=31536000, immutable' 
          }
        ]
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${process.cwd()}/uploads/:path*`
      },
      {
        source: '/modules/:path*',
        destination: `${process.cwd()}/uploads/modules/:path*`
      }
    ]
  }
};

export default nextConfig;
