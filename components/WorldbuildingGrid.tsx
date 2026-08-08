"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import EmptyState from "./EmptyState";
import { isOptimizableImageUrl } from "@/lib/image-host";
import { ENTITY_TYPE_LABELS } from "@/types/worldbuilding";
import type { LoreEntry, WorldbuildingEntityType } from "@/types/worldbuilding";

// Real per-image aspect ratio isn't stored, so tile geometry is varied with a
// small deterministic (id-based, not random) size pattern instead — keeps the
// ArtStation-Explore-style dense/uneven silhouette stable across re-filters.
function tileSize(id: number): "short" | "tall" | "wide" | "" {
  switch (id % 5) {
    case 0:
      return "tall";
    case 2:
      return "wide";
    case 4:
      return "short";
    default:
      return "";
  }
}

export default function WorldbuildingGrid({
  items,
  onSelect,
  hasEntries,
}: {
  items: LoreEntry[];
  onSelect: (id: number) => void;
  /** Whether any entry exists before search/filter — distinguishes
   * "nothing published yet" from "filtered down to nothing". */
  hasEntries: boolean;
}) {
  if (items.length === 0) {
    return hasEntries ? (
      <EmptyState title="No entries match this filter." />
    ) : (
      <EmptyState title="No worldbuilding entries have been published yet." />
    );
  }

  return (
    <div className="wb-disc-grid">
      <AnimatePresence initial={false}>
        {items.map((w) => {
          const typeLabel = w.entityType && w.entityType in ENTITY_TYPE_LABELS ? ENTITY_TYPE_LABELS[w.entityType as WorldbuildingEntityType] : null;
          const badge = typeLabel ?? w.cat;
          return (
            <motion.div
              layout
              key={w.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`wb-disc-card ${tileSize(w.id)}`}
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
              <Image
                src={w.img}
                alt={w.title}
                fill
                sizes="(max-width: 480px) 46vw, (max-width: 900px) 30vw, 220px"
                unoptimized={!isOptimizableImageUrl(w.img)}
              />
              <div className="wb-disc-overlay">
                {badge && <span className="wb-disc-badge">{badge}</span>}
                <span className="wb-disc-title">{w.title}</span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
