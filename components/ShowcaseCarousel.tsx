"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

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

  useEffect(() => {
    if (items.length <= 1 || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [items.length, paused]);

  useEffect(() => {
    const track = trackRef.current;
    const child = track?.children[index] as HTMLElement | undefined;
    if (track && child) {
      track.scrollTo({ left: child.offsetLeft - track.offsetLeft, behavior: "smooth" });
    }
  }, [index]);

  if (items.length === 0) return null;

  return (
    <div className="sc-track" ref={trackRef} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {items.map((item) => (
        <Link key={item.id} href={item.linkHref || "#"} className="sc-item">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.url} alt={item.title} />
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
