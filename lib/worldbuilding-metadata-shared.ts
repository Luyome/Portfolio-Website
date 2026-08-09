// Client-safe constants/types/labels for Worldbuilding's controlled-metadata
// layer — deliberately kept free of any `db`/`drizzle-orm` import so client
// components (e.g. `WorldbuildingMetadataForm`) can import from here without
// pulling the DB connection into the browser bundle. Mirrors `lib/metadata.ts`'s
// split from `lib/portfolio-metadata.ts`. The DB-query/mutation helpers stay in
// `lib/worldbuilding-metadata.ts`, which re-exports everything below for
// existing server-side import sites.

export const WB_METADATA_TYPES = ["wb_entity_type", "wb_category", "wb_chip"] as const;
export type WbMetadataType = (typeof WB_METADATA_TYPES)[number];

export const WB_METADATA_TYPE_LABELS: Record<WbMetadataType, string> = {
  wb_entity_type: "Entity Type",
  wb_category: "Category (legacy)",
  wb_chip: "Chips",
};

// The FormData field name each group's selector submits under.
export const WB_METADATA_FIELD_NAMES: Record<WbMetadataType, string> = {
  wb_entity_type: "entityTypeOptionId",
  wb_category: "catOptionId",
  wb_chip: "chipOptionIds",
};

export function isWbMetadataType(value: string): value is WbMetadataType {
  return (WB_METADATA_TYPES as readonly string[]).includes(value);
}
