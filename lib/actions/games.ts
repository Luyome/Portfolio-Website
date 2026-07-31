"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { games } from "@/db/schema";
import { num, parseCsv, parseLines, str } from "@/lib/form-utils";

function readFields(formData: FormData) {
  return {
    title: str(formData.get("title")),
    status: str(formData.get("status")),
    engine: str(formData.get("engine")),
    desc: str(formData.get("desc")),
    tags: parseCsv(formData.get("tags")),
    feats: parseLines(formData.get("feats")),
    target: str(formData.get("target")),
    img: str(formData.get("img")),
    year: num(formData.get("year")),
    content: str(formData.get("content")),
    sortOrder: num(formData.get("sortOrder")),
  };
}

function revalidateAll() {
  revalidatePath("/games");
  revalidatePath("/admin/games");
}

export async function createGame(formData: FormData) {
  await db.insert(games).values(readFields(formData));
  revalidateAll();
  redirect("/admin/games");
}

export async function updateGame(id: number, formData: FormData) {
  await db.update(games).set(readFields(formData)).where(eq(games.id, id));
  revalidateAll();
  redirect("/admin/games");
}

export async function deleteGame(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(games).where(eq(games.id, id));
  revalidateAll();
}
