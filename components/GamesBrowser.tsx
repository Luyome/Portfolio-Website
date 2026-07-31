"use client";

import { useState } from "react";
import GameDetailOverlay, { GameDetail } from "./GameDetailOverlay";

export type Game = GameDetail;

export default function GamesBrowser({ items }: { items: Game[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="games-wrap">
        {items.map((g, i) => (
          <div className={`game-row ${i % 2 === 1 ? "rev" : ""}`} key={g.id}>
            <div
              className="game-row-media"
              role="button"
              tabIndex={0}
              onClick={() => setOpenIndex(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpenIndex(i);
                }
              }}
            >
              <img src={g.img} alt={g.title} />
            </div>
            <div className="game-row-content">
              <div className="gr-index">{String(i + 1).padStart(2, "0")}</div>
              <div className="gr-status">{g.status} — {g.engine}</div>
              <h3 className="gr-title" onClick={() => setOpenIndex(i)}>{g.title}</h3>
              <p className="gr-desc">{g.desc}</p>
              <div className="gr-tags">
                {g.tags.map((t) => (
                  <span className="gr-tag" key={t}>{t}</span>
                ))}
              </div>
              <button type="button" className="gr-btn" onClick={() => setOpenIndex(i)}>View Details</button>
            </div>
          </div>
        ))}
      </div>
      <GameDetailOverlay game={openIndex !== null ? items[openIndex] : null} onClose={() => setOpenIndex(null)} />
    </>
  );
}
