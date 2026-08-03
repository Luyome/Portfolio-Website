"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { models3d, model3dImages, model3dLinks, model3dVideos } from "@/db/schema";
import { num, str } from "@/lib/form-utils";
import { readStyles } from "@/lib/style-fields";

function readFields(formData: FormData) {
  const img = str(formData.get("img"));
  const link = str(formData.get("link"));
  const colorHex = str(formData.get("colorHex"));
  return {
    year: num(formData.get("year")),
    label: str(formData.get("label")),
    desc: str(formData.get("desc")),
    img: img || null,
    link: link || null,
    colorHex: colorHex || null,
    sortOrder: num(formData.get("sortOrder")),
    styles: readStyles(formData, ["label", "desc"]),
  };
}

function revalidateAll() {
  revalidatePath("/3d");
  revalidatePath("/archive");
  revalidatePath("/admin/3d");
}

export async function createModel3D(formData: FormData) {
  await db.insert(models3d).values(readFields(formData));
  revalidateAll();
  redirect("/admin/3d");
}

export async function updateModel3D(id: number, formData: FormData) {
  await db.update(models3d).set(readFields(formData)).where(eq(models3d.id, id));
  revalidateAll();
  redirect("/admin/3d");
}

export async function deleteModel3D(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(models3d).where(eq(models3d.id, id));
  revalidateAll();
}

export async function createModel3DImage(modelId: number, formData: FormData) {
  const url = str(formData.get("url"));
  if (!url) return;
  await db.insert(model3dImages).values({ modelId, url, sortOrder: num(formData.get("sortOrder")) });
  revalidateAll();
}

export async function updateModel3DImage(id: number, formData: FormData) {
  await db.update(model3dImages).set({ sortOrder: num(formData.get("sortOrder")) }).where(eq(model3dImages.id, id));
  revalidateAll();
}

export async function deleteModel3DImage(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(model3dImages).where(eq(model3dImages.id, id));
  revalidateAll();
}

export async function createModel3DVideo(modelId: number, formData: FormData) {
  const url = str(formData.get("url"));
  if (!url) return;
  await db.insert(model3dVideos).values({ modelId, url, sortOrder: num(formData.get("sortOrder")) });
  revalidateAll();
}

export async function updateModel3DVideo(id: number, formData: FormData) {
  await db.update(model3dVideos).set({ sortOrder: num(formData.get("sortOrder")) }).where(eq(model3dVideos.id, id));
  revalidateAll();
}

export async function deleteModel3DVideo(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(model3dVideos).where(eq(model3dVideos.id, id));
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

export async function createModel3DLink(modelId: number, formData: FormData) {
  await db.insert(model3dLinks).values({ modelId, ...readLinkFields(formData) });
  revalidateAll();
}

export async function updateModel3DLink(id: number, formData: FormData) {
  await db.update(model3dLinks).set(readLinkFields(formData)).where(eq(model3dLinks.id, id));
  revalidateAll();
}

export async function deleteModel3DLink(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(model3dLinks).where(eq(model3dLinks.id, id));
  revalidateAll();
}
