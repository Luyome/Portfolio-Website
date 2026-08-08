"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { linkLabelOptions } from "@/db/schema";
import { requireAdminSession } from "@/lib/actions/guard";
import { slugify } from "@/lib/content-blocks";
import { num } from "@/lib/form-utils";
import { requiredId, requiredText, optionalText, ValidationError, safeErrorMessage } from "@/lib/validation";

type ActionState = { error?: string } | undefined;

function readFields(formData: FormData) {
  const label = requiredText(formData.get("label"), "Label");
  const rawSlug = optionalText(formData.get("slug"));
  const slug = slugify(rawSlug || label);
  if (!slug) throw new ValidationError("Slug is invalid.");
  return {
    label,
    slug,
    sortOrder: num(formData.get("sortOrder")),
    isActive: formData.get("isActive") === "on",
  };
}

async function slugTaken(slug: string, excludeId?: number): Promise<boolean> {
  const conditions = excludeId
    ? and(eq(linkLabelOptions.slug, slug), ne(linkLabelOptions.id, excludeId))
    : eq(linkLabelOptions.slug, slug);
  const rows = await db.select({ id: linkLabelOptions.id }).from(linkLabelOptions).where(conditions);
  return rows.length > 0;
}

function revalidateAll() {
  revalidatePath("/admin/link-labels");
}

export async function createLinkLabelOption(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  let fields;
  try {
    fields = readFields(formData);
    if (await slugTaken(fields.slug)) throw new ValidationError("This slug is already used.");
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  await db.insert(linkLabelOptions).values(fields);
  revalidateAll();
  redirect("/admin/link-labels");
}

export async function updateLinkLabelOption(id: number, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  let fields;
  try {
    fields = readFields(formData);
    if (await slugTaken(fields.slug, id)) throw new ValidationError("This slug is already used.");
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  await db.update(linkLabelOptions).set(fields).where(eq(linkLabelOptions.id, id));
  revalidateAll();
  redirect("/admin/link-labels");
}

export async function toggleLinkLabelOptionActive(formData: FormData) {
  await requireAdminSession();
  let id: number;
  try {
    id = requiredId(formData.get("id"), "Link label option");
  } catch {
    return;
  }
  const [existing] = await db.select({ isActive: linkLabelOptions.isActive }).from(linkLabelOptions).where(eq(linkLabelOptions.id, id));
  if (!existing) return;
  await db.update(linkLabelOptions).set({ isActive: !existing.isActive }).where(eq(linkLabelOptions.id, id));
  revalidateAll();
}

export async function updateLinkLabelOptionSortOrder(formData: FormData) {
  await requireAdminSession();
  let id: number;
  try {
    id = requiredId(formData.get("id"), "Link label option");
  } catch {
    return;
  }
  await db.update(linkLabelOptions).set({ sortOrder: num(formData.get("sortOrder")) }).where(eq(linkLabelOptions.id, id));
  revalidateAll();
}

// Labels are plain text on every *_links table (no FK), so a Link Label
// option can always be safely deleted — deleting it never orphans or
// corrupts an already-saved link, it only removes it from the picker for
// future edits (that link's legacy label continues to render normally, per
// AddLinkForm/ExtraLinksPanel's "known legacy value" fallback option).
export async function deleteLinkLabelOption(formData: FormData) {
  await requireAdminSession();
  let id: number;
  try {
    id = requiredId(formData.get("id"), "Link label option");
  } catch {
    return;
  }
  await db.delete(linkLabelOptions).where(eq(linkLabelOptions.id, id));
  revalidateAll();
}
