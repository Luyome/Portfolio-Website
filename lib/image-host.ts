// Single source of truth for the one remote media host next/image is
// configured to optimize (see next.config.ts, images.remotePatterns).
//
// Some existing content rows (portfolio pieces, worldbuilding entries, etc.)
// still reference pre-migration placeholder URLs on other hosts (e.g.
// Unsplash demo images used before real artwork was uploaded to Blob).
// next/image throws for any src outside the configured remotePatterns, so
// every public Image usage checks isOptimizableImageUrl() and falls back to
// `unoptimized` for anything that isn't actually a Blob URL — this keeps the
// allowlist itself strict (no unconfirmed hosts added to next.config.ts)
// while not breaking whatever a content row currently points to.
const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

export function isOptimizableImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    return new URL(url).hostname.endsWith(BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
}

export { BLOB_HOST_SUFFIX };
