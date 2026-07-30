"use client";

import { useMemo, useState } from "react";
import GalleryModal, { GalleryItem } from "./GalleryModal";

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
};

export default function PortfolioBrowser({
  items,
  initialYear,
}: {
  items: PortfolioItem[];
  initialYear?: string;
}) {
  const [year, setYear] = useState<string>(initialYear ?? "all");
  const [cat, setCat] = useState<string>("all");
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  const years = useMemo(
    () => ["all", ...Array.from(new Set(items.map((p) => p.year))).sort((a, b) => b - a).map(String)],
    [items]
  );
  const cats = useMemo(
    () => ["all", ...Array.from(new Set(items.map((p) => p.cat)))],
    [items]
  );

  const filtered = items.filter(
    (p) => (year === "all" || String(p.year) === year) && (cat === "all" || p.cat === cat)
  );

  const galleryItems: GalleryItem[] = filtered.map((p) => ({
    img: p.img,
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
        {filtered.map((p, i) => (
          <div className="port-card" key={p.id}>
            <div className="port-img-wrap" onClick={() => setModalIndex(i)}>
              <img src={p.img} alt={p.title} loading="lazy" />
              <div className="port-yr-badge">{p.year}</div>
              <div className="port-img-open">View Full →</div>
            </div>
            <div className="port-info">
              <div className="pi-cat">{p.cat}</div>
              <div className="pi-title">{p.title}</div>
              <p className="pi-desc">{p.desc}</p>
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
