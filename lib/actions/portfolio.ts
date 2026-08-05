"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { portfolioItems, portfolioImages, portfolioLinks, portfolioVideos } from "@/db/schema";
import { num, parseCsv, parseLinkFields } from "@/lib/form-utils";
import { readStyles } from "@/lib/style-fields";
import { requiredInt, requiredText, optionalUrl, requiredUrl, safeErrorMessage } from "@/lib/validation";

type ActionState = { error?: string } | undefined;

function readFields(formData: FormData) {
  return {
    title: requiredText(formData.get("title"), "Title"),
    cat: requiredText(formData.get("cat"), "Category"),
    year: requiredInt(formData.get("year"), "Year"),
    desc: requiredText(formData.get("desc"), "Description"),
    tags: parseCsv(formData.get("tags")),
    medium: requiredText(formData.get("medium"), "Medium"),
    software: requiredText(formData.get("software"), "Software"),
    link: optionalUrl(formData.get("link"), "External Link"),
    img: optionalUrl(formData.get("img"), "Image"),
    sortOrder: num(formData.get("sortOrder")),
    styles: readStyles(formData, ["title", "desc"]),
  };
}

function revalidateAll() {
  revalidatePath("/portfolio");
  revalidatePath("/archive");
  revalidatePath("/admin/portfolio");
}

export async function createPortfolioItem(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  let fields;
  try {
    fields = readFields(formData);
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  await db.insert(portfolioItems).values(fields);
  revalidateAll();
  redirect("/admin/portfolio");
}

export async function updatePortfolioItem(id: number, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  let fields;
  try {
    fields = readFields(formData);
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  await db.update(portfolioItems).set(fields).where(eq(portfolioItems.id, id));
  revalidateAll();
  redirect("/admin/portfolio");
}

export async function deletePortfolioItem(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(portfolioItems).where(eq(portfolioItems.id, id));
  revalidateAll();
}

export async function createPortfolioImage(portfolioId: number, formData: FormData) {
  let url: string;
  try {
    url = requiredUrl(formData.get("url"), "Image");
  } catch {
    return;
  }
  await db.insert(portfolioImages).values({ portfolioId, url, sortOrder: num(formData.get("sortOrder")) });
  revalidateAll();
}

export async function updatePortfolioImage(id: number, formData: FormData) {
  await db.update(portfolioImages).set({ sortOrder: num(formData.get("sortOrder")) }).where(eq(portfolioImages.id, id));
  revalidateAll();
}

export async function deletePortfolioImage(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(portfolioImages).where(eq(portfolioImages.id, id));
  revalidateAll();
}

export async function createPortfolioVideo(portfolioId: number, formData: FormData) {
  let url: string;
  try {
    url = requiredUrl(formData.get("url"), "Video");
  } catch {
    return;
  }
  await db.insert(portfolioVideos).values({ portfolioId, url, sortOrder: num(formData.get("sortOrder")) });
  revalidateAll();
}

export async function updatePortfolioVideo(id: number, formData: FormData) {
  await db.update(portfolioVideos).set({ sortOrder: num(formData.get("sortOrder")) }).where(eq(portfolioVideos.id, id));
  revalidateAll();
}

export async function deletePortfolioVideo(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(portfolioVideos).where(eq(portfolioVideos.id, id));
  revalidateAll();
}

export async function createPortfolioLink(portfolioId: number, formData: FormData) {
  let fields;
  try {
    fields = parseLinkFields(formData);
  } catch {
    return;
  }
  await db.insert(portfolioLinks).values({ portfolioId, ...fields });
  revalidateAll();
}

export async function updatePortfolioLink(id: number, formData: FormData) {
  let fields;
  try {
    fields = parseLinkFields(formData);
  } catch {
    return;
  }
  await db.update(portfolioLinks).set(fields).where(eq(portfolioLinks.id, id));
  revalidateAll();
}

export async function deletePortfolioLink(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(portfolioLinks).where(eq(portfolioLinks.id, id));
  revalidateAll();
}
