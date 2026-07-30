"use client";

import { useState } from "react";

export type WorldbuildingEntry = {
  id: number;
  year: number;
  date: string;
  cat: string;
  title: string;
  excerpt: string;
  chips: string[];
  img: string;
};

const CATS = ["all", "Characters", "Cities", "Lore", "Events"];

export default function WorldbuildingBrowser({ items }: { items: WorldbuildingEntry[] }) {
  const [cat, setCat] = useState("all");
  const filtered = cat === "all" ? items : items.filter((w) => w.cat === cat);

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
        {filtered.map((w) => (
          <div className="wb-card" key={w.id}>
            <div className="wb-card-img">
              <img src={w.img} alt={w.title} loading="lazy" />
              <div className="wb-card-date">{w.date}</div>
            </div>
            <div className="wb-card-body">
              <span className="wb-card-cat">{w.cat}</span>
              <div className="wb-card-title">{w.title}</div>
              <div className="wb-card-excerpt">{w.excerpt}</div>
              <div className="wb-card-chips">
                {w.chips.map((c) => (
                  <span className="wb-chip" key={c}>{c}</span>
                ))}
              </div>
            </div>
            <div className="wb-card-footer">
              <div className="wb-card-chips">
                {w.chips.slice(0, 2).map((c) => (
                  <span
                    className="wb-chip"
                    key={c}
                    style={{ background: "rgba(212,64,64,.1)", color: "var(--red)", borderColor: "rgba(212,64,64,.2)" }}
                  >
                    {c}
                  </span>
                ))}
              </div>
              <span className="wb-card-more">Read More →</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
