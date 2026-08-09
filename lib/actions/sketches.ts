"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { DISPLAY_TEMPLATES, sketches, sketchImages, sketchLinks, sketchVideos } from "@/db/schema";
import { requireAdminSession } from "@/lib/actions/guard";
import { num, parseLinkFields } from "@/lib/form-utils";
import { readStyles } from "@/lib/style-fields";
import { requiredInt, requiredText, optionalText, nullableText, nullableUrl, oneOf, requiredUrl, safeErrorMessage } from "@/lib/validation";

type ActionState = { error?: string } | undefined;

function readFields(formData: FormData) {
  return {
    year: requiredInt(formData.get("year"), "Year"),
    label: requiredText(formData.get("label"), "Label"),
    desc: optionalText(formData.get("desc")),
    img: nullableUrl(formData.get("img"), "Image"),
    link: nullableUrl(formData.get("link"), "Link"),
    colorHex: nullableText(formData.get("colorHex")),
    displayTemplate: oneOf(formData.get("displayTemplate") || "gallery", DISPLAY_TEMPLATES, "Display Template"),
    sortOrder: num(formData.get("sortOrder")),
    styles: readStyles(formData, ["label", "desc"]),
  };
}

function revalidateAll() {
  revalidatePath("/sketches");
  revalidatePath("/archive");
  revalidatePath("/admin/sketches");
}

export async function createSketch(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  let fields;
  try {
    fields = readFields(formData);
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  await db.insert(sketches).values(fields);
  revalidateAll();
  redirect("/admin/sketches");
}

export async function updateSketch(id: number, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  let fields;
  try {
    fields = readFields(formData);
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  await db.update(sketches).set(fields).where(eq(sketches.id, id));
  revalidateAll();
  redirect("/admin/sketches");
}

export async function deleteSketch(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(sketches).where(eq(sketches.id, id));
  revalidateAll();
}

export async function createSketchImage(sketchId: number, formData: FormData) {
  await requireAdminSession();
  let url: string;
  try {
    url = requiredUrl(formData.get("url"), "Image");
  } catch {
    return;
  }
  await db.insert(sketchImages).values({ sketchId, url, caption: nullableText(formData.get("caption")), sortOrder: num(formData.get("sortOrder")) });
  revalidateAll();
}

export async function updateSketchImage(id: number, formData: FormData) {
  await requireAdminSession();
  await db.update(sketchImages).set({ caption: nullableText(formData.get("caption")), sortOrder: num(formData.get("sortOrder")) }).where(eq(sketchImages.id, id));
  revalidateAll();
}

export async function deleteSketchImage(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(sketchImages).where(eq(sketchImages.id, id));
  revalidateAll();
}

export async function createSketchVideo(sketchId: number, formData: FormData) {
  await requireAdminSession();
  let url: string;
  try {
    url = requiredUrl(formData.get("url"), "Video");
  } catch {
    return;
  }
  await db.insert(sketchVideos).values({ sketchId, url, sortOrder: num(formData.get("sortOrder")) });
  revalidateAll();
}

export async function updateSketchVideo(id: number, formData: FormData) {
  await requireAdminSession();
  await db.update(sketchVideos).set({ sortOrder: num(formData.get("sortOrder")) }).where(eq(sketchVideos.id, id));
  revalidateAll();
}

export async function deleteSketchVideo(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(sketchVideos).where(eq(sketchVideos.id, id));
  revalidateAll();
}

export async function createSketchLink(sketchId: number, formData: FormData) {
  await requireAdminSession();
  let fields;
  try {
    fields = parseLinkFields(formData);
  } catch {
    return;
  }
  await db.insert(sketchLinks).values({ sketchId, ...fields });
  revalidateAll();
}

export async function updateSketchLink(id: number, formData: FormData) {
  await requireAdminSession();
  let fields;
  try {
    fields = parseLinkFields(formData);
  } catch {
    return;
  }
  await db.update(sketchLinks).set(fields).where(eq(sketchLinks.id, id));
  revalidateAll();
}

export async function deleteSketchLink(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(sketchLinks).where(eq(sketchLinks.id, id));
  revalidateAll();
}
