"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { worldMaps, mapLocations } from "@/db/schema";
import { requireAdminSession } from "@/lib/actions/guard";
import { num, numOrNull } from "@/lib/form-utils";
import {
  coordinate,
  nullableId,
  nullableUrl,
  oneOf,
  optionalText,
  optionalUrl,
  requiredId,
  requiredText,
  safeErrorMessage,
} from "@/lib/validation";
import { validatePriority, validateZoomRange } from "@/lib/map-zoom";
import type { IconType, PinType } from "@/lib/map-types";

const PIN_TYPES: readonly PinType[] = ["submap", "lore"];
const ICON_TYPES: readonly IconType[] = ["default", "city", "character", "landmark", "hazard"];

type ActionState = { error?: string } | undefined;

function revalidateAll() {
  // "/" (Home) reads world_maps/map_locations too (its own atlas preview) —
  // every sibling action file that feeds Home already busts it this way
  // (lib/actions/home.ts, settings.ts, appearance.ts, services.ts); this
  // file was the one exception, so a new/moved pin or map showed up on
  // /worldbuilding immediately but kept serving Home's stale cached render
  // until something unrelated happened to revalidate "/".
  revalidatePath("/", "layout");
  revalidatePath("/worldbuilding");
  revalidatePath("/admin/worldbuilding");
  revalidatePath("/admin/worldbuilding/maps");
  revalidatePath("/admin/worldbuilding/map");
}

function readMapFields(formData: FormData) {
  return {
    title: requiredText(formData.get("title"), "Title"),
    parentMapId: numOrNull(formData.get("parentMapId")),
    imageUrl: optionalUrl(formData.get("imageUrl"), "Map Image"),
    description: optionalText(formData.get("description")),
    sortOrder: num(formData.get("sortOrder")),
  };
}

export async function createWorldMap(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  let fields;
  try {
    fields = readMapFields(formData);
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  await db.insert(worldMaps).values(fields);
  revalidateAll();
  redirect("/admin/worldbuilding/maps");
}

export async function updateWorldMap(id: number, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  let fields;
  try {
    fields = readMapFields(formData);
  } catch (err) {
    return { error: safeErrorMessage(err) };
  }
  await db.update(worldMaps).set(fields).where(eq(worldMaps.id, id));
  revalidateAll();
  redirect("/admin/worldbuilding/maps");
}

export async function deleteWorldMap(formData: FormData) {
  await requireAdminSession();
  const id = num(formData.get("id"));
  await db.delete(worldMaps).where(eq(worldMaps.id, id));
  revalidateAll();
}

// createMapLocation/updateMapLocationPosition/updateMapLocationInfo are called
// directly from client components (MapEditor/MapPinEditPanel) with typed
// arguments, not through a <form>. There is no error-display UI wired to
// these calls, so — like the other secondary sub-resource actions in this
// codebase (e.g. createPortfolioImage) — invalid input is rejected by
// silently skipping the write rather than throwing. MapEditor already
// guards its `createMapLocation` call on a truthy return (`if (row) ...`),
// so returning `undefined` on invalid input is a pre-existing, handled case.
export async function createMapLocation(mapId: number, name: string, x: number, y: number) {
  await requireAdminSession();
  try {
    requiredId(mapId, "Map");
    requiredText(name, "Name");
    coordinate(x, "X");
    coordinate(y, "Y");
  } catch {
    return undefined;
  }
  const [row] = await db.insert(mapLocations).values({ mapId, name: name.trim(), x, y }).returning();
  revalidateAll();
  return row;
}

export async function updateMapLocationPosition(id: number, x: number, y: number) {
  await requireAdminSession();
  try {
    requiredId(id, "Location");
    coordinate(x, "X");
    coordinate(y, "Y");
  } catch {
    return;
  }
  await db.update(mapLocations).set({ x, y }).where(eq(mapLocations.id, id));
  revalidateAll();
}

export async function updateMapLocationInfo(
  id: number,
  fields: {
    name: string;
    info: string;
    img: string | null;
    pinType: "submap" | "lore";
    targetMapId: number | null;
    entryId: number | null;
    iconType: string;
  }
) {
  await requireAdminSession();
  let parsed;
  try {
    requiredId(id, "Location");
    parsed = {
      name: requiredText(fields.name, "Name"),
      info: optionalText(fields.info),
      img: nullableUrl(fields.img, "Image"),
      pinType: oneOf(fields.pinType, PIN_TYPES, "Pin type"),
      targetMapId: nullableId(fields.targetMapId, "Target map"),
      entryId: nullableId(fields.entryId, "Lore entry"),
      iconType: oneOf(fields.iconType, ICON_TYPES, "Icon type"),
    };
  } catch {
    return;
  }
  await db.update(mapLocations).set(parsed).where(eq(mapLocations.id, id));
  revalidateAll();
}

// Task 4.5 foundation for Task 4.6/4.7's semantic zoom controls — no admin
// UI calls this yet (Task 4.7 is the Map Editor refinement that wires it
// up), same pre-wiring pattern as the other typed sub-resource actions
// above. Validated through the shared lib/map-zoom.ts rules so every write
// path enforces the same bounded ranges as the schema's own CHECK constraints.
export async function updateMapLocationZoom(
  id: number,
  fields: { priority: number; minZoom: number; maxZoom: number }
) {
  await requireAdminSession();
  let parsed;
  try {
    requiredId(id, "Location");
    const { minZoom, maxZoom } = validateZoomRange(fields.minZoom, fields.maxZoom);
    parsed = { priority: validatePriority(fields.priority), minZoom, maxZoom };
  } catch {
    return;
  }
  await db.update(mapLocations).set(parsed).where(eq(mapLocations.id, id));
  revalidateAll();
}

export async function deleteMapLocation(id: number) {
  await requireAdminSession();
  await db.delete(mapLocations).where(eq(mapLocations.id, id));
  revalidateAll();
}
