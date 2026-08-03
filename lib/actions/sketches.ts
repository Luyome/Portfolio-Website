"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { sketches, sketchImages, sketchLinks, sketchVideos } from "@/db/schema";
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
  revalidatePath("/sketches");
  revalidatePath("/archive");
  revalidatePath("/admin/sketches");
}

export async function createSketch(formData: FormData) {
  await db.insert(sketches).values(readFields(formData));
  revalidateAll();
  redirect("/admin/sketches");
}

export async function updateSketch(id: number, formData: FormData) {
  await db.update(sketches).set(readFields(formData)).where(eq(sketches.id, id));
  revalidateAll();
  redirect("/admin/sketches");
}

export async function deleteSketch(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(sketches).where(eq(sketches.id, id));
  revalidateAll();
}

export async function createSketchImage(sketchId: number, formData: FormData) {
  const url = str(formData.get("url"));
  if (!url) return;
  await db.insert(sketchImages).values({ sketchId, url, sortOrder: num(formData.get("sortOrder")) });
  revalidateAll();
}

export async function updateSketchImage(id: number, formData: FormData) {
  await db.update(sketchImages).set({ sortOrder: num(formData.get("sortOrder")) }).where(eq(sketchImages.id, id));
  revalidateAll();
}

export async function deleteSketchImage(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(sketchImages).where(eq(sketchImages.id, id));
  revalidateAll();
}

export async function createSketchVideo(sketchId: number, formData: FormData) {
  const url = str(formData.get("url"));
  if (!url) return;
  await db.insert(sketchVideos).values({ sketchId, url, sortOrder: num(formData.get("sortOrder")) });
  revalidateAll();
}

export async function updateSketchVideo(id: number, formData: FormData) {
  await db.update(sketchVideos).set({ sortOrder: num(formData.get("sortOrder")) }).where(eq(sketchVideos.id, id));
  revalidateAll();
}

export async function deleteSketchVideo(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(sketchVideos).where(eq(sketchVideos.id, id));
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

export async function createSketchLink(sketchId: number, formData: FormData) {
  await db.insert(sketchLinks).values({ sketchId, ...readLinkFields(formData) });
  revalidateAll();
}

export async function updateSketchLink(id: number, formData: FormData) {
  await db.update(sketchLinks).set(readLinkFields(formData)).where(eq(sketchLinks.id, id));
  revalidateAll();
}

export async function deleteSketchLink(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(sketchLinks).where(eq(sketchLinks.id, id));
  revalidateAll();
}
