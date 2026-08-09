import { sql } from "drizzle-orm";
import { pgTable, serial, integer, text, timestamp, doublePrecision, jsonb, boolean, uniqueIndex, index, check, type AnyPgColumn } from "drizzle-orm/pg-core";

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
  isHomeVisible: boolean("is_home_visible").notNull().default(true),
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
  caption: text("caption"),
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
  caption: text("caption"),
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
  caption: text("caption"),
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
  // `cat` is legacy public taxonomy. Canonical Sprint 4 typing is additive so
  // ambiguous existing records remain intact until an owner classifies them.
  entityType: text("entity_type"),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  chips: text("chips").array().notNull().default([]),
  img: text("img").notNull(),
  content: text("content").notNull().default(""),
  contentOrder: integer("content_order").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  styles: stylesColumn(),
}, (table) => [
  index("worldbuilding_entries_entity_type_idx").on(table.entityType),
]);

export const worldbuildingRelationships = pgTable("worldbuilding_relationships", {
  id: serial("id").primaryKey(),
  sourceEntryId: integer("source_entry_id").notNull().references(() => worldbuildingEntries.id, { onDelete: "cascade" }),
  targetEntryId: integer("target_entry_id").notNull().references(() => worldbuildingEntries.id, { onDelete: "cascade" }),
  relationshipType: text("relationship_type").notNull().default("related"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  check("worldbuilding_relationships_no_self_relation_check", sql`${table.sourceEntryId} <> ${table.targetEntryId}`),
  uniqueIndex("worldbuilding_relationships_exact_unique_idx").on(table.sourceEntryId, table.targetEntryId, table.relationshipType),
  index("worldbuilding_relationships_source_order_idx").on(table.sourceEntryId, table.sortOrder, table.id),
  index("worldbuilding_relationships_target_order_idx").on(table.targetEntryId, table.sortOrder, table.id),
]);

export const worldbuildingImages = pgTable("worldbuilding_images", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").notNull().references(() => worldbuildingEntries.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  caption: text("caption"),
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
  caption: text("caption"),
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
  // Task 4.5 semantic zoom foundation. `priority` breaks ties when several
  // markers are visible at once (higher shows/orders first — used for
  // dense-zoom declutter and legend ordering by Task 4.6, not for filtering
  // by itself). `minZoom`/`maxZoom` are an abstract 1 (fully zoomed out) to
  // 5 (fully zoomed in) semantic scale, decoupled from any single viewer's
  // pixel zoom range (public MapZoomPanel: 1-4, admin MapEditor: 1-3) so
  // Task 4.6 can normalize either viewer's actual zoom into this scale. The
  // full-range default (1-5) preserves every existing pin's current
  // always-visible behavior after migration.
  priority: integer("priority").notNull().default(0),
  minZoom: integer("min_zoom").notNull().default(1),
  maxZoom: integer("max_zoom").notNull().default(5),
}, (table) => [
  check("map_locations_priority_range_check", sql`${table.priority} between 0 and 100`),
  check("map_locations_min_zoom_range_check", sql`${table.minZoom} between 1 and 5`),
  check("map_locations_max_zoom_range_check", sql`${table.maxZoom} between 1 and 5`),
  check("map_locations_zoom_order_check", sql`${table.minZoom} <= ${table.maxZoom}`),
  index("map_locations_map_priority_idx").on(table.mapId, table.priority, table.id),
]);

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

// Sprint 3 Home-only curation. This deliberately is not a universal content
// table: each row points through a real FK to exactly one content record that
// exists today. `section` only distinguishes the three confirmed Home
// collections that share this identical ordered-reference shape.
export const homeContentSelections = pgTable(
  "home_content_selections",
  {
    id: serial("id").primaryKey(),
    section: text("section").notNull(),
    portfolioId: integer("portfolio_id").references(() => portfolioItems.id, { onDelete: "cascade" }),
    sketchId: integer("sketch_id").references(() => sketches.id, { onDelete: "cascade" }),
    model3dId: integer("model_3d_id").references(() => models3d.id, { onDelete: "cascade" }),
    worldbuildingEntryId: integer("worldbuilding_entry_id").references(() => worldbuildingEntries.id, { onDelete: "cascade" }),
    gameId: integer("game_id").references(() => games.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    check(
      "home_content_selections_section_check",
      sql`${table.section} in ('featured_work', 'worldbuilding_highlight', 'latest_dispatch')`
    ),
    check(
      "home_content_selections_one_target_check",
      sql`num_nonnulls(${table.portfolioId}, ${table.sketchId}, ${table.model3dId}, ${table.worldbuildingEntryId}, ${table.gameId}) = 1`
    ),
    check(
      "home_content_selections_worldbuilding_target_check",
      sql`${table.section} <> 'worldbuilding_highlight' or ${table.worldbuildingEntryId} is not null`
    ),
    uniqueIndex("home_content_selections_portfolio_unique_idx").on(table.section, table.portfolioId),
    uniqueIndex("home_content_selections_sketch_unique_idx").on(table.section, table.sketchId),
    uniqueIndex("home_content_selections_model_3d_unique_idx").on(table.section, table.model3dId),
    uniqueIndex("home_content_selections_worldbuilding_unique_idx").on(table.section, table.worldbuildingEntryId),
    uniqueIndex("home_content_selections_game_unique_idx").on(table.section, table.gameId),
    index("home_content_selections_section_order_idx").on(table.section, table.sortOrder, table.id),
  ]
);

export const homeSkills = pgTable(
  "home_skills",
  {
    id: serial("id").primaryKey(),
    label: text("label").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isVisible: boolean("is_visible").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("home_skills_label_unique_idx").on(table.label),
    index("home_skills_visibility_order_idx").on(table.isVisible, table.sortOrder, table.id),
  ]
);

export const homeStatSettings = pgTable("home_stat_settings", {
  key: text("key").primaryKey(),
  isVisible: boolean("is_visible").notNull().default(false),
});

// A singleton row owns the selected existing KRUPNI map. Pins remain real
// map_locations rows and are only referenced by the ordered child table.
export const homeMapPreview = pgTable(
  "home_map_preview",
  {
    id: integer("id").primaryKey().default(1),
    mapId: integer("map_id").references(() => worldMaps.id, { onDelete: "set null" }),
    isVisible: boolean("is_visible").notNull().default(false),
  },
  (table) => [check("home_map_preview_singleton_check", sql`${table.id} = 1`)]
);

export const homeMapPreviewPins = pgTable(
  "home_map_preview_pins",
  {
    id: serial("id").primaryKey(),
    previewId: integer("preview_id").notNull().default(1).references(() => homeMapPreview.id, { onDelete: "cascade" }),
    locationId: integer("location_id").notNull().references(() => mapLocations.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    uniqueIndex("home_map_preview_pins_location_unique_idx").on(table.previewId, table.locationId),
    index("home_map_preview_pins_order_idx").on(table.previewId, table.sortOrder, table.id),
  ]
);

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

// Controlled metadata options for Medium, Subject Matter, Software, and Tags
// (Task 2.9). `type` is a plain, app-validated text column — matching the
// project's existing convention for controlled string sets (see `kind` on
// the *_links tables, `pinType` on `mapLocations`) rather than a pgEnum,
// which this schema has never used. The allowed values live in one place:
// `lib/metadata.ts`'s `METADATA_TYPES`. `iconUrl`/`websiteUrl` are only ever
// populated for `type: "software"`; every other type stores them as `null`.
// No Portfolio (or other content) junction table is created here — that is
// Task 2.10 scope.
export const metadataOptions = pgTable(
  "metadata_options",
  {
    id: serial("id").primaryKey(),
    type: text("type").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    iconUrl: text("icon_url"),
    websiteUrl: text("website_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    // Same slug may repeat across different type groups, but not within one.
    uniqueIndex("metadata_options_type_slug_idx").on(table.type, table.slug),
  ]
);

// Portfolio's own junction table linking a Portfolio item to any number of
// `metadataOptions` rows (Task 2.10). Deliberately Portfolio-specific — not
// a polymorphic contentType/contentId table and not one junction table per
// metadata type (Medium/Subject/Software/Tag). The option's own `type`
// column already tells you which group a given relation belongs to, so no
// `type` column is duplicated here. Other content types (Games, Worldbuilding,
// ...) get their own equally-named junction table if/when they adopt
// controlled metadata — not this task's scope.
export const portfolioMetadataOptions = pgTable(
  "portfolio_metadata_options",
  {
    id: serial("id").primaryKey(),
    portfolioId: integer("portfolio_id").notNull().references(() => portfolioItems.id, { onDelete: "cascade" }),
    metadataOptionId: integer("metadata_option_id").notNull().references(() => metadataOptions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    // A Portfolio item can reference a given option at most once.
    uniqueIndex("portfolio_metadata_options_unique_idx").on(table.portfolioId, table.metadataOptionId),
    index("portfolio_metadata_options_portfolio_idx").on(table.portfolioId),
    index("portfolio_metadata_options_option_idx").on(table.metadataOptionId),
  ]
);

// Task 4.7 — controlled Link Label options, shared by every *_links table
// (Portfolio/Sketches/3D/Games/Worldbuilding). Replaces the previous
// free-text Label input with a database-backed picker, mirroring the
// metadata_options controlled-vocabulary pattern (Task 2.9) at the smallest
// scope this needs: no `type` grouping (there is only one label list), no
// icon/logo storage yet (`slug` is the stable key a future logo lookup can
// key off — see docs/08_ROADMAP.md Task 4.7, section 8 — deliberately not
// built now). The *_links.label columns themselves stay plain text — no FK
// is added to them — so existing legacy label values (already-saved rows
// with a label outside this list) remain valid and are never rewritten.
export const linkLabelOptions = pgTable(
  "link_label_options",
  {
    id: serial("id").primaryKey(),
    label: text("label").notNull(),
    slug: text("slug").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("link_label_options_slug_idx").on(table.slug)]
);
