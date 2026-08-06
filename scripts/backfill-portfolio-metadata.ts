// Portfolio legacy metadata backfill (Task 2.10) — one-time, idempotent,
// additive-only migration of existing Portfolio `medium`/`software`/`tags`
// values into `metadata_options` + `portfolio_metadata_options`.
//
// Idempotent: re-running finds every option and junction row it already
// created (matched by `(type, slug)` and `(portfolioId, metadataOptionId)`)
// and inserts nothing new for them.
// Non-destructive: never updates or deletes `portfolio_items`, never
// touches the legacy `medium`/`software`/`tags` columns, never deletes an
// existing `metadata_options` row.
// Scoped: only reads/writes Portfolio's own legacy metadata and its
// junction table — no other content type, no default/starter taxonomy.
//
// Real production data was read (read-only) before writing this script to
// confirm the separator each legacy field actually uses:
//   - `medium`: always a single freeform value in production data (no
//     comma/slash/semicolon seen in any row) — never split.
//   - `software`: every row already uses ", " to join multiple tools
//     (e.g. "Maya, ZBrush, Marvelous Designer") — split on comma.
//   - `tags`: already a native Postgres array column — no split needed,
//     each element is one tag.
//   - Subject Matter has no legacy column at all — never invented here.
//
// Run: npx tsx scripts/backfill-portfolio-metadata.ts
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { portfolioItems, metadataOptions, portfolioMetadataOptions } from "../db/schema";
import { slugify } from "../lib/content-blocks";
import { METADATA_TYPES, type MetadataType } from "../lib/metadata";

type PortfolioRow = typeof portfolioItems.$inferSelect;
type MetadataOptionRow = typeof metadataOptions.$inferSelect;

/** Trim + collapse repeated internal whitespace — never alters meaningful content. */
function normalize(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/** Legacy values this Portfolio item contributes to one metadata type — empty for Subject Matter (no legacy source). */
function legacyValuesForType(type: MetadataType, item: PortfolioRow): string[] {
  if (type === "medium") {
    const value = normalize(item.medium);
    return value ? [value] : [];
  }
  if (type === "software") {
    return item.software.split(",").map(normalize).filter(Boolean);
  }
  if (type === "tag") {
    return item.tags.map(normalize).filter(Boolean);
  }
  return [];
}

function optionKey(type: string, slug: string): string {
  return `${type}::${slug}`;
}

async function main() {
  console.log("Portfolio metadata backfill — starting (idempotent, additive only, Portfolio-only).");

  const items = await db.select().from(portfolioItems);
  const existingOptions = await db.select().from(metadataOptions);
  const optionsBySlug = new Map<string, MetadataOptionRow>(
    existingOptions.map((o) => [optionKey(o.type, o.slug), o])
  );

  let optionsCreated = 0;
  let junctionsCreated = 0;
  let itemsLinked = 0;

  for (const item of items) {
    const linkIds = new Set<number>();

    for (const type of METADATA_TYPES) {
      for (const rawValue of legacyValuesForType(type, item)) {
        const slug = slugify(rawValue);
        if (!slug) continue; // e.g. a value with no alphanumeric characters — nothing meaningful to link
        const key = optionKey(type, slug);
        let option = optionsBySlug.get(key);
        if (!option) {
          const [inserted] = await db
            .insert(metadataOptions)
            .values({ type, name: rawValue, slug, sortOrder: 0, isActive: true })
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
      .select({ metadataOptionId: portfolioMetadataOptions.metadataOptionId })
      .from(portfolioMetadataOptions)
      .where(eq(portfolioMetadataOptions.portfolioId, item.id));
    const existingJunctionIds = new Set(existingJunctions.map((r) => r.metadataOptionId));
    const toInsert = [...linkIds].filter((id) => !existingJunctionIds.has(id));

    if (toInsert.length > 0) {
      await db
        .insert(portfolioMetadataOptions)
        .values(toInsert.map((metadataOptionId) => ({ portfolioId: item.id, metadataOptionId })));
      junctionsCreated += toInsert.length;
      itemsLinked++;
    }
  }

  console.log(`Portfolio items processed: ${items.length}`);
  console.log(`Metadata options created this run: ${optionsCreated}`);
  console.log(`Junction rows created this run: ${junctionsCreated} (across ${itemsLinked} item(s))`);
  console.log("Done — safe to re-run; already-linked items and existing options are skipped.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  });
