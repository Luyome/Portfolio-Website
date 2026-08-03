"use client";

import { useMemo, useState } from "react";
import GalleryModal, { GalleryItem } from "./GalleryModal";
import { fieldStyle, remapStyles } from "@/lib/style-fields";
import type { StylesMap } from "@/lib/style-fields";
import type { MediaEntry } from "@/lib/group-images";

export type Sketch = {
  id: number;
  year: number;
  label: string;
  desc: string;
  img: string | null;
  link?: string | null;
  images?: MediaEntry[];
  videos?: MediaEntry[];
  links?: { id: number; label: string; href: string; kind: string }[];
  colorHex: string | null;
  styles?: StylesMap;
};

export default function SketchGrid({ items, initialYear }: { items: Sketch[]; initialYear?: string }) {
  const [year, setYear] = useState<string>(initialYear ?? "all");
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  const years = useMemo(
    () => ["all", ...Array.from(new Set(items.map((s) => s.year))).sort((a, b) => b - a).map(String)],
    [items]
  );

  const filtered = items.filter((s) => year === "all" || String(s.year) === year);

  const galleryItems: GalleryItem[] = filtered.map((s) => ({
    img: s.img,
    images: s.images,
    videos: s.videos,
    title: s.label,
    catLabel: "Sketch",
    metaRows: [{ label: "Year", value: String(s.year) }],
    desc: s.desc,
    link: s.link ?? undefined,
    links: s.links,
    styles: remapStyles(s.styles, { label: "title", desc: "desc" }),
  }));

  return (
    <>
      <div className="sk-ctrl">
        <div className="year-row">
          {years.map((y) => (
            <button key={y} className={`yr-btn ${year === y ? "on" : ""}`} onClick={() => setYear(y)}>
              {y === "all" ? "All" : y}
            </button>
          ))}
        </div>
      </div>
      <div className="sk-grid">
        {filtered.map((s, i) =>
          s.img ? (
            <div
              className="sk-item"
              key={s.id}
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
              <div className="sk-thumb">
                <img src={s.img} alt={s.label} loading="lazy" />
              </div>
              <div className="sk-lbl" style={fieldStyle(s.styles, "label")}>{s.label}</div>
            </div>
          ) : (
            <div
              className="sk-item"
              key={s.id}
              role="button"
              tabIndex={0}
              onClick={() => setModalIndex(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setModalIndex(i);
                }
              }}
              style={{
                background: s.colorHex ?? "#151010",
                minHeight: 160,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--M)",
                  fontSize: "0.55rem",
                  color: "var(--muted)",
                  letterSpacing: ".15em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  lineHeight: 1.6,
                  ...fieldStyle(s.styles, "label"),
                }}
              >
                {s.label}
              </div>
              <div style={{ marginTop: 12, fontSize: "2rem", opacity: 0.1 }}>✎</div>
            </div>
          )
        )}
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
