"use client";

import { useMemo, useState } from "react";
import EmptyState from "./EmptyState";

export type ArchiveItemType = "Portfolio" | "Sketches" | "3D" | "Worldbuilding" | "Games";

export type ArchiveItem = {
  id: string;
  type: ArchiveItemType;
  title: string;
  cat: string;
  year: number;
  img: string;
  href: string;
};

const TYPES: ArchiveItemType[] = ["Portfolio", "Sketches", "3D", "Worldbuilding", "Games"];

export default function ArchiveList({ items, categories }: { items: ArchiveItem[]; categories: string[] }) {
  const [year, setYear] = useState("all");
  const [type, setType] = useState("all");
  const [cat, setCat] = useState("all");

  const years = useMemo(
    () => ["all", ...Array.from(new Set(items.map((i) => i.year))).sort((a, b) => b - a).map(String)],
    [items]
  );

  const filtered = items.filter(
    (i) =>
      (year === "all" || String(i.year) === year) &&
      (type === "all" || i.type === type) &&
      (cat === "all" || i.cat === cat)
  );

  return (
    <div className="arv-wrap">
      <div className="arv-filters">
        <div className="arv-filter-row">
          {years.map((y) => (
            <button key={y} className={`yr-btn ${year === y ? "on" : ""}`} onClick={() => setYear(y)}>
              {y === "all" ? "All Years" : y}
            </button>
          ))}
        </div>
        <div className="arv-filter-row">
          <button className={`cat-btn ${type === "all" ? "on" : ""}`} onClick={() => setType("all")}>All Types</button>
          {TYPES.map((t) => (
            <button key={t} className={`cat-btn ${type === t ? "on" : ""}`} onClick={() => setType(t)}>{t}</button>
          ))}
        </div>
        {categories.length > 0 && (
          <div className="arv-filter-row">
            <button className={`wb-pill ${cat === "all" ? "on" : ""}`} onClick={() => setCat("all")}>All Categories</button>
            {categories.map((c) => (
              <button key={c} className={`wb-pill ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
        )}
      </div>

      <div className="arv-count">{filtered.length} item{filtered.length === 1 ? "" : "s"}</div>

      <div className="arv-table">
        <div className="arv-row arv-head">
          <span className="arv-col-thumb" />
          <span className="arv-col-title">Title</span>
          <span className="arv-col-type">Type</span>
          <span className="arv-col-cat">Category</span>
          <span className="arv-col-year">Year</span>
          <span className="arv-col-action" />
        </div>
        {filtered.map((item) => (
          <a className="arv-row" href={item.href} key={item.id}>
            <span className="arv-col-thumb">
              {item.img ? <img src={item.img} alt={item.title} /> : <span className="arv-thumb-empty" />}
            </span>
            <span className="arv-col-title">{item.title}</span>
            <span className="arv-col-type">{item.type}</span>
            <span className="arv-col-cat">{item.cat}</span>
            <span className="arv-col-year">{item.year}</span>
            <span className="arv-col-action">View →</span>
          </a>
        ))}
        {filtered.length === 0 &&
          (items.length === 0 ? (
            <EmptyState title="No archive items have been published yet." />
          ) : (
            <EmptyState title="No items match these filters." />
          ))}
      </div>
    </div>
  );
}
