import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { linkLabelOptions } from "@/db/schema";

export type LinkLabelOptionLite = { id: number; label: string };

/** Active, ordered Link Label options for the shared Links picker (Task 4.7). */
export async function getActiveLinkLabelOptions(): Promise<LinkLabelOptionLite[]> {
  return db
    .select({ id: linkLabelOptions.id, label: linkLabelOptions.label })
    .from(linkLabelOptions)
    .where(eq(linkLabelOptions.isActive, true))
    .orderBy(asc(linkLabelOptions.sortOrder), asc(linkLabelOptions.label), asc(linkLabelOptions.id));
}
