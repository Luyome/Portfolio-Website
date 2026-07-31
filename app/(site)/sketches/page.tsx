import { desc, asc } from "drizzle-orm";
import { db } from "@/db";
import { sketches } from "@/db/schema";
import SketchGrid from "@/components/SketchGrid";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";

export default async function SketchesPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;
  const [items, appearance] = await Promise.all([
    db.select().from(sketches).orderBy(desc(sketches.year), asc(sketches.sortOrder)),
    getPageAppearance("sketches"),
  ]);

  return (
    <div className="page" style={pageAppearanceVars(appearance)}>
      <div className="ph">
        <div className="ph-wm">落書き</div>
        <div className="ph-eyebrow">Raw Drawings</div>
        <h2 className="ph-title">Sketches</h2>
        <p className="ph-sub">Personal sketches and studies — unfiltered.</p>
      </div>
      <SketchGrid items={items} initialYear={year} />
    </div>
  );
}
