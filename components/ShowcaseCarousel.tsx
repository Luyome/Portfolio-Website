"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { isOptimizableImageUrl } from "@/lib/image-host";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export type ShowcaseItem = {
  id: number;
  url: string;
  title: string;
  linkHref: string;
};

const AUTO_ADVANCE_MS = 5000;

export default function ShowcaseCarousel({ items }: { items: ShowcaseItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    // Reduced motion: never auto-advance, matching HeroCarousel — the
    // visitor drives it manually (scroll/tab through the track), which
    // stays fully functional.
    if (items.length <= 1 || paused || reduceMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [items.length, paused, reduceMotion]);

  useEffect(() => {
    const track = trackRef.current;
    const child = track?.children[index] as HTMLElement | undefined;
    if (track && child) {
      track.scrollTo({ left: child.offsetLeft - track.offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
    }
  }, [index, reduceMotion]);

  if (items.length === 0) return null;

  return (
    <div
      className="sc-track"
      ref={trackRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {items.map((item) => (
        <Link key={item.id} href={item.linkHref || "#"} className="sc-item">
          <Image
            src={item.url}
            alt={item.title}
            fill
            sizes="(max-width: 820px) 200px, 260px"
            quality={90}
            unoptimized={!isOptimizableImageUrl(item.url)}
          />
          {item.title && (
            <div className="sc-item-title">
              <span>{item.title}</span>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
