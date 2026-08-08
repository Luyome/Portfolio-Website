"use client";

import { useEffect, useRef, useState } from "react";
import { fieldStyle } from "@/lib/style-fields";
import { parseContent } from "@/lib/content-blocks";
import { buildMediaSequence } from "@/lib/content-sequence";
import { downloadUrl } from "@/lib/download-url";
import type { GalleryItem } from "@/components/GalleryModal";
import InlineBold from "@/components/InlineBold";
import ImageZoomOverlay from "@/components/ImageZoomOverlay";
import { useModalFocus } from "@/hooks/useModalFocus";

const NO_IMAGE_SVG =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23151010"/><text fill="%23555" x="50%25" y="50%25" font-size="18" text-anchor="middle" dy=".35em">No Image</text></svg>';

/**
 * Worldbuilding "Artwork / Entity Detail" — the media-dominant viewer used
 * for Character / Location / Corporation / Technology entries and any
 * untyped legacy entry (Sprint 4 Task 4.4B). A large viewport-scale media
 * stage on the left plus a dedicated information rail on the right, per the
 * ArtStation artwork-viewer reference. This is a standalone presentation
 * component, deliberately not GalleryModal with a CSS modifier — see
 * WorldbuildingLoreReader for the separate long-form reading experience.
 */
export default function WorldbuildingArtworkDetail({
  items,
  index,
  onClose,
  onNavigate,
  onRelatedSelect,
}: {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onRelatedSelect?: (id: number) => void;
}) {
  const open = index !== null;
  const item = open ? items[index] : null;
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useModalFocus(open && !zoomSrc, panelRef);

  function goTo(next: number) {
    setZoomSrc(null);
    onNavigate(next);
  }

  function selectRelated(id: number) {
    setZoomSrc(null);
    onRelatedSelect?.(id);
  }

  function zoomTrigger(src: string) {
    return {
      role: "button" as const,
      tabIndex: 0,
      onClick: () => setZoomSrc(src),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setZoomSrc(src);
        }
      },
    };
  }

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (zoomSrc) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index !== null && index > 0) goTo(index - 1);
      if (e.key === "ArrowRight" && index !== null && index < items.length - 1) goTo(index + 1);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, index, items.length, onClose, zoomSrc]); // eslint-disable-line react-hooks/exhaustive-deps -- goTo is stable across renders

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (mediaRef.current) mediaRef.current.scrollTop = 0;
  }, [index]);

  if (!item) return null;

  const sequence = buildMediaSequence(item);
  const hasExtraContent = !!item.content?.trim();
  const contentBlocks = hasExtraContent ? parseContent(item.content!) : [];

  return (
    <div
      className="wbd-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="wbd-stage" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="wbd-title">
        <div className="wbd-media">
          <div className="wbd-media-scroll" ref={mediaRef}>
            {item.img ? (
              <img src={item.img} alt={item.title} className="wbd-media-img" {...zoomTrigger(item.img)} />
            ) : sequence.length === 0 ? (
              <img src={NO_IMAGE_SVG} alt="" className="wbd-media-img" />
            ) : null}
            {sequence.map((entry, i) =>
              entry.kind === "video" ? (
                <iframe
                  key={`vid-${i}`}
                  src={entry.embed}
                  className="gm-video-embed wbd-media-video"
                  title={`${item.title} video ${i + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <img
                  key={`img-${i}`}
                  src={entry.url}
                  alt={item.title}
                  className="wbd-media-img"
                  {...zoomTrigger(entry.url)}
                />
              )
            )}
          </div>
          <button
            type="button"
            className="wbd-edge-nav wbd-edge-nav--prev"
            disabled={index === 0}
            aria-label="Previous entry"
            onClick={() => index !== null && goTo(index - 1)}
          >
            ←
          </button>
          <button
            type="button"
            className="wbd-edge-nav wbd-edge-nav--next"
            disabled={index === items.length - 1}
            aria-label="Next entry"
            onClick={() => index !== null && goTo(index + 1)}
          >
            →
          </button>
        </div>

        <div className="wbd-rail">
          <div className="wbd-rail-bar">
            <span className="wbd-cat-lbl">{item.catLabel}</span>
            <button type="button" className="wbd-close" onClick={onClose}>✕ &nbsp; Close</button>
          </div>
          <div className="wbd-title" id="wbd-title" style={fieldStyle(item.styles, "title")}>{item.title}</div>
          {item.subtitle && <div className="wbd-subtitle">{item.subtitle}</div>}
          {item.metaRows && item.metaRows.length > 0 && (
            <div className="wbd-meta">
              {item.metaRows.map((row) => (
                <div className="wbd-meta-row" key={row.label}>
                  <span className="wbd-meta-lbl">{row.label}</span>
                  <span className="wbd-meta-val">{row.value}</span>
                </div>
              ))}
            </div>
          )}
          {item.desc && <div className="wbd-desc" style={fieldStyle(item.styles, "desc")}>{item.desc}</div>}
          {hasExtraContent && (
            <div className="wbd-body">
              {contentBlocks.map((b, bi) => {
                if (b.type === "heading") return <h3 key={bi} className="wbd-body-heading">{b.text}</h3>;
                if (b.type === "image" || b.type === "video") return null;
                return (
                  <p key={bi} className="wbd-body-p">
                    <InlineBold text={b.text} />
                  </p>
                );
              })}
            </div>
          )}
          {item.tags && item.tags.length > 0 && (
            <div className="wbd-tags">
              {item.tags.map((t) => (
                <span className="wbd-tag" key={t}>{t}</span>
              ))}
            </div>
          )}
          {item.related && item.related.length > 0 && (
            <div className="wbd-related">
              <div className="wbd-related-lbl">Related Worldbuilding Entries</div>
              <div className="wbd-related-list">
                {item.related.map((r) => (
                  <div
                    key={r.id}
                    className="wbd-related-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => selectRelated(r.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        selectRelated(r.id);
                      }
                    }}
                  >
                    <div className="wbd-related-thumb">
                      {r.img && <img src={r.img} alt="" />}
                    </div>
                    <div className="wbd-related-meta">
                      <div className="wbd-related-type">{r.typeLabel}</div>
                      <div className="wbd-related-title">{r.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {item.links && item.links.length > 0 ? (
            <div className="wbd-link-area">
              <div className="wbd-link-lbl">Links</div>
              <div className="wbd-links-list">
                {item.links.map((l) =>
                  l.kind === "download" ? (
                    <a key={l.id} href={downloadUrl(l.href, l.label)} className="wbd-link-chip">
                      {l.label}
                    </a>
                  ) : (
                    <a key={l.id} href={l.href} target="_blank" rel="noopener noreferrer" className="wbd-link-chip">
                      {l.label}
                    </a>
                  )
                )}
              </div>
            </div>
          ) : item.link && (
            <div className="wbd-link-area">
              <div className="wbd-link-lbl">External Link</div>
              <div className="wbd-link-row">
                <input className="wbd-link-in" aria-label="External link URL" value={item.link} readOnly />
                <button type="button" className="wbd-link-btn" onClick={() => window.open(item.link, "_blank")}>
                  Open →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {zoomSrc && <ImageZoomOverlay src={zoomSrc} alt={item.title} onClose={() => setZoomSrc(null)} />}
    </div>
  );
}
