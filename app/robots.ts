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
      // Both the trailing-slash prefix and the bare root path — "/admin"
      // and "/api" alone (no trailing slash) previously fell outside the
      // `/admin/`/`/api/` prefix rules and were technically crawlable
      // (Sprint 2 Closure Audit, finding 8; an indexing-hygiene fix, not an
      // auth boundary — `proxy.ts` already protects the real routes).
      disallow: ["/admin", "/admin/", "/api", "/api/"],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
