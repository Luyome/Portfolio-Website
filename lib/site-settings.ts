import { cache } from "react";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import type { StylesMap } from "@/db/schema";

export const DEFAULT_SITE_SETTINGS = {
  name: "Ege Demir Ünal",
  handle: "/ TETSUNARU",
  jpLabel: "鉄なる — 創造者",
  footerLine: "Game Designer\nUnreal Engine 5\nIstanbul, TR — 2026",
  contactEmail: "egedemirunal@gmail.com",
  twitterUrl: "https://x.com/TetsuUnaru",
  artstationUrl: "https://www.artstation.com/demirunal",
  linkedinUrl: "https://www.linkedin.com/in/egedemirunal/",
  instagramUrl: "https://www.instagram.com/demirunal3d/",
  heroEyebrow: "Istanbul, Turkey — 2026",
  heroJpLine: "ゲームデザイナー　物語　世界",
  heroBio:
    "Game Designer & worldbuilder. Building **visceral, narrative-driven** games with Unreal Engine 5. Currently developing **The Abyss** — a psychological horror anomaly game for Steam.",
  homeBgImage: "",
  homeBgOpacity: 30,
  homeBgWidth: null as number | null,
  homeBgHeight: null as number | null,
  contactBgImage: "",
  contactBgOpacity: 30,
  githubUrl: "",
  narrativeImage: "",
  narrativeText:
    "Every project starts as a fragment of a larger world — a ruin, a rumor, a half-remembered myth. I build outward from there: environments that hold history, characters that carry it, and systems that let players uncover it at their own pace.",
  forceDarkMode: false,
  styles: {} as StylesMap,
};

// Read by the root layout, the site layout, and (on the Home Page) the page
// itself within the same request. Wrapped in React's `cache()` so those
// calls share one DB read per request instead of issuing it 2-3x — see
// node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md,
// "Deduplicating requests" (this project isn't on Cache Components, so React
// cache is the documented dedup path for non-fetch/ORM reads).
export const getSiteSettings = cache(async () => {
  try {
    const rows = await db.select().from(siteSettings).limit(1);
    return rows[0] ?? DEFAULT_SITE_SETTINGS;
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
});
