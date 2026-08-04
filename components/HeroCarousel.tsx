"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

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

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [slides.length]);

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
          transition={{ duration: 0.9, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {slide.linkUrl && <Link href={slide.linkUrl} aria-label={slide.title || "View"} className="hcar-link-overlay" />}

      <div className="hcar-vignette" />

      {(slide.title || slide.subtitle) && (
        <div className="hcar-caption">
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
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`hcar-dot ${i === index ? "on" : ""}`}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
