import type { NextConfig } from "next";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    // Enable parallel routes optimization
    optimizePackageImports: [
      "lucide-react",
      "@supabase/supabase-js",
      "zustand",
    ],
  },
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
    ],
  },
  // Production optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default withBundleAnalyzer(nextConfig);
