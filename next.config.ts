/** @type {import('next').NextConfig} */
import type { Configuration } from 'webpack';

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.logo.wine',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config: Configuration, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      // Exclude handlebars from client-side bundles
      config.resolve.alias['handlebars'] = false;
    }
    return config;
  },
  telemetry: false, // Disable Next.js telemetry
};

export default nextConfig;