"use client";

import { useEffect, useRef, useState } from "react";

export default function OptionPicker({
  id,
  name,
  options,
  defaultValue,
}: {
  id?: string;
  name: string;
  options: { label: string; value: string }[];
  defaultValue?: string;
}) {
  const initial = options.find((o) => o.value === defaultValue) ?? options[0];
  const [selected, setSelected] = useState(initial);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="hlp" ref={ref}>
      <input type="hidden" name={name} value={selected.value} readOnly />
      <button type="button" id={id} className="hlp-trigger" onClick={() => setOpen((o) => !o)}>
        {selected.label}
      </button>
      {open && (
        <div className="hlp-panel">
          {options.map((opt) => (
            <button
              type="button"
              key={opt.value}
              className={`hlp-opt ${opt.value === selected.value ? "on" : ""}`}
              onClick={() => {
                setSelected(opt);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
