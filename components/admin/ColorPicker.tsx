"use client";

import { useEffect, useRef, useState } from "react";

const SWATCHES = [
  "#c2415e", "#8a2438", "#d4536f", "#6b1c2c",
  "#f0e6dc", "#241417", "#c7b7ab", "#4a2f34",
  "#0f0a0b", "#f8f1e8", "#7d6b64", "#8c7770",
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export default function ColorPicker({
  name,
  defaultValue,
  formId,
  themeHint,
  onValueChange,
}: {
  name: string;
  defaultValue?: string;
  formId?: string;
  themeHint?: "dark" | "light";
  onValueChange?: (value: string) => void;
}) {
  const initial = defaultValue && HEX_RE.test(defaultValue) ? defaultValue : "";
  const [value, setValueState] = useState(initial);
  const [customHex, setCustomHex] = useState(initial && !SWATCHES.includes(initial) ? initial : "");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function setValue(v: string) {
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

  function commitCustom() {
    if (HEX_RE.test(customHex)) {
      setValue(customHex);
      setOpen(false);
    }
  }

  const previewColor = value || (HEX_RE.test(customHex) ? customHex : null);

  return (
    <div className="cp" ref={ref}>
      <input type="hidden" name={name} value={value} form={formId} readOnly />
      <button type="button" className="cp-trigger" onClick={() => setOpen((o) => !o)}>
        <span className="cp-trigger-dot" style={{ background: value || "transparent" }} />
        {themeHint === "dark" ? "Dark: " : themeHint === "light" ? "Light: " : ""}
        {value ? value : "Default"}
      </button>
      {open && (
        <div className="cp-panel">
          <button
            type="button"
            className={`cp-default-btn ${value === "" ? "on" : ""}`}
            onClick={() => {
              setValue("");
              setOpen(false);
            }}
          >
            Default (theme)
          </button>
          <div className="cp-grid">
            {SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                className={`cp-dot ${value === c ? "on" : ""}`}
                style={{ background: c }}
                onClick={() => {
                  setValue(c);
                  setOpen(false);
                }}
              />
            ))}
          </div>
          <input
            type="text"
            className="cp-hex-input"
            value={customHex}
            placeholder="#rrggbb"
            onChange={(e) => setCustomHex(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitCustom();
              }
            }}
          />
          <button type="button" className="cp-confirm" onClick={commitCustom}>Use Custom</button>
          {previewColor && (
            <div className="cp-preview-row">
              {themeHint !== "light" && (
                <span className="cp-preview cp-preview-dark" style={{ color: previewColor }}>Aa</span>
              )}
              {themeHint !== "dark" && (
                <span className="cp-preview cp-preview-light" style={{ color: previewColor }}>Aa</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
