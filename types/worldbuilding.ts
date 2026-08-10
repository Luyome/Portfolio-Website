import type { MediaEntry } from "@/lib/group-images";
import type { GalleryLink } from "@/components/shared/MediaLightbox";
import type { StylesMap } from "@/lib/style-fields";

export type CategoryType = "Characters" | "Cities" | "Systems" | "Factions" | "Items" | "History";
export type CategoryFilter = CategoryType | "all";
export type PinType = "submap" | "lore";

/** Public discovery top-level content mode — driven by the persisted
 * `displayTemplate` field, never by `entityType`/category (see
 * `WorldbuildingBrowser`'s mode filtering). */
export type WorldbuildingDiscoveryMode = "all" | "art" | "blog";

// Legacy fixed taxonomy — superseded by the Phase 2 `wb_category` managed
// metadata group (`lib/worldbuilding-metadata.ts`), kept only as a fallback
// seed list and for any code path that hasn't moved off it.
export const CATEGORIES: CategoryType[] = ["Characters", "Cities", "Systems", "Factions", "Items", "History"];

// Phase 2: Entity Type is a fully dynamic, admin-managed taxonomy (the
// `wb_entity_type` metadata group) rather than this fixed list — kept only
// as the seed values a fresh install/migration starts from. `entityType` on
// an entry is always a plain string (a metadata option's slug) from here on.
export const WORLDBUILDING_ENTITY_TYPES = ["character", "location", "corporation", "technology", "lore"] as const;
export type WorldbuildingEntityType = string;
export type EntityTypeFilter = string;

// Fallback labels for the seed slugs above — used only when no live
// `wb_entity_type` label map is available (e.g. a call site that hasn't
// been updated to pass one). Every current public/admin call site passes a
// live map built from active metadata options instead (`resolveEntityTypeLabel`'s
// second parameter), which reflects whatever an admin has renamed a slug to.
export const ENTITY_TYPE_LABELS: Record<string, string> = {
  character: "Character",
  location: "Location",
  corporation: "Corporation",
  technology: "Technology",
  lore: "Lore",
};

/** Resolves the display label for an entry: the live Entity Type label when
 * classified and present in `labels` (a slug→name map built from active
 * `wb_entity_type` metadata options — falls back to the seed labels above
 * when omitted), legacy `cat` free-text otherwise. Shared by the discovery
 * grid and the detail shell so both agree. */
export function resolveEntityTypeLabel(entityType: string | null, cat: string, labels: Record<string, string> = ENTITY_TYPE_LABELS): string {
  return entityType && entityType in labels ? labels[entityType] : cat;
}

/** A related Worldbuilding entity surfaced in the Task 4.4 detail shell,
 * resolved from the Task 4.2 relationship foundation. */
export type RelatedWorldbuildingEntry = {
  id: number;
  title: string;
  img: string | null;
  typeLabel: string;
};

export type LoreEntry = {
  id: number;
  title: string;
  cat: CategoryType | string;
  entityType: WorldbuildingEntityType | string | null;
  year: number;
  date: string;
  excerpt: string;
  chips: string[];
  img: string;
  content: string;
  contentOrder: number;
  images?: MediaEntry[];
  videos?: MediaEntry[];
  links?: GalleryLink[];
  styles?: StylesMap;
};
