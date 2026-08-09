import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { metadataOptions, worldbuildingMetadataOptions } from "@/db/schema";
import { ValidationError } from "@/lib/validation";
import { WB_METADATA_TYPES, WB_METADATA_TYPE_LABELS, WB_METADATA_FIELD_NAMES, isWbMetadataType, type WbMetadataType } from "@/lib/worldbuilding-metadata-shared";

// Worldbuilding's own controlled-metadata layer (Phase 2) — mirrors
// `lib/portfolio-metadata.ts`'s shape and conventions, but scoped to
// Worldbuilding's three groups instead of Portfolio's four. Kept as a
// separate module (not folded into `lib/metadata.ts`/`lib/portfolio-metadata.ts`)
// so Portfolio's existing, working metadata system is never touched by this.
//
// Client-safe constants/labels/types live in `lib/worldbuilding-metadata-shared.ts`
// (no `db` import there) — re-exported here so existing server-side imports of
// this module keep working unchanged.
export { WB_METADATA_TYPES, WB_METADATA_TYPE_LABELS, WB_METADATA_FIELD_NAMES, isWbMetadataType, type WbMetadataType };

export type WbMetadataOptionRow = typeof metadataOptions.$inferSelect;

/** One selectable option, shaped for the form. */
export type WbMetadataOptionChoice = { id: number; name: string; slug: string; isActive: boolean };

function toChoice(row: WbMetadataOptionRow): WbMetadataOptionChoice {
  return { id: row.id, name: row.name, slug: row.slug, isActive: row.isActive };
}

/** Active options for all three Worldbuilding metadata groups, grouped — one query. */
export async function getActiveWbMetadataOptionsByType(): Promise<Record<WbMetadataType, WbMetadataOptionChoice[]>> {
  const rows = await db
    .select()
    .from(metadataOptions)
    .where(eq(metadataOptions.isActive, true))
    .orderBy(asc(metadataOptions.sortOrder), asc(metadataOptions.name), asc(metadataOptions.id));

  const grouped = Object.fromEntries(WB_METADATA_TYPES.map((t) => [t, [] as WbMetadataOptionChoice[]])) as Record<
    WbMetadataType,
    WbMetadataOptionChoice[]
  >;
  for (const row of rows) {
    if (isWbMetadataType(row.type)) grouped[row.type].push(toChoice(row));
  }
  return grouped;
}

/** A Worldbuilding entry's currently selected options, grouped by type — includes inactive ones so the edit form doesn't silently drop a previously-selected option. */
export async function getWorldbuildingMetadataSelections(entryId: number): Promise<Record<WbMetadataType, WbMetadataOptionChoice[]>> {
  const rows = await db
    .select({ option: metadataOptions })
    .from(worldbuildingMetadataOptions)
    .innerJoin(metadataOptions, eq(worldbuildingMetadataOptions.metadataOptionId, metadataOptions.id))
    .where(eq(worldbuildingMetadataOptions.entryId, entryId))
    .orderBy(asc(metadataOptions.sortOrder), asc(metadataOptions.name), asc(metadataOptions.id));

  const grouped = Object.fromEntries(WB_METADATA_TYPES.map((t) => [t, [] as WbMetadataOptionChoice[]])) as Record<
    WbMetadataType,
    WbMetadataOptionChoice[]
  >;
  for (const { option } of rows) {
    if (isWbMetadataType(option.type)) grouped[option.type].push(toChoice(option));
  }
  return grouped;
}

export type ResolvedWbMetadataSelection = { ids: number[]; names: string[]; slugs: string[] };
export type ResolvedWbMetadataSelections = Record<WbMetadataType, ResolvedWbMetadataSelection>;

const NO_PREVIOUS_SELECTION: ReadonlySet<number> = new Set();

/**
 * Reads the three Worldbuilding metadata fields from submitted FormData.
 * `wb_entity_type` and `wb_category` are single-select (their field submits
 * at most one id; `wb_category` must submit exactly one — Category stays a
 * required field, matching its pre-Phase-2 behavior). `wb_chip` is
 * multi-select. Every id is verified to exist, belong to the expected
 * type, and (unless already selected before this edit) be active.
 */
export async function readWbMetadataSelections(
  formData: FormData,
  previouslySelectedIds: ReadonlySet<number> = NO_PREVIOUS_SELECTION
): Promise<ResolvedWbMetadataSelections> {
  const idsByType: Record<WbMetadataType, number[]> = { wb_entity_type: [], wb_category: [], wb_chip: [] };
  const allIds = new Set<number>();

  for (const type of WB_METADATA_TYPES) {
    const raw = formData.getAll(WB_METADATA_FIELD_NAMES[type]).filter((v) => v !== "");
    const seen = new Set<number>();
    for (const value of raw) {
      const n = Number(value);
      if (!Number.isInteger(n) || n <= 0) {
        throw new ValidationError(`${WB_METADATA_TYPE_LABELS[type]} selection is invalid.`);
      }
      seen.add(n);
    }
    idsByType[type] = [...seen];
    seen.forEach((id) => allIds.add(id));
  }

  if (idsByType.wb_category.length !== 1) {
    throw new ValidationError("Category is required.");
  }
  if (idsByType.wb_entity_type.length > 1) {
    throw new ValidationError("Entity Type must be a single selection.");
  }

  const byId = new Map<number, WbMetadataOptionRow>();
  if (allIds.size > 0) {
    const rows = await db.select().from(metadataOptions).where(inArray(metadataOptions.id, [...allIds]));
    for (const row of rows) byId.set(row.id, row);
  }

  const result = {} as ResolvedWbMetadataSelections;
  for (const type of WB_METADATA_TYPES) {
    const names: string[] = [];
    const slugs: string[] = [];
    for (const id of idsByType[type]) {
      const row = byId.get(id);
      if (!row) throw new ValidationError(`${WB_METADATA_TYPE_LABELS[type]} selection no longer exists.`);
      if (row.type !== type) throw new ValidationError(`${WB_METADATA_TYPE_LABELS[type]} selection is invalid.`);
      if (!row.isActive && !previouslySelectedIds.has(id)) {
        throw new ValidationError(`${WB_METADATA_TYPE_LABELS[type]} selection is no longer available.`);
      }
      names.push(row.name);
      slugs.push(row.slug);
    }
    result[type] = { ids: idsByType[type], names, slugs };
  }
  return result;
}

/** Every selected option ID across all three groups — the full junction-row set for one entry. */
export function allSelectedWbMetadataIds(selections: ResolvedWbMetadataSelections): number[] {
  return WB_METADATA_TYPES.flatMap((type) => selections[type].ids);
}

/** Real usage count for a delete-safety guard — how many Worldbuilding entries currently reference this option. */
export async function getWbMetadataUsageCount(id: number): Promise<number> {
  const rows = await db
    .select({ entryId: worldbuildingMetadataOptions.entryId })
    .from(worldbuildingMetadataOptions)
    .where(eq(worldbuildingMetadataOptions.metadataOptionId, id));
  return rows.length;
}
