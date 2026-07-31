"use client";

import { useEffect, useRef, useState } from "react";
import { MIN_YEAR, MAX_YEAR, clampYear } from "./YearPicker";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseDisplayDate(s?: string): { y: number; m: number; d: number } | null {
  if (!s) return null;
  const match = s.match(/^([A-Za-z]{3,9})\s+(\d{1,2}),\s+(\d{4})$/);
  if (!match) return null;
  const mi = MONTH_NAMES.findIndex((mn) => mn.toLowerCase() === match[1].slice(0, 3).toLowerCase());
  if (mi === -1) return null;
  return { y: Number(match[3]), m: mi, d: Number(match[2]) };
}

function formatDisplayDate(y: number, m: number, d: number) {
  return `${MONTH_NAMES[m]} ${d}, ${y}`;
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

export default function DatePicker({
  id,
  name,
  defaultValue,
  onValueChange,
}: {
  id?: string;
  name: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  const parsed = parseDisplayDate(defaultValue);
  const today = new Date();
  const fallback = formatDisplayDate(today.getFullYear(), today.getMonth(), today.getDate());
  const [value, setValueState] = useState(defaultValue || fallback);

  function setValue(v: string) {
    setValueState(v);
    onValueChange?.(v);
  }
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed?.y ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.m ?? today.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function pickDay(d: number) {
    setValue(formatDisplayDate(viewYear, viewMonth, d));
    setOpen(false);
  }

  function changeMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    y = clampYear(y);
    setViewMonth(m);
    setViewYear(y);
  }

  function commitYear(raw: string) {
    const n = Number(raw);
    if (Number.isFinite(n) && raw.trim() !== "") setViewYear(clampYear(Math.round(n)));
  }

  const numDays = daysInMonth(viewYear, viewMonth);
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const selected = parseDisplayDate(value);

  return (
    <div className="dp" ref={ref}>
      <input type="hidden" name={name} value={value} readOnly />
      <button type="button" id={id} className="dp-trigger" onClick={() => setOpen((o) => !o)}>
        {value}
      </button>
      {open && (
        <div className="dp-panel">
          <div className="dp-head">
            <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">‹</button>
            <input
              type="number"
              className="dp-year-input"
              min={MIN_YEAR}
              max={MAX_YEAR}
              value={viewYear}
              onChange={(e) => commitYear(e.target.value)}
            />
            <select value={viewMonth} onChange={(e) => setViewMonth(Number(e.target.value))}>
              {MONTH_NAMES.map((mn, i) => (
                <option key={mn} value={i}>{mn}</option>
              ))}
            </select>
            <button type="button" onClick={() => changeMonth(1)} aria-label="Next month">›</button>
          </div>
          <div className="dp-grid">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <span key={`e${i}`} />
            ))}
            {Array.from({ length: numDays }, (_, i) => i + 1).map((d) => (
              <button
                type="button"
                key={d}
                className={`dp-day ${selected && selected.y === viewYear && selected.m === viewMonth && selected.d === d ? "on" : ""}`}
                onClick={() => pickDay(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
