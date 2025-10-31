import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Vercel automatically handles Next.js builds - no need for standalone output
  // Enable static optimization
  swcMinify: true,
  // Ensure proper image optimization
  images: {
    unoptimized: false,
    remotePatterns: [],
  },
};

export default nextConfig;
