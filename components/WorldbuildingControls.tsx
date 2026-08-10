"use client";

import { useState, type ReactNode } from "react";
import type { EntityTypeFilter, WorldbuildingDiscoveryMode } from "@/types/worldbuilding";
import type { WorldbuildingEntityTypeOption, WorldbuildingMetadataChoice } from "./WorldbuildingBrowser";

const MODES: { id: WorldbuildingDiscoveryMode; label: string }[] = [
  { id: "all", label: "All" },
  { id: "art", label: "Art" },
  { id: "blog", label: "Blog" },
];

export default function WorldbuildingControls({
  mode,
  onModeChange,
  search,
  onSearchChange,
  entityFilter,
  onEntityFilterChange,
  entityTypeOptions,
  categoryFilter,
  onCategoryFilterChange,
  categoryOptions,
  chipFilter,
  onChipToggle,
  chipOptions,
  filtersActive,
  onClearFilters,
  resultCount,
  children,
}: {
  mode: WorldbuildingDiscoveryMode;
  onModeChange: (v: WorldbuildingDiscoveryMode) => void;
  search: string;
  onSearchChange: (v: string) => void;
  entityFilter: EntityTypeFilter;
  onEntityFilterChange: (v: EntityTypeFilter) => void;
  /** Active Entity Type options (Phase 2) — the filter tabs are built from this instead of a fixed list. */
  entityTypeOptions: WorldbuildingEntityTypeOption[];
  categoryFilter: string;
  onCategoryFilterChange: (v: string) => void;
  categoryOptions: WorldbuildingMetadataChoice[];
  chipFilter: string[];
  onChipToggle: (name: string) => void;
  chipOptions: WorldbuildingMetadataChoice[];
  filtersActive: boolean;
  onClearFilters: () => void;
  resultCount: number;
  children: ReactNode;
}) {
  const [railOpen, setRailOpen] = useState(false);

  return (
    <div className="wb-discovery">
      <div className="wb-header-row">
        <div className="wb-header-left">
          <div className="wb-mode-row" role="tablist" aria-label="Content mode">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={mode === m.id}
                className={`wb-mode-btn ${mode === m.id ? "on" : ""}`}
                onClick={() => onModeChange(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="wb-header-right">
          <h2 className="wb-header-title">Krupni Chronicles</h2>
          <p className="wb-header-subtitle">Lore / Stories / Art / Characters / Worlds</p>
        </div>
      </div>

      <button
        type="button"
        className="wb-rail-toggle"
        aria-expanded={railOpen}
        aria-controls="wb-rail"
        onClick={() => setRailOpen((o) => !o)}
      >
        Filters{filtersActive && <span className="wb-rail-toggle-dot" aria-hidden="true" />}
      </button>

      <div className="wb-body">
        <aside id="wb-rail" className={`wb-rail ${railOpen ? "open" : ""}`}>
          <div className="wb-rail-group">
            <label className="wb-rail-label" htmlFor="wb-search">
              Search
            </label>
            <input
              id="wb-search"
              type="search"
              className="wb-search"
              placeholder="Search the Codex…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {entityTypeOptions.length > 0 && (
            <div className="wb-rail-group">
              <label className="wb-rail-label" htmlFor="wb-entity-type">
                Entity Type
              </label>
              <select
                id="wb-entity-type"
                className="wb-rail-select"
                value={entityFilter}
                onChange={(e) => onEntityFilterChange(e.target.value)}
              >
                <option value="all">All types</option>
                {entityTypeOptions.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {categoryOptions.length > 0 && (
            <div className="wb-rail-group">
              <label className="wb-rail-label" htmlFor="wb-category">
                Category
              </label>
              <select
                id="wb-category"
                className="wb-rail-select"
                value={categoryFilter}
                onChange={(e) => onCategoryFilterChange(e.target.value)}
              >
                <option value="all">All categories</option>
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {chipOptions.length > 0 && (
            <div className="wb-rail-group">
              <span className="wb-rail-label">Chips</span>
              <div className="wb-chip-list">
                {chipOptions.map((c) => {
                  const on = chipFilter.includes(c.name);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className={`wb-chip-btn ${on ? "on" : ""}`}
                      aria-pressed={on}
                      onClick={() => onChipToggle(c.name)}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filtersActive && (
            <button type="button" className="wb-clear-btn" onClick={onClearFilters}>
              Clear Filters
            </button>
          )}
        </aside>

        <div className="wb-results">
          <div className="wb-result-count" role="status">
            {resultCount} {resultCount === 1 ? "result" : "results"}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
