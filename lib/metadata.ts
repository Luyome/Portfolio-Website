// Single source of truth for the four controlled metadata groups (Task 2.9:
// Medium, Subject Matter, Software, Tags). Every module that needs this list
// — the mutation boundary (`lib/actions/metadata.ts`) and the Admin Metadata
// Manager — imports it from here instead of repeating the four strings.
export const METADATA_TYPES = ["medium", "subject", "software", "tag"] as const;

export type MetadataType = (typeof METADATA_TYPES)[number];

export const METADATA_TYPE_LABELS: Record<MetadataType, string> = {
  medium: "Medium",
  subject: "Subject Matter",
  software: "Software",
  tag: "Tags",
};

export function isMetadataType(value: string): value is MetadataType {
  return (METADATA_TYPES as readonly string[]).includes(value);
}

// The FormData field name each metadata type's Portfolio multi-select
// submits under (Task 2.10) — matches the pre-existing `tags` column/field
// naming for `tag`, and the type name itself for the other three. Pure
// constants, safe to import from both server (`lib/portfolio-metadata.ts`)
// and client (`PortfolioForm`) code.
export const METADATA_FIELD_NAMES: Record<MetadataType, string> = {
  medium: "medium",
  subject: "subject",
  software: "software",
  tag: "tags",
};
