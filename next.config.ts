import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['@prisma/client', 'prisma'],
  // Add empty turbopack config to silence the webpack warning
  turbopack: {},
};

export default nextConfig;
