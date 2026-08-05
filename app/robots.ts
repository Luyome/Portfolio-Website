import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-metadata";

/**
 * Sitemap & Robots Foundation (Task 1.12).
 * `VERCEL_ENV` is Vercel's own system variable ("production" | "preview" |
 * undefined locally) — the simplest reliable signal already available
 * without introducing new environment configuration. Local and Preview
 * deployments disallow crawling entirely; Production allows public routes
 * and blocks only confirmed private/internal prefixes.
 */
const isProduction = process.env.VERCEL_ENV === "production";

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
