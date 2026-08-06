"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { metadataOptions } from "@/db/schema";
import { requireAdminSession } from "@/lib/actions/guard";
import { slugify } from "@/lib/content-blocks";
import { num } from "@/lib/form-utils";
import { getMetadataUsageCount } from "@/lib/metadata-usage";
import { METADATA_TYPES, type MetadataType } from "@/lib/metadata";
import {
  ValidationError,
  requiredId,
  requiredText,
  optionalText,
  nullableUrl,
  nullableHttpUrl,
  oneOf,
  safeErrorMessage,
} from "@/lib/validation";

type ActionState = { error?: string } | undefined;

function readType(formData: FormData): MetadataType {
  return oneOf(formData.get("type"), METADATA_TYPES, "Type");
}

function readFields(formData: FormData, type: MetadataType) {
  const name = requiredText(formData.get("name"), "Name");
  const rawSlug = optionalText(formData.get("slug"));
  const slug = slugify(rawSlug || name);
  if (!slug) throw new ValidationError("Slug is invalid.");
  const isSoftware = type === "software";
  return {
    type,
    name,
    slug,
    sortOrder: num(formData.get("sortOrder")),
    isActive: formData.get("isActive") === "on",
    // Software-only fields — every other type stores these as null, never a
    // stale leftover value from before an (unsupported) type change.
    iconUrl: isSoftware ? nullableUrl(formData.get("iconUrl"), "Icon") : null,
    websiteUrl: isSoftware ? nullableHttpUrl(formData.get("websiteUrl"), "Website URL") : null,
  };
}

/** True if another option in the same type group already uses this slug. */
async function slugTaken(type: MetadataType, slug: string, excludeId?: number): Promise<boolean> {
  const conditions = excludeId
    ? and(eq(metadataOptions.type, type), eq(metadataOptions.slug, slug), ne(metadataOptions.id, excludeId))
    : and(eq(metadataOptions.type, type), eq(metadataOptions.slug, slug));
  const rows = await db.select({ id: metadataOptions.id }).from(metadataOptions).where(conditions);
  return rows.length > 0;
}

function revalidateAll() {
  revalidatePath("/admin/metadata");
}

export async function createMetadataOption(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  let type: MetadataType;
  let fields: ReturnType<typeof readFields>;
  try {
    type = readType(formData);
    fields = readFields(formData, type);
    if (await slugTaken(type, fields.slug)) {
      throw new ValidationError("This slug is already used in this group.");
    }
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  await db.insert(metadataOptions).values(fields);
  revalidateAll();
  redirect(`/admin/metadata?type=${type}`);
}

export async function updateMetadataOption(id: number, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const [existing] = await db.select().from(metadataOptions).where(eq(metadataOptions.id, id));
  if (!existing) return { error: "This metadata option no longer exists." };
  // The type an option belongs to is never accepted from the edit form —
  // always re-derived from the existing row, so a tampered/stale hidden
  // field can never move an option between groups.
  const type = existing.type as MetadataType;
  let fields: ReturnType<typeof readFields>;
  try {
    fields = readFields(formData, type);
    if (fields.slug !== existing.slug && (await slugTaken(type, fields.slug, id))) {
      throw new ValidationError("This slug is already used in this group.");
    }
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  await db.update(metadataOptions).set({ ...fields, updatedAt: new Date() }).where(eq(metadataOptions.id, id));
  revalidateAll();
  redirect(`/admin/metadata?type=${type}`);
}

export async function toggleMetadataOptionActive(formData: FormData) {
  await requireAdminSession();
  let id: number;
  try {
    id = requiredId(formData.get("id"), "Metadata option");
  } catch {
    return;
  }
  const [existing] = await db.select({ isActive: metadataOptions.isActive }).from(metadataOptions).where(eq(metadataOptions.id, id));
  if (!existing) return;
  await db.update(metadataOptions).set({ isActive: !existing.isActive, updatedAt: new Date() }).where(eq(metadataOptions.id, id));
  revalidateAll();
}

export async function updateMetadataOptionSortOrder(formData: FormData) {
  await requireAdminSession();
  let id: number;
  try {
    id = requiredId(formData.get("id"), "Metadata option");
  } catch {
    return;
  }
  await db.update(metadataOptions).set({ sortOrder: num(formData.get("sortOrder")), updatedAt: new Date() }).where(eq(metadataOptions.id, id));
  revalidateAll();
}

export async function deleteMetadataOption(formData: FormData) {
  await requireAdminSession();
  let id: number;
  try {
    id = requiredId(formData.get("id"), "Metadata option");
  } catch {
    return;
  }
  const [existing] = await db.select({ type: metadataOptions.type }).from(metadataOptions).where(eq(metadataOptions.id, id));
  if (!existing) return;
  const usage = await getMetadataUsageCount(id, existing.type as MetadataType);
  if (usage > 0) return; // Safe no-op — an option still in use is never deleted.
  await db.delete(metadataOptions).where(eq(metadataOptions.id, id));
  revalidateAll();
}
