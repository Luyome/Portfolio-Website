"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { metadataOptions } from "@/db/schema";
import { requireAdminSession } from "@/lib/actions/guard";
import { slugify } from "@/lib/content-blocks";
import { num } from "@/lib/form-utils";
import { getWbMetadataUsageCount } from "@/lib/worldbuilding-metadata";
import { WB_METADATA_TYPES, type WbMetadataType } from "@/lib/worldbuilding-metadata";
import { ValidationError, requiredId, requiredText, optionalText, oneOf, safeErrorMessage } from "@/lib/validation";

// Mirrors `lib/actions/metadata.ts` exactly, scoped to Worldbuilding's own
// three groups (`WB_METADATA_TYPES`) instead of Portfolio's four — kept
// separate so Portfolio's existing metadata manager is never touched.

type ActionState = { error?: string } | undefined;

function readType(formData: FormData): WbMetadataType {
  return oneOf(formData.get("type"), WB_METADATA_TYPES, "Type");
}

function readFields(formData: FormData, type: WbMetadataType) {
  const name = requiredText(formData.get("name"), "Name");
  const rawSlug = optionalText(formData.get("slug"));
  const slug = slugify(rawSlug || name);
  if (!slug) throw new ValidationError("Slug is invalid.");
  return {
    type,
    name,
    slug,
    sortOrder: num(formData.get("sortOrder")),
    isActive: formData.get("isActive") === "on",
  };
}

async function slugTaken(type: WbMetadataType, slug: string, excludeId?: number): Promise<boolean> {
  const conditions = excludeId
    ? and(eq(metadataOptions.type, type), eq(metadataOptions.slug, slug), ne(metadataOptions.id, excludeId))
    : and(eq(metadataOptions.type, type), eq(metadataOptions.slug, slug));
  const rows = await db.select({ id: metadataOptions.id }).from(metadataOptions).where(conditions);
  return rows.length > 0;
}

function revalidateAll() {
  revalidatePath("/admin/worldbuilding/metadata");
  revalidatePath("/worldbuilding");
  revalidatePath("/admin/worldbuilding");
}

export async function createWorldbuildingMetadataOption(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  let type: WbMetadataType;
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
  redirect(`/admin/worldbuilding/metadata?type=${type}`);
}

export async function updateWorldbuildingMetadataOption(id: number, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const [existing] = await db.select().from(metadataOptions).where(eq(metadataOptions.id, id));
  if (!existing) return { error: "This metadata option no longer exists." };
  const type = existing.type as WbMetadataType;
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
  redirect(`/admin/worldbuilding/metadata?type=${type}`);
}

export async function toggleWorldbuildingMetadataOptionActive(formData: FormData) {
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

export async function updateWorldbuildingMetadataOptionSortOrder(formData: FormData) {
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

export async function deleteWorldbuildingMetadataOption(formData: FormData) {
  await requireAdminSession();
  let id: number;
  try {
    id = requiredId(formData.get("id"), "Metadata option");
  } catch {
    return;
  }
  const usage = await getWbMetadataUsageCount(id);
  if (usage > 0) return; // Safe no-op — an option still in use is never deleted.
  await db.delete(metadataOptions).where(eq(metadataOptions.id, id));
  revalidateAll();
}
