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
      // Ensure resolve and alias are initialized
      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {} as Record<string, string | false | string[]>;
      // Exclude handlebars from client-side bundles
      config.resolve.alias['handlebars'] = false;
    }
    return config;
  },
};

export default nextConfig;