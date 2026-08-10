"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { DISPLAY_TEMPLATES, worldbuildingEntries, worldbuildingImages, worldbuildingLinks, worldbuildingMetadataOptions, worldbuildingRelationships, worldbuildingVideos } from "@/db/schema";
import { requireAdminSession } from "@/lib/actions/guard";
import { num, parseLinkFields, str } from "@/lib/form-utils";
import { allSelectedWbMetadataIds, readWbMetadataSelections, type ResolvedWbMetadataSelections } from "@/lib/worldbuilding-metadata";
import { readStyles } from "@/lib/style-fields";
import { requiredId, requiredDate, requiredText, nullableText, oneOf, optionalUrl, requiredUrl, safeErrorMessage, ValidationError } from "@/lib/validation";

type ActionState = { error?: string } | undefined;

// `cat`/`entityType`/`chips` stay a compatibility mirror of the selected
// metadata option names (`cat`, `chips`) / slug (`entityType` — the public
// site compares this as a stable key, not a display label) until every
// consumer reads through the junction table directly instead — mirrors
// Portfolio's own legacy dual-write strategy (`lib/actions/portfolio.ts`).
function readFields(formData: FormData, selections: ResolvedWbMetadataSelections) {
  const { iso: date, year } = requiredDate(formData.get("date"), "Date");
  return {
    year,
    date,
    cat: selections.wb_category.names[0] ?? "",
    entityType: selections.wb_entity_type.slugs[0] ?? null,
    title: requiredText(formData.get("title"), "Title"),
    excerpt: requiredText(formData.get("excerpt"), "Excerpt"),
    chips: selections.wb_chip.names,
    img: optionalUrl(formData.get("img"), "Image"),
    displayTemplate: oneOf(formData.get("displayTemplate") || "gallery", DISPLAY_TEMPLATES, "Display Template"),
    // Rich content block — left untouched (no trim/validation) so authored
    // markdown/structured content is never altered, per docs/02_CONTENT_ARCHITECTURE.md.
    content: str(formData.get("content")),
    contentOrder: num(formData.get("contentOrder")),
    sortOrder: num(formData.get("sortOrder")),
    styles: readStyles(formData, ["title", "excerpt"]),
  };
}

function revalidateAll() {
  revalidatePath("/worldbuilding");
  revalidatePath("/archive");
  revalidatePath("/admin/worldbuilding");
}

export async function createWorldbuildingEntry(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  let fields;
  let selections;
  try {
    selections = await readWbMetadataSelections(formData);
    fields = readFields(formData, selections);
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  const metadataIds = allSelectedWbMetadataIds(selections);

  const [inserted] = await db.insert(worldbuildingEntries).values(fields).returning({ id: worldbuildingEntries.id });
  if (metadataIds.length > 0) {
    try {
      await db.insert(worldbuildingMetadataOptions).values(metadataIds.map((metadataOptionId) => ({ entryId: inserted.id, metadataOptionId })));
    } catch (err) {
      // Same compensating-delete strategy as Portfolio's create action — the
      // neon-http driver has no cross-statement transaction support, so if
      // the junction insert fails, delete the just-created entry (its
      // `onDelete: cascade` FK takes any partial junction rows with it)
      // rather than leave an entry with no/half metadata relation behind.
      await db.delete(worldbuildingEntries).where(eq(worldbuildingEntries.id, inserted.id));
      throw err;
    }
  }
  revalidateAll();
  redirect("/admin/worldbuilding");
}

export async function updateWorldbuildingEntry(id: number, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();

  const existingRows = await db
    .select({ metadataOptionId: worldbuildingMetadataOptions.metadataOptionId })
    .from(worldbuildingMetadataOptions)
    .where(eq(worldbuildingMetadataOptions.entryId, id));
  const existingIds = new Set(existingRows.map((r) => r.metadataOptionId));

  let fields;
  let selections;
  try {
    selections = await readWbMetadataSelections(formData, existingIds);
    fields = readFields(formData, selections);
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  const nextIds = new Set(allSelectedWbMetadataIds(selections));
  const toRemove = [...existingIds].filter((mid) => !nextIds.has(mid));
  const toAdd = [...nextIds].filter((mid) => !existingIds.has(mid));

  const updateQuery = db.update(worldbuildingEntries).set(fields).where(eq(worldbuildingEntries.id, id));
  const removeQuery = () =>
    db
      .delete(worldbuildingMetadataOptions)
      .where(and(eq(worldbuildingMetadataOptions.entryId, id), inArray(worldbuildingMetadataOptions.metadataOptionId, toRemove)));
  const addQuery = () =>
    db.insert(worldbuildingMetadataOptions).values(toAdd.map((metadataOptionId) => ({ entryId: id, metadataOptionId })));

  if (toRemove.length > 0 && toAdd.length > 0) {
    await db.batch([updateQuery, removeQuery(), addQuery()]);
  } else if (toRemove.length > 0) {
    await db.batch([updateQuery, removeQuery()]);
  } else if (toAdd.length > 0) {
    await db.batch([updateQuery, addQuery()]);
  } else {
    await db.batch([updateQuery]);
  }

  revalidateAll();
  redirect("/admin/worldbuilding");
}

export async function deleteWorldbuildingEntry(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(worldbuildingEntries).where(eq(worldbuildingEntries.id, id));
  revalidateAll();
}

/** Minimal mutation boundary for the Task 4.7 relationship manager. */
export async function createWorldbuildingRelationship(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  try {
    const sourceEntryId = requiredId(formData.get("sourceEntryId"), "Source entity");
    const targetEntryId = requiredId(formData.get("targetEntryId"), "Target entity");
    if (sourceEntryId === targetEntryId) throw new ValidationError("An entity cannot relate to itself.");
    const relationshipType = requiredText(formData.get("relationshipType"), "Relationship type");
    if (relationshipType.length > 100) throw new ValidationError("Relationship type must be 100 characters or fewer.");
    await db.insert(worldbuildingRelationships).values({
      sourceEntryId,
      targetEntryId,
      relationshipType,
      sortOrder: num(formData.get("sortOrder")),
    }).onConflictDoNothing();
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  revalidateAll();
}

export async function deleteWorldbuildingRelationship(formData: FormData) {
  await requireAdminSession();
  let id: number;
  try {
    id = requiredId(formData.get("id"), "Relationship");
  } catch {
    return;
  }
  await db.delete(worldbuildingRelationships).where(eq(worldbuildingRelationships.id, id));
  revalidateAll();
}

export async function createWorldbuildingImage(entryId: number, formData: FormData) {
  await requireAdminSession();
  let url: string;
  try {
    url = requiredUrl(formData.get("url"), "Image");
  } catch {
    return;
  }
  await db.insert(worldbuildingImages).values({ entryId, url, caption: nullableText(formData.get("caption")), sortOrder: num(formData.get("sortOrder")) });
  revalidateAll();
}

export async function updateWorldbuildingImage(id: number, formData: FormData) {
  await requireAdminSession();
  await db.update(worldbuildingImages).set({ caption: nullableText(formData.get("caption")), sortOrder: num(formData.get("sortOrder")) }).where(eq(worldbuildingImages.id, id));
  revalidateAll();
}

export async function deleteWorldbuildingImage(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(worldbuildingImages).where(eq(worldbuildingImages.id, id));
  revalidateAll();
}

export async function createWorldbuildingVideo(entryId: number, formData: FormData) {
  await requireAdminSession();
  let url: string;
  try {
    url = requiredUrl(formData.get("url"), "Video");
  } catch {
    return;
  }
  await db.insert(worldbuildingVideos).values({ entryId, url, sortOrder: num(formData.get("sortOrder")) });
  revalidateAll();
}

export async function updateWorldbuildingVideo(id: number, formData: FormData) {
  await requireAdminSession();
  await db.update(worldbuildingVideos).set({ sortOrder: num(formData.get("sortOrder")) }).where(eq(worldbuildingVideos.id, id));
  revalidateAll();
}

export async function deleteWorldbuildingVideo(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(worldbuildingVideos).where(eq(worldbuildingVideos.id, id));
  revalidateAll();
}

export async function createWorldbuildingLink(entryId: number, formData: FormData) {
  await requireAdminSession();
  let fields;
  try {
    fields = parseLinkFields(formData);
  } catch {
    return;
  }
  await db.insert(worldbuildingLinks).values({ entryId, ...fields });
  revalidateAll();
}

export async function updateWorldbuildingLink(id: number, formData: FormData) {
  await requireAdminSession();
  let fields;
  try {
    fields = parseLinkFields(formData);
  } catch {
    return;
  }
  await db.update(worldbuildingLinks).set(fields).where(eq(worldbuildingLinks.id, id));
  revalidateAll();
}

export async function deleteWorldbuildingLink(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(worldbuildingLinks).where(eq(worldbuildingLinks.id, id));
  revalidateAll();
}
