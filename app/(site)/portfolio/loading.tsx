import PageHeader from "@/components/PageHeader";

// Streamed instantly on navigation (no data fetch) while the real page's
// DB-backed content resolves — see docs/08_ROADMAP.md's navigation-latency
// optimization entry. Header copy mirrors page.tsx exactly so there's no
// layout jump once the real content replaces this shell.
export default function Loading() {
  return (
    <div className="page">
      <PageHeader watermark="作品" eyebrow="Works" title="Portfolio" subtitle="3D characters and concept art." />
      <div className="qk-skel-rows" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <div className="qk-skel-row" key={i} />
        ))}
      </div>
    </div>
  );
}
