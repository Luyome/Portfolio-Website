"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export type HomeSectionNavItem = { id: string; label: string };

/**
 * Fixed, vertically-centered scrollspy rail for Home only. Content is
 * server-derived from `app/(site)/page.tsx` (only sections that actually
 * rendered are passed in -- see that file's `navSections` build), so this
 * component never hardcodes a link to an omitted section. Deliberately
 * minimal: small ticks, no panel/glass background, matching the existing
 * restrained red/neutral Home visual language.
 */
export default function HomeSectionNav({ sections }: { sections: HomeSectionNavItem[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const reduceMotion = usePrefersReducedMotion();
  const ratiosRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (sections.length === 0 || typeof IntersectionObserver === "undefined") return;
    const ratios = ratiosRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        let bestId = "";
        let bestRatio = 0;
        for (const section of sections) {
          const ratio = ratios.get(section.id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = section.id;
          }
        }
        if (bestId) setActiveId(bestId);
      },
      { threshold: [0, 0.15, 0.3, 0.5, 0.7, 1] }
    );
    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  if (sections.length === 0) return null;

  function goTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  return (
    <nav className="home-section-nav" aria-label="Home sections">
      <ul>
        {sections.map((section) => (
          <li key={section.id}>
            <button
              type="button"
              className="hsn-item"
              data-active={section.id === activeId}
              aria-current={section.id === activeId ? "true" : undefined}
              aria-label={section.label}
              onClick={() => goTo(section.id)}
            >
              <span className="hsn-dot" aria-hidden="true" />
              <span className="hsn-label">{section.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
