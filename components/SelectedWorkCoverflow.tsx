"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ResolvedHomeContent } from "@/lib/home-data";
import { isOptimizableImageUrl } from "@/lib/image-host";

const TYPE_LABELS: Record<ResolvedHomeContent["type"], string> = {
  portfolio: "Portfolio",
  sketch: "Sketch",
  model3d: "3D Work",
  worldbuilding: "Worldbuilding",
  game: "Game Design",
};

export default function SelectedWorkCoverflow({ items }: { items: ResolvedHomeContent[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const count = items.length;

  const select = useCallback((index: number) => {
    if (!count) return;
    setActiveIndex((index + count) % count);
  }, [count]);

  if (!count) return null;

  const active = items[activeIndex];

  return (
    <section
      className="selected-work"
      aria-labelledby="selected-work-title"
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

      <div className={`sw-stage sw-count-${Math.min(count, 3)}`}>
        {items.map((item, index) => {
          const offset = index - activeIndex;
          const visible = Math.abs(offset) <= 2;
          return (
            <button
              key={item.selectionId}
              type="button"
              className={`sw-card ${offset === 0 ? "is-active" : ""}`}
              style={{ "--sw-offset": offset } as React.CSSProperties}
              onClick={() => select(index)}
              aria-label={offset === 0 ? `${item.title}, selected` : `Select ${item.title}`}
              aria-pressed={offset === 0}
              aria-hidden={!visible}
              tabIndex={visible && offset !== 0 ? 0 : -1}
            >
              <span className="sw-media">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 84vw, (max-width: 1024px) 68vw, 58vw"
                    unoptimized={!isOptimizableImageUrl(item.image)}
                  />
                ) : (
                  <span className="sw-media-missing" aria-hidden="true">{TYPE_LABELS[item.type]}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="sw-details" aria-live="polite">
        <div className="sw-details-copy">
          <span className="sw-type">{TYPE_LABELS[active.type]}</span>
          <h3>{active.title}</h3>
          {active.summary && <p>{active.summary}</p>}
        </div>
        <Link href={active.href} className="sw-open">View work <span aria-hidden="true">↗</span></Link>
      </div>

      {count > 1 && (
        <div className="sw-controls" aria-label="Selected work controls">
          <button type="button" onClick={() => select(activeIndex - 1)} aria-label="Previous work">←</button>
          <span><strong>{String(activeIndex + 1).padStart(2, "0")}</strong> / {String(count).padStart(2, "0")}</span>
          <button type="button" onClick={() => select(activeIndex + 1)} aria-label="Next work">→</button>
        </div>
      )}
    </section>
  );
}
