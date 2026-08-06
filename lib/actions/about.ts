"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { aboutContent, timelineEntries } from "@/db/schema";
import { requireAdminSession } from "@/lib/actions/guard";
import { num, parseCsv, parseLines, str } from "@/lib/form-utils";
import { readStyles } from "@/lib/style-fields";

function revalidateAll() {
  revalidatePath("/about");
  revalidatePath("/admin/about");
}

export async function updateAboutContent(formData: FormData) {
  await requireAdminSession();
  const fields = {
    whoIAmParagraphs: parseLines(formData.get("whoIAmParagraphs")),
    tools: parseCsv(formData.get("tools")),
    styles: readStyles(formData, ["whoIAmParagraphs"]),
  };

  const [existing] = await db.select().from(aboutContent).limit(1);
  if (existing) {
    await db.update(aboutContent).set(fields).where(eq(aboutContent.id, existing.id));
  } else {
    await db.insert(aboutContent).values(fields);
  }
  revalidateAll();
}

export async function createTimelineEntry(formData: FormData) {
  await requireAdminSession();
  await db.insert(timelineEntries).values({
    year: str(formData.get("year")),
    text: str(formData.get("text")),
    sortOrder: num(formData.get("sortOrder")),
  });
  revalidateAll();
}

export async function updateTimelineEntry(id: number, formData: FormData) {
  await requireAdminSession();
  await db
    .update(timelineEntries)
    .set({
      year: str(formData.get("year")),
      text: str(formData.get("text")),
      sortOrder: num(formData.get("sortOrder")),
    })
    .where(eq(timelineEntries.id, id));
  revalidateAll();
}

export async function deleteTimelineEntry(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(timelineEntries).where(eq(timelineEntries.id, id));
  revalidateAll();
}
