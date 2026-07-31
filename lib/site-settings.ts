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
  forceDarkMode: false,
  styles: {} as StylesMap,
};

export async function getSiteSettings() {
  try {
    const rows = await db.select().from(siteSettings).limit(1);
    return rows[0] ?? DEFAULT_SITE_SETTINGS;
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}
