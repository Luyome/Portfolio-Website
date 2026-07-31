"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { sketches } from "@/db/schema";
import { num, str } from "@/lib/form-utils";
import { readStyles } from "@/lib/style-fields";

function readFields(formData: FormData) {
  const img = str(formData.get("img"));
  const colorHex = str(formData.get("colorHex"));
  return {
    year: num(formData.get("year")),
    label: str(formData.get("label")),
    desc: str(formData.get("desc")),
    img: img || null,
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
