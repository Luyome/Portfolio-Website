import type { CSSProperties } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pageAppearance } from "@/db/schema";
import type { PageColorKey } from "@/db/schema";
import { hexToRgbTriplet } from "./color";

export const PAGE_KEYS = [
  "home",
  "portfolio",
  "sketches",
  "worldbuilding",
  "games",
  "about",
  "map",
  "archive",
] as const;

export type PageKey = (typeof PAGE_KEYS)[number];

export const PAGE_LABELS: Record<PageKey, string> = {
  home: "Home",
  portfolio: "Portfolio",
  sketches: "Sketches",
  worldbuilding: "Worldbuilding",
  games: "Games",
  about: "About",
  map: "Map",
  archive: "Archive",
};

export type PageAppearanceRow = typeof pageAppearance.$inferSelect;

const PAGE_COLOR_KEYS: PageColorKey[] = ["bg", "bg2", "bg3", "text", "text2", "accent"];

export async function getPageAppearance(page: PageKey): Promise<PageAppearanceRow | null> {
  const [row] = await db.select().from(pageAppearance).where(eq(pageAppearance.page, page));
  return row ?? null;
}

export function pageAppearanceVars(row: PageAppearanceRow | null | undefined): CSSProperties {
  if (!row) return {};
  const vars: Record<string, string> = {};
  for (const key of PAGE_COLOR_KEYS) {
    const color = row.colors[key];
    if (!color) continue;
    if (color.dark) vars[`--pa-${key}-dark`] = color.dark;
    if (color.light) vars[`--pa-${key}-light`] = color.light;
    if (key === "accent") {
      if (color.dark) {
        const rgb = hexToRgbTriplet(color.dark);
        if (rgb) vars["--pa-accent-rgb-dark"] = rgb;
      }
      if (color.light) {
        const rgb = hexToRgbTriplet(color.light);
        if (rgb) vars["--pa-accent-rgb-light"] = rgb;
      }
    }
  }
  return vars as CSSProperties;
}
