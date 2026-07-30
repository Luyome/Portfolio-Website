"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { worldbuildingEntries } from "@/db/schema";
import { num, parseCsv, str } from "@/lib/form-utils";

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
