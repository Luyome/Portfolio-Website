import { cache } from "react";
import { resolveContentDetailHref } from "@/lib/content-detail-href";
import { asc, count, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  games,
  homeContentSelections,
  homeMapPreview,
  homeMapPreviewPins,
  homeSkills,
  homeStatSettings,
  mapLocations,
  metadataOptions,
  models3d,
  portfolioItems,
  services,
  sketches,
  worldbuildingEntries,
  worldMaps,
} from "@/db/schema";
import { getSiteSettings } from "@/lib/site-settings";
import { ValidationError, requiredId, requiredText } from "@/lib/validation";

export const HOME_CONTENT_SECTIONS = ["featured_work", "worldbuilding_highlight", "latest_dispatch"] as const;
export type HomeContentSection = (typeof HOME_CONTENT_SECTIONS)[number];

export const HOME_CONTENT_TYPES = ["portfolio", "sketch", "model3d", "worldbuilding", "game"] as const;
export type HomeContentType = (typeof HOME_CONTENT_TYPES)[number];

export type HomeContentReference = { type: HomeContentType; id: number };

export const HOME_SECTION_LIMITS: Record<HomeContentSection, number> = {
  featured_work: 6,
  worldbuilding_highlight: 3,
  latest_dispatch: 4,
};
export const HOME_SKILLS_LIMIT = 6;
export const HOME_CAPABILITIES_LIMIT = 4;
export const HOME_MAP_PINS_LIMIT = 5;

type HomeMapConfig = { isVisible: boolean; mapId: number | null };
type HomeMap = typeof worldMaps.$inferSelect;
type HomeMapPin = typeof mapLocations.$inferSelect;
export type ResolvedHomeContinentPin = HomeMapPin & { href: string; targetTitle: string };

export function resolveHomeMapPreview(
  config: HomeMapConfig | null,
  map: HomeMap | null,
  pins: readonly HomeMapPin[],
  childMaps: readonly HomeMap[] = []
) {
  if (!config?.isVisible || !config.mapId || !map || map.id !== config.mapId) return null;

  const seen = new Set<number>();
  const childMapsById = new Map(childMaps.map((child) => [child.id, child]));
  const validPins = pins.flatMap((pin): ResolvedHomeContinentPin[] => {
    if (seen.has(pin.id) || pin.mapId !== map.id || !pin.name.trim()) return [];
    if (!Number.isFinite(pin.x) || !Number.isFinite(pin.y) || pin.x < 0 || pin.x > 100 || pin.y < 0 || pin.y > 100) return [];
    if (pin.pinType !== "submap" || pin.targetMapId === null) return [];
    const targetMap = childMapsById.get(pin.targetMapId);
    if (!targetMap || targetMap.parentMapId !== map.id) return [];
    seen.add(pin.id);
    return [{ ...pin, href: `/worldbuilding?map=${targetMap.id}`, targetTitle: targetMap.title }];
  }).slice(0, HOME_MAP_PINS_LIMIT);

  return { map, pins: validPins };
}

export const HOME_STAT_KEYS = [
  "3d_works",
  "2d_works",
  "worldbuilding_entries",
  "game_projects",
  "stories_devlogs",
  "published_entries",
] as const;
export type HomeStatKey = (typeof HOME_STAT_KEYS)[number];

const SUPPORTED_STAT_KEYS = new Set<HomeStatKey>([
  "3d_works",
  "2d_works",
  "worldbuilding_entries",
  "game_projects",
]);

export function isHomeStatSupported(key: HomeStatKey): boolean {
  return SUPPORTED_STAT_KEYS.has(key);
}

export type HomeProductionStat = {
  key: HomeStatKey;
  label: string;
  count: number | null;
  available: boolean;
  isVisible: boolean;
};

type HomeStatCounts = Partial<Record<HomeStatKey, number>>;
type HomeStatSetting = { key: string; isVisible: boolean };

const STAT_LABELS: Record<HomeStatKey, string> = {
  "3d_works": "3D Works",
  "2d_works": "2D Works",
  worldbuilding_entries: "Worldbuilding Entries",
  game_projects: "Game Projects",
  stories_devlogs: "Stories & Devlogs",
  published_entries: "Published Entries",
};

export function validateHomeSelectionSet(section: HomeContentSection, refs: readonly HomeContentReference[]): void {
  const limit = HOME_SECTION_LIMITS[section];
  if (refs.length > limit) throw new ValidationError(`This Home section supports at most ${limit} items.`);

  const keys = new Set<string>();
  for (const ref of refs) {
    requiredId(ref.id, "Content");
    if (!HOME_CONTENT_TYPES.includes(ref.type)) throw new ValidationError("Content type is invalid.");
    if (section === "worldbuilding_highlight" && ref.type !== "worldbuilding") {
      throw new ValidationError("Worldbuilding Highlights can only reference Worldbuilding entries.");
    }
    const key = `${ref.type}:${ref.id}`;
    if (keys.has(key)) throw new ValidationError("The same content cannot be selected twice.");
    keys.add(key);
  }
}

export function validateHomeMapPinSet(locationIds: readonly number[]): void {
  if (locationIds.length > HOME_MAP_PINS_LIMIT) {
    throw new ValidationError(`The Home map preview supports at most ${HOME_MAP_PINS_LIMIT} pins.`);
  }
  const unique = new Set(locationIds);
  if (unique.size !== locationIds.length) throw new ValidationError("The same map pin cannot be selected twice.");
  locationIds.forEach((id) => requiredId(id, "Map pin"));
}

export function homeSelectionValues(section: HomeContentSection, refs: readonly HomeContentReference[]) {
  return refs.map((ref, sortOrder) => ({
    section,
    portfolioId: ref.type === "portfolio" ? ref.id : null,
    sketchId: ref.type === "sketch" ? ref.id : null,
    model3dId: ref.type === "model3d" ? ref.id : null,
    worldbuildingEntryId: ref.type === "worldbuilding" ? ref.id : null,
    gameId: ref.type === "game" ? ref.id : null,
    sortOrder,
  }));
}

async function assertContentReferencesExist(refs: readonly HomeContentReference[]): Promise<void> {
  const ids = <T extends HomeContentType>(type: T) => refs.filter((ref) => ref.type === type).map((ref) => ref.id);
  const portfolioIds = ids("portfolio");
  const sketchIds = ids("sketch");
  const modelIds = ids("model3d");
  const worldbuildingIds = ids("worldbuilding");
  const gameIds = ids("game");

  const [portfolioRows, sketchRows, modelRows, worldbuildingRows, gameRows] = await Promise.all([
    portfolioIds.length ? db.select({ id: portfolioItems.id }).from(portfolioItems).where(inArray(portfolioItems.id, portfolioIds)) : [],
    sketchIds.length ? db.select({ id: sketches.id }).from(sketches).where(inArray(sketches.id, sketchIds)) : [],
    modelIds.length ? db.select({ id: models3d.id }).from(models3d).where(inArray(models3d.id, modelIds)) : [],
    worldbuildingIds.length
      ? db.select({ id: worldbuildingEntries.id }).from(worldbuildingEntries).where(inArray(worldbuildingEntries.id, worldbuildingIds))
      : [],
    gameIds.length ? db.select({ id: games.id }).from(games).where(inArray(games.id, gameIds)) : [],
  ]);

  const found = new Set([
    ...portfolioRows.map((row) => `portfolio:${row.id}`),
    ...sketchRows.map((row) => `sketch:${row.id}`),
    ...modelRows.map((row) => `model3d:${row.id}`),
    ...worldbuildingRows.map((row) => `worldbuilding:${row.id}`),
    ...gameRows.map((row) => `game:${row.id}`),
  ]);
  if (refs.some((ref) => !found.has(`${ref.type}:${ref.id}`))) {
    throw new ValidationError("One or more selected content records no longer exist.");
  }
}

/** Atomic ordered replacement used by the future Home Admin actions. */
export async function replaceHomeContentSelections(
  section: HomeContentSection,
  refs: readonly HomeContentReference[]
): Promise<void> {
  validateHomeSelectionSet(section, refs);
  await assertContentReferencesExist(refs);
  const remove = db.delete(homeContentSelections).where(eq(homeContentSelections.section, section));
  if (refs.length === 0) {
    await remove;
    return;
  }
  await db.batch([remove, db.insert(homeContentSelections).values(homeSelectionValues(section, refs))]);
}

export function homeSkillValues(skills: readonly { label: string; isVisible: boolean }[]) {
  const labels = validateHomeSkills(skills);
  return skills.map((skill, sortOrder) => ({ label: labels[sortOrder], isVisible: skill.isVisible, sortOrder }));
}

export async function replaceHomeSkills(
  skills: readonly { label: string; isVisible: boolean }[]
): Promise<void> {
  const values = homeSkillValues(skills);
  const remove = db.delete(homeSkills);
  if (skills.length === 0) {
    await remove;
    return;
  }
  await db.batch([
    remove,
    db.insert(homeSkills).values(values),
  ]);
}

export function validateHomeSkills(skills: readonly { label: string; isVisible: boolean }[]): string[] {
  if (skills.length > HOME_SKILLS_LIMIT) throw new ValidationError(`Home supports at most ${HOME_SKILLS_LIMIT} skills.`);
  const labels = skills.map((skill) => requiredText(skill.label, "Skill"));
  if (new Set(labels.map((label) => label.toLocaleLowerCase("en-US"))).size !== labels.length) {
    throw new ValidationError("Home Skills must be unique.");
  }
  return labels;
}

export async function setHomeCapabilities(serviceIds: readonly number[]): Promise<void> {
  if (serviceIds.length > HOME_CAPABILITIES_LIMIT) {
    throw new ValidationError(`Home supports at most ${HOME_CAPABILITIES_LIMIT} capabilities.`);
  }
  const uniqueIds = [...new Set(serviceIds)];
  if (uniqueIds.length !== serviceIds.length) throw new ValidationError("The same capability cannot be selected twice.");
  uniqueIds.forEach((id) => requiredId(id, "Capability"));
  if (uniqueIds.length > 0) {
    const rows = await db.select({ id: services.id }).from(services).where(inArray(services.id, uniqueIds));
    if (rows.length !== uniqueIds.length) throw new ValidationError("One or more selected capabilities no longer exist.");
  }

  if (uniqueIds.length === 0) {
    await db.update(services).set({ isHomeVisible: false });
    return;
  }
  const orderedIds = sql.join(uniqueIds.map((id) => sql`${id}`), sql`, `);
  const orderCases = sql.join(uniqueIds.map((id, sortOrder) => sql`when ${id} then ${sortOrder}`), sql` `);
  // One statement keeps visibility and ordering consistent even though the
  // neon-http driver does not expose db.transaction().
  await db.update(services).set({
    isHomeVisible: sql`${services.id} in (${orderedIds})`,
    sortOrder: sql`case ${services.id} ${orderCases} else ${services.sortOrder} end`,
  });
}

export async function setHomeStatVisibility(key: HomeStatKey, isVisible: boolean): Promise<void> {
  if (!HOME_STAT_KEYS.includes(key)) throw new ValidationError("Production stat is invalid.");
  if (isVisible && !SUPPORTED_STAT_KEYS.has(key)) {
    throw new ValidationError(`${STAT_LABELS[key]} is not supported by the current content schema.`);
  }
  await db
    .insert(homeStatSettings)
    .values({ key, isVisible })
    .onConflictDoUpdate({ target: homeStatSettings.key, set: { isVisible } });
}

export async function setHomeMapPreview(mapId: number | null, isVisible: boolean): Promise<void> {
  if (mapId !== null) {
    requiredId(mapId, "Map");
    const rows = await db.select({ id: worldMaps.id }).from(worldMaps).where(eq(worldMaps.id, mapId));
    if (rows.length !== 1) throw new ValidationError("The selected map no longer exists.");
  }
  if (isVisible && mapId === null) throw new ValidationError("Choose a map before showing the Home map preview.");
  await db
    .insert(homeMapPreview)
    .values({ id: 1, mapId, isVisible })
    .onConflictDoUpdate({ target: homeMapPreview.id, set: { mapId, isVisible } });
}

export async function replaceHomeMapPreviewPins(locationIds: readonly number[]): Promise<void> {
  validateHomeMapPinSet(locationIds);
  const [preview] = await db.select().from(homeMapPreview).where(eq(homeMapPreview.id, 1));
  if (!preview?.mapId && locationIds.length > 0) throw new ValidationError("Choose a Home preview map before selecting pins.");

  if (locationIds.length > 0) {
    const rows = await db
      .select({ id: mapLocations.id, mapId: mapLocations.mapId })
      .from(mapLocations)
      .where(inArray(mapLocations.id, locationIds));
    if (rows.length !== locationIds.length || rows.some((row) => row.mapId !== preview.mapId)) {
      throw new ValidationError("Every Home preview pin must exist on the selected map.");
    }
  }

  const remove = db.delete(homeMapPreviewPins).where(eq(homeMapPreviewPins.previewId, 1));
  if (locationIds.length === 0) {
    await remove;
    return;
  }
  await db.batch([
    remove,
    db.insert(homeMapPreviewPins).values(locationIds.map((locationId, sortOrder) => ({ previewId: 1, locationId, sortOrder }))),
  ]);
}

export type ResolvedHomeContent = {
  selectionId: number;
  section: HomeContentSection;
  sortOrder: number;
  type: HomeContentType;
  contentId: number;
  title: string;
  summary: string;
  image: string | null;
  href: string;
  createdAt: Date;
  category?: string;
};

export function resolveHomeWorldbuildingHighlights(
  curated: readonly ResolvedHomeContent[],
  eligible: readonly ResolvedHomeContent[]
): ResolvedHomeContent[] {
  const valid = (items: readonly ResolvedHomeContent[]) => items.filter((item) =>
    item.section === "worldbuilding_highlight" &&
    item.type === "worldbuilding" &&
    Number.isSafeInteger(item.contentId) &&
    item.contentId > 0 &&
    item.title.trim().length > 0 &&
    item.href === resolveContentDetailHref("worldbuilding", item.contentId)
  );
  const selected = valid(curated);
  return (selected.length > 0 ? selected : valid(eligible)).slice(0, HOME_SECTION_LIMITS.worldbuilding_highlight);
}

export function resolveHomeLatestDispatches(
  items: readonly ResolvedHomeContent[]
): ResolvedHomeContent[] {
  return items
    .filter((item) => {
      const canonicalHref = resolveContentDetailHref(item.type, item.contentId);
      return item.section === "latest_dispatch" &&
        Number.isSafeInteger(item.contentId) &&
        item.contentId > 0 &&
        item.title.trim().length > 0 &&
        canonicalHref !== null &&
        item.href === canonicalHref &&
        item.createdAt instanceof Date &&
        Number.isFinite(item.createdAt.getTime());
    })
    .sort((a, b) =>
      b.createdAt.getTime() - a.createdAt.getTime() ||
      b.contentId - a.contentId ||
      a.type.localeCompare(b.type)
    )
    .slice(0, HOME_SECTION_LIMITS.latest_dispatch);
}

async function getHomeContentSelections(): Promise<ResolvedHomeContent[]> {
  const rows = await db
    .select({
      selection: homeContentSelections,
      portfolio: { id: portfolioItems.id, title: portfolioItems.title, summary: portfolioItems.desc, image: portfolioItems.img, createdAt: portfolioItems.createdAt },
      sketch: { id: sketches.id, title: sketches.label, summary: sketches.desc, image: sketches.img, createdAt: sketches.createdAt },
      model3d: { id: models3d.id, title: models3d.label, summary: models3d.desc, image: models3d.img, createdAt: models3d.createdAt },
      worldbuilding: { id: worldbuildingEntries.id, title: worldbuildingEntries.title, summary: worldbuildingEntries.excerpt, image: worldbuildingEntries.img, category: worldbuildingEntries.cat, createdAt: worldbuildingEntries.createdAt },
      game: { id: games.id, title: games.title, summary: games.desc, image: games.img, createdAt: games.createdAt },
    })
    .from(homeContentSelections)
    .leftJoin(portfolioItems, eq(homeContentSelections.portfolioId, portfolioItems.id))
    .leftJoin(sketches, eq(homeContentSelections.sketchId, sketches.id))
    .leftJoin(models3d, eq(homeContentSelections.model3dId, models3d.id))
    .leftJoin(worldbuildingEntries, eq(homeContentSelections.worldbuildingEntryId, worldbuildingEntries.id))
    .leftJoin(games, eq(homeContentSelections.gameId, games.id))
    .orderBy(asc(homeContentSelections.section), asc(homeContentSelections.sortOrder), asc(homeContentSelections.id));

  return rows.flatMap((row): ResolvedHomeContent[] => {
    const base = { selectionId: row.selection.id, section: row.selection.section as HomeContentSection, sortOrder: row.selection.sortOrder };
    if (row.portfolio) return [{ ...base, type: "portfolio", contentId: row.portfolio.id, title: row.portfolio.title, summary: row.portfolio.summary, image: row.portfolio.image || null, href: resolveContentDetailHref("portfolio", row.portfolio.id)!, createdAt: row.portfolio.createdAt }];
    if (row.sketch) return [{ ...base, type: "sketch", contentId: row.sketch.id, title: row.sketch.title, summary: row.sketch.summary, image: row.sketch.image, href: resolveContentDetailHref("sketch", row.sketch.id)!, createdAt: row.sketch.createdAt }];
    if (row.model3d) return [{ ...base, type: "model3d", contentId: row.model3d.id, title: row.model3d.title, summary: row.model3d.summary, image: row.model3d.image, href: resolveContentDetailHref("model3d", row.model3d.id)!, createdAt: row.model3d.createdAt }];
    if (row.worldbuilding) return [{ ...base, type: "worldbuilding", contentId: row.worldbuilding.id, title: row.worldbuilding.title, summary: row.worldbuilding.summary, image: row.worldbuilding.image || null, href: resolveContentDetailHref("worldbuilding", row.worldbuilding.id)!, createdAt: row.worldbuilding.createdAt, category: row.worldbuilding.category }];
    if (row.game) return [{ ...base, type: "game", contentId: row.game.id, title: row.game.title, summary: row.game.summary, image: row.game.image || null, href: resolveContentDetailHref("game", row.game.id)!, createdAt: row.game.createdAt }];
    return [];
  });
}

/** Focused public read for Task 3.5; avoids resolving later Home sections. */
export const getHomeFeaturedWorks = cache(async () => {
  const selections = await getHomeContentSelections();
  return selections.filter((item) => item.section === "featured_work");
});

/** Focused public read for Task 3.6; does not resolve future Home stages. */
export const getHomeCapabilitiesAndSkills = cache(async () => {
  const [capabilities, skills] = await Promise.all([
    db.select().from(services).where(eq(services.isHomeVisible, true)).orderBy(asc(services.sortOrder), asc(services.id)),
    db.select().from(homeSkills).where(eq(homeSkills.isVisible, true)).orderBy(asc(homeSkills.sortOrder), asc(homeSkills.id)),
  ]);
  return { capabilities, skills };
});

export function resolveHomeProductionStats(
  counts: HomeStatCounts,
  settings: readonly HomeStatSetting[]
): HomeProductionStat[] {
  const visibility = new Map(settings.map((setting) => [setting.key, setting.isVisible]));
  return HOME_STAT_KEYS.map((key) => ({
    key,
    label: STAT_LABELS[key],
    count: isHomeStatSupported(key) ? (counts[key] ?? 0) : null,
    available: isHomeStatSupported(key),
    isVisible: isHomeStatSupported(key) && (visibility.get(key) ?? false),
  }));
}

export const getHomeProductionStats = cache(async (): Promise<HomeProductionStat[]> => {
  const [modelCount, sketchCount, worldbuildingCount, gameCount, settings] = await Promise.all([
    db.select({ value: count() }).from(models3d),
    db.select({ value: count() }).from(sketches),
    db.select({ value: count() }).from(worldbuildingEntries),
    db.select({ value: count() }).from(games),
    db.select().from(homeStatSettings),
  ]);
  const counts: HomeStatCounts = {
    "3d_works": modelCount[0]?.value ?? 0,
    "2d_works": sketchCount[0]?.value ?? 0,
    worldbuilding_entries: worldbuildingCount[0]?.value ?? 0,
    game_projects: gameCount[0]?.value ?? 0,
  };
  return resolveHomeProductionStats(counts, settings);
});

async function getHomeMapData() {
  const [preview] = await db
    .select({ config: homeMapPreview, map: worldMaps })
    .from(homeMapPreview)
    .leftJoin(worldMaps, eq(homeMapPreview.mapId, worldMaps.id))
    .where(eq(homeMapPreview.id, 1));
  if (!preview?.config.mapId || !preview.map) return null;
  const pins = await db
    .select({ selection: homeMapPreviewPins, location: mapLocations })
    .from(homeMapPreviewPins)
    .innerJoin(mapLocations, eq(homeMapPreviewPins.locationId, mapLocations.id))
    .where(eq(homeMapPreviewPins.previewId, 1))
    .orderBy(asc(homeMapPreviewPins.sortOrder), asc(homeMapPreviewPins.id));
  const childMaps = await db.select().from(worldMaps).where(eq(worldMaps.parentMapId, preview.map.id));
  return resolveHomeMapPreview(preview.config, preview.map, pins.map((row) => row.location), childMaps);
}

/** Consolidated, request-deduplicated read boundary for future Home tasks. */
export const getHomeData = cache(async () => {
  const [settings, capabilities, skills, selections, stats, mapPreview, fallbackWorldbuilding, softwareOptions] = await Promise.all([
    getSiteSettings(),
    db.select().from(services).where(eq(services.isHomeVisible, true)).orderBy(asc(services.sortOrder), asc(services.id)),
    db.select().from(homeSkills).where(eq(homeSkills.isVisible, true)).orderBy(asc(homeSkills.sortOrder), asc(homeSkills.id)),
    getHomeContentSelections(),
    getHomeProductionStats(),
    getHomeMapData(),
    db.select({
      id: worldbuildingEntries.id,
      title: worldbuildingEntries.title,
      summary: worldbuildingEntries.excerpt,
      image: worldbuildingEntries.img,
      category: worldbuildingEntries.cat,
      createdAt: worldbuildingEntries.createdAt,
    }).from(worldbuildingEntries).orderBy(asc(worldbuildingEntries.sortOrder), asc(worldbuildingEntries.id)).limit(HOME_SECTION_LIMITS.worldbuilding_highlight),
    db.select({ name: metadataOptions.name, iconUrl: metadataOptions.iconUrl })
      .from(metadataOptions).where(eq(metadataOptions.type, "software")),
  ]);
  const softwareKey = (name: string) => name
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/\s+(?:v(?:ersion)?\s*)?\d+(?:\.\d+)*$/u, "");
  const softwareIcons = new Map<string, string>();
  for (const option of softwareOptions) {
    if (option.iconUrl) softwareIcons.set(softwareKey(option.name), option.iconUrl);
  }
  const knownSoftwareIcons = new Map([
    ["unreal engine", "https://cdn.simpleicons.org/unrealengine/FFFFFF"],
    ["blender", "https://cdn.simpleicons.org/blender/FFFFFF"],
    ["maya", "https://cdn.simpleicons.org/autodeskmaya/FFFFFF"],
  ]);
  const curatedWorldbuilding = selections.filter((item) => item.section === "worldbuilding_highlight");
  const fallbackHighlights: ResolvedHomeContent[] = fallbackWorldbuilding.map((item, sortOrder) => ({
    selectionId: -(sortOrder + 1),
    section: "worldbuilding_highlight",
    sortOrder,
    type: "worldbuilding",
    contentId: item.id,
    title: item.title,
    summary: item.summary,
    image: item.image || null,
    href: resolveContentDetailHref("worldbuilding", item.id)!,
    createdAt: item.createdAt,
    category: item.category,
  }));
  return {
    settings,
    capabilities,
    skills: skills.map((skill) => {
      const key = softwareKey(skill.label);
      return { ...skill, iconUrl: softwareIcons.get(key) ?? knownSoftwareIcons.get(key) ?? null };
    }),
    featuredWorks: selections.filter((item) => item.section === "featured_work"),
    worldbuildingHighlights: resolveHomeWorldbuildingHighlights(curatedWorldbuilding, fallbackHighlights),
    latestDispatches: resolveHomeLatestDispatches(selections),
    stats,
    mapPreview,
  };
});
