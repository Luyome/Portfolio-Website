import type { Metadata } from "next";

/**
 * Shared SEO metadata constants (Task 1.11 — SEO Metadata Foundation).
 * Kept independent from database calls so metadata resolution never depends
 * on a fragile data source — see docs/07_TECHNICAL_ARCHITECTURE.md, section 13.
 */

export const SITE_NAME = "TETSUNARU";
export const SITE_TITLE = "TETSUNARU — Ege Demir Ünal";
export const SITE_DESCRIPTION =
  "Game Designer & worldbuilder. Personal archive of games, 3D art, sketches and worldbuilding.";

/**
 * Canonical production origin, resolved from Vercel's system environment
 * variables — never hardcoded. `VERCEL_PROJECT_PRODUCTION_URL` stays stable
 * across every deployment (including previews) and points at the project's
 * real production domain, so it is preferred over the per-deployment
 * `VERCEL_URL`. Falls back to localhost only for local development; that
 * fallback is never shipped as the deployed canonical origin.
 */
const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
export const siteUrl = productionHost ? `https://${productionHost}` : "http://localhost:3000";

/** Shared Open Graph fields every page inherits unless it has a real reason to override them. */
export const baseOpenGraph: NonNullable<Metadata["openGraph"]> = {
  siteName: SITE_NAME,
  type: "website",
  locale: "en_US",
};
