import { pgTable, serial, integer, text, timestamp, doublePrecision, jsonb, boolean, type AnyPgColumn } from "drizzle-orm/pg-core";

export type ThemedColor = { dark?: string; light?: string };
export type FieldStyle = { color?: ThemedColor; fontSize?: string };
export type StylesMap = Record<string, FieldStyle>;
const stylesColumn = () => jsonb("styles").$type<StylesMap>().notNull().default({});

export type PageColorKey = "bg" | "bg2" | "bg3" | "text" | "text2" | "accent";
export type PageColorMap = Partial<Record<PageColorKey, ThemedColor>>;

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  icon: text("icon").notNull(),
  title: text("title").notNull(),
  desc: text("desc").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const portfolioItems = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  cat: text("cat").notNull(),
  year: integer("year").notNull(),
  desc: text("desc").notNull(),
  tags: text("tags").array().notNull().default([]),
  medium: text("medium").notNull(),
  software: text("software").notNull(),
  link: text("link").notNull(),
  img: text("img").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  styles: stylesColumn(),
});

export const portfolioImages = pgTable("portfolio_images", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").notNull().references(() => portfolioItems.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const portfolioVideos = pgTable("portfolio_videos", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").notNull().references(() => portfolioItems.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const portfolioLinks = pgTable("portfolio_links", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").notNull().references(() => portfolioItems.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  href: text("href").notNull(),
  kind: text("kind").notNull().default("link"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const sketches = pgTable("sketches", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  label: text("label").notNull(),
  desc: text("desc").notNull().default(""),
  img: text("img"),
  link: text("link"),
  colorHex: text("color_hex"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  styles: stylesColumn(),
});

export const sketchImages = pgTable("sketch_images", {
  id: serial("id").primaryKey(),
  sketchId: integer("sketch_id").notNull().references(() => sketches.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const sketchVideos = pgTable("sketch_videos", {
  id: serial("id").primaryKey(),
  sketchId: integer("sketch_id").notNull().references(() => sketches.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const sketchLinks = pgTable("sketch_links", {
  id: serial("id").primaryKey(),
  sketchId: integer("sketch_id").notNull().references(() => sketches.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  href: text("href").notNull(),
  kind: text("kind").notNull().default("link"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const models3d = pgTable("models_3d", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  label: text("label").notNull(),
  desc: text("desc").notNull().default(""),
  img: text("img"),
  link: text("link"),
  colorHex: text("color_hex"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  styles: stylesColumn(),
});

export const model3dImages = pgTable("model_3d_images", {
  id: serial("id").primaryKey(),
  modelId: integer("model_id").notNull().references(() => models3d.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const model3dVideos = pgTable("model_3d_videos", {
  id: serial("id").primaryKey(),
  modelId: integer("model_id").notNull().references(() => models3d.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const model3dLinks = pgTable("model_3d_links", {
  id: serial("id").primaryKey(),
  modelId: integer("model_id").notNull().references(() => models3d.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  href: text("href").notNull(),
  kind: text("kind").notNull().default("link"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const worldbuildingEntries = pgTable("worldbuilding_entries", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  date: text("date").notNull(),
  cat: text("cat").notNull(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  chips: text("chips").array().notNull().default([]),
  img: text("img").notNull(),
  content: text("content").notNull().default(""),
  contentOrder: integer("content_order").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  styles: stylesColumn(),
});

export const worldbuildingImages = pgTable("worldbuilding_images", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").notNull().references(() => worldbuildingEntries.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const worldbuildingVideos = pgTable("worldbuilding_videos", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").notNull().references(() => worldbuildingEntries.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const worldbuildingLinks = pgTable("worldbuilding_links", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").notNull().references(() => worldbuildingEntries.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  href: text("href").notNull(),
  kind: text("kind").notNull().default("link"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  status: text("status").notNull(),
  engine: text("engine").notNull(),
  desc: text("desc").notNull(),
  tags: text("tags").array().notNull().default([]),
  feats: text("feats").array().notNull().default([]),
  target: text("target").notNull(),
  img: text("img").notNull(),
  year: integer("year").notNull().default(2026),
  content: text("content").notNull().default(""),
  contentOrder: integer("content_order").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  styles: stylesColumn(),
});

export const gameLinks = pgTable("game_links", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  href: text("href").notNull(),
  kind: text("kind").notNull().default("link"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const gameImages = pgTable("game_images", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const gameVideos = pgTable("game_videos", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const worldMaps = pgTable("world_maps", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  parentMapId: integer("parent_map_id").references((): AnyPgColumn => worldMaps.id, { onDelete: "set null" }),
  imageUrl: text("image_url").notNull().default(""),
  description: text("description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const mapLocations = pgTable("map_locations", {
  id: serial("id").primaryKey(),
  mapId: integer("map_id").notNull().references(() => worldMaps.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  x: doublePrecision("x").notNull().default(50),
  y: doublePrecision("y").notNull().default(50),
  pinType: text("pin_type").notNull().default("lore"),
  targetMapId: integer("target_map_id").references((): AnyPgColumn => worldMaps.id, { onDelete: "set null" }),
  entryId: integer("entry_id").references(() => worldbuildingEntries.id, { onDelete: "set null" }),
  iconType: text("icon_type").notNull().default("default"),
  info: text("info").notNull().default(""),
  img: text("img"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const aboutContent = pgTable("about_content", {
  id: serial("id").primaryKey(),
  whoIAmParagraphs: text("who_i_am_paragraphs").array().notNull().default([]),
  tools: text("tools").array().notNull().default([]),
  styles: stylesColumn(),
});

export const cvContent = pgTable("cv_content", {
  id: serial("id").primaryKey(),
  img: text("img"),
});

export const timelineEntries = pgTable("timeline_entries", {
  id: serial("id").primaryKey(),
  year: text("year").notNull(),
  text: text("text").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  handle: text("handle").notNull(),
  jpLabel: text("jp_label").notNull(),
  footerLine: text("footer_line").notNull(),
  contactEmail: text("contact_email").notNull().default(""),
  twitterUrl: text("twitter_url").notNull().default(""),
  artstationUrl: text("artstation_url").notNull().default(""),
  linkedinUrl: text("linkedin_url").notNull().default(""),
  instagramUrl: text("instagram_url").notNull().default(""),
  heroEyebrow: text("hero_eyebrow").notNull().default("Istanbul, Turkey — 2026"),
  heroJpLine: text("hero_jp_line").notNull().default("ゲームデザイナー　物語　世界"),
  heroBio: text("hero_bio").notNull().default(
    "Game Designer & worldbuilder. Building **visceral, narrative-driven** games with Unreal Engine 5. Currently developing **The Abyss** — a psychological horror anomaly game for Steam."
  ),
  homeBgImage: text("home_bg_image").notNull().default(""),
  homeBgOpacity: integer("home_bg_opacity").notNull().default(30),
  homeBgWidth: integer("home_bg_width"),
  homeBgHeight: integer("home_bg_height"),
  contactBgImage: text("contact_bg_image").notNull().default(""),
  contactBgOpacity: integer("contact_bg_opacity").notNull().default(30),
  githubUrl: text("github_url").notNull().default(""),
  narrativeImage: text("narrative_image").notNull().default(""),
  narrativeText: text("narrative_text").notNull().default(""),
  forceDarkMode: boolean("force_dark_mode").notNull().default(false),
  styles: stylesColumn(),
});

export const heroButtons = pgTable("hero_buttons", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  href: text("href").notNull(),
  style: text("style").notNull().default("primary"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const homeHeroSlides = pgTable("home_hero_slides", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title"),
  subtitle: text("subtitle"),
  linkUrl: text("link_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const homeShowcase = pgTable("home_showcase", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull().default(""),
  linkHref: text("link_href").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pageAppearance = pgTable("page_appearance", {
  id: serial("id").primaryKey(),
  page: text("page").notNull().unique(),
  colors: jsonb("colors").$type<PageColorMap>().notNull().default({}),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const archiveCategories = pgTable("archive_categories", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});
