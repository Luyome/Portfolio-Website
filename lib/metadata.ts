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
