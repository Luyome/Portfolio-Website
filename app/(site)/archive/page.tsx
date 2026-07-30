import Link from "next/link";
import { db } from "@/db";
import { portfolioItems, sketches, worldbuildingEntries } from "@/db/schema";

export default async function ArchivePage() {
  const [port, sk, wb] = await Promise.all([
    db.select().from(portfolioItems),
    db.select().from(sketches),
    db.select().from(worldbuildingEntries),
  ]);

  const all = [...port, ...sk, ...wb];
  const years = Array.from(new Set(all.map((d) => d.year))).sort((a, b) => b - a);

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-wm">記録</div>
        <div className="ph-eyebrow">Year by Year</div>
        <h2 className="ph-title">Archive</h2>
        <p className="ph-sub">Browse all work by year.</p>
      </div>
      <div className="archive-wrap">
        <p className="archive-intro">Select a year to browse all work from that period.</p>
        <div className="arc-list">
          {years.map((y) => {
            const count = all.filter((d) => d.year === y).length;
            const cats = Array.from(
              new Set([
                ...port.filter((d) => d.year === y).map((d) => d.cat),
                ...(sk.some((d) => d.year === y) ? ["Sketch"] : []),
                ...(wb.some((d) => d.year === y) ? ["Worldbuilding"] : []),
              ])
            );
            return (
              <Link className="arc-card" href={`/portfolio?year=${y}`} key={y}>
                <div className="arc-y">{y}</div>
                <div className="arc-info">
                  <div className="arc-cnt">{count} pieces</div>
                  <div className="arc-cats">
                    {cats.map((c) => (
                      <span className="arc-cat" key={c}>{c}</span>
                    ))}
                  </div>
                </div>
                <button className="arc-btn">Browse {y} →</button>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
