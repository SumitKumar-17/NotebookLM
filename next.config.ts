import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // This configuration is the key to solving the "canvas" module not found error.
    // It tells Webpack to not try to bundle `canvas` when building for the server.
    if (isServer) {
      config.externals.push('canvas');
    }
    return config;
  },
};

export default nextConfig;