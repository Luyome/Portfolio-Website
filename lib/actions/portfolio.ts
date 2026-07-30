"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { portfolioItems } from "@/db/schema";
import { num, parseCsv, str } from "@/lib/form-utils";

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
