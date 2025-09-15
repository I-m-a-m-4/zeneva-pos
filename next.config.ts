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
      config.resolve.alias = {
        ...(Array.isArray(config.resolve.alias) ? {} : config.resolve.alias || {}),
        handlebars: false,
      };
      // Ensure externals is an array
      if (!config.externals) {
        config.externals = [];
      } else if (!Array.isArray(config.externals)) {
        config.externals = [config.externals];
      }
      // Exclude handlebars from client-side bundles
      (config.externals as any[]).push('handlebars');
    }
    return config;
  },
};

export default nextConfig;