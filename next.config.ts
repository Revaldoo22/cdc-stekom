import type { NextConfig } from "next";

// ─── Content Security Policy ──────────────────────────────────────────────────
// Restricts where resources may load from. Hosts listed are the only external
// origins this app legitimately talks to (CDC + TopLoker APIs, image hosts,
// Google Apps Script webhook, WhatsApp deep links).
// React/Turbopack need eval() in dev (HMR, debugging). Production never uses it,
// so only relax script-src outside production.
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  // Next.js injects inline runtime/hydration scripts; 'unsafe-inline' is required
  // for it to work. No user-supplied input is ever rendered as a <script>.
  // 'unsafe-eval' is added in development only — see isDev above.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  // Tailwind / Next inject inline <style>; 'unsafe-inline' needed.
  "style-src 'self' 'unsafe-inline'",
  // Images: self + the remote hosts we render (loker posters, VJF banners, stock).
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // XHR/fetch targets — keep tight to the APIs we actually call.
  "connect-src 'self' https://cdc.stekom.ac.id https://toploker.com",
  // Form posts (VJF → WhatsApp, applications → Google Apps Script).
  "form-action 'self' https://wa.me https://script.google.com",
  // Nobody may embed us in an <iframe> (clickjacking), and we frame nothing.
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Force HTTPS for 2 years incl. subdomains (only takes effect over HTTPS).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Belt-and-suspenders clickjacking protection for older browsers.
  { key: "X-Frame-Options", value: "DENY" },
  // Stop MIME-type sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs to other origins.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable powerful APIs we never use.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  // Isolate cross-origin resources.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework version.
  poweredByHeader: false,
  images: {
    // Vercel's Image Optimization quota (Hobby plan) was exhausted, causing all
    // next/image requests to fail with HTTP 402. Serve images as-is instead —
    // our assets are already reasonably sized.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to every route.
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  // For VPS deployment: uncomment below
  // output: "standalone",
};

export default nextConfig;
