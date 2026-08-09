"use client";

import { useState } from "react";
import Image from "next/image";
import MediaLightbox, { GalleryItem } from "./shared/MediaLightbox";
import { fieldStyle } from "@/lib/style-fields";
import type { StylesMap } from "@/lib/style-fields";
import type { MediaEntry } from "@/lib/group-images";
import { isOptimizableImageUrl } from "@/lib/image-host";
import { findContentItemIndex } from "@/lib/content-detail-href";

export type GameLink = { id: number; label: string; href: string; kind: string };

export type Game = {
  id: number;
  title: string;
  status: string;
  engine: string;
  desc: string;
  tags: string[];
  feats: string[];
  target: string;
  img: string;
  year: number;
  content: string;
  contentOrder: number;
  links: GameLink[];
  images?: MediaEntry[];
  videos?: MediaEntry[];
  styles?: StylesMap;
};

export default function GamesBrowser({ items, initialItemId }: { items: Game[]; initialItemId?: number | null }) {
  const [openIndex, setOpenIndex] = useState<number | null>(() => findContentItemIndex(items, initialItemId ?? null));

  const galleryItems: GalleryItem[] = items.map((g) => ({
    img: g.img,
    images: g.images,
    videos: g.videos,
    title: g.title,
    catLabel: "Games",
    subtitle: `${g.status} — ${g.engine}`,
    metaRows: [
      { label: "Year", value: String(g.year) },
      { label: "Target", value: g.target },
    ],
    desc: g.desc,
    content: g.content,
    contentOrder: g.contentOrder,
    feats: g.feats,
    tags: g.tags,
    links: g.links,
    styles: g.styles,
  }));

  return (
    <>
      <div className="games-wrap">
        {items.map((g, i) => (
          <div className={`game-row ${i % 2 === 1 ? "rev" : ""}`} key={g.id}>
            <div
              className="game-row-media"
              role="button"
              tabIndex={0}
              onClick={() => setOpenIndex(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpenIndex(i);
                }
              }}
            >
              <Image
                src={g.img}
                alt={g.title}
                fill
                sizes="(max-width: 820px) 100vw, 50vw"
                unoptimized={!isOptimizableImageUrl(g.img)}
              />
            </div>
            <div className="game-row-content">
              <div className="gr-index">{String(i + 1).padStart(2, "0")}</div>
              <div className="gr-status">
                <span style={fieldStyle(g.styles, "status")}>{g.status}</span> — <span style={fieldStyle(g.styles, "engine")}>{g.engine}</span>
              </div>
              <h2 className="gr-title" style={fieldStyle(g.styles, "title")} onClick={() => setOpenIndex(i)}>{g.title}</h2>
              <p className="gr-desc" style={fieldStyle(g.styles, "desc")}>{g.desc}</p>
              <div className="gr-tags">
                {g.tags.map((t) => (
                  <span className="gr-tag" key={t}>{t}</span>
                ))}
              </div>
              <button type="button" className="gr-btn" onClick={() => setOpenIndex(i)}>View Details</button>
            </div>
          </div>
        ))}
      </div>
      <MediaLightbox
        items={galleryItems}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
        richReading
      />
    </>
  );
}
