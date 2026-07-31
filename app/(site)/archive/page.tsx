import { asc } from "drizzle-orm";
import { db } from "@/db";
import { portfolioItems, sketches, worldbuildingEntries, games, archiveCategories } from "@/db/schema";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import ArchiveList from "@/components/ArchiveList";
import type { ArchiveItem } from "@/components/ArchiveList";

export default async function ArchivePage() {
  const [port, sk, wb, gm, categories, appearance] = await Promise.all([
    db.select().from(portfolioItems),
    db.select().from(sketches),
    db.select().from(worldbuildingEntries),
    db.select().from(games),
    db.select().from(archiveCategories).orderBy(asc(archiveCategories.sortOrder)),
    getPageAppearance("archive"),
  ]);

  const items: ArchiveItem[] = [
    ...port.map((p) => ({
      id: `portfolio-${p.id}`,
      type: "Portfolio" as const,
      title: p.title,
      cat: p.cat,
      year: p.year,
      img: p.img,
      href: `/portfolio?year=${p.year}`,
    })),
    ...sk.map((s) => ({
      id: `sketch-${s.id}`,
      type: "Sketches" as const,
      title: s.label,
      cat: "Sketch",
      year: s.year,
      img: s.img ?? "",
      href: `/sketches?year=${s.year}`,
    })),
    ...wb.map((w) => ({
      id: `worldbuilding-${w.id}`,
      type: "Worldbuilding" as const,
      title: w.title,
      cat: w.cat,
      year: w.year,
      img: w.img,
      href: "/worldbuilding",
    })),
    ...gm.map((g) => ({
      id: `game-${g.id}`,
      type: "Games" as const,
      title: g.title,
      cat: g.status,
      year: g.year,
      img: g.img,
      href: "/games",
    })),
  ].sort((a, b) => b.year - a.year);

  return (
    <div className="page" style={pageAppearanceVars(appearance)}>
      <div className="ph">
        <div className="ph-wm">記録</div>
        <div className="ph-eyebrow">Year by Year</div>
        <h2 className="ph-title">Archive</h2>
        <p className="ph-sub">Every project, sketch, world, and game — in one place.</p>
      </div>
      <ArchiveList items={items} categories={categories.map((c) => c.label)} />
    </div>
  );
}
