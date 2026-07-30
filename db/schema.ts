import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  icon: text("icon").notNull(),
  title: text("title").notNull(),
  desc: text("desc").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
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
});

export const sketches = pgTable("sketches", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  label: text("label").notNull(),
  desc: text("desc").notNull().default(""),
  img: text("img"),
  colorHex: text("color_hex"),
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
  sortOrder: integer("sort_order").notNull().default(0),
});

export const aboutContent = pgTable("about_content", {
  id: serial("id").primaryKey(),
  whoIAmParagraphs: text("who_i_am_paragraphs").array().notNull().default([]),
  tools: text("tools").array().notNull().default([]),
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
});
