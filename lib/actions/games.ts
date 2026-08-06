"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { games, gameLinks, gameImages, gameVideos } from "@/db/schema";
import { requireAdminSession } from "@/lib/actions/guard";
import { num, parseCsv, parseLines, parseLinkFields, str } from "@/lib/form-utils";
import { readStyles } from "@/lib/style-fields";
import { requiredInt, requiredText, optionalUrl, requiredUrl, safeErrorMessage } from "@/lib/validation";

type ActionState = { error?: string } | undefined;

function readFields(formData: FormData) {
  return {
    title: requiredText(formData.get("title"), "Title"),
    status: requiredText(formData.get("status"), "Status"),
    engine: requiredText(formData.get("engine"), "Engine"),
    desc: requiredText(formData.get("desc"), "Description"),
    tags: parseCsv(formData.get("tags")),
    feats: parseLines(formData.get("feats")),
    target: requiredText(formData.get("target"), "Target"),
    img: optionalUrl(formData.get("img"), "Image"),
    year: requiredInt(formData.get("year"), "Year"),
    // Rich content block — left untouched (no trim/validation) so authored
    // markdown/structured content is never altered, per docs/02_CONTENT_ARCHITECTURE.md.
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

export async function createGame(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  let fields;
  try {
    fields = readFields(formData);
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  await db.insert(games).values(fields);
  revalidateAll();
  redirect("/admin/games");
}

export async function updateGame(id: number, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  let fields;
  try {
    fields = readFields(formData);
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  await db.update(games).set(fields).where(eq(games.id, id));
  revalidateAll();
  redirect("/admin/games");
}

export async function deleteGame(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(games).where(eq(games.id, id));
  revalidateAll();
}

export async function createGameLink(gameId: number, formData: FormData) {
  await requireAdminSession();
  let fields;
  try {
    fields = parseLinkFields(formData);
  } catch {
    return;
  }
  await db.insert(gameLinks).values({ gameId, ...fields });
  revalidateAll();
}

export async function updateGameLink(id: number, formData: FormData) {
  await requireAdminSession();
  let fields;
  try {
    fields = parseLinkFields(formData);
  } catch {
    return;
  }
  await db.update(gameLinks).set(fields).where(eq(gameLinks.id, id));
  revalidateAll();
}

export async function deleteGameLink(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(gameLinks).where(eq(gameLinks.id, id));
  revalidateAll();
}

export async function createGameImage(gameId: number, formData: FormData) {
  await requireAdminSession();
  let url: string;
  try {
    url = requiredUrl(formData.get("url"), "Image");
  } catch {
    return;
  }
  await db.insert(gameImages).values({ gameId, url, sortOrder: num(formData.get("sortOrder")) });
  revalidateAll();
}

export async function updateGameImage(id: number, formData: FormData) {
  await requireAdminSession();
  await db.update(gameImages).set({ sortOrder: num(formData.get("sortOrder")) }).where(eq(gameImages.id, id));
  revalidateAll();
}

export async function deleteGameImage(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(gameImages).where(eq(gameImages.id, id));
  revalidateAll();
}

export async function createGameVideo(gameId: number, formData: FormData) {
  await requireAdminSession();
  let url: string;
  try {
    url = requiredUrl(formData.get("url"), "Video");
  } catch {
    return;
  }
  await db.insert(gameVideos).values({ gameId, url, sortOrder: num(formData.get("sortOrder")) });
  revalidateAll();
}

export async function updateGameVideo(id: number, formData: FormData) {
  await requireAdminSession();
  await db.update(gameVideos).set({ sortOrder: num(formData.get("sortOrder")) }).where(eq(gameVideos.id, id));
  revalidateAll();
}

export async function deleteGameVideo(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(gameVideos).where(eq(gameVideos.id, id));
  revalidateAll();
}
