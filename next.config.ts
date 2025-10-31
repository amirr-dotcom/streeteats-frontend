import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Ensure proper image optimization
  images: {
    unoptimized: false,
    remotePatterns: [],
  },
};

export default nextConfig;
