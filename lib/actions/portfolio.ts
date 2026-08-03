"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { portfolioItems, portfolioImages, portfolioLinks, portfolioVideos } from "@/db/schema";
import { num, parseCsv, str } from "@/lib/form-utils";
import { readStyles } from "@/lib/style-fields";

function readFields(formData: FormData) {
  return {
    title: str(formData.get("title")),
    cat: str(formData.get("cat")),
    year: num(formData.get("year")),
    desc: str(formData.get("desc")),
    tags: parseCsv(formData.get("tags")),
    medium: str(formData.get("medium")),
    software: str(formData.get("software")),
    link: str(formData.get("link")),
    img: str(formData.get("img")),
    sortOrder: num(formData.get("sortOrder")),
    styles: readStyles(formData, ["title", "desc"]),
  };
}

function revalidateAll() {
  revalidatePath("/portfolio");
  revalidatePath("/archive");
  revalidatePath("/admin/portfolio");
}

export async function createPortfolioItem(formData: FormData) {
  await db.insert(portfolioItems).values(readFields(formData));
  revalidateAll();
  redirect("/admin/portfolio");
}

export async function updatePortfolioItem(id: number, formData: FormData) {
  await db.update(portfolioItems).set(readFields(formData)).where(eq(portfolioItems.id, id));
  revalidateAll();
  redirect("/admin/portfolio");
}

export async function deletePortfolioItem(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(portfolioItems).where(eq(portfolioItems.id, id));
  revalidateAll();
}

export async function createPortfolioImage(portfolioId: number, formData: FormData) {
  const url = str(formData.get("url"));
  if (!url) return;
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
  const url = str(formData.get("url"));
  if (!url) return;
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

function readLinkFields(formData: FormData) {
  return {
    label: str(formData.get("label")),
    href: str(formData.get("href")),
    kind: str(formData.get("kind")) || "link",
    sortOrder: num(formData.get("sortOrder")),
  };
}

export async function createPortfolioLink(portfolioId: number, formData: FormData) {
  await db.insert(portfolioLinks).values({ portfolioId, ...readLinkFields(formData) });
  revalidateAll();
}

export async function updatePortfolioLink(id: number, formData: FormData) {
  await db.update(portfolioLinks).set(readLinkFields(formData)).where(eq(portfolioLinks.id, id));
  revalidateAll();
}

export async function deletePortfolioLink(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(portfolioLinks).where(eq(portfolioLinks.id, id));
  revalidateAll();
}
