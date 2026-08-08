import type { MediaEntry } from "@/lib/group-images";
import type { GalleryLink } from "@/components/GalleryModal";
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
