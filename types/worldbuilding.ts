import type { MediaEntry } from "@/lib/group-images";
import type { GalleryLink } from "@/components/shared/MediaLightbox";
import type { StylesMap } from "@/lib/style-fields";

export type CategoryType = "Characters" | "Cities" | "Systems" | "Factions" | "Items" | "History";
export type CategoryFilter = CategoryType | "all";
export type PinType = "submap" | "lore";

export const CATEGORIES: CategoryType[] = ["Characters", "Cities", "Systems", "Factions", "Items", "History"];

// Canonical Worldbuilding taxonomy. The legacy CATEGORIES list intentionally
// remains separate because it still powers the existing Admin category UI.
export const WORLDBUILDING_ENTITY_TYPES = ["character", "location", "corporation", "technology", "lore"] as const;
export type WorldbuildingEntityType = typeof WORLDBUILDING_ENTITY_TYPES[number];
export type EntityTypeFilter = WorldbuildingEntityType | "all";

// Display labels for the public Task 4.3 discovery-grid filter. Records with
// no canonical entityType (legacy, unclassified) are never guessed into one
// of these — they only ever appear under "all".
export const ENTITY_TYPE_LABELS: Record<WorldbuildingEntityType, string> = {
  character: "Character",
  location: "Location",
  corporation: "Corporation",
  technology: "Technology",
  lore: "Lore",
};

/** Resolves the display label for an entry: canonical entityType label when
 * classified (Task 4.2), legacy `cat` free-text otherwise. Shared by the
 * Task 4.3 discovery grid and the Task 4.4 detail shell so both agree. */
export function resolveEntityTypeLabel(entityType: WorldbuildingEntityType | string | null, cat: string): string {
  return entityType && entityType in ENTITY_TYPE_LABELS ? ENTITY_TYPE_LABELS[entityType as WorldbuildingEntityType] : cat;
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
