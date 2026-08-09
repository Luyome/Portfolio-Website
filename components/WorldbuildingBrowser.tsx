"use client";

import { useMemo, useState } from "react";
import MediaLightbox, { GalleryItem } from "./shared/MediaLightbox";
import BlogReader from "./shared/BlogReader";
import WorldbuildingAtlas from "./WorldbuildingAtlas";
import WorldbuildingControls from "./WorldbuildingControls";
import WorldbuildingGrid from "./WorldbuildingGrid";
import { remapStyles } from "@/lib/style-fields";
import type { StylesMap } from "@/lib/style-fields";
import type { MediaEntry } from "@/lib/group-images";
import type { MapLocation, WorldMap } from "@/lib/map-types";
import { fuzzyMatch } from "@/lib/search";
import { resolveEntityTypeLabel } from "@/types/worldbuilding";
import type { EntityTypeFilter, LoreEntry, WorldbuildingEntityType } from "@/types/worldbuilding";
import { findContentItemIndex } from "@/lib/content-detail-href";

export type WorldbuildingRelationshipEdge = {
  sourceEntryId: number;
  targetEntryId: number;
  sortOrder: number;
};

/** An active `wb_entity_type` metadata option — the Phase 2 dynamic taxonomy (see `lib/worldbuilding-metadata.ts`). */
export type WorldbuildingEntityTypeOption = { id: number; name: string; slug: string };

export type WorldbuildingEntry = {
  id: number;
  year: number;
  date: string;
  cat: string;
  entityType: WorldbuildingEntityType | string | null;
  displayTemplate: string;
  title: string;
  excerpt: string;
  chips: string[];
  img: string;
  content: string;
  contentOrder: number;
  images?: MediaEntry[];
  videos?: MediaEntry[];
  links?: { id: number; label: string; href: string; kind: string }[];
  styles?: StylesMap;
};

export default function WorldbuildingBrowser({
  items,
  relationships,
  maps,
  locations,
  entityTypeOptions,
  initialItemId,
  initialMapId,
}: {
  items: WorldbuildingEntry[];
  relationships: WorldbuildingRelationshipEdge[];
  maps: WorldMap[];
  locations: MapLocation[];
  /** Active Entity Type options (Phase 2) — drives both the filter tabs and label resolution. */
  entityTypeOptions: WorldbuildingEntityTypeOption[];
  initialItemId?: number | null;
  initialMapId?: number | null;
}) {
  const entityTypeLabels = useMemo(
    () => Object.fromEntries(entityTypeOptions.map((o) => [o.slug, o.name])),
    [entityTypeOptions]
  );
  const [entityFilter, setEntityFilter] = useState<EntityTypeFilter>("all");
  const [search, setSearch] = useState("");
  const initialIndex = findContentItemIndex(items, initialItemId ?? null);
  const [openEntryId, setOpenEntryId] = useState<number | null>(() => initialIndex === null ? null : items[initialIndex].id);

  const filtered = useMemo(
    () =>
      items.filter(
        (w) =>
          (entityFilter === "all" || w.entityType === entityFilter) &&
          (search.trim() === "" || fuzzyMatch(w.title, search) || fuzzyMatch(w.excerpt, search))
      ),
    [items, entityFilter, search]
  );

  const loreEntries: LoreEntry[] = filtered.map((w) => ({
    id: w.id,
    title: w.title,
    cat: w.cat,
    entityType: w.entityType,
    year: w.year,
    date: w.date,
    excerpt: w.excerpt,
    chips: w.chips,
    img: w.img,
    content: w.content,
    contentOrder: w.contentOrder,
    images: w.images,
    videos: w.videos,
    links: w.links,
    styles: w.styles,
  }));

  // Related-entity ids per entry, from the Task 4.2 relationship foundation
  // (edges are undirected for display purposes — either side of a
  // relationship counts as "related" to the other).
  const relatedIdsByEntry = useMemo(() => {
    const map = new Map<number, number[]>();
    const add = (from: number, to: number) => {
      const list = map.get(from);
      if (list) {
        if (!list.includes(to)) list.push(to);
      } else {
        map.set(from, [to]);
      }
    };
    for (const r of relationships) {
      add(r.sourceEntryId, r.targetEntryId);
      add(r.targetEntryId, r.sourceEntryId);
    }
    return map;
  }, [relationships]);

  const itemsById = useMemo(() => new Map(items.map((w) => [w.id, w])), [items]);

  const galleryItems: GalleryItem[] = items.map((w) => ({
    img: w.img,
    images: w.images,
    videos: w.videos,
    title: w.title,
    catLabel: resolveEntityTypeLabel(w.entityType, w.cat, entityTypeLabels),
    metaRows: [
      { label: "Year", value: String(w.year) },
      { label: "Date", value: w.date },
    ],
    desc: w.excerpt,
    content: w.content,
    contentOrder: w.contentOrder,
    tags: w.chips,
    links: w.links,
    related: (relatedIdsByEntry.get(w.id) ?? [])
      .map((id) => itemsById.get(id))
      .filter((r): r is WorldbuildingEntry => !!r)
      .map((r) => ({ id: r.id, title: r.title, img: r.img, typeLabel: resolveEntityTypeLabel(r.entityType, r.cat, entityTypeLabels) })),
    styles: remapStyles(w.styles, { title: "title", excerpt: "desc" }),
  }));

  const modalIndex = openEntryId === null ? null : items.findIndex((i) => i.id === openEntryId);
  const openIndex = modalIndex === -1 ? null : modalIndex;
  // Phase 2: the display template is its own field, independent of Entity
  // Type — an entry classified as e.g. "location" can still publish through
  // the Lore Reader (article view) if its owner picked "blog". Previously
  // this was hardcoded to `entityType === "lore"` (Task 4.4B).
  const isLoreOpen = openIndex !== null && items[openIndex]?.displayTemplate === "blog";

  return (
    <>
      {maps.length > 0 && <WorldbuildingAtlas maps={maps} locations={locations} onOpenLore={setOpenEntryId} initialMapId={initialMapId} />}
      <WorldbuildingControls
        search={search}
        onSearchChange={setSearch}
        entityFilter={entityFilter}
        onEntityFilterChange={setEntityFilter}
        entityTypeOptions={entityTypeOptions}
      />
      <WorldbuildingGrid items={loreEntries} onSelect={setOpenEntryId} hasEntries={items.length > 0} entityTypeLabels={entityTypeLabels} />
      {isLoreOpen ? (
        <BlogReader
          items={galleryItems}
          index={openIndex}
          onClose={() => setOpenEntryId(null)}
          onNavigate={(next) => setOpenEntryId(items[next]?.id ?? null)}
          onRelatedSelect={setOpenEntryId}
        />
      ) : (
        <MediaLightbox
          items={galleryItems}
          index={openIndex}
          onClose={() => setOpenEntryId(null)}
          onNavigate={(next) => setOpenEntryId(items[next]?.id ?? null)}
          onRelatedSelect={setOpenEntryId}
        />
      )}
    </>
  );
}
