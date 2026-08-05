"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import EmptyState from "./EmptyState";
import GalleryModal, { GalleryItem } from "./GalleryModal";
import { fieldStyle } from "@/lib/style-fields";
import type { StylesMap } from "@/lib/style-fields";
import type { MediaEntry } from "@/lib/group-images";
import { resolveYearParam, yearOptions } from "@/lib/search";
import { isOptimizableImageUrl } from "@/lib/image-host";

export type PortfolioItem = {
  id: number;
  title: string;
  cat: string;
  year: number;
  desc: string;
  tags: string[];
  medium: string;
  software: string;
  link: string;
  img: string;
  images?: MediaEntry[];
  videos?: MediaEntry[];
  links?: { id: number; label: string; href: string; kind: string }[];
  styles?: StylesMap;
};

export default function PortfolioBrowser({
  items,
  initialYear,
}: {
  items: PortfolioItem[];
  initialYear?: string;
}) {
  const years = useMemo(() => yearOptions(items, (p) => p.year), [items]);
  const [year, setYear] = useState<string>(() => resolveYearParam(initialYear, years));
  const [cat, setCat] = useState<string>("all");
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  const cats = useMemo(
    () => ["all", ...Array.from(new Set(items.map((p) => p.cat)))],
    [items]
  );

  const filtered = items.filter(
    (p) => (year === "all" || String(p.year) === year) && (cat === "all" || p.cat === cat)
  );

  const galleryItems: GalleryItem[] = filtered.map((p) => ({
    img: p.img,
    images: p.images,
    videos: p.videos,
    title: p.title,
    catLabel: p.cat,
    metaRows: [
      { label: "Year", value: String(p.year) },
      { label: "Medium", value: p.medium },
      { label: "Software", value: p.software },
    ],
    desc: p.desc,
    tags: p.tags,
    link: p.link,
    links: p.links,
    styles: p.styles,
  }));

  return (
    <>
      <div className="port-ctrl">
        <div className="year-row">
          {years.map((y) => (
            <button key={y} className={`yr-btn ${year === y ? "on" : ""}`} onClick={() => setYear(y)}>
              {y === "all" ? "All" : y}
            </button>
          ))}
        </div>
        <div className="cat-row">
          {cats.map((c) => (
            <button key={c} className={`cat-btn ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
      </div>
      <div className="port-list">
        {filtered.length === 0 &&
          (items.length === 0 ? (
            <EmptyState title="No portfolio pieces have been published yet." />
          ) : (
            <EmptyState title="No pieces match the selected year and category." />
          ))}
        {filtered.map((p, i) => (
          <div className="port-card" key={p.id}>
            <div
              className="port-img-wrap"
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
              <Image
                src={p.img}
                alt={p.title}
                fill
                sizes="(max-width: 820px) 100vw, 320px"
                unoptimized={!isOptimizableImageUrl(p.img)}
              />
              <div className="port-yr-badge">{p.year}</div>
              <div className="port-img-open">View Full →</div>
            </div>
            <div className="port-info">
              <div className="pi-cat">{p.cat}</div>
              <div className="pi-title" style={fieldStyle(p.styles, "title")}>{p.title}</div>
              <p className="pi-desc" style={fieldStyle(p.styles, "desc")}>{p.desc}</p>
              <div className="pi-tags">
                {p.tags.map((t) => (
                  <span className="pi-tag" key={t}>{t}</span>
                ))}
              </div>
              <a className="pi-link" href={p.link} target="_blank" rel="noreferrer">
                View on ArtStation ↗
              </a>
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
