"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { aboutContent, timelineEntries } from "@/db/schema";
import { num, parseCsv, parseLines, str } from "@/lib/form-utils";

function revalidateAll() {
  revalidatePath("/about");
  revalidatePath("/admin/about");
}

export async function updateAboutContent(formData: FormData) {
  const fields = {
    whoIAmParagraphs: parseLines(formData.get("whoIAmParagraphs")),
    tools: parseCsv(formData.get("tools")),
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
  await db.insert(timelineEntries).values({
    year: str(formData.get("year")),
    text: str(formData.get("text")),
    sortOrder: num(formData.get("sortOrder")),
  });
  revalidateAll();
}

export async function updateTimelineEntry(id: number, formData: FormData) {
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
  const id = num(formData.get("id"));
  await db.delete(timelineEntries).where(eq(timelineEntries.id, id));
  revalidateAll();
}
