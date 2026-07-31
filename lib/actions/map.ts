"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { mapSettings, mapLocations } from "@/db/schema";
import { str } from "@/lib/form-utils";

function revalidateAll() {
  revalidatePath("/map");
  revalidatePath("/admin/map");
}

export async function updateMapImage(formData: FormData) {
  const imageUrl = str(formData.get("imageUrl"));
  const existing = await db.select().from(mapSettings).limit(1);
  if (existing.length === 0) {
    await db.insert(mapSettings).values({ imageUrl });
  } else {
    await db.update(mapSettings).set({ imageUrl }).where(eq(mapSettings.id, existing[0].id));
  }
  revalidateAll();
}

export async function createMapLocation(name: string, x: number, y: number) {
  const [row] = await db.insert(mapLocations).values({ name, x, y }).returning();
  revalidateAll();
  return row;
}

export async function updateMapLocationPosition(id: number, x: number, y: number) {
  await db.update(mapLocations).set({ x, y }).where(eq(mapLocations.id, id));
  revalidateAll();
}

export async function updateMapLocationInfo(
  id: number,
  fields: { name: string; info: string; img: string | null }
) {
  await db.update(mapLocations).set(fields).where(eq(mapLocations.id, id));
  revalidateAll();
}

export async function deleteMapLocation(id: number) {
  await db.delete(mapLocations).where(eq(mapLocations.id, id));
  revalidateAll();
}
