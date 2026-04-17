import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // ── Performance ──
  reactStrictMode: true,
  poweredByHeader: false, // hide X-Powered-By header
  skipTrailingSlashRedirect: true,

  // ── Images — allow external domains used by your APIs ──
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.careerics.com" },
      // Add your CDN / storage domains here
    ],
  },

  // ── Security headers (supplement middleware headers) ──
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },

  // ── Proxy API calls during dev to avoid CORS issues ──
  turbopack: {
    root: configDir,
  },

  async rewrites() {
    return [
      {
        source: "/api/dotnet/:path*",
        destination: `${process.env.DOTNET_API_URL ?? "http://localhost:5000/api"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
