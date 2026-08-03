"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { games, gameLinks, gameImages, gameVideos } from "@/db/schema";
import { num, parseCsv, parseLines, str } from "@/lib/form-utils";
import { readStyles } from "@/lib/style-fields";

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
    contentOrder: num(formData.get("contentOrder")),
    sortOrder: num(formData.get("sortOrder")),
    styles: readStyles(formData, ["title", "status", "engine", "desc", "target"]),
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

function readLinkFields(formData: FormData) {
  return {
    label: str(formData.get("label")),
    href: str(formData.get("href")),
    kind: str(formData.get("kind")) || "link",
    sortOrder: num(formData.get("sortOrder")),
  };
}

export async function createGameLink(gameId: number, formData: FormData) {
  await db.insert(gameLinks).values({ gameId, ...readLinkFields(formData) });
  revalidateAll();
}

export async function updateGameLink(id: number, formData: FormData) {
  await db.update(gameLinks).set(readLinkFields(formData)).where(eq(gameLinks.id, id));
  revalidateAll();
}

export async function deleteGameLink(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(gameLinks).where(eq(gameLinks.id, id));
  revalidateAll();
}

export async function createGameImage(gameId: number, formData: FormData) {
  const url = str(formData.get("url"));
  if (!url) return;
  await db.insert(gameImages).values({ gameId, url, sortOrder: num(formData.get("sortOrder")) });
  revalidateAll();
}

export async function updateGameImage(id: number, formData: FormData) {
  await db.update(gameImages).set({ sortOrder: num(formData.get("sortOrder")) }).where(eq(gameImages.id, id));
  revalidateAll();
}

export async function deleteGameImage(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(gameImages).where(eq(gameImages.id, id));
  revalidateAll();
}

export async function createGameVideo(gameId: number, formData: FormData) {
  const url = str(formData.get("url"));
  if (!url) return;
  await db.insert(gameVideos).values({ gameId, url, sortOrder: num(formData.get("sortOrder")) });
  revalidateAll();
}

export async function updateGameVideo(id: number, formData: FormData) {
  await db.update(gameVideos).set({ sortOrder: num(formData.get("sortOrder")) }).where(eq(gameVideos.id, id));
  revalidateAll();
}

export async function deleteGameVideo(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(gameVideos).where(eq(gameVideos.id, id));
  revalidateAll();
}
