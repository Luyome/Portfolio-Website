"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { cvContent } from "@/db/schema";
import { requireAdminSession } from "@/lib/actions/guard";
import { str } from "@/lib/form-utils";

export async function updateCvContent(formData: FormData) {
  await requireAdminSession();
  const fields = { img: str(formData.get("img")) || null };

  const [existing] = await db.select().from(cvContent).limit(1);
  if (existing) {
    await db.update(cvContent).set(fields).where(eq(cvContent.id, existing.id));
  } else {
    await db.insert(cvContent).values(fields);
  }
  revalidatePath("/cv");
  revalidatePath("/admin/cv");
}
