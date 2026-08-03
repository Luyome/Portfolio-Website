"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { worldMaps, mapLocations } from "@/db/schema";
import { num, numOrNull, str } from "@/lib/form-utils";

function revalidateAll() {
  revalidatePath("/worldbuilding");
  revalidatePath("/admin/worldbuilding");
  revalidatePath("/admin/worldbuilding/maps");
}

function readMapFields(formData: FormData) {
  return {
    title: str(formData.get("title")),
    parentMapId: numOrNull(formData.get("parentMapId")),
    imageUrl: str(formData.get("imageUrl")),
    description: str(formData.get("description")),
    sortOrder: num(formData.get("sortOrder")),
  };
}

export async function createWorldMap(formData: FormData) {
  await db.insert(worldMaps).values(readMapFields(formData));
  revalidateAll();
  redirect("/admin/worldbuilding/maps");
}

export async function updateWorldMap(id: number, formData: FormData) {
  await db.update(worldMaps).set(readMapFields(formData)).where(eq(worldMaps.id, id));
  revalidateAll();
  redirect("/admin/worldbuilding/maps");
}

export async function deleteWorldMap(formData: FormData) {
  const id = num(formData.get("id"));
  await db.delete(worldMaps).where(eq(worldMaps.id, id));
  revalidateAll();
}

export async function createMapLocation(mapId: number, name: string, x: number, y: number) {
  const [row] = await db.insert(mapLocations).values({ mapId, name, x, y }).returning();
  revalidateAll();
  return row;
}

export async function updateMapLocationPosition(id: number, x: number, y: number) {
  await db.update(mapLocations).set({ x, y }).where(eq(mapLocations.id, id));
  revalidateAll();
}

export async function updateMapLocationInfo(
  id: number,
  fields: {
    name: string;
    info: string;
    img: string | null;
    pinType: "submap" | "lore";
    targetMapId: number | null;
    entryId: number | null;
    iconType: string;
  }
) {
  await db.update(mapLocations).set(fields).where(eq(mapLocations.id, id));
  revalidateAll();
}

export async function deleteMapLocation(id: number) {
  await db.delete(mapLocations).where(eq(mapLocations.id, id));
  revalidateAll();
}
