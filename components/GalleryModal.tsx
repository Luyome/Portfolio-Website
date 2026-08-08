"use client";

import { useEffect, useRef, useState } from "react";
import { fieldStyle } from "@/lib/style-fields";
import type { StylesMap } from "@/lib/style-fields";
import { parseContent, extractHeadings } from "@/lib/content-blocks";
import { downloadUrl } from "@/lib/download-url";
import { toEmbedUrl } from "@/lib/video-embed";
import type { MediaEntry } from "@/lib/group-images";
import InlineBold from "./InlineBold";
import ImageZoomOverlay from "./ImageZoomOverlay";
import { useModalFocus } from "@/hooks/useModalFocus";

export type GalleryLink = { id: number | string; label: string; href: string; kind?: string };

export type GalleryRelatedEntry = { id: number; title: string; img: string | null; typeLabel: string };

export type GalleryItem = {
  img: string | null;
  images?: MediaEntry[];
  videos?: MediaEntry[];
  title: string;
  catLabel: string;
  subtitle?: string;
  metaRows?: { label: string; value: string }[];
  desc?: string;
  content?: string;
  contentOrder?: number;
  feats?: string[];
  tags?: string[];
  link?: string;
  links?: GalleryLink[];
  /** Related entries (e.g. Task 4.2 Worldbuilding relationships). Only
   * populated by consumers that have real relationship data. */
  related?: GalleryRelatedEntry[];
  styles?: StylesMap;
};

type SeqEntry =
  | { kind: "content"; order: number }
  | { kind: "image"; order: number; url: string }
  | { kind: "video"; order: number; embed: string };

const NO_IMAGE_SVG =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23151010"/><text fill="%23555" x="50%25" y="50%25" font-size="18" text-anchor="middle" dy=".35em">No Image</text></svg>';

export default function GalleryModal({
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
  /** Opens a related entry by id (not by array index — related entries may
   * sit outside the currently filtered/navigable `items` sequence). */
  onRelatedSelect?: (id: number) => void;
}) {
  const open = index !== null;
  const item = open ? items[index] : null;
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const readingRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Only manages focus while the image zoom overlay isn't also open on top
  // — that overlay runs its own useModalFocus and returns focus back here.
  useModalFocus(open && !zoomSrc, panelRef);

  function goTo(next: number) {
    setZoomSrc(null);
    onNavigate(next);
  }

  function selectRelated(id: number) {
    setZoomSrc(null);
    onRelatedSelect?.(id);
  }

  // Spread onto the clickable image/cover elements below so opening the zoom
  // overlay works the same by keyboard (Enter/Space) as it does by click —
  // matching the tabIndex+role pattern already used site-wide for
  // non-native clickable elements (e.g. PortfolioBrowser's image cards).
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
  }, [open, index, items.length, onClose, zoomSrc]); // eslint-disable-line react-hooks/exhaustive-deps -- goTo is stable across renders (only closes over onNavigate/setZoomSrc)

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (readingRef.current) readingRef.current.scrollTop = 0;
  }, [index]);

  const hasRichContent = !!item?.content?.trim();
  const blocks = hasRichContent ? parseContent(item!.content!) : [];
  const headings = hasRichContent ? extractHeadings(item!.content!) : [];

  const imageEntries: SeqEntry[] = (item?.images ?? []).map((im) => ({
    kind: "image",
    order: im.order,
    url: im.url,
  }));
  const videoEntries: SeqEntry[] = (item?.videos ?? [])
    .map((v) => ({ order: v.order, embed: toEmbedUrl(v.url) }))
    .filter((v): v is { order: number; embed: string } => !!v.embed)
    .map((v) => ({ kind: "video", order: v.order, embed: v.embed }));
  const sequence: SeqEntry[] = (
    hasRichContent
      ? [{ kind: "content", order: item?.contentOrder ?? 0 } as SeqEntry, ...imageEntries, ...videoEntries]
      : [...imageEntries, ...videoEntries]
  ).sort((a, b) => a.order - b.order);

  function scrollToHeading(slug: string) {
    const el = readingRef.current?.querySelector(`#${CSS.escape(slug)}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      className={`gm-overlay ${open ? "open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {item && (
        <div className="gm-panel" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="gm-modal-title">
          <div className="gm-img-side">
            <div className="gm-img-scroll" ref={readingRef}>
              {hasRichContent ? (
                <div className="gm-reading">
                  {item.img ? (
                    <div className="gm-reading-cover" {...zoomTrigger(item.img!)}>
                      <img src={item.img} alt={item.title} />
                    </div>
                  ) : sequence.length === 0 ? (
                    <div className="gm-reading-cover">
                      <img src={NO_IMAGE_SVG} alt="" />
                    </div>
                  ) : null}
                  {sequence.map((entry, i) => {
                    if (entry.kind === "content") {
                      return (
                        <div key="content">
                          {blocks.map((b, bi) => {
                            if (b.type === "heading") {
                              return <h3 key={bi} id={b.slug} className="gm-reading-heading">{b.text}</h3>;
                            }
                            if (b.type === "image") {
                              return (
                                <img
                                  key={bi}
                                  src={b.src}
                                  alt={b.alt}
                                  className="gm-reading-img"
                                  {...zoomTrigger(b.src)}
                                />
                              );
                            }
                            if (b.type === "video") {
                              const embed = toEmbedUrl(b.src);
                              if (!embed) return null;
                              return (
                                <iframe
                                  key={bi}
                                  src={embed}
                                  className="gm-video-embed gm-reading-video"
                                  title={`${item.title} video`}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  loading="lazy"
                                />
                              );
                            }
                            return (
                              <p key={bi} className="gm-reading-p">
                                <InlineBold text={b.text} />
                              </p>
                            );
                          })}
                        </div>
                      );
                    }
                    if (entry.kind === "image") {
                      return (
                        <img
                          key={`img-${i}`}
                          src={entry.url}
                          alt={item.title}
                          className="gm-reading-img"
                          {...zoomTrigger(entry.url)}
                        />
                      );
                    }
                    return (
                      <iframe
                        key={`vid-${i}`}
                        src={entry.embed}
                        className="gm-video-embed gm-reading-video"
                        title={`${item.title} video`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="gm-img-list">
                  {item.img ? (
                    <img src={item.img} alt={item.title} {...zoomTrigger(item.img!)} />
                  ) : sequence.length === 0 ? (
                    <img src={NO_IMAGE_SVG} alt="" />
                  ) : null}
                  {sequence.map((entry, i) =>
                    entry.kind === "video" ? (
                      <iframe
                        key={`vid-${i}`}
                        src={entry.embed}
                        className="gm-video-embed"
                        title={`${item.title} video ${i + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    ) : entry.kind === "image" ? (
                      <img
                        key={`img-${i}`}
                        src={entry.url}
                        alt={item.title}
                        {...zoomTrigger(entry.url)}
                      />
                    ) : null
                  )}
                </div>
              )}
            </div>
            <div className="gm-nav">
              <button
                type="button"
                className="gm-nav-btn"
                disabled={index === 0}
                aria-label="Previous item"
                onClick={() => index !== null && goTo(index - 1)}
              >
                ← Prev
              </button>
              <button
                type="button"
                className="gm-nav-btn"
                disabled={index === items.length - 1}
                aria-label="Next item"
                onClick={() => index !== null && goTo(index + 1)}
              >
                Next →
              </button>
            </div>
          </div>
          <div className="gm-info">
            <div className="gm-bar">
              <span className="gm-cat-lbl">{item.catLabel}</span>
              <button type="button" className="gm-close" onClick={onClose}>✕ &nbsp; Close</button>
            </div>
            <div className="gm-title" id="gm-modal-title" style={fieldStyle(item.styles, "title")}>{item.title}</div>
            {item.subtitle && <div className="gm-subtitle">{item.subtitle}</div>}
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
            {headings.length > 0 && (
              <>
                <div className="gm-divider" />
                <nav className="gm-toc">
                  {headings.map((h) => (
                    <button key={h.slug} type="button" className="gm-toc-link" onClick={() => scrollToHeading(h.slug)}>
                      {h.text}
                    </button>
                  ))}
                </nav>
              </>
            )}
            <div className="gm-desc-wrap">
              {item.desc && <div className="gm-desc" style={fieldStyle(item.styles, "desc")}>{item.desc}</div>}
              {item.tags && item.tags.length > 0 && (
                <div className="gm-tags">
                  {item.tags.map((t) => (
                    <span className="gm-tag" key={t}>{t}</span>
                  ))}
                </div>
              )}
            </div>
            {item.feats && item.feats.length > 0 && (
              <div className="gm-feats">
                <div className="gm-feats-lbl">Features</div>
                {item.feats.map((f) => (
                  <div className="gm-feat" key={f}>{f}</div>
                ))}
              </div>
            )}
            {item.related && item.related.length > 0 && (
              <div className="gm-related">
                <div className="gm-related-lbl">Related Worldbuilding Entries</div>
                <div className="gm-related-list">
                  {item.related.map((r) => (
                    <div
                      key={r.id}
                      className="gm-related-card"
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
                      <div className="gm-related-thumb">
                        {r.img && <img src={r.img} alt="" />}
                      </div>
                      <div className="gm-related-meta">
                        <div className="gm-related-type">{r.typeLabel}</div>
                        <div className="gm-related-title">{r.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {item.links && item.links.length > 0 ? (
              <div className="gm-link-area">
                <div className="gm-link-lbl">Links</div>
                <div className="gm-links-list">
                  {item.links.map((l) =>
                    l.kind === "download" ? (
                      <a key={l.id} href={downloadUrl(l.href, l.label)} className="gm-link-chip">
                        {l.label}
                      </a>
                    ) : (
                      <a key={l.id} href={l.href} target="_blank" rel="noopener noreferrer" className="gm-link-chip">
                        {l.label}
                      </a>
                    )
                  )}
                </div>
              </div>
            ) : item.link && (
              <div className="gm-link-area">
                <div className="gm-link-lbl">External Link</div>
                <div className="gm-link-row">
                  <input className="gm-link-in" aria-label="External link URL" value={item.link} readOnly />
                  <button type="button" className="gm-link-btn" onClick={() => window.open(item.link, "_blank")}>
                    Open →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {zoomSrc && <ImageZoomOverlay src={zoomSrc} alt={item?.title ?? ""} onClose={() => setZoomSrc(null)} />}
    </div>
  );
}
