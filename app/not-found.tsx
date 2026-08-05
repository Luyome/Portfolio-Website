import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ActionLink from "@/components/ActionLink";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you were looking for doesn't exist or may have moved.",
};

/**
 * Root `not-found.tsx`. Handles both genuinely unmatched URLs across the
 * whole app (only the root file catches those) and any `notFound()` call
 * that bubbles up without a closer boundary of its own — currently the
 * existing Admin edit routes. No DB reads: safe to render even when the
 * page a visitor meant to reach could not be resolved.
 */
export default function NotFound() {
  return (
    <div className="page">
      <PageHeader
        watermark="不明"
        eyebrow="404"
        title="Page Not Found"
        subtitle="The page you were looking for doesn't exist or may have moved."
      />
      <div className="h-btns">
        <ActionLink href="/" variant="primary">
          Back to Home
        </ActionLink>
        <ActionLink href="/archive" variant="ghost">
          Browse Archive
        </ActionLink>
      </div>
    </div>
  );
}
