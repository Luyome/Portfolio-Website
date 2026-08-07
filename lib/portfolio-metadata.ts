import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { metadataOptions, portfolioMetadataOptions } from "@/db/schema";
import { METADATA_TYPES, METADATA_TYPE_LABELS, METADATA_FIELD_NAMES, type MetadataType } from "@/lib/metadata";
import { ValidationError } from "@/lib/validation";

// Small, Portfolio-specific metadata read/validate helpers (Task 2.10) —
// not a general repository/CMS layer. `lib/metadata.ts` stays the single
// source of truth for the four type names; everything here is scoped to
// how Portfolio's create/edit form and its server actions use them.

export type MetadataOptionRow = typeof metadataOptions.$inferSelect;

/** One selectable option, shaped for the form (active-options list or an edit-time selection). */
export type MetadataOptionChoice = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
};

function toChoice(row: MetadataOptionRow): MetadataOptionChoice {
  return { id: row.id, name: row.name, slug: row.slug, isActive: row.isActive };
}

/**
 * Active options for all four metadata types, grouped — one query, used by
 * both the create and edit Portfolio pages so the form always offers only
 * currently-active choices to pick from.
 */
export async function getActiveMetadataOptionsByType(): Promise<Record<MetadataType, MetadataOptionChoice[]>> {
  const rows = await db
    .select()
    .from(metadataOptions)
    .where(eq(metadataOptions.isActive, true))
    .orderBy(asc(metadataOptions.sortOrder), asc(metadataOptions.name), asc(metadataOptions.id));

  const grouped = Object.fromEntries(METADATA_TYPES.map((t) => [t, [] as MetadataOptionChoice[]])) as Record<
    MetadataType,
    MetadataOptionChoice[]
  >;
  for (const row of rows) {
    if (row.type in grouped) grouped[row.type as MetadataType].push(toChoice(row));
  }
  return grouped;
}

/**
 * A Portfolio item's currently selected options, grouped by type — one join
 * query. Includes options that have since been made inactive (`isActive:
 * false` on the returned choice), so the edit form can keep showing a
 * previously-selected-but-now-inactive option instead of silently dropping
 * it.
 */
export async function getPortfolioMetadataSelections(portfolioId: number): Promise<Record<MetadataType, MetadataOptionChoice[]>> {
  const rows = await db
    .select({ option: metadataOptions })
    .from(portfolioMetadataOptions)
    .innerJoin(metadataOptions, eq(portfolioMetadataOptions.metadataOptionId, metadataOptions.id))
    .where(eq(portfolioMetadataOptions.portfolioId, portfolioId))
    .orderBy(asc(metadataOptions.sortOrder), asc(metadataOptions.name), asc(metadataOptions.id));

  const grouped = Object.fromEntries(METADATA_TYPES.map((t) => [t, [] as MetadataOptionChoice[]])) as Record<
    MetadataType,
    MetadataOptionChoice[]
  >;
  for (const { option } of rows) {
    if (option.type in grouped) grouped[option.type as MetadataType].push(toChoice(option));
  }
  return grouped;
}

export type ResolvedMetadataSelection = { ids: number[]; names: string[] };
export type ResolvedMetadataSelections = Record<MetadataType, ResolvedMetadataSelection>;

const NO_PREVIOUS_SELECTION: ReadonlySet<number> = new Set();

/**
 * Reads the four metadata multi-select fields from submitted FormData:
 * dedupes IDs per type, then verifies every ID actually exists in
 * `metadata_options` and belongs to the expected type — rejecting an
 * unknown ID or one that belongs to a different type, rather than silently
 * dropping it. Returns both the validated IDs (for the junction table) and
 * their current names (for the legacy dual-write columns — Section 8).
 * Throws `ValidationError` on the first problem found.
 *
 * An inactive option is only accepted if its ID is already in
 * `previouslySelectedIds` — the item's own current junction rows before
 * this edit (Sprint 2 Closure Audit, finding 1). This lets an edit keep or
 * remove a selection that has since been deactivated, without allowing a
 * newly-added selection (or any selection on create, where there is no
 * prior state) to pick an inactive option. Each ID belongs to exactly one
 * type, so one flat ID set — not grouped by type — is enough.
 */
export async function readMetadataSelections(
  formData: FormData,
  previouslySelectedIds: ReadonlySet<number> = NO_PREVIOUS_SELECTION
): Promise<ResolvedMetadataSelections> {
  const idsByType: Record<MetadataType, number[]> = { medium: [], subject: [], software: [], tag: [] };
  const allIds = new Set<number>();

  for (const type of METADATA_TYPES) {
    const raw = formData.getAll(METADATA_FIELD_NAMES[type]);
    const seen = new Set<number>();
    for (const value of raw) {
      const n = Number(value);
      if (!Number.isInteger(n) || n <= 0) {
        throw new ValidationError(`${METADATA_TYPE_LABELS[type]} selection is invalid.`);
      }
      seen.add(n);
    }
    idsByType[type] = [...seen];
    seen.forEach((id) => allIds.add(id));
  }

  const byId = new Map<number, MetadataOptionRow>();
  if (allIds.size > 0) {
    const rows = await db.select().from(metadataOptions).where(inArray(metadataOptions.id, [...allIds]));
    for (const row of rows) byId.set(row.id, row);
  }

  const result = {} as ResolvedMetadataSelections;
  for (const type of METADATA_TYPES) {
    const names: string[] = [];
    for (const id of idsByType[type]) {
      const row = byId.get(id);
      if (!row) throw new ValidationError(`${METADATA_TYPE_LABELS[type]} selection no longer exists.`);
      if (row.type !== type) throw new ValidationError(`${METADATA_TYPE_LABELS[type]} selection is invalid.`);
      if (!row.isActive && !previouslySelectedIds.has(id)) {
        throw new ValidationError(`${METADATA_TYPE_LABELS[type]} selection is no longer available.`);
      }
      names.push(row.name);
    }
    result[type] = { ids: idsByType[type], names };
  }
  return result;
}

/** Every selected option ID across all four types, combined — the full junction-row set for one Portfolio item. */
export function allSelectedMetadataIds(selections: ResolvedMetadataSelections): number[] {
  return METADATA_TYPES.flatMap((type) => selections[type].ids);
}
