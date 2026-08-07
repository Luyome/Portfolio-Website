"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

// Small, dependency-free multi-select: a searchable dropdown of active
// options plus removable chips for the current selection (Task 2.10). Used
// by PortfolioForm for the four controlled metadata groups (Medium, Subject
// Matter, Software, Tags) — kept generic so any future controlled-metadata
// consumer can reuse it without duplicating this.
//
// Composes with `Field` the same way a plain `<input>` does: `Field`
// clones `id`/`aria-describedby`/`aria-invalid` onto this component's
// element, and they're applied here to the actual search `<input>` so
// `<label htmlFor>` and error/hint wiring still land on the right control.

export type MultiSelectOption = { id: number; name: string };
export type MultiSelectChip = { id: number; name: string; isActive: boolean };

export default function MultiSelect({
  id,
  name,
  options,
  initialSelected,
  metadataType,
  placeholder = "Search…",
  onSelectionChange,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
}: {
  id?: string;
  /** FormData field name — one hidden input per selected option is submitted under this name. */
  name: string;
  /** Active, addable options. */
  options: MultiSelectOption[];
  /** Already-selected options, including any since made inactive. */
  initialSelected?: MultiSelectChip[];
  /** Metadata type slug, for the empty-state "Admin → Metadata" link. */
  metadataType: string;
  placeholder?: string;
  onSelectionChange?: (selected: MultiSelectChip[]) => void;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}) {
  const [selected, setSelected] = useState<MultiSelectChip[]>(initialSelected ?? []);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  // -1 = nothing highlighted yet. Distinct from "index 0 highlighted" so the
  // first ArrowDown after opening (via mouse/focus, with no typing) lands on
  // the first option instead of skipping straight to the second.
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = id ? `${id}-listbox` : undefined;

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selectedIds = useMemo(() => new Set(selected.map((s) => s.id)), [selected]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter((o) => !selectedIds.has(o.id) && (!q || o.name.toLowerCase().includes(q)));
  }, [options, selectedIds, query]);

  function commit(next: MultiSelectChip[]) {
    setSelected(next);
    onSelectionChange?.(next);
  }

  function addOption(opt: MultiSelectOption) {
    commit([...selected, { id: opt.id, name: opt.name, isActive: true }]);
    setQuery("");
    setActiveIndex(0);
  }

  function removeOption(optId: number) {
    commit(selected.filter((s) => s.id !== optId));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        // First ArrowDown opens the dropdown and highlights the first
        // option, rather than opening on index 0 and immediately advancing
        // past it.
        setOpen(true);
        setActiveIndex(0);
      } else if (activeIndex < 0) {
        // Already open (via mouse/focus) but nothing highlighted yet.
        setActiveIndex(0);
      } else {
        setActiveIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const opt = activeIndex >= 0 ? filtered[activeIndex] : undefined;
      if (open && opt) {
        e.preventDefault();
        addOption(opt);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className="ms" ref={rootRef}>
      {selected.map((s) => (
        <input key={s.id} type="hidden" name={name} value={s.id} />
      ))}
      {selected.length > 0 && (
        <div className="ms-chips">
          {selected.map((s) => (
            <span className={`ms-chip${s.isActive ? "" : " ms-chip-inactive"}`} key={s.id}>
              {s.name}
              {!s.isActive && <span className="ms-chip-badge">Inactive</span>}
              <button
                type="button"
                className="ms-chip-remove"
                onClick={() => removeOption(s.id)}
                aria-label={`Remove ${s.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      {options.length === 0 ? (
        <p className="ms-empty">
          No options yet. Add some in{" "}
          <Link href={`/admin/metadata?type=${metadataType}`}>Admin → Metadata</Link>.
        </p>
      ) : (
        <div className="ms-input-wrap">
          <input
            id={id}
            type="text"
            className="ms-search"
            value={query}
            placeholder={placeholder}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActiveIndex(0);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            aria-expanded={open}
            aria-controls={listboxId}
            aria-activedescendant={
              open && activeIndex >= 0 && filtered[activeIndex] ? `${listboxId}-opt-${filtered[activeIndex].id}` : undefined
            }
            aria-autocomplete="list"
            role="combobox"
            autoComplete="off"
          />
          {open && (
            <div className="ms-panel" id={listboxId} role="listbox">
              {filtered.length === 0 ? (
                <div className="ms-no-match">No matches.</div>
              ) : (
                filtered.map((opt, i) => (
                  <button
                    type="button"
                    key={opt.id}
                    id={`${listboxId}-opt-${opt.id}`}
                    role="option"
                    // This panel only ever lists addable (not-yet-selected)
                    // options, so nothing rendered here is ever the true
                    // "selected" value — aria-selected stays false and the
                    // `active` class alone carries keyboard-highlight state,
                    // so the two are never conflated (Sprint 2 Closure Audit,
                    // finding 3).
                    aria-selected={false}
                    className={`ms-opt${i === activeIndex ? " active" : ""}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addOption(opt)}
                  >
                    {opt.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
