import type { NextConfig } from "next";
import { BLOB_HOST_SUFFIX } from "./lib/image-host";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/cv", destination: "/about", permanent: true }];
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
  },
};

export default nextConfig;
