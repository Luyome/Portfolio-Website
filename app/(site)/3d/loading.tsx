import PageHeader from "@/components/PageHeader";

// Streamed instantly on navigation (no data fetch) while the real page's
// DB-backed content resolves — see docs/08_ROADMAP.md's navigation-latency
// optimization entry. Header copy mirrors page.tsx exactly so there's no
// layout jump once the real content replaces this shell.
export default function Loading() {
  return (
    <div className="page">
      <PageHeader
        watermark="立体"
        eyebrow="Raw Models"
        title="3D"
        subtitle="Personal 3D studies and props — unfiltered."
      />
      <div className="qk-skel-grid" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <div className="qk-skel-tile" key={i} />
        ))}
      </div>
    </div>
  );
}
