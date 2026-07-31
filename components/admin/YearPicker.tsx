"use client";

import { useEffect, useRef, useState } from "react";

export const MIN_YEAR = 2000;
export const MAX_YEAR = 2199;

export function clampYear(n: number) {
  return Math.min(MAX_YEAR, Math.max(MIN_YEAR, n));
}

export default function YearPicker({
  id,
  name,
  defaultValue,
  onValueChange,
}: {
  id?: string;
  name: string;
  defaultValue?: number | null;
  onValueChange?: (value: number) => void;
}) {
  const fallback = new Date().getFullYear();
  const [value, setValueState] = useState<number>(defaultValue ?? fallback);
  const [draft, setDraft] = useState(String(defaultValue ?? fallback));

  function setValue(v: number) {
    setValueState(v);
    onValueChange?.(v);
  }
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function commit() {
    const n = Number(draft);
    if (Number.isFinite(n) && draft.trim() !== "") {
      const clamped = clampYear(Math.round(n));
      setValue(clamped);
      setDraft(String(clamped));
    }
    setOpen(false);
  }

  return (
    <div className="yp" ref={ref}>
      <input type="hidden" name={name} value={value} readOnly />
      <button type="button" id={id} className="yp-trigger" onClick={() => setOpen((o) => !o)}>
        {value}
      </button>
      {open && (
        <div className="yp-panel">
          <input
            ref={inputRef}
            type="number"
            className="yp-input"
            min={MIN_YEAR}
            max={MAX_YEAR}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
            }}
          />
          <div className="yp-hint">{MIN_YEAR}–{MAX_YEAR}</div>
          <button type="button" className="yp-confirm" onClick={commit}>Set Year</button>
        </div>
      )}
    </div>
  );
}
