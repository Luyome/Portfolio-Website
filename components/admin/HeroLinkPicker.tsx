"use client";

import { useEffect, useRef, useState } from "react";

const PAGE_OPTIONS = [
  { label: "Home", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Sketches", href: "/sketches" },
  { label: "Worldbuilding", href: "/worldbuilding" },
  { label: "Map", href: "/map" },
  { label: "Games", href: "/games" },
  { label: "About", href: "/about" },
  { label: "Archive", href: "/archive" },
];

export default function HeroLinkPicker({
  labelName,
  hrefName,
  defaultLabel,
  defaultHref,
  onValueChange,
}: {
  labelName: string;
  hrefName: string;
  defaultLabel?: string;
  defaultHref?: string;
  onValueChange?: (value: { label: string; href: string }) => void;
}) {
  const matched = PAGE_OPTIONS.find((p) => p.href === defaultHref);
  // Preserve any existing href that isn't one of the known pages (external URL, mailto:, etc.)
  // instead of silently discarding it in favor of Home.
  const custom = !matched && defaultHref ? { label: defaultLabel || defaultHref, href: defaultHref } : null;
  const options = custom ? [custom, ...PAGE_OPTIONS] : PAGE_OPTIONS;
  const [selected, setSelectedState] = useState(matched ?? custom ?? PAGE_OPTIONS[0]);

  function setSelected(opt: { label: string; href: string }) {
    setSelectedState(opt);
    onValueChange?.(opt);
  }
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
      <input type="hidden" name={labelName} value={selected.label} readOnly />
      <input type="hidden" name={hrefName} value={selected.href} readOnly />
      <button type="button" className="hlp-trigger" onClick={() => setOpen((o) => !o)}>
        {selected.label} <span className="hlp-href">{selected.href}</span>
      </button>
      {open && (
        <div className="hlp-panel">
          {options.map((opt) => (
            <button
              type="button"
              key={opt.href}
              className={`hlp-opt ${opt.href === selected.href ? "on" : ""}`}
              onClick={() => {
                setSelected(opt);
                setOpen(false);
              }}
            >
              {opt.label} <span className="hlp-href">{opt.href}</span>
              {opt === custom && <span className="hlp-custom-badge">Current</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
