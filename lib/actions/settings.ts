"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { str } from "@/lib/form-utils";

export async function updateSiteSettings(formData: FormData) {
  const fields = {
    name: str(formData.get("name")),
    handle: str(formData.get("handle")),
    jpLabel: str(formData.get("jpLabel")),
    footerLine: str(formData.get("footerLine")),
    contactEmail: str(formData.get("contactEmail")),
    twitterUrl: str(formData.get("twitterUrl")),
    artstationUrl: str(formData.get("artstationUrl")),
    linkedinUrl: str(formData.get("linkedinUrl")),
    instagramUrl: str(formData.get("instagramUrl")),
  };

  const [existing] = await db.select().from(siteSettings).limit(1);
  if (existing) {
    await db.update(siteSettings).set(fields).where(eq(siteSettings.id, existing.id));
  } else {
    await db.insert(siteSettings).values(fields);
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}
