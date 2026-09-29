import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: `next build` writes the whole site to ./out for S3 + CloudFront.
  output: "export",
  // Emit /work/slug/index.html so S3 keys map predictably to URLs.
  trailingSlash: true,
  // No image optimization server on a static host; images are pre-sized by hand.
  images: { unoptimized: true },
};

export default nextConfig;
