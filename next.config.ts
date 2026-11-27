import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
