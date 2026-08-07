"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export type HeroSlide = {
  id: number;
  url: string;
  title?: string | null;
  subtitle?: string | null;
  linkUrl?: string | null;
};

const AUTO_ADVANCE_MS = 4000;

export default function HeroCarousel({
  slides,
  opacity,
  width,
  height,
}: {
  slides: HeroSlide[];
  opacity: number;
  width?: number | null;
  height?: number | null;
}) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    // Reduced motion: never auto-advance — the visitor drives slide changes
    // manually via the arrows/dots below, which stay fully functional.
    if (slides.length <= 1 || reduceMotion || isPaused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [slides.length, reduceMotion, isPaused]);

  const goTo = useCallback(
    (i: number) => setIndex(((i % slides.length) + slides.length) % slides.length),
    [slides.length]
  );

  if (slides.length === 0) return null;

  const slide = slides[index];
  const bgStyle: CSSProperties = {
    backgroundImage: `url(${slide.url})`,
    ...(width && height ? { backgroundSize: `${width}px ${height}px`, backgroundRepeat: "no-repeat" } : {}),
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          key={slide.id}
          className="home-bg-image"
          style={bgStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: opacity / 100 }}
          exit={{ opacity: 0 }}
          // Reduced motion: crossfade becomes an immediate state change
          // instead of a timed transition. The slide is already a plain
          // opacity swap (no spatial movement), so this is the only
          // adjustment needed here.
          transition={{ duration: reduceMotion ? 0 : 0.9, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {slide.linkUrl && <Link href={slide.linkUrl} aria-label={slide.title || "View"} className="hcar-link-overlay" />}

      <div className="hcar-vignette" />

      {(slide.title || slide.subtitle) && (
        <div className="hcar-caption" aria-live={isPaused || reduceMotion ? "polite" : "off"}>
          {slide.title && <div className="hcar-caption-title">{slide.title}</div>}
          {slide.subtitle && <div className="hcar-caption-sub">{slide.subtitle}</div>}
        </div>
      )}

      {slides.length > 1 && (
        <>
          <button type="button" className="hcar-arrow left" aria-label="Previous slide" onClick={() => goTo(index - 1)}>
            ‹
          </button>
          <button type="button" className="hcar-arrow right" aria-label="Next slide" onClick={() => goTo(index + 1)}>
            ›
          </button>
          <div className="hcar-dots">
            <button
              type="button"
              className="hcar-pause"
              aria-label={isPaused ? "Resume automatic slides" : "Pause automatic slides"}
              aria-pressed={isPaused}
              onClick={() => setIsPaused((paused) => !paused)}
            >
              <span aria-hidden="true">{isPaused ? "Play" : "Pause"}</span>
            </button>
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`hcar-dot ${i === index ? "on" : ""}`}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
