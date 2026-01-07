import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pokemontcg.io',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'img2.clipart-library.com',
        port: '',
      },
    ],
  },
};

export default nextConfig;
