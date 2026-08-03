"use client";

import { useState } from "react";
import GalleryModal, { GalleryItem } from "./GalleryModal";
import { fieldStyle, remapStyles } from "@/lib/style-fields";
import type { StylesMap } from "@/lib/style-fields";
import type { MediaEntry } from "@/lib/group-images";

export type WorldbuildingEntry = {
  id: number;
  year: number;
  date: string;
  cat: string;
  title: string;
  excerpt: string;
  chips: string[];
  img: string;
  images?: MediaEntry[];
  videos?: MediaEntry[];
  links?: { id: number; label: string; href: string; kind: string }[];
  styles?: StylesMap;
};

const CATS = ["all", "Characters", "Cities", "Lore", "Events"];

export default function WorldbuildingBrowser({ items }: { items: WorldbuildingEntry[] }) {
  const [cat, setCat] = useState("all");
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const filtered = cat === "all" ? items : items.filter((w) => w.cat === cat);

  const galleryItems: GalleryItem[] = filtered.map((w) => ({
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
    tags: w.chips,
    links: w.links,
    styles: remapStyles(w.styles, { title: "title", excerpt: "desc" }),
  }));

  return (
    <>
      <div className="wb-ctrl">
        {CATS.map((c) => (
          <button key={c} className={`wb-pill ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>
            {c === "all" ? "All" : c}
          </button>
        ))}
      </div>
      <div className="wb-grid">
        {filtered.map((w, i) => (
          <div
            className="wb-card"
            key={w.id}
            role="button"
            tabIndex={0}
            onClick={() => setModalIndex(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setModalIndex(i);
              }
            }}
          >
            <div className="wb-card-img">
              <img src={w.img} alt={w.title} loading="lazy" />
              <div className="wb-card-date">{w.date}</div>
            </div>
            <div className="wb-card-body">
              <span className="wb-card-cat">{w.cat}</span>
              <div className="wb-card-title" style={fieldStyle(w.styles, "title")}>{w.title}</div>
              <div className="wb-card-excerpt" style={fieldStyle(w.styles, "excerpt")}>{w.excerpt}</div>
              <div className="wb-card-chips">
                {w.chips.map((c) => (
                  <span className="wb-chip" key={c}>{c}</span>
                ))}
              </div>
            </div>
            <div className="wb-card-footer">
              <div className="wb-card-chips">
                {w.chips.slice(0, 2).map((c) => (
                  <span className="wb-chip featured" key={c}>
                    {c}
                  </span>
                ))}
              </div>
              <span className="wb-card-more">Read More →</span>
            </div>
          </div>
        ))}
      </div>
      <GalleryModal
        items={galleryItems}
        index={modalIndex}
        onClose={() => setModalIndex(null)}
        onNavigate={setModalIndex}
      />
    </>
  );
}
