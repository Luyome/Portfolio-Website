import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { portfolioMetadataOptions } from "@/db/schema";
import type { MetadataType } from "@/lib/metadata";

// Real usage count for a single metadata option — how many existing content
// records currently reference it. Portfolio (Task 2.10) is the only content
// type with a metadata junction table today, so this counts
// `portfolio_metadata_options` rows; a `metadataOptionId` uniquely
// identifies an option regardless of `type`, so no extra type filter is
// needed here (the caller already knows which type it asked about). This
// is the single point the Admin Metadata Manager's Usage column and the
// delete-safety guard (`lib/actions/metadata.ts`) both call through — when
// another content type (Games, Worldbuilding, ...) adopts controlled
// metadata, add its own junction table's `COUNT` here the same way.
export async function getMetadataUsageCount(id: number, type: MetadataType): Promise<number> {
  void type;
  const [row] = await db
    .select({ value: count() })
    .from(portfolioMetadataOptions)
    .where(eq(portfolioMetadataOptions.metadataOptionId, id));
  return row?.value ?? 0;
}
