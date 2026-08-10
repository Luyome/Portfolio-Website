// One-time, idempotent data migration for the Sketches → 2D page rename:
// `page_appearance.page` is an exact-match string key (see `lib/page-appearance.ts`),
// so any existing row saved under the old `"sketches"` key must move to
// `"2d"` or it becomes orphaned (silently ignored by every `getPageAppearance("2d")`
// call). Safe to re-run — a no-op once the row no longer has the old key.
//
// Run: npx tsx scripts/rename-sketches-page-appearance.ts
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { pageAppearance } from "../db/schema";

async function main() {
  const result = await db
    .update(pageAppearance)
    .set({ page: "2d" })
    .where(eq(pageAppearance.page, "sketches"))
    .returning({ id: pageAppearance.id });
  console.log(`Updated ${result.length} page_appearance row(s) from "sketches" to "2d".`);
}

main();
