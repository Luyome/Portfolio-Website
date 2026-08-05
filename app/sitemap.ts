import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-metadata";

/**
 * Sitemap & Robots Foundation (Task 1.12).
 * Static, hand-maintained list of confirmed canonical public pages — no
 * dynamic public detail routes exist yet (see docs/01_INFORMATION_ARCHITECTURE.md,
 * section 13), so no database query is needed here. Order follows the
 * primary site navigation (components/Header.tsx) for stable, deterministic
 * output. `lastModified` is intentionally omitted: none of these routes have
 * a reliable last-changed source, and fabricating one is explicitly disallowed.
 */
const PUBLIC_ROUTES = [
  "/",
  "/portfolio",
  "/sketches",
  "/3d",
  "/games",
  "/worldbuilding",
  "/archive",
  "/about",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((path) => ({
    url: new URL(path, siteUrl).toString(),
  }));
}
