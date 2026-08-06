"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { services } from "@/db/schema";
import { requireAdminSession } from "@/lib/actions/guard";
import { num, str } from "@/lib/form-utils";

function readFields(formData: FormData) {
  return {
    icon: str(formData.get("icon")),
    title: str(formData.get("title")),
    desc: str(formData.get("desc")),
    sortOrder: num(formData.get("sortOrder")),
  };
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/admin/services");
}

export async function createService(formData: FormData) {
  await requireAdminSession();
  await db.insert(services).values(readFields(formData));
  revalidateAll();
  redirect("/admin/services");
}

export async function updateService(id: number, formData: FormData) {
  await requireAdminSession();
  await db.update(services).set(readFields(formData)).where(eq(services.id, id));
  revalidateAll();
  redirect("/admin/services");
}

export async function deleteService(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(services).where(eq(services.id, id));
  revalidateAll();
}
