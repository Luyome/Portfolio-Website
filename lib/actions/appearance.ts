"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { pageAppearance } from "@/db/schema";
import type { PageColorKey, PageColorMap, ThemedColor } from "@/db/schema";
import { str } from "@/lib/form-utils";
import type { PageKey } from "@/lib/page-appearance";

const PAGE_COLOR_KEYS: PageColorKey[] = ["bg", "bg2", "bg3", "text", "text2", "accent"];

function revalidateAll(page: PageKey) {
  revalidatePath(page === "home" ? "/" : `/${page}`);
  revalidatePath("/admin/appearance");
}

export async function updatePageAppearance(page: PageKey, formData: FormData) {
  const colors: PageColorMap = {};
  for (const key of PAGE_COLOR_KEYS) {
    const dark = str(formData.get(`${key}_dark`));
    const light = str(formData.get(`${key}_light`));
    const color: ThemedColor = {};
    if (dark) color.dark = dark;
    if (light) color.light = light;
    if (color.dark || color.light) colors[key] = color;
  }

  const [existing] = await db.select().from(pageAppearance).where(eq(pageAppearance.page, page));
  if (existing) {
    await db.update(pageAppearance).set({ colors, updatedAt: new Date() }).where(eq(pageAppearance.id, existing.id));
  } else {
    await db.insert(pageAppearance).values({ page, colors });
  }
  revalidateAll(page);
}
