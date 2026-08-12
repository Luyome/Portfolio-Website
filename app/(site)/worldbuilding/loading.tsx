// Streamed instantly on navigation (no data fetch) while the real page's
// DB-backed content resolves — see docs/08_ROADMAP.md's navigation-latency
// optimization entry. The real page has no PageHeader of its own (its map +
// filter/discovery shell renders inline in WorldbuildingBrowser), so this
// shell stays a plain grid placeholder to avoid introducing heading text
// that doesn't exist in the real page.
export default function Loading() {
  return (
    <div className="page">
      <div className="qk-skel-grid" style={{ paddingTop: "40px" }} aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <div className="qk-skel-tile" key={i} />
        ))}
      </div>
    </div>
  );
}
