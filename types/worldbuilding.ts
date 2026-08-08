import type { MediaEntry } from "@/lib/group-images";
import type { GalleryLink } from "@/components/GalleryModal";
import type { StylesMap } from "@/lib/style-fields";

export type CategoryType = "Characters" | "Cities" | "Systems" | "Factions" | "Items" | "History";
export type CategoryFilter = CategoryType | "all";
export type ViewMode = "default" | "grid";
export type PinType = "submap" | "lore";

export const CATEGORIES: CategoryType[] = ["Characters", "Cities", "Systems", "Factions", "Items", "History"];

// Canonical Worldbuilding taxonomy. The legacy CATEGORIES list intentionally
// remains separate because it still powers the existing public/Admin category UI.
export const WORLDBUILDING_ENTITY_TYPES = ["character", "location", "corporation", "technology", "lore"] as const;
export type WorldbuildingEntityType = typeof WORLDBUILDING_ENTITY_TYPES[number];

export type LoreEntry = {
  id: number;
  title: string;
  cat: CategoryType | string;
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
