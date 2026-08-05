"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { models3d, model3dImages, model3dLinks, model3dVideos } from "@/db/schema";
import { num, parseLinkFields } from "@/lib/form-utils";
import { readStyles } from "@/lib/style-fields";
import { requiredInt, requiredText, optionalText, nullableText, nullableUrl, requiredUrl, safeErrorMessage } from "@/lib/validation";

type ActionState = { error?: string } | undefined;

function readFields(formData: FormData) {
  return {
    year: requiredInt(formData.get("year"), "Year"),
    label: requiredText(formData.get("label"), "Label"),
    desc: optionalText(formData.get("desc")),
    img: nullableUrl(formData.get("img"), "Image"),
    link: nullableUrl(formData.get("link"), "Link"),
    colorHex: nullableText(formData.get("colorHex")),
    sortOrder: num(formData.get("sortOrder")),
    styles: readStyles(formData, ["label", "desc"]),
  };
}

function revalidateAll() {
  revalidatePath("/3d");
  revalidatePath("/archive");
  revalidatePath("/admin/3d");
}

export async function createModel3D(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  let fields;
  try {
    fields = readFields(formData);
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  await db.insert(models3d).values(fields);
  revalidateAll();
  redirect("/admin/3d");
}

export async function updateModel3D(id: number, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  let fields;
  try {
    fields = readFields(formData);
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  await db.update(models3d).set(fields).where(eq(models3d.id, id));
  revalidateAll();
  redirect("/admin/3d");
}

export async function deleteModel3D(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(models3d).where(eq(models3d.id, id));
  revalidateAll();
}

export async function createModel3DImage(modelId: number, formData: FormData) {
  let url: string;
  try {
    url = requiredUrl(formData.get("url"), "Image");
  } catch {
    return;
  }
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
  let url: string;
  try {
    url = requiredUrl(formData.get("url"), "Video");
  } catch {
    return;
  }
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

export async function createModel3DLink(modelId: number, formData: FormData) {
  let fields;
  try {
    fields = parseLinkFields(formData);
  } catch {
    return;
  }
  await db.insert(model3dLinks).values({ modelId, ...fields });
  revalidateAll();
}

export async function updateModel3DLink(id: number, formData: FormData) {
  let fields;
  try {
    fields = parseLinkFields(formData);
  } catch {
    return;
  }
  await db.update(model3dLinks).set(fields).where(eq(model3dLinks.id, id));
  revalidateAll();
}

export async function deleteModel3DLink(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(model3dLinks).where(eq(model3dLinks.id, id));
  revalidateAll();
}
