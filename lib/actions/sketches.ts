"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { DISPLAY_TEMPLATES, sketches, sketchImages, sketchLinks, sketchVideos, sketchMetadataOptions } from "@/db/schema";
import { requireAdminSession } from "@/lib/actions/guard";
import { num, parseLinkFields } from "@/lib/form-utils";
import { readStyles } from "@/lib/style-fields";
import { readArtCategorySelection } from "@/lib/art-metadata";
import { requiredDate, requiredText, optionalText, nullableText, nullableUrl, oneOf, requiredUrl, safeErrorMessage } from "@/lib/validation";

type ActionState = { error?: string } | undefined;

function readFields(formData: FormData) {
  const { iso: date, year } = requiredDate(formData.get("date"), "Date");
  return {
    year,
    date,
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
  revalidatePath("/2d");
  revalidatePath("/archive");
  revalidatePath("/admin/2d");
}

export async function createSketch(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  let fields;
  let category;
  try {
    fields = readFields(formData);
    category = await readArtCategorySelection(formData);
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  const [inserted] = await db.insert(sketches).values(fields).returning({ id: sketches.id });
  if (category) {
    try {
      await db.insert(sketchMetadataOptions).values({ sketchId: inserted.id, metadataOptionId: category.id });
    } catch (err) {
      // Same compensating-delete strategy as Worldbuilding's create action —
      // the neon-http driver has no cross-statement transaction support.
      await db.delete(sketches).where(eq(sketches.id, inserted.id));
      throw err;
    }
  }
  revalidateAll();
  redirect("/admin/2d");
}

export async function updateSketch(id: number, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const [existing] = await db
    .select({ metadataOptionId: sketchMetadataOptions.metadataOptionId })
    .from(sketchMetadataOptions)
    .where(eq(sketchMetadataOptions.sketchId, id));

  let fields;
  let category;
  try {
    fields = readFields(formData);
    category = await readArtCategorySelection(formData, existing?.metadataOptionId ?? null);
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }

  const updateQuery = db.update(sketches).set(fields).where(eq(sketches.id, id));
  const removeQuery = () => db.delete(sketchMetadataOptions).where(eq(sketchMetadataOptions.sketchId, id));
  const addQuery = () => db.insert(sketchMetadataOptions).values({ sketchId: id, metadataOptionId: category!.id });

  if (existing && (!category || category.id !== existing.metadataOptionId)) {
    if (category) {
      await db.batch([updateQuery, removeQuery(), addQuery()]);
    } else {
      await db.batch([updateQuery, removeQuery()]);
    }
  } else if (!existing && category) {
    await db.batch([updateQuery, addQuery()]);
  } else {
    await db.batch([updateQuery]);
  }

  revalidateAll();
  redirect("/admin/2d");
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
