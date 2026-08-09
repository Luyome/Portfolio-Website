"use client";

import { useEffect, useRef, useState } from "react";
import { fieldStyle } from "@/lib/style-fields";
import { parseContent, extractHeadings } from "@/lib/content-blocks";
import { downloadUrl } from "@/lib/download-url";
import { toEmbedUrl } from "@/lib/video-embed";
import type { GalleryItem } from "@/components/shared/MediaLightbox";
import InlineBold from "@/components/InlineBold";
import ImageZoomOverlay from "@/components/ImageZoomOverlay";
import { useModalFocus } from "@/hooks/useModalFocus";

/**
 * The shared "Blog" reading experience (Phase 2) — the long-form
 * article-reading counterpart to `MediaLightbox`'s "Gallery" template,
 * selected per-entry via `displayTemplate` (independent of content type or
 * taxonomy) across Worldbuilding, Portfolio, Sketches, 3D, and Games. A full
 * dark reading surface with a centered prose column, large title, small
 * metadata line, section headings, and inline images that may bleed wider
 * than the column — matching the ArtStation Breakdown reference, not
 * `MediaLightbox`'s media-stage-plus-sidebar layout. Originally built as
 * Worldbuilding's own "Lore Reader" (Sprint 4 Task 4.4B); promoted to this
 * shared location in Phase 2 without changing its behavior.
 */
export default function BlogReader({
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
  const articleRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useModalFocus(open && !zoomSrc, articleRef);

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
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [index]);

  if (!item) return null;

  const blocks = parseContent(item.content ?? "");
  const headings = extractHeadings(item.content ?? "");

  function scrollToHeading(slug: string) {
    const el = articleRef.current?.querySelector(`#${CSS.escape(slug)}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="wbr-overlay" role="dialog" aria-modal="true" aria-labelledby="wbr-title">
      <div className="wbr-topbar">
        <span className="wbr-crumb">Worldbuilding / <span className="wbr-crumb-accent">{item.catLabel}</span></span>
        <button type="button" className="wbr-close" onClick={onClose}>✕ &nbsp; Close</button>
      </div>
      <div className="wbr-scroll" ref={scrollRef}>
        <div className="wbr-article" ref={articleRef}>
          <header className="wbr-header">
            <div className="wbr-title" id="wbr-title" style={fieldStyle(item.styles, "title")}>{item.title}</div>
            <div className="wbr-meta">
              {item.metaRows?.map((row) => (
                <span className="wbr-meta-item" key={row.label}>{row.label}: {row.value}</span>
              ))}
            </div>
            {headings.length > 0 && (
              <nav className="wbr-toc">
                {headings.map((h) => (
                  <button key={h.slug} type="button" className="wbr-toc-link" onClick={() => scrollToHeading(h.slug)}>
                    {h.text}
                  </button>
                ))}
              </nav>
            )}
          </header>

          {item.img && (
            <div className="wbr-cover" {...zoomTrigger(item.img)}>
              <img src={item.img} alt={item.title} />
            </div>
          )}

          <div className="wbr-body">
            {blocks.map((b, bi) => {
              if (b.type === "heading") {
                return <h2 key={bi} id={b.slug} className="wbr-heading">{b.text}</h2>;
              }
              if (b.type === "image") {
                return <img key={bi} src={b.src} alt={b.alt} className="wbr-img" {...zoomTrigger(b.src)} />;
              }
              if (b.type === "video") {
                const embed = toEmbedUrl(b.src);
                if (!embed) return null;
                return (
                  <iframe
                    key={bi}
                    src={embed}
                    className="gm-video-embed wbr-video"
                    title={`${item.title} video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                );
              }
              return (
                <p key={bi} className="wbr-p">
                  <InlineBold text={b.text} />
                </p>
              );
            })}
          </div>

          <footer className="wbr-footer">
            {item.desc && <div className="wbr-desc" style={fieldStyle(item.styles, "desc")}>{item.desc}</div>}
            {item.tags && item.tags.length > 0 && (
              <div className="wbr-tags">
                {item.tags.map((t) => (
                  <span className="wbr-tag" key={t}>{t}</span>
                ))}
              </div>
            )}
            {item.related && item.related.length > 0 && (
              <div className="wbr-related">
                <div className="wbr-related-lbl">Related Worldbuilding Entries</div>
                <div className="wbr-related-list">
                  {item.related.map((r) => (
                    <div
                      key={r.id}
                      className="wbr-related-card"
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
                      <div className="wbr-related-thumb">
                        {r.img && <img src={r.img} alt="" />}
                      </div>
                      <div className="wbr-related-meta">
                        <div className="wbr-related-type">{r.typeLabel}</div>
                        <div className="wbr-related-title">{r.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {item.links && item.links.length > 0 ? (
              <div className="wbr-link-area">
                <div className="wbr-link-lbl">Links</div>
                <div className="wbr-links-list">
                  {item.links.map((l) =>
                    l.kind === "download" ? (
                      <a key={l.id} href={downloadUrl(l.href, l.label)} className="wbr-link-chip">
                        {l.label}
                      </a>
                    ) : (
                      <a key={l.id} href={l.href} target="_blank" rel="noopener noreferrer" className="wbr-link-chip">
                        {l.label}
                      </a>
                    )
                  )}
                </div>
              </div>
            ) : item.link && (
              <div className="wbr-link-area">
                <div className="wbr-link-lbl">External Link</div>
                <div className="wbr-link-row">
                  <input className="wbr-link-in" aria-label="External link URL" value={item.link} readOnly />
                  <button type="button" className="wbr-link-btn" onClick={() => window.open(item.link, "_blank")}>
                    Open →
                  </button>
                </div>
              </div>
            )}
          </footer>
        </div>
      </div>
      <button
        type="button"
        className="wbr-edge-nav wbr-edge-nav--prev"
        disabled={index === 0}
        aria-label="Previous entry"
        onClick={() => index !== null && goTo(index - 1)}
      >
        ‹
      </button>
      <button
        type="button"
        className="wbr-edge-nav wbr-edge-nav--next"
        disabled={index === items.length - 1}
        aria-label="Next entry"
        onClick={() => index !== null && goTo(index + 1)}
      >
        ›
      </button>
      {zoomSrc && <ImageZoomOverlay src={zoomSrc} alt={item.title} onClose={() => setZoomSrc(null)} />}
    </div>
  );
}
