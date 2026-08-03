"use client";

import { useEffect, useRef, useState } from "react";

export const MIN_ORDER = 1;
export const MAX_ORDER = 10;

export default function OrderPicker({
  name,
  defaultValue,
  formId,
  onValueChange,
}: {
  name: string;
  defaultValue?: number;
  formId?: string;
  onValueChange?: (value: number) => void;
}) {
  const fallback = defaultValue ?? MIN_ORDER;
  const [value, setValueState] = useState(fallback);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function setValue(v: number) {
    setValueState(v);
    onValueChange?.(v);
  }

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const inRange = value >= MIN_ORDER && value <= MAX_ORDER;
  const options = Array.from({ length: MAX_ORDER - MIN_ORDER + 1 }, (_, i) => MIN_ORDER + i);

  return (
    <div className="op" ref={ref}>
      <input type="hidden" name={name} value={value} form={formId} readOnly />
      <button type="button" className="op-trigger" onClick={() => setOpen((o) => !o)}>
        {value}
      </button>
      {open && (
        <div className="op-panel">
          <div className="op-grid">
            {options.map((n) => (
              <button
                type="button"
                key={n}
                className={`op-dot ${value === n ? "on" : ""}`}
                onClick={() => {
                  setValue(n);
                  setOpen(false);
                }}
              >
                {n}
              </button>
            ))}
          </div>
          {!inRange && (
            <div className="op-current">
              Current: <strong>{value}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
