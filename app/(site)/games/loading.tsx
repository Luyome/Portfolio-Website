import PageHeader from "@/components/PageHeader";

// Streamed instantly on navigation (no data fetch) while the real page's
// DB-backed content resolves — see docs/08_ROADMAP.md's navigation-latency
// optimization entry. Header copy mirrors page.tsx exactly so there's no
// layout jump once the real content replaces this shell.
export default function Loading() {
  return (
    <div className="page">
      <PageHeader
        watermark="ゲーム"
        eyebrow="Game Development"
        title="Games"
        subtitle="Solo and group projects. Unreal Engine 5."
      />
      <div className="qk-skel-rows" aria-hidden="true">
        {Array.from({ length: 2 }).map((_, i) => (
          <div className="qk-skel-row" key={i} />
        ))}
      </div>
    </div>
  );
}
