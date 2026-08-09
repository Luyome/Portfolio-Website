"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { siteSettings, heroButtons, homeHeroSlides, homeShowcase } from "@/db/schema";
import { requireAdminSession } from "@/lib/actions/guard";
import {
  HOME_CONTENT_SECTIONS,
  HOME_CONTENT_TYPES,
  HOME_STAT_KEYS,
  replaceHomeContentSelections,
  replaceHomeSkills,
  setHomeCapabilities,
  setHomeMapPreview,
  setHomeStatVisibility,
  type HomeContentReference,
} from "@/lib/home-data";
import { oneOf, requiredId, safeErrorMessage } from "@/lib/validation";
import { num, numOrNull, str } from "@/lib/form-utils";
import { readStyles } from "@/lib/style-fields";

const MAX_SHOWCASE_ITEMS = 12;
export type HomeAdminActionState = { error?: string; success?: string } | undefined;

function revalidateAll() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/home");
}

export async function updateHomeSettings(formData: FormData) {
  await requireAdminSession();
  const fields = {
    heroEyebrow: str(formData.get("heroEyebrow")),
    heroJpLine: str(formData.get("heroJpLine")),
    heroBio: str(formData.get("heroBio")),
    homeBgImage: str(formData.get("homeBgImage")),
    homeBgOpacity: num(formData.get("homeBgOpacity")),
    homeBgWidth: numOrNull(formData.get("homeBgWidth")),
    homeBgHeight: numOrNull(formData.get("homeBgHeight")),
    contactBgImage: str(formData.get("contactBgImage")),
    contactBgOpacity: num(formData.get("contactBgOpacity")),
    narrativeImage: str(formData.get("narrativeImage")),
    narrativeText: str(formData.get("narrativeText")),
    styles: readStyles(formData, ["heroEyebrow", "heroJpLine", "heroBio"]),
  };

  const [existing] = await db.select().from(siteSettings).limit(1);
  if (existing) {
    await db.update(siteSettings).set(fields).where(eq(siteSettings.id, existing.id));
  } else {
    await db.insert(siteSettings).values({
      name: "",
      handle: "",
      jpLabel: "",
      footerLine: "",
      ...fields,
    });
  }
  revalidateAll();
}

export async function createHeroButton(formData: FormData) {
  await requireAdminSession();
  await db.insert(heroButtons).values({
    label: str(formData.get("label")),
    href: str(formData.get("href")),
    style: str(formData.get("style")) || "primary",
    sortOrder: num(formData.get("sortOrder")),
  });
  revalidateAll();
}

export async function updateHeroButton(id: number, formData: FormData) {
  await requireAdminSession();
  await db
    .update(heroButtons)
    .set({
      label: str(formData.get("label")),
      href: str(formData.get("href")),
      style: str(formData.get("style")) || "primary",
      sortOrder: num(formData.get("sortOrder")),
    })
    .where(eq(heroButtons.id, id));
  revalidateAll();
}

export async function deleteHeroButton(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(heroButtons).where(eq(heroButtons.id, id));
  revalidateAll();
}

function optStr(value: FormDataEntryValue | null): string | null {
  const s = str(value);
  return s ? s : null;
}

export async function createHomeHeroSlide(formData: FormData) {
  await requireAdminSession();
  await db.insert(homeHeroSlides).values({
    url: str(formData.get("url")),
    title: optStr(formData.get("title")),
    subtitle: optStr(formData.get("subtitle")),
    linkUrl: optStr(formData.get("linkUrl")),
    sortOrder: num(formData.get("sortOrder")),
  });
  revalidateAll();
}

export async function updateHomeHeroSlide(id: number, formData: FormData) {
  await requireAdminSession();
  await db
    .update(homeHeroSlides)
    .set({
      title: optStr(formData.get("title")),
      subtitle: optStr(formData.get("subtitle")),
      linkUrl: optStr(formData.get("linkUrl")),
      sortOrder: num(formData.get("sortOrder")),
    })
    .where(eq(homeHeroSlides.id, id));
  revalidateAll();
}

export async function deleteHomeHeroSlide(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(homeHeroSlides).where(eq(homeHeroSlides.id, id));
  revalidateAll();
}

export async function createHomeShowcaseItem(formData: FormData) {
  await requireAdminSession();
  const existing = await db.select().from(homeShowcase);
  if (existing.length >= MAX_SHOWCASE_ITEMS) {
    return;
  }
  await db.insert(homeShowcase).values({
    url: str(formData.get("url")),
    title: str(formData.get("title")),
    linkHref: str(formData.get("linkHref")),
    sortOrder: num(formData.get("sortOrder")),
  });
  revalidateAll();
}

export async function updateHomeShowcaseItem(id: number, formData: FormData) {
  await requireAdminSession();
  await db
    .update(homeShowcase)
    .set({
      title: str(formData.get("title")),
      linkHref: str(formData.get("linkHref")),
      sortOrder: num(formData.get("sortOrder")),
    })
    .where(eq(homeShowcase.id, id));
  revalidateAll();
}

export async function deleteHomeShowcaseItem(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(homeShowcase).where(eq(homeShowcase.id, id));
  revalidateAll();
}

function jsonArray(formData: FormData, name: string): unknown[] {
  const value = formData.get(name);
  if (typeof value !== "string") throw new Error("Invalid form payload");
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) throw new Error("Invalid form payload");
  return parsed;
}

export async function saveHomeContentSelections(
  _state: HomeAdminActionState,
  formData: FormData
): Promise<HomeAdminActionState> {
  await requireAdminSession();
  try {
    const section = oneOf(formData.get("section"), HOME_CONTENT_SECTIONS, "Home section");
    const refs = jsonArray(formData, "items").map((item): HomeContentReference => {
      if (!item || typeof item !== "object") throw new Error("Invalid form payload");
      const row = item as Record<string, unknown>;
      return {
        type: oneOf(typeof row.type === "string" ? row.type : null, HOME_CONTENT_TYPES, "Content type"),
        id: requiredId(typeof row.id === "number" ? row.id : null, "Content"),
      };
    });
    await replaceHomeContentSelections(section, refs);
    revalidateAll();
    return { success: "Selection saved." };
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
}

export async function saveHomeSkills(_state: HomeAdminActionState, formData: FormData): Promise<HomeAdminActionState> {
  await requireAdminSession();
  try {
    const skills = jsonArray(formData, "items").map((item) => {
      if (!item || typeof item !== "object") throw new Error("Invalid form payload");
      const row = item as Record<string, unknown>;
      return { label: typeof row.label === "string" ? row.label : "", isVisible: row.isVisible === true };
    });
    await replaceHomeSkills(skills);
    revalidateAll();
    return { success: "Home Skills saved." };
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
}

export async function saveHomeCapabilities(_state: HomeAdminActionState, formData: FormData): Promise<HomeAdminActionState> {
  await requireAdminSession();
  try {
    const ids = jsonArray(formData, "items").map((id) => requiredId(typeof id === "number" ? id : null, "Capability"));
    await setHomeCapabilities(ids);
    revalidateAll();
    return { success: "Capabilities saved." };
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
}

export async function saveHomeStats(_state: HomeAdminActionState, formData: FormData): Promise<HomeAdminActionState> {
  await requireAdminSession();
  try {
    const visible = new Set(jsonArray(formData, "items").map((key) => oneOf(typeof key === "string" ? key : null, HOME_STAT_KEYS, "Production stat")));
    await Promise.all(HOME_STAT_KEYS.map((key) => setHomeStatVisibility(key, visible.has(key))));
    revalidateAll();
    return { success: "Production Stats saved." };
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
}

// Home always shows every pin on the selected map's hierarchy — it is not a
// separately curated map model (see resolveHomeMapPreview, lib/home-data.ts).
// A per-pin selector used to exist here (home_map_preview_pins) but its
// selections were never read by the actual Home render, only ever written —
// dead, misleading UI that implied curation mattered when it didn't. Only
// "which map" and "visible on Home" are real settings.
export async function saveHomeMapPreview(_state: HomeAdminActionState, formData: FormData): Promise<HomeAdminActionState> {
  await requireAdminSession();
  try {
    const rawMapId = formData.get("mapId");
    const mapId = typeof rawMapId === "string" && rawMapId ? requiredId(rawMapId, "Map") : null;
    const isVisible = formData.get("isVisible") === "on";
    await setHomeMapPreview(mapId, isVisible);
    revalidateAll();
    return { success: "Map Preview saved." };
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
}
