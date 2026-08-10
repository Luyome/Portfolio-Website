"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { DISPLAY_TEMPLATES, models3d, model3dImages, model3dLinks, model3dVideos, model3dMetadataOptions } from "@/db/schema";
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
  revalidatePath("/3d");
  revalidatePath("/archive");
  revalidatePath("/admin/3d");
}

export async function createModel3D(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  let fields;
  let category;
  try {
    fields = readFields(formData);
    category = await readArtCategorySelection(formData);
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  const [inserted] = await db.insert(models3d).values(fields).returning({ id: models3d.id });
  if (category) {
    try {
      await db.insert(model3dMetadataOptions).values({ modelId: inserted.id, metadataOptionId: category.id });
    } catch (err) {
      // Same compensating-delete strategy as Worldbuilding's create action —
      // the neon-http driver has no cross-statement transaction support.
      await db.delete(models3d).where(eq(models3d.id, inserted.id));
      throw err;
    }
  }
  revalidateAll();
  redirect("/admin/3d");
}

export async function updateModel3D(id: number, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const [existing] = await db
    .select({ metadataOptionId: model3dMetadataOptions.metadataOptionId })
    .from(model3dMetadataOptions)
    .where(eq(model3dMetadataOptions.modelId, id));

  let fields;
  let category;
  try {
    fields = readFields(formData);
    category = await readArtCategorySelection(formData, existing?.metadataOptionId ?? null);
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }

  const updateQuery = db.update(models3d).set(fields).where(eq(models3d.id, id));
  const removeQuery = () => db.delete(model3dMetadataOptions).where(eq(model3dMetadataOptions.modelId, id));
  const addQuery = () => db.insert(model3dMetadataOptions).values({ modelId: id, metadataOptionId: category!.id });

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
  redirect("/admin/3d");
}

export async function deleteModel3D(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(models3d).where(eq(models3d.id, id));
  revalidateAll();
}

export async function createModel3DImage(modelId: number, formData: FormData) {
  await requireAdminSession();
  let url: string;
  try {
    url = requiredUrl(formData.get("url"), "Image");
  } catch {
    return;
  }
  await db.insert(model3dImages).values({ modelId, url, caption: nullableText(formData.get("caption")), sortOrder: num(formData.get("sortOrder")) });
  revalidateAll();
}

export async function updateModel3DImage(id: number, formData: FormData) {
  await requireAdminSession();
  await db.update(model3dImages).set({ caption: nullableText(formData.get("caption")), sortOrder: num(formData.get("sortOrder")) }).where(eq(model3dImages.id, id));
  revalidateAll();
}

export async function deleteModel3DImage(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(model3dImages).where(eq(model3dImages.id, id));
  revalidateAll();
}

export async function createModel3DVideo(modelId: number, formData: FormData) {
  await requireAdminSession();
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
  await requireAdminSession();
  await db.update(model3dVideos).set({ sortOrder: num(formData.get("sortOrder")) }).where(eq(model3dVideos.id, id));
  revalidateAll();
}

export async function deleteModel3DVideo(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(model3dVideos).where(eq(model3dVideos.id, id));
  revalidateAll();
}

export async function createModel3DLink(modelId: number, formData: FormData) {
  await requireAdminSession();
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
  await requireAdminSession();
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
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(model3dLinks).where(eq(model3dLinks.id, id));
  revalidateAll();
}
