"use client";

import { useEffect, useRef, useState } from "react";

export default function NumberPicker({
  id,
  name,
  defaultValue,
  min = 0,
  max = 999,
  formId,
}: {
  id?: string;
  name: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  formId?: string;
}) {
  const fallback = defaultValue ?? 0;
  const [value, setValue] = useState(fallback);
  const [draft, setDraft] = useState(String(fallback));
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
      const clamped = Math.min(max, Math.max(min, Math.round(n)));
      setValue(clamped);
      setDraft(String(clamped));
    }
    setOpen(false);
  }

  return (
    <div className="yp" ref={ref}>
      <input type="hidden" name={name} value={value} form={formId} readOnly />
      <button type="button" id={id} className="yp-trigger" onClick={() => setOpen((o) => !o)}>
        {value}
      </button>
      {open && (
        <div className="yp-panel">
          <input
            ref={inputRef}
            type="number"
            className="yp-input"
            min={min}
            max={max}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
            }}
          />
          <div className="yp-hint">{min}–{max}</div>
          <button type="button" className="yp-confirm" onClick={commit}>Set Value</button>
        </div>
      )}
    </div>
  );
}
