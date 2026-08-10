// Seeds the shared 2D/3D category taxonomy (`metadataOptions` rows with
// `type: "art_category"`). Mirrors `scripts/backfill-worldbuilding-metadata.ts`'s
// pattern. "All" is intentionally not seeded — it's synthetic, pinned
// client-side by the grid's filter row, same as `yearOptions()`'s "all".
// Safe to re-run: `onConflictDoNothing()` on the (type, slug) unique index.
import "dotenv/config";
import { db } from "../db";
import { metadataOptions } from "../db/schema";

const SEED = [
  { name: "Character", slug: "character", sortOrder: 0 },
  { name: "Environment", slug: "environment", sortOrder: 1 },
  { name: "Sketches", slug: "sketches", sortOrder: 2 },
  { name: "Prop/Item", slug: "prop-item", sortOrder: 3 },
];

async function main() {
  for (const s of SEED) {
    await db
      .insert(metadataOptions)
      .values({ type: "art_category", ...s, isActive: true })
      .onConflictDoNothing();
  }
  console.log(`Seeded ${SEED.length} art_category option(s).`);
}

main();
