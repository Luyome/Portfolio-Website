"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ResolvedHomeContent } from "@/lib/home-data";
import { isOptimizableImageUrl } from "@/lib/image-host";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { buildSelectedWorkDisplayItems, selectedWorkPosition, wrapSelectedWorkIndex } from "@/lib/selected-work";

const AUTO_ADVANCE_MS = 5000;

export default function SelectedWorkCoverflow({ items }: { items: ResolvedHomeContent[] }) {
  const displayItems = useMemo(() => buildSelectedWorkDisplayItems(items), [items]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [interactionVersion, setInteractionVersion] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const count = displayItems.length;

  const select = useCallback((index: number, manual = true) => {
    if (!count) return;
    setActiveIndex(wrapSelectedWorkIndex(index, count));
    if (manual) setInteractionVersion((version) => version + 1);
  }, [count]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduceMotion || isHovered || hasFocus || !isVisible || count <= 1) return;
    const timer = window.setTimeout(() => select(activeIndex + 1, false), AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [activeIndex, count, hasFocus, interactionVersion, isHovered, isVisible, reduceMotion, select]);

  const active = displayItems[activeIndex];

  return (
    <section
      className="selected-work"
      id="selected-work"
      ref={sectionRef}
      aria-labelledby="selected-work-title"
      data-autoplay-paused={reduceMotion || isHovered || hasFocus || !isVisible ? "true" : "false"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setHasFocus(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHasFocus(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          select(activeIndex - 1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          select(activeIndex + 1);
        }
      }}
    >
      <div className="sw-heading">
        <div>
          <p className="sw-kicker">What I made</p>
          <h2 id="selected-work-title">Selected Work</h2>
        </div>
        <p className="sw-intro">A focused selection across game design, visual craft, and constructed worlds.</p>
      </div>

      <div className="sw-stage">
        {displayItems.map((item, index) => {
          const position = selectedWorkPosition(index, activeIndex, count);
          const visible = position !== null;
          const media = (
            <span className="sw-media">
              {item.image ? (
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 84vw, (max-width: 1024px) 68vw, 58vw"
                  quality={90}
                  unoptimized={!isOptimizableImageUrl(item.image)}
                />
              ) : (
                <span className="sw-placeholder-art" aria-hidden="true">
                  <span className="sw-placeholder-orbit" />
                  <span className="sw-placeholder-mark">{String(index + 1).padStart(2, "0")}</span>
                </span>
              )}
            </span>
          );
          const cardClass = `sw-card ${position === 0 ? "is-active" : ""} ${item.isPlaceholder ? "is-placeholder" : ""} ${position === 0 && item.href ? "is-link" : ""}`;
          const cardStyle = { "--sw-position": position ?? 0, "--sw-slot": index } as React.CSSProperties;

          if (position === 0 && item.href) {
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cardClass}
                style={cardStyle}
                aria-label={`Open ${item.title}, selected work`}
                aria-hidden="false"
              >
                {media}
              </Link>
            );
          }

          if (position === 0) {
            return (
              <div key={item.key} className={cardClass} style={cardStyle} aria-label={`${item.title}, selected`} aria-hidden="false">
                {media}
              </div>
            );
          }

          return (
            <button
              key={item.key}
              type="button"
              className={cardClass}
              style={cardStyle}
              onClick={() => select(index)}
              aria-label={`Select ${item.title}`}
              aria-hidden={!visible}
              tabIndex={visible ? 0 : -1}
            >
              {media}
            </button>
          );
        })}
      </div>

      <div className="sw-footer">
        <div className="sw-details" aria-live="polite">
          <div className="sw-details-copy">
            <span className="sw-type">{active.typeLabel}</span>
            <h3>{active.href ? <Link href={active.href}>{active.title}</Link> : active.title}</h3>
            {active.summary && <p>{active.summary}</p>}
          </div>
          {active.href && <Link href={active.href} className="sw-open">View More <span aria-hidden="true">↗</span></Link>}
        </div>

        {count > 1 && (
          <div className="sw-controls" aria-label="Selected work controls">
            <button type="button" onClick={() => select(activeIndex - 1)} aria-label="Previous work">←</button>
            <span><strong>{String(activeIndex + 1).padStart(2, "0")}</strong> / {String(count).padStart(2, "0")}</span>
            <button type="button" onClick={() => select(activeIndex + 1)} aria-label="Next work">→</button>
          </div>
        )}
      </div>
    </section>
  );
}
