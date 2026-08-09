"use client";

import { useEffect, useRef, useState } from "react";
import { fieldStyle } from "@/lib/style-fields";
import type { StylesMap } from "@/lib/style-fields";
import { parseContent, extractHeadings } from "@/lib/content-blocks";
import { buildMediaSequence } from "@/lib/content-sequence";
import { downloadUrl } from "@/lib/download-url";
import { toEmbedUrl } from "@/lib/video-embed";
import type { MediaEntry } from "@/lib/group-images";
import InlineBold from "@/components/InlineBold";
import ImageZoomOverlay from "@/components/ImageZoomOverlay";
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
  /** Related entries (Task 4.2 Worldbuilding relationships). */
  related?: GalleryRelatedEntry[];
  styles?: StylesMap;
};

type ReadingSeqEntry =
  | { kind: "content"; order: number }
  | { kind: "image"; order: number; url: string; caption?: string | null }
  | { kind: "video"; order: number; embed: string; caption?: string | null };

const NO_IMAGE_SVG =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23151010"/><text fill="%23555" x="50%25" y="50%25" font-size="18" text-anchor="middle" dy=".35em">No Image</text></svg>';

/**
 * The single shared "media + detail rail" lightbox for every content type
 * (Worldbuilding, Portfolio, Sketches, 3D, Games, and the map's info-only
 * pins) — replaces the previously separate GalleryModal, Worldbuilding
 * Artwork Detail, and MapZoomPanel pin-panel implementations. Edge-pinned
 * Prev/Next arrows (never a bottom-docked bar) keep the media scroll area's
 * padding symmetric in every mode; `richReading` opts into the
 * text-and-media-interleaved reading experience Portfolio/Sketches/3D/Games
 * rely on (Worldbuilding's own entries keep their simpler flat body, the
 * default, so its existing look is unchanged).
 */
export default function MediaLightbox({
  items,
  index,
  onClose,
  onNavigate,
  onRelatedSelect,
  richReading = false,
}: {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onRelatedSelect?: (id: number) => void;
  richReading?: boolean;
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

  const hasExtraContent = !!item.content?.trim();
  const useRichReading = richReading && hasExtraContent;

  // Non-rich (default, Worldbuilding) media sequence — gallery images/videos
  // only, content text rendered separately as a flat body in the rail.
  const gallerySequence = buildMediaSequence(item);
  const galleryMediaCount = (item.img ? 1 : 0) + gallerySequence.length;

  // Rich-reading (Portfolio/Sketches/3D/Games) sequence — content is woven
  // in at its own contentOrder alongside images/videos, exactly like the
  // retired GalleryModal did, so TOC/interleaved-image behavior is unchanged.
  const contentBlocks = hasExtraContent ? parseContent(item.content!) : [];
  const headings = useRichReading ? extractHeadings(item.content!) : [];
  const readingImageEntries: ReadingSeqEntry[] = (item.images ?? []).map((im) => ({
    kind: "image",
    order: im.order,
    url: im.url,
    caption: im.caption,
  }));
  const readingVideoEntries: ReadingSeqEntry[] = (item.videos ?? [])
    .map((v) => ({ order: v.order, embed: toEmbedUrl(v.url), caption: v.caption }))
    .filter((v): v is { order: number; embed: string; caption: string | null | undefined } => !!v.embed)
    .map((v) => ({ kind: "video" as const, order: v.order, embed: v.embed, caption: v.caption }));
  const readingSequence: ReadingSeqEntry[] = useRichReading
    ? [{ kind: "content" as const, order: item.contentOrder ?? 0 }, ...readingImageEntries, ...readingVideoEntries].sort(
        (a, b) => a.order - b.order
      )
    : [];

  const mediaCount = useRichReading ? galleryMediaCount + 1 : galleryMediaCount;
  // Rich-reading items are a flowing article (images sit inline with text,
  // as many as the content calls for) — they always use the padded,
  // naturally-stacked layout. The "flush single image / hero-fills-viewport
  // with no peek" behavior only applies to the plain media-stack mode
  // (Worldbuilding entries and single-image pin popups).
  const isMulti = useRichReading || mediaCount > 1;
  const applyHero = isMulti && !useRichReading;

  function scrollToHeading(slug: string) {
    const el = mediaRef.current?.querySelector(`#${CSS.escape(slug)}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // The hero treatment (fills the scroll area's visible viewport, so
  // anything after it starts below the fold) belongs to whichever element
  // renders first: the cover image if there is one, otherwise the first
  // gallery entry — determined up front as plain data, not by mutating a
  // counter while walking the JSX.
  const heroIsCover = applyHero && !!item.img;
  const heroSequenceIndex = applyHero && !item.img ? 0 : -1;
  function heroClass(base: string, isHero: boolean) {
    return isHero ? `${base} ${base}--hero` : base;
  }

  return (
    <div
      className="wbd-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="wbd-stage" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="wbd-title">
        <div className="wbd-media">
          <div className={`wbd-media-scroll ${isMulti ? "wbd-media-scroll--multi" : "wbd-media-scroll--single"}`} ref={mediaRef}>
            {useRichReading ? (
              <>
                {item.img ? (
                  <div className="wbd-reading-cover" {...zoomTrigger(item.img)}>
                    <img src={item.img} alt={item.title} className="wbd-media-img" />
                  </div>
                ) : readingSequence.length === 0 ? (
                  <img src={NO_IMAGE_SVG} alt="" className="wbd-media-img" />
                ) : null}
                {readingSequence.map((entry, i) => {
                  if (entry.kind === "content") {
                    return (
                      <div key="content" className="wbd-reading-content">
                        {contentBlocks.map((b, bi) => {
                          if (b.type === "heading") {
                            return <h3 key={bi} id={b.slug} className="wbd-reading-heading">{b.text}</h3>;
                          }
                          if (b.type === "image") {
                            return <img key={bi} src={b.src} alt={b.alt} className="wbd-reading-img" {...zoomTrigger(b.src)} />;
                          }
                          if (b.type === "video") {
                            const embed = toEmbedUrl(b.src);
                            if (!embed) return null;
                            return (
                              <iframe
                                key={bi}
                                src={embed}
                                className="gm-video-embed wbd-reading-video"
                                title={`${item.title} video`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                              />
                            );
                          }
                          return (
                            <p key={bi} className="wbd-reading-p">
                              <InlineBold text={b.text} />
                            </p>
                          );
                        })}
                      </div>
                    );
                  }
                  if (entry.kind === "image") {
                    return (
                      <figure key={`img-${i}`} className="wbd-reading-figure">
                        <img
                          src={entry.url}
                          alt={item.title}
                          className="wbd-reading-img"
                          {...zoomTrigger(entry.url)}
                        />
                        {entry.caption && <figcaption className="wbd-media-caption">{entry.caption}</figcaption>}
                      </figure>
                    );
                  }
                  return (
                    <iframe
                      key={`vid-${i}`}
                      src={entry.embed}
                      className="gm-video-embed wbd-reading-video"
                      title={`${item.title} video`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  );
                })}
              </>
            ) : (
              <>
                {item.img ? (
                  <img src={item.img} alt={item.title} className={heroClass("wbd-media-img", heroIsCover)} {...zoomTrigger(item.img)} />
                ) : gallerySequence.length === 0 ? (
                  <img src={NO_IMAGE_SVG} alt="" className="wbd-media-img" />
                ) : null}
                {gallerySequence.map((entry, i) =>
                  entry.kind === "video" ? (
                    <iframe
                      key={`vid-${i}`}
                      src={entry.embed}
                      className={`gm-video-embed ${heroClass("wbd-media-video", i === heroSequenceIndex)}`}
                      title={`${item.title} video ${i + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  ) : (
                    <figure key={`img-${i}`} className="wbd-media-figure">
                      <img
                        src={entry.url}
                        alt={item.title}
                        className={heroClass("wbd-media-img", i === heroSequenceIndex)}
                        {...zoomTrigger(entry.url)}
                      />
                      {entry.caption && <figcaption className="wbd-media-caption">{entry.caption}</figcaption>}
                    </figure>
                  )
                )}
              </>
            )}
          </div>
          {items.length > 1 && (
            <>
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
            </>
          )}
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
          {headings.length > 0 && (
            <>
              <div className="wbd-divider" />
              <nav className="wbd-toc">
                {headings.map((h) => (
                  <button key={h.slug} type="button" className="wbd-toc-link" onClick={() => scrollToHeading(h.slug)}>
                    {h.text}
                  </button>
                ))}
              </nav>
            </>
          )}
          {item.desc && <div className="wbd-desc" style={fieldStyle(item.styles, "desc")}>{item.desc}</div>}
          {!useRichReading && hasExtraContent && (
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
          {item.feats && item.feats.length > 0 && (
            <div className="wbd-feats">
              <div className="wbd-feats-lbl">Features</div>
              {item.feats.map((f) => (
                <div className="wbd-feat" key={f}>{f}</div>
              ))}
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
