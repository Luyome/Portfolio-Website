"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { portfolioItems, portfolioImages, portfolioLinks, portfolioVideos, portfolioMetadataOptions } from "@/db/schema";
import { requireAdminSession } from "@/lib/actions/guard";
import { num, parseLinkFields } from "@/lib/form-utils";
import { allSelectedMetadataIds, readMetadataSelections, type ResolvedMetadataSelections } from "@/lib/portfolio-metadata";
import { readStyles } from "@/lib/style-fields";
import { requiredInt, requiredText, optionalUrl, requiredUrl, safeErrorMessage } from "@/lib/validation";

type ActionState = { error?: string } | undefined;

// Legacy `medium`/`software`/`tags` columns stay a compatibility mirror of
// the selected metadata option names (Section 8) until the public Portfolio
// pages move off them (Sprint 7). `software`'s existing real-world values
// already use ", " to join multiple tools in one field (e.g. "Maya, ZBrush,
// Marvelous Designer"), confirmed by reading current production data before
// this task's migration — reused here for `medium` too for one consistent
// separator, and dropped entirely (not needed) for `tags`, which is already
// a native array column.
const LEGACY_JOIN = ", ";

function readFields(formData: FormData, selections: ResolvedMetadataSelections) {
  return {
    title: requiredText(formData.get("title"), "Title"),
    cat: requiredText(formData.get("cat"), "Category"),
    year: requiredInt(formData.get("year"), "Year"),
    desc: requiredText(formData.get("desc"), "Description"),
    tags: selections.tag.names,
    medium: selections.medium.names.join(LEGACY_JOIN),
    software: selections.software.names.join(LEGACY_JOIN),
    link: optionalUrl(formData.get("link"), "External Link"),
    img: optionalUrl(formData.get("img"), "Image"),
    sortOrder: num(formData.get("sortOrder")),
    styles: readStyles(formData, ["title", "desc"]),
  };
}

function revalidateAll() {
  revalidatePath("/portfolio");
  revalidatePath("/archive");
  revalidatePath("/admin/portfolio");
}

export async function createPortfolioItem(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  let fields;
  let selections;
  try {
    selections = await readMetadataSelections(formData);
    fields = readFields(formData, selections);
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  const metadataIds = allSelectedMetadataIds(selections);

  const [inserted] = await db.insert(portfolioItems).values(fields).returning({ id: portfolioItems.id });
  if (metadataIds.length > 0) {
    try {
      await db.insert(portfolioMetadataOptions).values(metadataIds.map((metadataOptionId) => ({ portfolioId: inserted.id, metadataOptionId })));
    } catch (err) {
      // The neon-http driver has no cross-statement transaction support
      // (confirmed: `db.transaction()` throws "No transactions support in
      // neon-http driver"), so the item insert above and this junction
      // insert can't share one real transaction. If the junction insert
      // fails, delete the just-created item as a compensating action —
      // its `onDelete: cascade` FK takes any partially-inserted junction
      // rows with it — rather than leave a Portfolio item with no (or a
      // half) metadata relation behind.
      await db.delete(portfolioItems).where(eq(portfolioItems.id, inserted.id));
      throw err;
    }
  }
  revalidateAll();
  redirect("/admin/portfolio");
}

export async function updatePortfolioItem(id: number, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();

  // Read first — readMetadataSelections needs the item's pre-edit selection
  // to know which (if any) inactive options are allowed to stay selected
  // (Sprint 2 Closure Audit, finding 1). Reused below for the add/remove diff.
  const existingRows = await db
    .select({ metadataOptionId: portfolioMetadataOptions.metadataOptionId })
    .from(portfolioMetadataOptions)
    .where(eq(portfolioMetadataOptions.portfolioId, id));
  const existingIds = new Set(existingRows.map((r) => r.metadataOptionId));

  let fields;
  let selections;
  try {
    selections = await readMetadataSelections(formData, existingIds);
    fields = readFields(formData, selections);
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  const nextIds = new Set(allSelectedMetadataIds(selections));
  const toRemove = [...existingIds].filter((mid) => !nextIds.has(mid));
  const toAdd = [...nextIds].filter((mid) => !existingIds.has(mid));

  // The Portfolio row update and the junction diff (remove + add) run as
  // one `db.batch()` call — a single atomic HTTP-level Postgres transaction
  // (the neon-http driver's real substitute for `db.transaction()`, which
  // it doesn't support). Either every statement here lands, or none does.
  // `db.batch()`'s type signature wants a literal tuple, so each
  // remove/add combination is its own literal-array call rather than one
  // dynamically-built array — the four cases cover every combination.
  const updateQuery = db.update(portfolioItems).set(fields).where(eq(portfolioItems.id, id));
  const removeQuery = () =>
    db
      .delete(portfolioMetadataOptions)
      .where(and(eq(portfolioMetadataOptions.portfolioId, id), inArray(portfolioMetadataOptions.metadataOptionId, toRemove)));
  const addQuery = () =>
    db.insert(portfolioMetadataOptions).values(toAdd.map((metadataOptionId) => ({ portfolioId: id, metadataOptionId })));

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
  redirect("/admin/portfolio");
}

export async function deletePortfolioItem(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(portfolioItems).where(eq(portfolioItems.id, id));
  revalidateAll();
}

export async function createPortfolioImage(portfolioId: number, formData: FormData) {
  await requireAdminSession();
  let url: string;
  try {
    url = requiredUrl(formData.get("url"), "Image");
  } catch {
    return;
  }
  await db.insert(portfolioImages).values({ portfolioId, url, sortOrder: num(formData.get("sortOrder")) });
  revalidateAll();
}

export async function updatePortfolioImage(id: number, formData: FormData) {
  await requireAdminSession();
  await db.update(portfolioImages).set({ sortOrder: num(formData.get("sortOrder")) }).where(eq(portfolioImages.id, id));
  revalidateAll();
}

export async function deletePortfolioImage(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(portfolioImages).where(eq(portfolioImages.id, id));
  revalidateAll();
}

export async function createPortfolioVideo(portfolioId: number, formData: FormData) {
  await requireAdminSession();
  let url: string;
  try {
    url = requiredUrl(formData.get("url"), "Video");
  } catch {
    return;
  }
  await db.insert(portfolioVideos).values({ portfolioId, url, sortOrder: num(formData.get("sortOrder")) });
  revalidateAll();
}

export async function updatePortfolioVideo(id: number, formData: FormData) {
  await requireAdminSession();
  await db.update(portfolioVideos).set({ sortOrder: num(formData.get("sortOrder")) }).where(eq(portfolioVideos.id, id));
  revalidateAll();
}

export async function deletePortfolioVideo(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(portfolioVideos).where(eq(portfolioVideos.id, id));
  revalidateAll();
}

export async function createPortfolioLink(portfolioId: number, formData: FormData) {
  await requireAdminSession();
  let fields;
  try {
    fields = parseLinkFields(formData);
  } catch {
    return;
  }
  await db.insert(portfolioLinks).values({ portfolioId, ...fields });
  revalidateAll();
}

export async function updatePortfolioLink(id: number, formData: FormData) {
  await requireAdminSession();
  let fields;
  try {
    fields = parseLinkFields(formData);
  } catch {
    return;
  }
  await db.update(portfolioLinks).set(fields).where(eq(portfolioLinks.id, id));
  revalidateAll();
}

export async function deletePortfolioLink(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(portfolioLinks).where(eq(portfolioLinks.id, id));
  revalidateAll();
}
