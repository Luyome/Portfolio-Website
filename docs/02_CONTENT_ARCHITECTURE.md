# Content Architecture

This document defines how every type of content on this website should be structured, written, displayed, and maintained. It exists to keep the site consistent as it grows — across years, across pillars, and across whoever authors content in the future (including an AI assistant following these rules).

---

# 1. Purpose

**Why Content Architecture matters.** `01_INFORMATION_ARCHITECTURE.md` defines *what exists and how it relates* — the skeleton. This document defines *what goes inside each piece of content, how it is written, and how it is displayed* — the substance. A perfect skeleton with inconsistent, low-quality content inside it still fails the vision described in `00_PRODUCT_VISION.md`. Content Architecture is what prevents a technically well-structured site from reading like it was written by ten different people with ten different standards.

**Information Architecture vs. Content Architecture.**

- **Information Architecture** answers: *Where does this content live? What is it related to? How is it found?* It is structural and relational.
- **Content Architecture** answers: *What must this content contain? How is it written? How is it displayed? How is it kept current?* It is editorial and presentational.

A content type is defined once in the Information Architecture (its purpose and relationships) and defined again here (its required sections, metadata, tone, and display rules). Both documents must agree on the same list of content types — this document does not introduce new content types, it governs the ones already defined in `01_INFORMATION_ARCHITECTURE.md`, section 3.

---

# 2. Content Principles

- **Clarity** — a visitor should never have to guess what a piece of content is or why it exists. State it plainly before being clever about it.
- **Consistency** — the same content type must read the same way wherever it appears, regardless of which pillar it belongs to.
- **Authenticity** — content describes real work and real intent. No filler achievements, no invented milestones, no inflated scope.
- **Quality over quantity** — one well-written, complete entry outranks five thin ones. Volume is never a goal in itself.
- **Readability** — short paragraphs, clear structure, no unnecessary jargon. Immersive does not mean dense.
- **Long-term maintainability** — content must be written so it can still make sense, and still be accurate, years later without a full rewrite.
- **Story-first thinking** — even functional content (a status update, a metadata-heavy page) should be framed with narrative intent where it fits naturally, per `AI_RULES.md`.

---

# 3. Content Types

Each content type below defines: **Purpose**, **Required Sections**, **Optional Sections**, **Metadata**, **Related Content**, **Display Rules**, **Future Expansion**. This governs the same content types introduced in `01_INFORMATION_ARCHITECTURE.md`, section 3 — this document does not redefine their relationships, only their editorial and presentational rules.

### Portfolio Piece
- **Purpose:** Present a single finished, presentation-quality work to a professional standard.
- **Required Sections:** Title, hero image/render, short summary (one to two sentences), medium/discipline.
- **Optional Sections:** Process breakdown, software/tool list, wireframe/clay renders, turntable or video.
- **Metadata:** Title, medium, software, completion date, tags, category, status, visibility.
- **Related Content:** Project, Game, or World it belongs to (if any — see `01_INFORMATION_ARCHITECTURE.md`, section 4); Gallery; Devlog documenting its creation.
- **Display Rules:** Hero image first, always. Summary before technical detail. Breakdown content, if present, is opt-in (expandable/secondary), never forced above the fold.
- **Future Expansion:** Interactive 3D viewer, side-by-side comparison slider (concept vs. final).

### Project
- **Purpose:** Represent an active or completed body of work, functioning as an umbrella for its outputs.
- **Required Sections:** Title, status, summary, description of scope.
- **Optional Sections:** Goals/scope breakdown, technology stack, timeline of milestones, team/collaborators.
- **Metadata:** Title, status (draft/active/completed/archived), start date, tags, category, visibility.
- **Related Content:** Devlogs, Portfolio Pieces, Downloads produced by the project; World it is set in, if any.
- **Display Rules:** Status must always be visible near the title (active vs. completed vs. archived) so a visitor never mistakes an old project for current work.
- **Future Expansion:** Progress indicators, funding/publisher status.

### Game
- **Purpose:** Present a game title as design work — the concept, the pitch, and the execution.
- **Required Sections:** Title, status, one-line pitch, summary, cover media.
- **Optional Sections:** Trailer, feature breakdown, platform/release information, press kit.
- **Metadata:** Title, status, engine, platforms, tags, category, release info, visibility.
- **Related Content:** World it is set in, if any; Characters/Locations referenced; Devlogs; Portfolio Pieces built for it.
- **Display Rules:** The one-line pitch must appear before any screenshot or trailer — visitors decide interest from the concept first, visuals second.
- **Future Expansion:** Changelog, press kit download.

### Story / Writing
- **Purpose:** Present original fiction and creative writing in readable long-form — KRUPNI stories, standalone fiction, scenario experiments, and personal writing alike (see `01_INFORMATION_ARCHITECTURE.md`, section 3). A classification (e.g. KRUPNI Story / Standalone Fiction / Scenario Experiment / Personal Writing) marks which kind a given piece is, without requiring a separate content type per subtype.
- **Required Sections:** Title, summary/hook, body content, status, visibility. Nothing else is required to publish.
- **Optional Sections:** KRUPNI relationship, Characters, Locations, Factions, reading time, cover image, series, chapter order, content warning, related content.
- **Metadata:** Title, classification, tags, status, visibility; optionally reading time, publish date, cover image.
- **Related Content:** Fully optional. A KRUPNI Story may reference Characters, Locations, Factions, or Timeline Events. A Standalone Fiction, Scenario Experiment, or Personal Writing piece does not require any fictional-world metadata or related content, and is not blocked from publishing without it.
- **Display Rules:** Reading experience takes priority — minimal chrome around the body text, no unrelated navigation interrupting the read. A Related Content section appears after the story only when it genuinely improves discovery; it is not shown at all when empty — a story is allowed to simply end.
- **Future Expansion:** Audio narration, multi-chapter series navigation.

### Character
- **Purpose:** Introduce an individual within a World.
- **Required Sections:** Name, role/summary, portrait or representative image.
- **Optional Sections:** Full biography, affiliations, appearance details, relationships to other characters.
- **Metadata:** Name, World, role, tags, status, visibility.
- **Related Content:** Companies/Factions the character belongs to; Stories, Timeline Events, Projects/Games they appear in.
- **Display Rules:** A short summary must be readable without scrolling; full biography is progressive detail below it, never a wall of text up front.
- **Future Expansion:** Relationship graph view, voice/casting notes.

### Company (Corporation)
- **Purpose:** Introduce an organizational entity within a World.
- **Required Sections:** Name, type, summary/purpose.
- **Optional Sections:** Ideology, structure, emblem/branding, notable members.
- **Metadata:** Name, World, type, tags, status, visibility.
- **Related Content:** Affiliated Characters; controlled Locations; appearances in Stories/Timeline Events.
- **Display Rules:** Purpose/ideology must be stated in plain language before any in-world jargon is introduced.
- **Future Expansion:** Internal hierarchy chart, rivalry/alliance mapping with other factions.

### Faction
- **Purpose:** Introduce a non-corporate organized group within a World (ideological, military, cultural).
- **Required Sections:** Name, summary/purpose.
- **Optional Sections:** Ideology, structure, symbol/branding, notable members, territory.
- **Metadata:** Name, World, tags, status, visibility.
- **Related Content:** Affiliated Characters; controlled or contested Locations; appearances in Stories/Timeline Events.
- **Display Rules:** Same as Company — plain-language purpose before lore-dense detail.
- **Future Expansion:** Rivalry/alliance mapping shared with Company.

### Location (including Continent)
- **Purpose:** Establish a place within a World, at any scale from a single site to a continent.
- **Required Sections:** Name, type (city/region/continent/site), summary, primary image.
- **Optional Sections:** Extended description, map reference/coordinates, notable inhabitants or events.
- **Metadata:** Name, World, type, parent location (if nested), tags, status, visibility.
- **Related Content:** Parent/child Locations; associated Companies, Factions, Characters, Timeline Events; illustrative Portfolio Pieces (environments).
- **Display Rules:** Continents and large regions lead with scale-establishing imagery or map context; cities and sites lead with atmosphere-establishing imagery. Hierarchy (continent → region → city) must be visible via breadcrumb, not just implied.
- **Future Expansion:** Interactive map pin, layered zoom between continent and city scale.

### Technology
- **Purpose:** Document an in-world object, system, vehicle, weapon, or creature of significance.
- **Required Sections:** Name, type, summary/function.
- **Optional Sections:** Extended lore, technical/spec detail, imagery or a linked hardsurface Portfolio Piece.
- **Metadata:** Name, World, type, tags, status, visibility.
- **Related Content:** Characters/Companies who use or created it; Portfolio Piece modeling it, if one exists.
- **Display Rules:** Function/summary before lore. A visitor should understand *what it is* before *why it matters in the story*.
- **Future Expansion:** Technical spec sheets for game-relevant items.

### Timeline Event
- **Purpose:** Record a dated event on a World, Project, or career timeline (see `01_INFORMATION_ARCHITECTURE.md`, section 12).
- **Required Sections:** Title, date/era, one-paragraph summary.
- **Optional Sections:** Extended narrative detail, linked media.
- **Metadata:** Title, timeline type (World/Project/Career), date or era, tags, visibility.
- **Related Content:** Characters, Companies, Locations, Projects it involves.
- **Display Rules:** Always displayed in chronological context (its position on the relevant timeline), never as an isolated entry with no temporal anchor.
- **Future Expansion:** Visual timeline scrubber, era grouping.

### Devlog
- **Purpose:** Document real development progress on a Project or Game, including setbacks.
- **Required Sections:** Title, date, summary, body.
- **Optional Sections:** WIP media, linked task/progress list.
- **Metadata:** Title, Project/Game it belongs to, date, tags, category, visibility.
- **Related Content:** Parent Project/Game; Portfolio Pieces or Timeline Events produced during this period.
- **Display Rules:** Dated and shown in chronological order by default (newest first). Honesty about setbacks is expected — a devlog that only reports success is not fulfilling its purpose (see section 4, Writing Style).
- **Future Expansion:** Progress percentage indicators, linked task lists.

### Article
- **Purpose:** General long-form writing not tied to a devlog cadence — essays, design breakdowns, retrospectives.
- **Required Sections:** Title, summary, body.
- **Optional Sections:** Cover image, referenced content links.
- **Metadata:** Title, publish date, reading time, tags, category, visibility.
- **Related Content:** Any content type the article discusses.
- **Display Rules:** Summary must accurately preview the article's actual content — no bait-and-switch between summary and body (see section 4).
- **Future Expansion:** Series grouping (`01_INFORMATION_ARCHITECTURE.md`, section 10).

### Gallery
- **Purpose:** Present a curated set of images grouped for visual presentation, attached to a larger piece of content.
- **Required Sections:** Title (or parent content it belongs to), ordered image set.
- **Optional Sections:** Per-image captions, credits.
- **Metadata:** Title, parent content reference, ordering, visibility.
- **Related Content:** The Portfolio Piece, Project, or Devlog it is attached to.
- **Display Rules:** Consistent aspect handling across all images in a set — no jarring size/crop inconsistency within the same gallery.
- **Future Expansion:** Lightbox comparison/slider views.

---

# 4. Writing Style

**Tone of voice:** professional, immersive, minimal.

- **Professional** — content reads as the work of someone who takes their craft seriously. No slang for its own sake, no unnecessary informality.
- **Immersive** — worldbuilding and game content should draw the reader into the atmosphere described in `00_PRODUCT_VISION.md` (section 7, Brand Personality): cinematic dark, contemplative, quietly confident.
- **Minimal** — say what needs to be said and stop. Every sentence should earn its place.

**Never:**

- **Exaggerated** — no "revolutionary," "game-changing," or "unprecedented" language applied to routine work.
- **Clickbait** — titles and summaries must accurately represent what the content contains. No curiosity-gap headlines.
- **Overly corporate** — no marketing-speak, no buzzword stacking, no passive-voice hedging designed to say nothing.

This tone applies across every content type in section 3 — a Devlog and a Story are written in different *registers* (technical vs. narrative) but share the same underlying discipline: clear, honest, unexaggerated language.

---

# 5. Media Standards

- **Images** — high resolution, properly compressed for web delivery, always with descriptive alt text (per `AI_RULES.md`, SEO & Accessibility). Consistent aspect ratio within any single gallery or grid.
- **Videos** — used for motion that a still image cannot communicate (turntables, gameplay, animation). Always paired with a static poster frame for pages that shouldn't autoplay heavy media.
- **GIFs** — used sparingly, for short looping demonstrations only (a UI interaction, a small animation loop). Never used as a substitute for proper video when duration or quality would suffer.
- **Sketches** — presented as-is, without over-polishing; the rawness is part of their value as process documentation.
- **Concept Art** — treated with the same quality bar as finished Portfolio Pieces when presented publicly; work-in-progress concept art belongs in a Devlog, not the Portfolio.
- **Downloads** — always labeled with file type and, where relevant, file size, before the visitor clicks.
- **3D Viewers (future)** — reserved for interactive embeds of 3D work; must not be implemented in a way that blocks page load or degrades performance for visitors who don't interact with it (per `AI_RULES.md`, Performance Rules).

---

# 6. Metadata Standards

Every content type in section 3 must be able to express the following metadata, though not every field is required for every type (see each type's individual **Metadata** entry above for what is mandatory versus omitted):

- **Title**
- **Subtitle** (optional, used where a title alone doesn't convey enough context)
- **Author** (defaults to the site owner; reserved for future multi-author scenarios)
- **Created Date**
- **Updated Date**
- **Tags** (see `01_INFORMATION_ARCHITECTURE.md`, section 8)
- **Categories** (see `01_INFORMATION_ARCHITECTURE.md`, section 9)
- **Universe** (whether the content belongs to KRUPNI — currently the site's only active universe — if at all; see `01_INFORMATION_ARCHITECTURE.md`, section 18, Universe Architecture)
- **Status** (see section 7, Content Status)
- **Visibility** (public, unlisted, or private — governs whether content is indexed/linked at all)
- **Related Content** (see section 9)

**Updated Date** must be maintained honestly — it reflects genuine substantive edits, not cosmetic touch-ups, so that "recently updated" remains a meaningful signal to returning visitors.

---

# 7. Content Status

```
Idea → Draft → Review → Published → Featured → Archived
```

- **Idea** — not yet content; a placeholder concept with no guarantee of ever being written. Never publicly visible in any form.
- **Draft** — in active authoring. Not queryable by any public system.
- **Review** — complete and being checked against this document and `AI_RULES.md` before release. Not publicly visible.
- **Published** — live, indexed, eligible for tags/categories/collections and related-content recommendations.
- **Featured** — a Published item promoted to prominent placement (see section 8).
- **Archived** — no longer promoted in default views but still reachable via direct URL, Archive, and search (see `01_INFORMATION_ARCHITECTURE.md`, section 16, Content Lifecycle — this status system extends that one with the pre-publication **Idea** and **Review** stages specific to editorial workflow).

---

# 8. Featured Content Strategy

Featured status is a deliberate editorial decision, never a random rotation or an automated "recently added" shortcut.

- Featured content must meet the highest bar in its content type — it represents the site to a first-time visitor.
- Prioritize quality and relevance to the current moment (a piece that best represents current skill level or the current project focus) over novelty alone.
- Featured selections should be reviewed periodically rather than left static indefinitely — but changing them is a curatorial act, not a schedule to automate.
- A content type with no entry that meets the bar should simply have no Featured item in that type yet, rather than featuring something mediocre to fill the slot (consistent with section 2, Quality over quantity).

---

# 9. Related Content Strategy

Related content recommendations must be contextual — see `01_INFORMATION_ARCHITECTURE.md`, section 12 (Cross-Link Strategy) for the structural mechanism this strategy governs editorially.

Never force relationships. A recommendation is only shown where it provides genuine value to whoever is reading the current page.

**Recommendation priorities**, in order:

1. **Direct relationships** — content explicitly connected to the current page (its Project, its World, its Characters).
2. **Same Collection** — content curated alongside the current page in a Collection (`01_INFORMATION_ARCHITECTURE.md`, section 10).
3. **Shared tags/category** — content sharing enough tags or the same category to be topically relevant.
4. **Same content type, same World** — a fallback for Worldbuilding content with no other established relationships yet.

If none of these produce a genuinely relevant result, no related-content module is shown. An empty related-content section is preferable to a forced, irrelevant one.

---

# 10. Content Maintenance

Outdated content is never deleted outright — it is archived (see section 7 and `01_INFORMATION_ARCHITECTURE.md`, section 16). This site is a long-term record, and its own history (an early project, a first devlog, an early portfolio piece) has documentary value even after it stops being representative of current skill.

Rules:

- **Never delete valuable history.** Archive instead of removing.
- Archived content keeps its URL permanently (per `01_INFORMATION_ARCHITECTURE.md`, section 13) — inbound links must never break.
- When content becomes factually inaccurate (a project status that changed, a since-corrected technical claim), it must be updated promptly rather than left stale, with **Updated Date** reflecting the correction.
- Superseded content (an old version of a now-improved Portfolio Piece) should be archived and, where useful, explicitly linked from its replacement rather than left to compete with it in search and navigation.
- Periodic review is expected — content that has drifted out of date, or that no longer meets the bar in section 2, should be identified and either updated or archived, not left to quietly misrepresent current standards.

---

# 11. Future Expansion

Content Architecture should not be blocked from accommodating the following if a real need appears and the owner explicitly approves — none of these are scheduled:

- **Multiple Languages** — content fields (title, summary, body) must be structured so a translation layer can be added without changing the underlying content type definitions.
- **Interactive Maps** — Location content (section 3) already carries the fields needed to support this; see `07_TECHNICAL_ARCHITECTURE.md`, section 11 for the existing/planned architecture.
- **Downloads** — already a defined content type (`01_INFORMATION_ARCHITECTURE.md`, section 3); this document's Media Standards (section 5) govern its presentation.
- **Documentation** — public-facing design documents, distinct from this internal `/docs` folder, governed by the same metadata and status rules defined here.
- **Optional future email updates** — see `08_ROADMAP.md`; not a public-account or community feature, not currently scheduled.

A second Worldbuilding universe and any public/community feature (comments, likes, bookmarks, followers) are explicitly **not** on this list — see `AI_RULES.md`, Product Scope Rules.

---

# 12. Content Principles

- Every page must provide value.
- Every page should encourage exploration.
- Content should remain timeless whenever possible.
- Consistency is more important than quantity.
- Never publish unfinished content simply to fill space.

These principles are permanent. Any future content decision that conflicts with them must be flagged and resolved explicitly, per `AI_RULES.md` — never silently overridden.
