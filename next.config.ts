import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vercel's Image Optimization quota (Hobby plan) was exhausted, causing all
    // next/image requests to fail with HTTP 402. Serve images as-is instead —
    // our assets are already reasonably sized.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // For VPS deployment: uncomment below
  // output: "standalone",
};

export default nextConfig;
