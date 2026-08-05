"use client";

import { useEffect } from "react";
import Link from "next/link";
import "./globals.css";

/**
 * Root failure boundary. Only fires when the root layout itself throws —
 * e.g. its `getSiteSettings()` read — since a segment's `error.tsx` never
 * wraps the layout above it in the same segment (see `(site)/error.tsx`).
 * Replaces the entire document, so it defines its own `<html>`/`<body>`
 * and cannot rely on the root layout, its DB read, or any component tree
 * that may share the cause of the failure — markup here is written by
 * hand against the existing `.page`/`.ph`/`.hbtn` classes instead of
 * importing `PageHeader`/`ActionLink`. Theme is fixed to the site's
 * default (dark) — the settings-driven theme choice isn't available here.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" data-theme="dark">
      <head>
        <title>Something Went Wrong</title>
      </head>
      <body>
        <div className="page">
          <div className="ph">
            <div className="ph-wm">エラー</div>
            <div className="ph-eyebrow">Critical Error</div>
            <h2 className="ph-title">Something Went Wrong</h2>
            <p className="ph-sub">
              The site ran into a problem it couldn&apos;t recover from. Try again, or head back home.
            </p>
          </div>
          <div className="h-btns">
            <button type="button" className="hbtn hbtn-p" onClick={() => reset()}>
              Try Again
            </button>
            <Link href="/" className="hbtn hbtn-g">
              Back to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
