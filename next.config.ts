import type { NextConfig } from "next";
import { BLOB_HOST_SUFFIX } from "./lib/image-host";

const nextConfig: NextConfig = {
  // Allows isolated production QA while an owner development server is
  // using `.next`; the default remains unchanged for every normal command.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async redirects() {
    return [
      { source: "/cv", destination: "/about", permanent: true },
      { source: "/sketches", destination: "/2d", permanent: true },
    ];
  },
  images: {
    // The only remote media host in use: Vercel Blob (see @vercel/blob usage
    // in the admin upload routes and app/api/download/route.ts). Each Blob
    // store gets its own subdomain, hence the single wildcard segment.
    // Kept in sync with lib/image-host.ts, which every public next/image
    // usage checks against before trusting a content row's URL to this host.
    remotePatterns: [
      {
        protocol: "https",
        hostname: `*${BLOB_HOST_SUFFIX}`,
        pathname: "/**",
      },
    ],
    // Next's own default (`[75]`) was the sole source of every thumbnail
    // looking visibly softer than the lightbox's raw, uncompressed <img> —
    // no grid/card component ever passed a `quality` prop, so all of them
    // silently rendered at 75. Adding 90 (not replacing 75) lets those
    // components opt into it without changing anything that doesn't.
    qualities: [75, 90],
  },
};

export default nextConfig;
