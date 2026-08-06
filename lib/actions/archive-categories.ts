"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { archiveCategories } from "@/db/schema";
import { requireAdminSession } from "@/lib/actions/guard";
import { num, str } from "@/lib/form-utils";

function readFields(formData: FormData) {
  return {
    label: str(formData.get("label")),
    sortOrder: num(formData.get("sortOrder")),
  };
}

function revalidateAll() {
  revalidatePath("/archive");
  revalidatePath("/admin/archive");
}

export async function createArchiveCategory(formData: FormData) {
  await requireAdminSession();
  await db.insert(archiveCategories).values(readFields(formData));
  revalidateAll();
}

export async function updateArchiveCategory(id: number, formData: FormData) {
  await requireAdminSession();
  await db.update(archiveCategories).set(readFields(formData)).where(eq(archiveCategories.id, id));
  revalidateAll();
}

export async function deleteArchiveCategory(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(archiveCategories).where(eq(archiveCategories.id, id));
  revalidateAll();
}
