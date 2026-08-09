"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import EmptyState from "./EmptyState";
import { isOptimizableImageUrl } from "@/lib/image-host";
import { resolveEntityTypeLabel } from "@/types/worldbuilding";
import type { LoreEntry } from "@/types/worldbuilding";

export default function WorldbuildingGrid({
  items,
  onSelect,
  hasEntries,
  entityTypeLabels,
}: {
  items: LoreEntry[];
  onSelect: (id: number) => void;
  /** Whether any entry exists before search/filter — distinguishes
   * "nothing published yet" from "filtered down to nothing". */
  hasEntries: boolean;
  /** Slug→name map built from active Entity Type options (Phase 2). */
  entityTypeLabels: Record<string, string>;
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
          const badge = resolveEntityTypeLabel(w.entityType, w.cat, entityTypeLabels);
          const meta = [w.date, badge].filter(Boolean).join(" — ");
          return (
            <motion.div
              layout
              key={w.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="wb-disc-card"
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
              <div className="wb-disc-media">
                <Image
                  src={w.img}
                  alt={w.title}
                  fill
                  sizes="(max-width: 480px) 46vw, (max-width: 900px) 22vw, 15vw"
                  quality={90}
                  unoptimized={!isOptimizableImageUrl(w.img)}
                />
              </div>
              <div className="wb-disc-caption">
                {meta && <div className="wb-disc-cap-meta">{meta}</div>}
                <div className="wb-disc-cap-title">{w.title}</div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
