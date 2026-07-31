import { db } from "@/db";
import { portfolioItems, sketches, worldbuildingEntries, games, services } from "@/db/schema";

export type ContentEvent = {
  createdAt: string;
  words: number;
  hasImage: boolean;
};

export type SectionCount = { label: string; href: string; count: number };

function countWords(...parts: (string | string[] | null | undefined)[]): number {
  const text = parts.flatMap((p) => (Array.isArray(p) ? p : [p ?? ""])).join(" ").trim();
  return text ? text.split(/\s+/).length : 0;
}

export type DashboardData = {
  events: ContentEvent[];
  sections: SectionCount[];
  totalPages: number;
  totalWords: number;
  totalImages: number;
  addedThisMonth: number;
};

export async function getDashboardData(): Promise<DashboardData> {
  const [portfolio, sketchRows, worldbuilding, gameRows, serviceRows] = await Promise.all([
    db.select().from(portfolioItems),
    db.select().from(sketches),
    db.select().from(worldbuildingEntries),
    db.select().from(games),
    db.select().from(services),
  ]);

  const events: ContentEvent[] = [
    ...portfolio.map((p) => ({
      createdAt: p.createdAt.toISOString(),
      words: countWords(p.title, p.cat, p.desc, p.tags, p.medium, p.software),
      hasImage: Boolean(p.img),
    })),
    ...sketchRows.map((s) => ({
      createdAt: s.createdAt.toISOString(),
      words: countWords(s.label, s.desc),
      hasImage: Boolean(s.img),
    })),
    ...worldbuilding.map((w) => ({
      createdAt: w.createdAt.toISOString(),
      words: countWords(w.title, w.cat, w.excerpt, w.chips),
      hasImage: Boolean(w.img),
    })),
    ...gameRows.map((g) => ({
      createdAt: g.createdAt.toISOString(),
      words: countWords(g.title, g.desc, g.tags, g.feats, g.target),
      hasImage: Boolean(g.img),
    })),
    ...serviceRows.map((s) => ({
      createdAt: s.createdAt.toISOString(),
      words: countWords(s.title, s.desc),
      hasImage: false,
    })),
  ];

  const sections: SectionCount[] = [
    { label: "Portfolio", href: "/admin/portfolio", count: portfolio.length },
    { label: "Sketches", href: "/admin/sketches", count: sketchRows.length },
    { label: "Worldbuilding", href: "/admin/worldbuilding", count: worldbuilding.length },
    { label: "Games", href: "/admin/games", count: gameRows.length },
    { label: "Services", href: "/admin/services", count: serviceRows.length },
  ];

  const totalPages = sections.reduce((sum, s) => sum + s.count, 0);
  const totalWords = events.reduce((sum, e) => sum + e.words, 0);
  const totalImages = events.filter((e) => e.hasImage).length;

  const now = new Date();
  const addedThisMonth = events.filter((e) => {
    const d = new Date(e.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  return { events, sections, totalPages, totalWords, totalImages, addedThisMonth };
}
