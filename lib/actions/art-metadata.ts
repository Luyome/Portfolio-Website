"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { metadataOptions } from "@/db/schema";
import { requireAdminSession } from "@/lib/actions/guard";
import { slugify } from "@/lib/content-blocks";
import { num } from "@/lib/form-utils";
import { getArtMetadataUsageCount } from "@/lib/art-metadata";
import { ART_METADATA_TYPES, type ArtMetadataType } from "@/lib/art-metadata";
import { ValidationError, requiredId, requiredText, optionalText, oneOf, safeErrorMessage } from "@/lib/validation";

// Mirrors `lib/actions/worldbuilding-metadata.ts` exactly, scoped to 2D/3D's
// single shared `art_category` group — kept separate so Worldbuilding's and
// Portfolio's existing metadata managers are never touched.

type ActionState = { error?: string } | undefined;

function readType(formData: FormData): ArtMetadataType {
  return oneOf(formData.get("type"), ART_METADATA_TYPES, "Type");
}

function readFields(formData: FormData, type: ArtMetadataType) {
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

async function slugTaken(type: ArtMetadataType, slug: string, excludeId?: number): Promise<boolean> {
  const conditions = excludeId
    ? and(eq(metadataOptions.type, type), eq(metadataOptions.slug, slug), ne(metadataOptions.id, excludeId))
    : and(eq(metadataOptions.type, type), eq(metadataOptions.slug, slug));
  const rows = await db.select({ id: metadataOptions.id }).from(metadataOptions).where(conditions);
  return rows.length > 0;
}

function revalidateAll() {
  revalidatePath("/admin/art/metadata");
  revalidatePath("/2d");
  revalidatePath("/3d");
  revalidatePath("/admin/2d");
  revalidatePath("/admin/3d");
}

export async function createArtMetadataOption(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  let type: ArtMetadataType;
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
  redirect("/admin/art/metadata");
}

export async function updateArtMetadataOption(id: number, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const [existing] = await db.select().from(metadataOptions).where(eq(metadataOptions.id, id));
  if (!existing) return { error: "This category no longer exists." };
  const type = existing.type as ArtMetadataType;
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
  redirect("/admin/art/metadata");
}

export async function toggleArtMetadataOptionActive(formData: FormData) {
  await requireAdminSession();
  let id: number;
  try {
    id = requiredId(formData.get("id"), "Category");
  } catch {
    return;
  }
  const [existing] = await db.select({ isActive: metadataOptions.isActive }).from(metadataOptions).where(eq(metadataOptions.id, id));
  if (!existing) return;
  await db.update(metadataOptions).set({ isActive: !existing.isActive, updatedAt: new Date() }).where(eq(metadataOptions.id, id));
  revalidateAll();
}

export async function updateArtMetadataOptionSortOrder(formData: FormData) {
  await requireAdminSession();
  let id: number;
  try {
    id = requiredId(formData.get("id"), "Category");
  } catch {
    return;
  }
  await db.update(metadataOptions).set({ sortOrder: num(formData.get("sortOrder")), updatedAt: new Date() }).where(eq(metadataOptions.id, id));
  revalidateAll();
}

export async function deleteArtMetadataOption(formData: FormData) {
  await requireAdminSession();
  let id: number;
  try {
    id = requiredId(formData.get("id"), "Category");
  } catch {
    return;
  }
  const usage = await getArtMetadataUsageCount(id);
  if (usage > 0) return; // Safe no-op — a category still in use on a 2D or 3D item is never deleted.
  await db.delete(metadataOptions).where(eq(metadataOptions.id, id));
  revalidateAll();
}
