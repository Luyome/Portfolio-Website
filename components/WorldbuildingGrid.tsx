"use client";

import { AnimatePresence, motion } from "framer-motion";
import { fieldStyle } from "@/lib/style-fields";
import type { LoreEntry, ViewMode } from "@/types/worldbuilding";

export default function WorldbuildingGrid({
  items,
  viewMode,
  onSelect,
}: {
  items: LoreEntry[];
  viewMode: ViewMode;
  onSelect: (id: number) => void;
}) {
  if (items.length === 0) {
    return <div className="wb-empty">No entries match your search.</div>;
  }

  if (viewMode === "grid") {
    return (
      <div className="wb-square-grid">
        <AnimatePresence initial={false}>
          {items.map((w) => (
            <motion.div
              layout
              key={w.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="wb-square-card"
              role="button"
              tabIndex={0}
              onClick={() => onSelect(w.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(w.id);
                }
              }}
            >
              <img src={w.img} alt={w.title} loading="lazy" />
              <div className="wb-square-overlay">
                <span className="wb-square-cat">{w.cat}</span>
                <span className="wb-square-title">{w.title}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="wb-grid">
      <AnimatePresence initial={false}>
        {items.map((w) => (
          <motion.div
            layout
            key={w.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="wb-card"
            role="button"
            tabIndex={0}
            onClick={() => onSelect(w.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(w.id);
              }
            }}
          >
            <div className="wb-card-img">
              <img src={w.img} alt={w.title} loading="lazy" />
              <div className="wb-card-date">{w.date}</div>
            </div>
            <div className="wb-card-body">
              <span className="wb-card-cat">{w.cat}</span>
              <div className="wb-card-title" style={fieldStyle(w.styles, "title")}>
                {w.title}
              </div>
              <div className="wb-card-excerpt" style={fieldStyle(w.styles, "excerpt")}>
                {w.excerpt}
              </div>
              <div className="wb-card-chips">
                {w.chips.map((c) => (
                  <span className="wb-chip" key={c}>
                    {c}
                  </span>
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
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
