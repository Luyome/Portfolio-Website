"use client";

import { useMemo, useState } from "react";
import type { ContentEvent } from "@/lib/dashboard-analytics";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Bucket = { label: string; words: number; images: number };

export default function DashboardChart({ events }: { events: ContentEvent[] }) {
  const years = useMemo(() => {
    const set = new Set(events.map((e) => new Date(e.createdAt).getFullYear()));
    set.add(new Date().getFullYear());
    return Array.from(set).sort((a, b) => b - a);
  }, [events]);

  const [year, setYear] = useState<number | "ALL">(years[0]);
  const [month, setMonth] = useState<number | "ALL">("ALL");

  const buckets: Bucket[] = useMemo(() => {
    if (year === "ALL") {
      const map = new Map<number, Bucket>();
      for (const y of years) map.set(y, { label: String(y), words: 0, images: 0 });
      for (const e of events) {
        const y = new Date(e.createdAt).getFullYear();
        const b = map.get(y) ?? { label: String(y), words: 0, images: 0 };
        b.words += e.words;
        b.images += e.hasImage ? 1 : 0;
        map.set(y, b);
      }
      return Array.from(map.values()).sort((a, b) => Number(a.label) - Number(b.label));
    }

    if (month === "ALL") {
      const arr: Bucket[] = MONTH_NAMES.map((label) => ({ label, words: 0, images: 0 }));
      for (const e of events) {
        const d = new Date(e.createdAt);
        if (d.getFullYear() !== year) continue;
        arr[d.getMonth()].words += e.words;
        arr[d.getMonth()].images += e.hasImage ? 1 : 0;
      }
      return arr;
    }

    const numDays = new Date(year, month + 1, 0).getDate();
    const arr: Bucket[] = Array.from({ length: numDays }, (_, i) => ({ label: String(i + 1), words: 0, images: 0 }));
    for (const e of events) {
      const d = new Date(e.createdAt);
      if (d.getFullYear() !== year || d.getMonth() !== month) continue;
      arr[d.getDate() - 1].words += e.words;
      arr[d.getDate() - 1].images += e.hasImage ? 1 : 0;
    }
    return arr;
  }, [events, year, month, years]);

  const maxWords = Math.max(...buckets.map((b) => b.words), 1);
  const maxImages = Math.max(...buckets.map((b) => b.images), 1);

  return (
    <div className="adm-chart-card">
      <div className="adm-chart-head">
        <h2 className="adm-chart-title">Content Activity</h2>
        <div className="adm-chart-filters">
          <button
            type="button"
            className={`adm-chart-chip ${year === "ALL" ? "on" : ""}`}
            onClick={() => {
              setYear("ALL");
              setMonth("ALL");
            }}
          >
            ALL
          </button>
          <select
            value={year === "ALL" ? "ALL" : year}
            onChange={(e) => {
              const v = e.target.value;
              setYear(v === "ALL" ? "ALL" : Number(v));
              setMonth("ALL");
            }}
          >
            <option value="ALL">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {year !== "ALL" && (
            <select value={month === "ALL" ? "ALL" : month} onChange={(e) => setMonth(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}>
              <option value="ALL">All months</option>
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
          )}
        </div>
      </div>
      <div className="adm-chart-legend">
        <span><span className="adm-legend-dot words" />Words written</span>
        <span><span className="adm-legend-dot images" />Images added</span>
      </div>
      <div className="adm-bar-chart">
        {buckets.map((b, i) => (
          <div key={i} className="adm-bar-group" title={`${b.label}: ${b.words} words, ${b.images} images`}>
            <div className="adm-bar-words" style={{ height: `${(b.words / maxWords) * 100}%` }} />
            <div className="adm-bar-images" style={{ height: `${(b.images / maxImages) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="adm-bar-labels">
        {buckets.map((b, i) => (
          <span key={i}>{b.label}</span>
        ))}
      </div>
    </div>
  );
}
