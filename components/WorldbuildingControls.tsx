"use client";

import type { EntityTypeFilter } from "@/types/worldbuilding";
import type { WorldbuildingEntityTypeOption } from "./WorldbuildingBrowser";

export default function WorldbuildingControls({
  search,
  onSearchChange,
  entityFilter,
  onEntityFilterChange,
  entityTypeOptions,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  entityFilter: EntityTypeFilter;
  onEntityFilterChange: (v: EntityTypeFilter) => void;
  /** Active Entity Type options (Phase 2) — the filter tabs are built from this instead of a fixed list. */
  entityTypeOptions: WorldbuildingEntityTypeOption[];
}) {
  return (
    <div className="wb-ctrl">
      <div className="wb-ctrl-row">
        <input
          type="search"
          className="wb-search"
          placeholder="Search the Codex…"
          aria-label="Search the Codex"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="wb-pill-row">
        <button
          type="button"
          className={`wb-pill ${entityFilter === "all" ? "on" : ""}`}
          aria-pressed={entityFilter === "all"}
          onClick={() => onEntityFilterChange("all")}
        >
          All
        </button>
        {entityTypeOptions.map((t) => (
          <button
            key={t.slug}
            type="button"
            className={`wb-pill ${entityFilter === t.slug ? "on" : ""}`}
            aria-pressed={entityFilter === t.slug}
            onClick={() => onEntityFilterChange(t.slug)}
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
}
