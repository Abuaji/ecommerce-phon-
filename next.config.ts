import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["unzipper"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
