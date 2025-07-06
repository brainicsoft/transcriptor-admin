/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
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
