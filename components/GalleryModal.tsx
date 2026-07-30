"use client";

import { useEffect } from "react";

export type GalleryItem = {
  img: string | null;
  title: string;
  catLabel: string;
  metaRows?: { label: string; value: string }[];
  desc?: string;
  tags?: string[];
  link?: string;
};

const NO_IMAGE_SVG =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23151010"/><text fill="%23555" x="50%25" y="50%25" font-size="18" text-anchor="middle" dy=".35em">No Image</text></svg>';

export default function GalleryModal({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const open = index !== null;
  const item = open ? items[index] : null;

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index !== null && index > 0) onNavigate(index - 1);
      if (e.key === "ArrowRight" && index !== null && index < items.length - 1) onNavigate(index + 1);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, index, items.length, onClose, onNavigate]);

  return (
    <div
      className={`gm-overlay ${open ? "open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {item && (
        <div className="gm-panel">
          <div className="gm-img-side">
            <img src={item.img || NO_IMAGE_SVG} alt={item.title} />
            <div className="gm-nav">
              <button
                className="gm-nav-btn"
                disabled={index === 0}
                onClick={() => index !== null && onNavigate(index - 1)}
              >
                ← Prev
              </button>
              <button
                className="gm-nav-btn"
                disabled={index === items.length - 1}
                onClick={() => index !== null && onNavigate(index + 1)}
              >
                Next →
              </button>
            </div>
          </div>
          <div className="gm-info">
            <div className="gm-bar">
              <span className="gm-cat-lbl">{item.catLabel}</span>
              <button className="gm-close" onClick={onClose}>✕ &nbsp; Close</button>
            </div>
            <div className="gm-title">{item.title}</div>
            {item.metaRows && item.metaRows.length > 0 && (
              <div>
                {item.metaRows.map((row) => (
                  <div className="gm-row" key={row.label}>
                    <span className="gm-lbl">{row.label}</span>
                    <span className="gm-val">{row.value}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="gm-desc-wrap">
              {item.desc && <div className="gm-desc">{item.desc}</div>}
              {item.tags && item.tags.length > 0 && (
                <div className="gm-tags">
                  {item.tags.map((t) => (
                    <span className="gm-tag" key={t}>{t}</span>
                  ))}
                </div>
              )}
            </div>
            {item.link && (
              <div className="gm-link-area">
                <div className="gm-link-lbl">External Link</div>
                <div className="gm-link-row">
                  <input className="gm-link-in" value={item.link} readOnly />
                  <button className="gm-link-btn" onClick={() => window.open(item.link, "_blank")}>
                    Open →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
