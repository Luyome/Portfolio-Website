"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { worldbuildingEntries, worldbuildingImages, worldbuildingLinks, worldbuildingRelationships, worldbuildingVideos } from "@/db/schema";
import { requireAdminSession } from "@/lib/actions/guard";
import { num, parseCsv, parseLinkFields, str } from "@/lib/form-utils";
import { readStyles } from "@/lib/style-fields";
import { requiredId, requiredInt, requiredText, optionalUrl, oneOf, requiredUrl, safeErrorMessage, ValidationError } from "@/lib/validation";
import { CATEGORIES, WORLDBUILDING_ENTITY_TYPES } from "@/types/worldbuilding";

type ActionState = { error?: string } | undefined;

function readFields(formData: FormData) {
  return {
    year: requiredInt(formData.get("year"), "Year"),
    date: requiredText(formData.get("date"), "Display Date"),
    cat: oneOf(formData.get("cat"), CATEGORIES, "Category"),
    title: requiredText(formData.get("title"), "Title"),
    excerpt: requiredText(formData.get("excerpt"), "Excerpt"),
    chips: parseCsv(formData.get("chips")),
    img: optionalUrl(formData.get("img"), "Image"),
    // Rich content block — left untouched (no trim/validation) so authored
    // markdown/structured content is never altered, per docs/02_CONTENT_ARCHITECTURE.md.
    content: str(formData.get("content")),
    contentOrder: num(formData.get("contentOrder")),
    sortOrder: num(formData.get("sortOrder")),
    styles: readStyles(formData, ["title", "excerpt"]),
  };
}

// Task 4.7 owns the assignment UI. Existing edits do not post this field, so
// omitting it preserves a type that was previously assigned.
function readOptionalEntityType(formData: FormData) {
  if (!formData.has("entityType")) return undefined;
  const value = String(formData.get("entityType") ?? "").trim();
  return value ? oneOf(value, WORLDBUILDING_ENTITY_TYPES, "Entity type") : null;
}

function revalidateAll() {
  revalidatePath("/worldbuilding");
  revalidatePath("/archive");
  revalidatePath("/admin/worldbuilding");
}

export async function createWorldbuildingEntry(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  let fields;
  let entityType;
  try {
    fields = readFields(formData);
    entityType = readOptionalEntityType(formData);
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  await db.insert(worldbuildingEntries).values({ ...fields, entityType: entityType ?? null });
  revalidateAll();
  redirect("/admin/worldbuilding");
}

export async function updateWorldbuildingEntry(id: number, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  let fields;
  let entityType;
  try {
    fields = readFields(formData);
    entityType = readOptionalEntityType(formData);
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  await db.update(worldbuildingEntries).set({ ...fields, ...(entityType === undefined ? {} : { entityType }) }).where(eq(worldbuildingEntries.id, id));
  revalidateAll();
  redirect("/admin/worldbuilding");
}

export async function deleteWorldbuildingEntry(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(worldbuildingEntries).where(eq(worldbuildingEntries.id, id));
  revalidateAll();
}

/** Minimal mutation boundary for the Task 4.7 relationship manager. */
export async function createWorldbuildingRelationship(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  try {
    const sourceEntryId = requiredId(formData.get("sourceEntryId"), "Source entity");
    const targetEntryId = requiredId(formData.get("targetEntryId"), "Target entity");
    if (sourceEntryId === targetEntryId) throw new ValidationError("An entity cannot relate to itself.");
    const relationshipType = requiredText(formData.get("relationshipType"), "Relationship type");
    if (relationshipType.length > 100) throw new ValidationError("Relationship type must be 100 characters or fewer.");
    await db.insert(worldbuildingRelationships).values({
      sourceEntryId,
      targetEntryId,
      relationshipType,
      sortOrder: num(formData.get("sortOrder")),
    }).onConflictDoNothing();
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  revalidateAll();
}

export async function deleteWorldbuildingRelationship(formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  try {
    const id = requiredId(formData.get("id"), "Relationship");
    await db.delete(worldbuildingRelationships).where(eq(worldbuildingRelationships.id, id));
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  revalidateAll();
}

export async function createWorldbuildingImage(entryId: number, formData: FormData) {
  await requireAdminSession();
  let url: string;
  try {
    url = requiredUrl(formData.get("url"), "Image");
  } catch {
    return;
  }
  await db.insert(worldbuildingImages).values({ entryId, url, sortOrder: num(formData.get("sortOrder")) });
  revalidateAll();
}

export async function updateWorldbuildingImage(id: number, formData: FormData) {
  await requireAdminSession();
  await db.update(worldbuildingImages).set({ sortOrder: num(formData.get("sortOrder")) }).where(eq(worldbuildingImages.id, id));
  revalidateAll();
}

export async function deleteWorldbuildingImage(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(worldbuildingImages).where(eq(worldbuildingImages.id, id));
  revalidateAll();
}

export async function createWorldbuildingVideo(entryId: number, formData: FormData) {
  await requireAdminSession();
  let url: string;
  try {
    url = requiredUrl(formData.get("url"), "Video");
  } catch {
    return;
  }
  await db.insert(worldbuildingVideos).values({ entryId, url, sortOrder: num(formData.get("sortOrder")) });
  revalidateAll();
}

export async function updateWorldbuildingVideo(id: number, formData: FormData) {
  await requireAdminSession();
  await db.update(worldbuildingVideos).set({ sortOrder: num(formData.get("sortOrder")) }).where(eq(worldbuildingVideos.id, id));
  revalidateAll();
}

export async function deleteWorldbuildingVideo(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(worldbuildingVideos).where(eq(worldbuildingVideos.id, id));
  revalidateAll();
}

export async function createWorldbuildingLink(entryId: number, formData: FormData) {
  await requireAdminSession();
  let fields;
  try {
    fields = parseLinkFields(formData);
  } catch {
    return;
  }
  await db.insert(worldbuildingLinks).values({ entryId, ...fields });
  revalidateAll();
}

export async function updateWorldbuildingLink(id: number, formData: FormData) {
  await requireAdminSession();
  let fields;
  try {
    fields = parseLinkFields(formData);
  } catch {
    return;
  }
  await db.update(worldbuildingLinks).set(fields).where(eq(worldbuildingLinks.id, id));
  revalidateAll();
}

export async function deleteWorldbuildingLink(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(worldbuildingLinks).where(eq(worldbuildingLinks.id, id));
  revalidateAll();
}
