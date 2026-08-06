"use client";

import { CATEGORIES } from "@/types/worldbuilding";
import type { CategoryFilter, ViewMode } from "@/types/worldbuilding";

export default function WorldbuildingControls({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  viewMode,
  onViewModeChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  category: CategoryFilter;
  onCategoryChange: (v: CategoryFilter) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
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
        <div className="wb-view-toggle">
          <button
            type="button"
            className={`wb-view-btn ${viewMode === "default" ? "on" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              onViewModeChange("default");
            }}
            aria-label="Default view"
            aria-pressed={viewMode === "default"}
          >
            ☰
          </button>
          <button
            type="button"
            className={`wb-view-btn ${viewMode === "grid" ? "on" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              onViewModeChange("grid");
            }}
            aria-label="Grid view"
            aria-pressed={viewMode === "grid"}
          >
            ▦
          </button>
        </div>
      </div>
      <div className="wb-pill-row">
        <button
          type="button"
          className={`wb-pill ${category === "all" ? "on" : ""}`}
          aria-pressed={category === "all"}
          onClick={() => onCategoryChange("all")}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className={`wb-pill ${category === c ? "on" : ""}`}
            aria-pressed={category === c}
            onClick={() => onCategoryChange(c)}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
