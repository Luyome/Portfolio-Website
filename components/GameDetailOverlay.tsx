"use client";

import { useEffect, useRef } from "react";
import { parseContent, extractHeadings } from "@/lib/content-blocks";
import InlineBold from "./InlineBold";

export type GameDetail = {
  id: number;
  title: string;
  status: string;
  engine: string;
  desc: string;
  tags: string[];
  target: string;
  img: string;
  year: number;
  content: string;
};

export default function GameDetailOverlay({ game, onClose }: { game: GameDetail | null; onClose: () => void }) {
  const readingRef = useRef<HTMLDivElement>(null);
  const open = game !== null;

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open && readingRef.current) readingRef.current.scrollTop = 0;
  }, [open, game?.id]);

  const blocks = game ? (game.content.trim() ? parseContent(game.content) : [{ type: "paragraph" as const, text: game.desc }]) : [];
  const headings = game ? extractHeadings(game.content) : [];

  function scrollToHeading(slug: string) {
    const el = readingRef.current?.querySelector(`#${CSS.escape(slug)}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      className={`gdo-overlay ${open ? "open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {game && (
        <div className="gdo-panel">
          <button type="button" className="gdo-close" onClick={onClose}>✕ &nbsp; Close</button>
          <div className="gdo-reading" ref={readingRef}>
            <div className="gdo-cover">
              <img src={game.img} alt={game.title} />
            </div>
            {blocks.map((b, i) => {
              if (b.type === "heading") {
                return <h3 key={i} id={b.slug} className="gdo-heading">{b.text}</h3>;
              }
              if (b.type === "image") {
                return <img key={i} src={b.src} alt={b.alt} className="gdo-inline-img" />;
              }
              return (
                <p key={i} className="gdo-paragraph">
                  <InlineBold text={b.text} />
                </p>
              );
            })}
          </div>
          <div className="gdo-side">
            <div className="gdo-side-title">{game.title}</div>
            <div className="gdo-side-year">{game.year}</div>
            <div className="gdo-side-status">{game.status} — {game.engine}</div>

            {headings.length > 0 && (
              <>
                <div className="gdo-side-divider" />
                <nav className="gdo-toc">
                  {headings.map((h) => (
                    <button key={h.slug} type="button" className="gdo-toc-link" onClick={() => scrollToHeading(h.slug)}>
                      {h.text}
                    </button>
                  ))}
                </nav>
              </>
            )}

            <div className="gdo-side-divider" />
            <div className="gdo-side-section">
              <div className="gdo-side-lbl">Target</div>
              <div className="gdo-side-val">{game.target}</div>
            </div>
            {game.tags.length > 0 && (
              <div className="gdo-side-section">
                <div className="gdo-side-lbl">Tags</div>
                <div className="gdo-side-tags">
                  {game.tags.map((t) => (
                    <span className="gdo-tag" key={t}>{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
