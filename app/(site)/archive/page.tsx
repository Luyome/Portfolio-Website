import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { portfolioItems, sketches, models3d, worldbuildingEntries, games, archiveCategories } from "@/db/schema";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import ArchiveList from "@/components/ArchiveList";
import type { ArchiveItem } from "@/components/ArchiveList";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Archive",
  description: "A chronological catalog of every project, sketch, 3D piece, world and game published on the site.",
  alternates: { canonical: "/archive" },
};

export default async function ArchivePage() {
  const [port, sk, m3, wb, gm, categories, appearance] = await Promise.all([
    db.select().from(portfolioItems),
    db.select().from(sketches),
    db.select().from(models3d),
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
      date: p.date,
      img: p.img,
      href: `/portfolio?year=${p.year}`,
    })),
    ...sk.map((s) => ({
      id: `sketch-${s.id}`,
      type: "2D" as const,
      title: s.label,
      cat: "Sketch",
      year: s.year,
      date: s.date,
      img: s.img ?? "",
      href: `/2d?year=${s.year}`,
    })),
    ...m3.map((m) => ({
      id: `3d-${m.id}`,
      type: "3D" as const,
      title: m.label,
      cat: "3D",
      year: m.year,
      date: m.date,
      img: m.img ?? "",
      href: `/3d?year=${m.year}`,
    })),
    ...wb.map((w) => ({
      id: `worldbuilding-${w.id}`,
      type: "Worldbuilding" as const,
      title: w.title,
      cat: w.cat,
      year: w.year,
      date: w.date,
      img: w.img,
      href: "/worldbuilding",
    })),
    ...gm.map((g) => ({
      id: `game-${g.id}`,
      type: "Games" as const,
      title: g.title,
      cat: g.status,
      year: g.year,
      date: g.date,
      img: g.img,
      href: "/games",
    })),
  ].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return (
    <div className="page" style={pageAppearanceVars(appearance)}>
      <PageHeader
        watermark="記録"
        eyebrow="Year by Year"
        title="Archive"
        subtitle="Every project, sketch, world, and game — in one place."
      />
      <ArchiveList items={items} categories={categories.map((c) => c.label)} />
    </div>
  );
}
