import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Change "examYada" to your actual GitHub repository name
  basePath: "/examYada",
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
