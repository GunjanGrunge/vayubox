import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/vayubox' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/vayubox' : '',
  // Exclude API routes for static export
  generateBuildId: async () => {
    return 'vayubox-static-build'
  },
};

export default nextConfig;
