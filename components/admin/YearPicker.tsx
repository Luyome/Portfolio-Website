"use client";

import { useEffect, useRef, useState } from "react";

const MIN_YEAR = 2000;
const MAX_YEAR = 2199;

export default function YearPicker({
  id,
  name,
  defaultValue,
  required,
}: {
  id?: string;
  name: string;
  defaultValue?: number | null;
  required?: boolean;
}) {
  const [value, setValue] = useState<number | undefined>(defaultValue ?? undefined);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (open) {
      panelRef.current?.querySelector<HTMLElement>(".yp-opt.on")?.scrollIntoView({ block: "center" });
    }
  }, [open]);

  const years: number[] = [];
  for (let y = MAX_YEAR; y >= MIN_YEAR; y--) years.push(y);

  return (
    <div className="yp" ref={ref}>
      <input type="hidden" name={name} value={value ?? ""} required={required} readOnly />
      <button type="button" id={id} className="yp-trigger" onClick={() => setOpen((o) => !o)}>
        {value ?? "Select year"}
      </button>
      {open && (
        <div className="yp-panel" ref={panelRef}>
          {years.map((y) => (
            <button
              type="button"
              key={y}
              className={`yp-opt ${y === value ? "on" : ""}`}
              onClick={() => {
                setValue(y);
                setOpen(false);
              }}
            >
              {y}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
