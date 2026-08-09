// Worldbuilding legacy metadata backfill (Phase 2) — one-time, idempotent,
// additive-only migration of existing `entityType`/`cat`/`chips` values into
// `metadata_options` + `worldbuilding_metadata_options`, mirroring
// `scripts/backfill-portfolio-metadata.ts` exactly for Worldbuilding's own
// three groups (`wb_entity_type`, `wb_category`, `wb_chip`).
//
// Idempotent: re-running finds every option and junction row it already
// created (matched by `(type, slug)` and `(entryId, metadataOptionId)`) and
// inserts nothing new for them.
// Non-destructive: never updates or deletes `worldbuilding_entries`, never
// touches the legacy `entityType`/`cat`/`chips` columns, never deletes an
// existing `metadata_options` row.
//
// Run: npx tsx scripts/backfill-worldbuilding-metadata.ts
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { worldbuildingEntries, metadataOptions, worldbuildingMetadataOptions } from "../db/schema";
import { slugify } from "../lib/content-blocks";
import { ENTITY_TYPE_LABELS, type WorldbuildingEntityType } from "../types/worldbuilding";
import { WB_METADATA_TYPES, type WbMetadataType } from "../lib/worldbuilding-metadata";

type WorldbuildingRow = typeof worldbuildingEntries.$inferSelect;
type MetadataOptionRow = typeof metadataOptions.$inferSelect;

function normalize(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/** [name, explicitSlug | null] pairs this entry contributes to one Worldbuilding metadata group. `entityType` is already a slug, so its name is resolved through the same label map the public site uses (falling back to the slug itself for a custom value not in that map). */
function legacyValuesForType(type: WbMetadataType, item: WorldbuildingRow): { name: string; slug: string | null }[] {
  if (type === "wb_entity_type") {
    const value = item.entityType ? normalize(item.entityType) : "";
    if (!value) return [];
    const label = ENTITY_TYPE_LABELS[value as WorldbuildingEntityType] ?? value;
    return [{ name: label, slug: value }];
  }
  if (type === "wb_category") {
    const value = normalize(item.cat);
    return value ? [{ name: value, slug: null }] : [];
  }
  if (type === "wb_chip") {
    return item.chips.map(normalize).filter(Boolean).map((name) => ({ name, slug: null }));
  }
  return [];
}

function optionKey(type: string, slug: string): string {
  return `${type}::${slug}`;
}

async function main() {
  console.log("Worldbuilding metadata backfill — starting (idempotent, additive only, Worldbuilding-only).");

  const items = await db.select().from(worldbuildingEntries);
  const existingOptions = await db.select().from(metadataOptions);
  const optionsBySlug = new Map<string, MetadataOptionRow>(
    existingOptions.map((o) => [optionKey(o.type, o.slug), o])
  );

  let optionsCreated = 0;
  let junctionsCreated = 0;
  let itemsLinked = 0;

  for (const item of items) {
    const linkIds = new Set<number>();

    for (const type of WB_METADATA_TYPES) {
      for (const { name, slug: explicitSlug } of legacyValuesForType(type, item)) {
        const slug = explicitSlug ?? slugify(name);
        if (!slug) continue;
        const key = optionKey(type, slug);
        let option = optionsBySlug.get(key);
        if (!option) {
          const [inserted] = await db
            .insert(metadataOptions)
            .values({ type, name, slug, sortOrder: 0, isActive: true })
            .returning();
          option = inserted;
          optionsBySlug.set(key, option);
          optionsCreated++;
        }
        linkIds.add(option.id);
      }
    }

    if (linkIds.size === 0) continue;

    const existingJunctions = await db
      .select({ metadataOptionId: worldbuildingMetadataOptions.metadataOptionId })
      .from(worldbuildingMetadataOptions)
      .where(eq(worldbuildingMetadataOptions.entryId, item.id));
    const existingJunctionIds = new Set(existingJunctions.map((r) => r.metadataOptionId));
    const toInsert = [...linkIds].filter((id) => !existingJunctionIds.has(id));

    if (toInsert.length > 0) {
      await db
        .insert(worldbuildingMetadataOptions)
        .values(toInsert.map((metadataOptionId) => ({ entryId: item.id, metadataOptionId })));
      junctionsCreated += toInsert.length;
      itemsLinked++;
    }
  }

  console.log(`Worldbuilding entries processed: ${items.length}`);
  console.log(`Metadata options created this run: ${optionsCreated}`);
  console.log(`Junction rows created this run: ${junctionsCreated} (across ${itemsLinked} entr${itemsLinked === 1 ? "y" : "ies"})`);
  console.log("Done — safe to re-run; already-linked entries and existing options are skipped.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  });
