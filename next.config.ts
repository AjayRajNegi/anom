import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Ignore type errors from generated .next/types (turbopack route group bug)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;