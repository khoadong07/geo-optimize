/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://backend:4000';
    return [{ source: '/api/:path*', destination: `${backendUrl}/:path*` }];
  },
};

module.exports = nextConfig;
