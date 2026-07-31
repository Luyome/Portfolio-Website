"use client";

import { useState } from "react";
import GameDetailOverlay, { GameDetail } from "./GameDetailOverlay";

export type Game = GameDetail & {
  feats: string[];
};

export default function GamesBrowser({ items }: { items: Game[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="games-wrap">
        {items.map((g, i) => (
          <div className="game-card" key={g.id}>
            <div
              className="game-cover"
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
              <div className="game-cover-over">
                <div className="gco-st">{g.status} — {g.engine}</div>
                <div className="gco-t">{g.title}</div>
              </div>
            </div>
            <div className="game-body">
              <div>
                <p className="gb-desc">{g.desc}</p>
                <div className="gb-tags">
                  {g.tags.map((t) => (
                    <span className="gb-tag" key={t}>{t}</span>
                  ))}
                </div>
              </div>
              <div className="g-aside">
                <div className="ga-lbl">Features</div>
                {g.feats.map((f) => (
                  <div className="ga-feat" key={f}>{f}</div>
                ))}
                <div className="ga-tgt">
                  <strong>Target</strong>
                  <span>{g.target}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <GameDetailOverlay game={openIndex !== null ? items[openIndex] : null} onClose={() => setOpenIndex(null)} />
    </>
  );
}
