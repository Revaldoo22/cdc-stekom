import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 100],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // For VPS deployment: uncomment below
  // output: "standalone",
};

export default nextConfig;
