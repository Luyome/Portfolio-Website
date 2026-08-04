"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { siteSettings, heroButtons, homeHeroSlides, homeShowcase } from "@/db/schema";
import { num, numOrNull, str } from "@/lib/form-utils";
import { readStyles } from "@/lib/style-fields";

const MAX_SHOWCASE_ITEMS = 12;

function revalidateAll() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/home");
}

export async function updateHomeSettings(formData: FormData) {
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
  await db.insert(heroButtons).values({
    label: str(formData.get("label")),
    href: str(formData.get("href")),
    style: str(formData.get("style")) || "primary",
    sortOrder: num(formData.get("sortOrder")),
  });
  revalidateAll();
}

export async function updateHeroButton(id: number, formData: FormData) {
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
  const id = num(formData.get("id"));
  await db.delete(heroButtons).where(eq(heroButtons.id, id));
  revalidateAll();
}

function optStr(value: FormDataEntryValue | null): string | null {
  const s = str(value);
  return s ? s : null;
}

export async function createHomeHeroSlide(formData: FormData) {
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
  const id = num(formData.get("id"));
  await db.delete(homeHeroSlides).where(eq(homeHeroSlides.id, id));
  revalidateAll();
}

export async function createHomeShowcaseItem(formData: FormData) {
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
  const id = num(formData.get("id"));
  await db.delete(homeShowcase).where(eq(homeShowcase.id, id));
  revalidateAll();
}
