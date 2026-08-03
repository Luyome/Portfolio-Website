"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { worldbuildingEntries, worldbuildingImages, worldbuildingLinks, worldbuildingVideos } from "@/db/schema";
import { num, parseCsv, str } from "@/lib/form-utils";
import { readStyles } from "@/lib/style-fields";

function readFields(formData: FormData) {
  return {
    year: num(formData.get("year")),
    date: str(formData.get("date")),
    cat: str(formData.get("cat")),
    title: str(formData.get("title")),
    excerpt: str(formData.get("excerpt")),
    chips: parseCsv(formData.get("chips")),
    img: str(formData.get("img")),
    sortOrder: num(formData.get("sortOrder")),
    styles: readStyles(formData, ["title", "excerpt"]),
  };
}

function revalidateAll() {
  revalidatePath("/worldbuilding");
  revalidatePath("/archive");
  revalidatePath("/admin/worldbuilding");
}

export async function createWorldbuildingEntry(formData: FormData) {
  await db.insert(worldbuildingEntries).values(readFields(formData));
  revalidateAll();
  redirect("/admin/worldbuilding");
}

export async function updateWorldbuildingEntry(id: number, formData: FormData) {
  await db.update(worldbuildingEntries).set(readFields(formData)).where(eq(worldbuildingEntries.id, id));
  revalidateAll();
  redirect("/admin/worldbuilding");
}

export async function deleteWorldbuildingEntry(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(worldbuildingEntries).where(eq(worldbuildingEntries.id, id));
  revalidateAll();
}

export async function createWorldbuildingImage(entryId: number, formData: FormData) {
  const url = str(formData.get("url"));
  if (!url) return;
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
  const url = str(formData.get("url"));
  if (!url) return;
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

function readLinkFields(formData: FormData) {
  return {
    label: str(formData.get("label")),
    href: str(formData.get("href")),
    kind: str(formData.get("kind")) || "link",
    sortOrder: num(formData.get("sortOrder")),
  };
}

export async function createWorldbuildingLink(entryId: number, formData: FormData) {
  await db.insert(worldbuildingLinks).values({ entryId, ...readLinkFields(formData) });
  revalidateAll();
}

export async function updateWorldbuildingLink(id: number, formData: FormData) {
  await db.update(worldbuildingLinks).set(readLinkFields(formData)).where(eq(worldbuildingLinks.id, id));
  revalidateAll();
}

export async function deleteWorldbuildingLink(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(worldbuildingLinks).where(eq(worldbuildingLinks.id, id));
  revalidateAll();
}
