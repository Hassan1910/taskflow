import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Standalone output for Azure App Service
  output: 'standalone',
  
  // External packages for Prisma
  serverExternalPackages: ['@prisma/client', 'prisma'],
  
  // Image optimization - disable for Azure or configure external loader
  images: {
    unoptimized: true, // Set to false if you configure Azure CDN
  },
  
  // Add empty turbopack config to silence the webpack warning
  turbopack: {},
};

export default nextConfig;
