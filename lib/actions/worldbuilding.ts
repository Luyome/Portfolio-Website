"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { worldbuildingEntries, worldbuildingImages, worldbuildingLinks, worldbuildingVideos } from "@/db/schema";
import { num, parseCsv, parseLinkFields, str } from "@/lib/form-utils";
import { readStyles } from "@/lib/style-fields";
import { requiredInt, requiredText, optionalUrl, oneOf, requiredUrl, safeErrorMessage } from "@/lib/validation";
import { CATEGORIES } from "@/types/worldbuilding";

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

function revalidateAll() {
  revalidatePath("/worldbuilding");
  revalidatePath("/archive");
  revalidatePath("/admin/worldbuilding");
}

export async function createWorldbuildingEntry(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  let fields;
  try {
    fields = readFields(formData);
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  await db.insert(worldbuildingEntries).values(fields);
  revalidateAll();
  redirect("/admin/worldbuilding");
}

export async function updateWorldbuildingEntry(id: number, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  let fields;
  try {
    fields = readFields(formData);
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  await db.update(worldbuildingEntries).set(fields).where(eq(worldbuildingEntries.id, id));
  revalidateAll();
  redirect("/admin/worldbuilding");
}

export async function deleteWorldbuildingEntry(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(worldbuildingEntries).where(eq(worldbuildingEntries.id, id));
  revalidateAll();
}

export async function createWorldbuildingImage(entryId: number, formData: FormData) {
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
  await db.update(worldbuildingImages).set({ sortOrder: num(formData.get("sortOrder")) }).where(eq(worldbuildingImages.id, id));
  revalidateAll();
}

export async function deleteWorldbuildingImage(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(worldbuildingImages).where(eq(worldbuildingImages.id, id));
  revalidateAll();
}

export async function createWorldbuildingVideo(entryId: number, formData: FormData) {
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
  await db.update(worldbuildingVideos).set({ sortOrder: num(formData.get("sortOrder")) }).where(eq(worldbuildingVideos.id, id));
  revalidateAll();
}

export async function deleteWorldbuildingVideo(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(worldbuildingVideos).where(eq(worldbuildingVideos.id, id));
  revalidateAll();
}

export async function createWorldbuildingLink(entryId: number, formData: FormData) {
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
  const id = num(formData.get("id"));
  await db.delete(worldbuildingLinks).where(eq(worldbuildingLinks.id, id));
  revalidateAll();
}
