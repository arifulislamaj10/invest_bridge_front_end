/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.cloudfront.net' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.s3.amazonaws.com' },
      { protocol: 'https', hostname: '**.s3.**.amazonaws.com' },
    ],
  },
  async rewrites() {
    const backend = process.env.API_PROXY_URL || 'https://travel_agency_back.sobhoy.com';
    return [
      { source: '/api/:path*', destination: `${backend}/api/:path*` },
    ];
  },
};

module.exports = nextConfig;
