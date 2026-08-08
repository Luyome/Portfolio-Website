"use client";

import { ENTITY_TYPE_LABELS, WORLDBUILDING_ENTITY_TYPES } from "@/types/worldbuilding";
import type { EntityTypeFilter } from "@/types/worldbuilding";

export default function WorldbuildingControls({
  search,
  onSearchChange,
  entityFilter,
  onEntityFilterChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  entityFilter: EntityTypeFilter;
  onEntityFilterChange: (v: EntityTypeFilter) => void;
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
        {WORLDBUILDING_ENTITY_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            className={`wb-pill ${entityFilter === t ? "on" : ""}`}
            aria-pressed={entityFilter === t}
            onClick={() => onEntityFilterChange(t)}
          >
            {ENTITY_TYPE_LABELS[t]}
          </button>
        ))}
      </div>
    </div>
  );
}
