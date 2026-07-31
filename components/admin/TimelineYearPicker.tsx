"use client";

import { useEffect, useRef, useState } from "react";

const MIN_YEAR = 2000;
const MAX_YEAR = 2199;
const ONGOING = "→";

export default function TimelineYearPicker({
  name,
  defaultValue,
  formId,
  onValueChange,
}: {
  name: string;
  defaultValue?: string;
  formId?: string;
  onValueChange?: (value: string) => void;
}) {
  const fallback = String(new Date().getFullYear());
  const [value, setValueState] = useState(defaultValue ?? fallback);

  function setValue(v: string) {
    setValueState(v);
    onValueChange?.(v);
  }
  const [draft, setDraft] = useState(value === ONGOING ? fallback : value);
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
      const clamped = String(Math.min(MAX_YEAR, Math.max(MIN_YEAR, Math.round(n))));
      setValue(clamped);
      setDraft(clamped);
    }
    setOpen(false);
  }

  function setOngoing() {
    setValue(ONGOING);
    setOpen(false);
  }

  return (
    <div className="yp" ref={ref}>
      <input type="hidden" name={name} value={value} form={formId} readOnly />
      <button type="button" className="yp-trigger" onClick={() => setOpen((o) => !o)}>
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
          <button type="button" className={`yp-ongoing ${value === ONGOING ? "on" : ""}`} onClick={setOngoing}>
            → Ongoing
          </button>
        </div>
      )}
    </div>
  );
}
