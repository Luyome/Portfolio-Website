"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import EmptyState from "./EmptyState";
import { isOptimizableImageUrl } from "@/lib/image-host";
import { resolveEntityTypeLabel } from "@/types/worldbuilding";
import type { LoreEntry, WorldbuildingDiscoveryMode } from "@/types/worldbuilding";

const EMPTY_COPY: Record<WorldbuildingDiscoveryMode, { published: string; filtered: string }> = {
  all: { published: "No worldbuilding entries have been published yet.", filtered: "No Worldbuilding entries match these filters." },
  art: { published: "No artwork has been published yet.", filtered: "No artwork matches these filters." },
  blog: { published: "No blog entries have been published yet.", filtered: "No blog entries match these filters." },
};

export default function WorldbuildingGrid({
  items,
  onSelect,
  mode,
  hasEntries,
  filtersActive,
  onClearFilters,
  entityTypeLabels,
}: {
  items: LoreEntry[];
  onSelect: (id: number) => void;
  /** Active content mode — only used to pick the right empty-state copy and
   * whether a Blog excerpt renders under each card. */
  mode: WorldbuildingDiscoveryMode;
  /** Whether the active mode has any entries at all, ignoring secondary
   * filters — distinguishes "nothing published in this mode" from
   * "filtered down to nothing". */
  hasEntries: boolean;
  filtersActive: boolean;
  onClearFilters: () => void;
  /** Slug→name map built from active Entity Type options (Phase 2). */
  entityTypeLabels: Record<string, string>;
}) {
  const copy = EMPTY_COPY[mode];

  if (items.length === 0) {
    return hasEntries ? (
      <EmptyState
        title={copy.filtered}
        action={
          filtersActive ? (
            <button type="button" className="wb-clear-btn" onClick={onClearFilters}>
              Clear Filters
            </button>
          ) : undefined
        }
      />
    ) : (
      <EmptyState title={copy.published} />
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
                  sizes="(max-width: 480px) 46vw, (max-width: 900px) 24vw, 16vw"
                  quality={90}
                  unoptimized={!isOptimizableImageUrl(w.img)}
                />
              </div>
              <div className="wb-disc-caption">
                {meta && <div className="wb-disc-cap-meta">{meta}</div>}
                <div className="wb-disc-cap-title">{w.title}</div>
                {/* Blog-only excerpt (Part 8) — real `excerpt` field, never
                    shown in ALL/ART so the two card types stay visually
                    unified there. */}
                {mode === "blog" && w.excerpt && <div className="wb-disc-cap-excerpt">{w.excerpt}</div>}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
