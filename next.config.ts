import type { NextConfig } from 'next';

// API_URL is read at build time: the Docker build passes the internal API address.
const apiUrl = process.env.API_URL ?? 'http://127.0.0.1:4000';

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;
