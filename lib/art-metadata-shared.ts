// Client-safe constants/types for 2D (Sketches) and 3D's shared controlled
// category taxonomy — deliberately kept free of any `db`/`drizzle-orm`
// import so client components (e.g. `ArtMetadataForm`) can import from here
// without pulling the DB connection into the browser bundle. Mirrors
// `lib/worldbuilding-metadata-shared.ts`'s split from `lib/worldbuilding-metadata.ts`.
// Only one group exists today (`art_category`) — both 2D and 3D pick from
// the exact same list of options, unlike Worldbuilding's three separate
// groups.

export const ART_METADATA_TYPES = ["art_category"] as const;
export type ArtMetadataType = (typeof ART_METADATA_TYPES)[number];

export const ART_METADATA_TYPE_LABELS: Record<ArtMetadataType, string> = {
  art_category: "Category",
};

// The FormData field name the single category selector submits under.
export const ART_METADATA_FIELD_NAME = "artCategoryOptionId";

// Which public page a category-status check/selection applies to — each
// category can be independently shown/hidden (and selectable) per page.
export const ART_PAGES = ["2d", "3d"] as const;
export type ArtPage = (typeof ART_PAGES)[number];

export function isArtMetadataType(value: string): value is ArtMetadataType {
  return (ART_METADATA_TYPES as readonly string[]).includes(value);
}
