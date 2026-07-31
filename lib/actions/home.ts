"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { siteSettings, heroButtons } from "@/db/schema";
import { num, numOrNull, str } from "@/lib/form-utils";
import { readStyles } from "@/lib/style-fields";

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
