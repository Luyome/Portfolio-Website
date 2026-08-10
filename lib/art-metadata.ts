import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { metadataOptions, sketchMetadataOptions, model3dMetadataOptions } from "@/db/schema";
import { ValidationError } from "@/lib/validation";
import { ART_METADATA_TYPES, ART_METADATA_TYPE_LABELS, ART_METADATA_FIELD_NAME, isArtMetadataType, type ArtMetadataType } from "@/lib/art-metadata-shared";

// 2D (Sketches) and 3D's own controlled-metadata layer — mirrors
// `lib/worldbuilding-metadata.ts`'s shape and conventions, scoped to the
// single shared `art_category` group both content types pick from. Kept as
// a separate module so Worldbuilding's/Portfolio's existing metadata
// systems are never touched by this.
//
// Client-safe constants/labels/types live in `lib/art-metadata-shared.ts`
// (no `db` import there) — re-exported here so server-side imports of this
// module keep the same shape as `lib/worldbuilding-metadata.ts`.
export { ART_METADATA_TYPES, ART_METADATA_TYPE_LABELS, ART_METADATA_FIELD_NAME, isArtMetadataType, type ArtMetadataType };

export type ArtMetadataOptionRow = typeof metadataOptions.$inferSelect;

/** One selectable option, shaped for the form/filter. */
export type ArtMetadataOptionChoice = { id: number; name: string; slug: string; isActive: boolean };

function toChoice(row: ArtMetadataOptionRow): ArtMetadataOptionChoice {
  return { id: row.id, name: row.name, slug: row.slug, isActive: row.isActive };
}

/** Every active category — the shared list both the 2D and 3D pages/forms draw from, sorted for consistent display. */
export async function getActiveArtMetadataOptions(): Promise<ArtMetadataOptionChoice[]> {
  const rows = await db
    .select()
    .from(metadataOptions)
    .where(eq(metadataOptions.type, "art_category"))
    .orderBy(asc(metadataOptions.sortOrder), asc(metadataOptions.name), asc(metadataOptions.id));
  return rows.filter((r) => r.isActive).map(toChoice);
}

/** A sketch's currently selected category — includes inactive so the edit form doesn't silently drop a previously-selected option. */
export async function getSketchCategorySelection(sketchId: number): Promise<ArtMetadataOptionChoice | undefined> {
  const [row] = await db
    .select({ option: metadataOptions })
    .from(sketchMetadataOptions)
    .innerJoin(metadataOptions, eq(sketchMetadataOptions.metadataOptionId, metadataOptions.id))
    .where(eq(sketchMetadataOptions.sketchId, sketchId));
  return row ? toChoice(row.option) : undefined;
}

/** A 3D model's currently selected category — same inactive-inclusion rule as above. */
export async function getModel3DCategorySelection(modelId: number): Promise<ArtMetadataOptionChoice | undefined> {
  const [row] = await db
    .select({ option: metadataOptions })
    .from(model3dMetadataOptions)
    .innerJoin(metadataOptions, eq(model3dMetadataOptions.metadataOptionId, metadataOptions.id))
    .where(eq(model3dMetadataOptions.modelId, modelId));
  return row ? toChoice(row.option) : undefined;
}

/**
 * Reads the single, optional `artCategoryOptionId` field from submitted
 * FormData. Returns `null` when left blank — a category assignment is not
 * required (existing sketches/3D items pre-date this taxonomy). The
 * submitted id is verified to exist, belong to `art_category`, and (unless
 * already selected before this edit) be active.
 */
export async function readArtCategorySelection(
  formData: FormData,
  previouslySelectedId?: number | null
): Promise<ArtMetadataOptionChoice | null> {
  const raw = formData.get(ART_METADATA_FIELD_NAME);
  if (raw === null || raw === "") return null;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError(`${ART_METADATA_TYPE_LABELS.art_category} selection is invalid.`);
  }
  const [row] = await db.select().from(metadataOptions).where(eq(metadataOptions.id, id));
  if (!row || row.type !== "art_category") {
    throw new ValidationError(`${ART_METADATA_TYPE_LABELS.art_category} selection no longer exists.`);
  }
  if (!row.isActive && row.id !== previouslySelectedId) {
    throw new ValidationError(`${ART_METADATA_TYPE_LABELS.art_category} selection is no longer available.`);
  }
  return toChoice(row);
}

/** Real usage count for a delete-safety guard — summed across both 2D and 3D, since the taxonomy is shared. */
export async function getArtMetadataUsageCount(id: number): Promise<number> {
  const [sketchRows, modelRows] = await Promise.all([
    db.select({ sketchId: sketchMetadataOptions.sketchId }).from(sketchMetadataOptions).where(eq(sketchMetadataOptions.metadataOptionId, id)),
    db.select({ modelId: model3dMetadataOptions.modelId }).from(model3dMetadataOptions).where(eq(model3dMetadataOptions.metadataOptionId, id)),
  ]);
  return sketchRows.length + modelRows.length;
}
