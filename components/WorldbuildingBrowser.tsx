"use client";

import { useMemo, useState } from "react";
import GalleryModal, { GalleryItem } from "./GalleryModal";
import WorldbuildingAtlas from "./WorldbuildingAtlas";
import WorldbuildingControls from "./WorldbuildingControls";
import WorldbuildingGrid from "./WorldbuildingGrid";
import { remapStyles } from "@/lib/style-fields";
import type { StylesMap } from "@/lib/style-fields";
import type { MediaEntry } from "@/lib/group-images";
import type { MapLocation, WorldMap } from "@/lib/map-types";
import { fuzzyMatch } from "@/lib/search";
import type { EntityTypeFilter, LoreEntry, WorldbuildingEntityType } from "@/types/worldbuilding";
import { findContentItemIndex } from "@/lib/content-detail-href";

export type WorldbuildingEntry = {
  id: number;
  year: number;
  date: string;
  cat: string;
  entityType: WorldbuildingEntityType | string | null;
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
  maps,
  locations,
  initialItemId,
  initialMapId,
}: {
  items: WorldbuildingEntry[];
  maps: WorldMap[];
  locations: MapLocation[];
  initialItemId?: number | null;
  initialMapId?: number | null;
}) {
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

  const galleryItems: GalleryItem[] = items.map((w) => ({
    img: w.img,
    images: w.images,
    videos: w.videos,
    title: w.title,
    catLabel: w.cat,
    metaRows: [
      { label: "Year", value: String(w.year) },
      { label: "Date", value: w.date },
    ],
    desc: w.excerpt,
    content: w.content,
    contentOrder: w.contentOrder,
    tags: w.chips,
    links: w.links,
    styles: remapStyles(w.styles, { title: "title", excerpt: "desc" }),
  }));

  const modalIndex = openEntryId === null ? null : items.findIndex((i) => i.id === openEntryId);

  return (
    <>
      {maps.length > 0 && <WorldbuildingAtlas maps={maps} locations={locations} onOpenLore={setOpenEntryId} initialMapId={initialMapId} />}
      <WorldbuildingControls
        search={search}
        onSearchChange={setSearch}
        entityFilter={entityFilter}
        onEntityFilterChange={setEntityFilter}
      />
      <WorldbuildingGrid items={loreEntries} onSelect={setOpenEntryId} hasEntries={items.length > 0} />
      <GalleryModal
        items={galleryItems}
        index={modalIndex === -1 ? null : modalIndex}
        onClose={() => setOpenEntryId(null)}
        onNavigate={(next) => setOpenEntryId(items[next]?.id ?? null)}
      />
    </>
  );
}
