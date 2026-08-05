"use client";

import { useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import ActionLink from "@/components/ActionLink";

/**
 * Route-level error boundary for the public `(site)` group. Catches
 * unexpected rendering/data failures thrown by a page or its nested
 * layouts below this boundary — it does not (and cannot) catch a failure
 * in `(site)/layout.tsx` itself, since an error boundary never wraps the
 * layout in its own segment; that case is handled by `global-error.tsx`.
 * Reuses the same `PageHeader`/`ActionLink`/`.h-btns` primitives every
 * other public page is built from instead of inventing new markup.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server Component errors already arrive scrubbed to a generic message;
    // the digest lets this be matched against server-side logs without
    // exposing anything sensitive here.
    console.error(error);
  }, [error]);

  return (
    <div className="page">
      <PageHeader
        watermark="エラー"
        eyebrow="Unexpected Error"
        title="Something Went Wrong"
        subtitle="This page ran into a problem while loading. Try again, or head back home."
      />
      <div className="h-btns">
        <button type="button" className="hbtn hbtn-p" onClick={() => reset()}>
          Try Again
        </button>
        <ActionLink href="/" variant="ghost">
          Back to Home
        </ActionLink>
      </div>
    </div>
  );
}
