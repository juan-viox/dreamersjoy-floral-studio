import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Prevent pages that use browser APIs from being prerendered at build time
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
