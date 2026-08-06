import { desc } from "drizzle-orm";
import { db } from "@/db";
import { portfolioItems, sketches, models3d, worldbuildingEntries, games, services, worldMaps } from "@/db/schema";

export type ContentEvent = {
  createdAt: string;
  words: number;
  hasImage: boolean;
};

export type SectionCount = { label: string; href: string; count: number };

export type AttentionItem = { label: string; detail: string; href: string };

export type RecentItem = { type: string; title: string; href: string; createdAt: string };

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
  attentionItems: AttentionItem[];
  primaryCreateHref: string;
  primaryCreateLabel: string;
};

export async function getDashboardData(): Promise<DashboardData> {
  const [portfolio, sketchRows, model3dRows, worldbuilding, gameRows, serviceRows, mapRows] = await Promise.all([
    db.select().from(portfolioItems),
    db.select().from(sketches),
    db.select().from(models3d),
    db.select().from(worldbuildingEntries),
    db.select().from(games),
    db.select().from(services),
    // Only the columns the dashboard actually needs (count + title check) —
    // maps aren't part of the words/images activity chart below.
    db.select({ id: worldMaps.id, title: worldMaps.title }).from(worldMaps),
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
    ...model3dRows.map((m) => ({
      createdAt: m.createdAt.toISOString(),
      words: countWords(m.label, m.desc),
      hasImage: Boolean(m.img),
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
    { label: "3D Models", href: "/admin/3d", count: model3dRows.length },
    { label: "Worldbuilding", href: "/admin/worldbuilding", count: worldbuilding.length },
    { label: "Games", href: "/admin/games", count: gameRows.length },
    { label: "Maps", href: "/admin/worldbuilding/maps", count: mapRows.length },
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

  // Only checks fields the mutation boundary (lib/actions/*.ts) actually
  // enforces as required (requiredText on title/label) — never a field
  // that's genuinely optional today (e.g. img, which every action reads
  // via optionalUrl). Rows created before validation existed, or edited
  // directly in the database, are the only realistic way this fires.
  const attentionItems: AttentionItem[] = [
    ...portfolio
      .filter((p) => !p.title.trim())
      .map((p) => ({ label: "Portfolio", detail: `Item #${p.id} is missing a title`, href: `/admin/portfolio/${p.id}/edit` })),
    ...sketchRows
      .filter((s) => !s.label.trim())
      .map((s) => ({ label: "Sketches", detail: `Item #${s.id} is missing a title`, href: `/admin/sketches/${s.id}/edit` })),
    ...model3dRows
      .filter((m) => !m.label.trim())
      .map((m) => ({ label: "3D Models", detail: `Item #${m.id} is missing a title`, href: `/admin/3d/${m.id}/edit` })),
    ...worldbuilding
      .filter((w) => !w.title.trim())
      .map((w) => ({ label: "Worldbuilding", detail: `Entry #${w.id} is missing a title`, href: `/admin/worldbuilding/${w.id}/edit` })),
    ...gameRows
      .filter((g) => !g.title.trim())
      .map((g) => ({ label: "Games", detail: `Item #${g.id} is missing a title`, href: `/admin/games/${g.id}/edit` })),
    ...mapRows
      .filter((m) => !m.title.trim())
      .map((m) => ({ label: "Maps", detail: `Map #${m.id} is missing a title`, href: `/admin/worldbuilding/maps/${m.id}/edit` })),
  ];

  // Header's single primary create action: the content type with the most
  // existing items is the one actually used most often — a real,
  // database-derived signal rather than a guess, and the only one
  // available without adding analytics tracking (out of scope).
  const primaryCandidates = [
    { label: "Portfolio Item", href: "/admin/portfolio/new", count: portfolio.length },
    { label: "Worldbuilding Entry", href: "/admin/worldbuilding/new", count: worldbuilding.length },
    { label: "Sketch", href: "/admin/sketches/new", count: sketchRows.length },
    { label: "3D Model", href: "/admin/3d/new", count: model3dRows.length },
    { label: "Game", href: "/admin/games/new", count: gameRows.length },
    { label: "Map", href: "/admin/worldbuilding/maps/new", count: mapRows.length },
  ];
  const primary = primaryCandidates.reduce((a, b) => (b.count > a.count ? b : a));

  return {
    events,
    sections,
    totalPages,
    totalWords,
    totalImages,
    addedThisMonth,
    attentionItems,
    primaryCreateHref: primary.href,
    primaryCreateLabel: primary.label,
  };
}

/**
 * Most recently added items across every content type that has both a
 * `createdAt` column and a real Admin edit route. Each table is queried with
 * its own `ORDER BY created_at DESC LIMIT` (bounded and deterministic at the
 * database level) — merging the top `limit` rows of N sorted lists is
 * guaranteed to contain the true overall top `limit`, so no unbounded fetch
 * or client-side sort over full tables is needed.
 */
export async function getRecentContent(limit = 8): Promise<RecentItem[]> {
  const [portfolio, sketchRows, model3dRows, worldbuilding, gameRows, mapRows] = await Promise.all([
    db
      .select({ id: portfolioItems.id, title: portfolioItems.title, createdAt: portfolioItems.createdAt })
      .from(portfolioItems)
      .orderBy(desc(portfolioItems.createdAt), desc(portfolioItems.id))
      .limit(limit),
    db
      .select({ id: sketches.id, title: sketches.label, createdAt: sketches.createdAt })
      .from(sketches)
      .orderBy(desc(sketches.createdAt), desc(sketches.id))
      .limit(limit),
    db
      .select({ id: models3d.id, title: models3d.label, createdAt: models3d.createdAt })
      .from(models3d)
      .orderBy(desc(models3d.createdAt), desc(models3d.id))
      .limit(limit),
    db
      .select({ id: worldbuildingEntries.id, title: worldbuildingEntries.title, createdAt: worldbuildingEntries.createdAt })
      .from(worldbuildingEntries)
      .orderBy(desc(worldbuildingEntries.createdAt), desc(worldbuildingEntries.id))
      .limit(limit),
    db
      .select({ id: games.id, title: games.title, createdAt: games.createdAt })
      .from(games)
      .orderBy(desc(games.createdAt), desc(games.id))
      .limit(limit),
    db
      .select({ id: worldMaps.id, title: worldMaps.title, createdAt: worldMaps.createdAt })
      .from(worldMaps)
      .orderBy(desc(worldMaps.createdAt), desc(worldMaps.id))
      .limit(limit),
  ]);

  const items: RecentItem[] = [
    ...portfolio.map((p) => ({ type: "Portfolio", title: p.title, href: `/admin/portfolio/${p.id}/edit`, createdAt: p.createdAt.toISOString() })),
    ...sketchRows.map((s) => ({ type: "Sketch", title: s.title, href: `/admin/sketches/${s.id}/edit`, createdAt: s.createdAt.toISOString() })),
    ...model3dRows.map((m) => ({ type: "3D Model", title: m.title, href: `/admin/3d/${m.id}/edit`, createdAt: m.createdAt.toISOString() })),
    ...worldbuilding.map((w) => ({ type: "Worldbuilding", title: w.title, href: `/admin/worldbuilding/${w.id}/edit`, createdAt: w.createdAt.toISOString() })),
    ...gameRows.map((g) => ({ type: "Game", title: g.title, href: `/admin/games/${g.id}/edit`, createdAt: g.createdAt.toISOString() })),
    ...mapRows.map((m) => ({ type: "Map", title: m.title, href: `/admin/worldbuilding/maps/${m.id}/edit`, createdAt: m.createdAt.toISOString() })),
  ];

  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
}
