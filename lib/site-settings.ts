import { db } from "@/db";
import { siteSettings } from "@/db/schema";

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
};

export async function getSiteSettings() {
  try {
    const rows = await db.select().from(siteSettings).limit(1);
    return rows[0] ?? DEFAULT_SITE_SETTINGS;
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}
