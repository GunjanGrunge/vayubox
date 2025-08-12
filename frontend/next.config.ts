import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove static export for Vercel - we need API routes
  // output: 'export',
  // trailingSlash: true,
  // skipTrailingSlashRedirect: true,
  // distDir: 'out',
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/vayubox' : '',
  // basePath: process.env.NODE_ENV === 'production' ? '/vayubox' : '',
  
  // Vercel configuration
  images: {
    domains: ['awsdropbox101.s3.ap-south-1.amazonaws.com'],
  },
  
  // Environment variables
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
};

export default nextConfig;
