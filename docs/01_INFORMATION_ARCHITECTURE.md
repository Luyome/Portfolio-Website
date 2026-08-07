# Information Architecture

This document defines the complete Information Architecture (IA) of the website: its hierarchy, content types, relationships, navigation, search, tagging, URL structure, and lifecycle rules.

This is not a portfolio sitemap. It is the structural blueprint for a long-term platform combining Portfolio, Game Design, Worldbuilding, Storytelling, a Development Journal, and a Personal Knowledge Base. Every future page, feature, and navigation decision must be traceable back to this document. If a future task requires a structure not covered here, this document must be updated first — never improvised around.

---

# 1. Information Architecture Goals

**Why IA matters here.** A generic portfolio can survive with a flat structure: a homepage, a gallery, a contact form. This platform cannot. It spans six pillars that *may* reference each other where a real connection exists, and it continues to accumulate content during active use. Without a deliberate structure, this content would either fragment into disconnected silos (the exact failure state described in `00_PRODUCT_VISION.md`) or collapse into an unmaintainable flat list. IA is the discipline that prevents both.

**How it supports reasonable extensibility.** Every content type defined in this document is designed to accept new fields, new relationships, and new entries without requiring a new content type to be invented for each variation. A `Character` added today and a `Character` added later in active use must fit the same schema. Growth should be additive (more rows, more tags, more collections), never structural (new hierarchies bolted on ad hoc) — and this document does not assume any particular volume of growth beyond what active, ongoing publishing produces.

**How it supports discoverability.** Content that cannot be found does not exist for the visitor, no matter how good it is. Discoverability here is achieved through four independent, overlapping systems: hierarchy (section 2), tags and categories (sections 8–9), search (section 7), and cross-linking (section 12). A single piece of content should typically be reachable through at least two of these paths.

**How it improves navigation.** Navigation is not decoration; it is the visitor's mental map of the site. A consistent navigation philosophy (section 5) means a visitor who has learned how to move through Portfolio already knows how to move through Worldbuilding — the patterns repeat.

**How it connects all content together.** Every content type in section 3 is *capable* of relating to others (section 4) — this is what lets a visitor discover a genuine connection between pillars when one exists. Relationships are optional and intentional, never mandatory (see section 4, section 17, Content Independence); this is still what separates this platform from a portfolio with a blog attached to it, because the *capability* to connect meaningfully is designed in everywhere, even where a specific piece of content chooses not to use it.

---

# 2. Site Hierarchy

The hierarchy below is conceptual, not a literal folder structure — see section 13 for URL mapping. Each top-level section is a pillar or a cross-cutting system.

```
Homepage
│
├── Portfolio            — curated, presentation-quality work
│   └── Portfolio Pieces
│
├── Projects              — working umbrella for active/in-progress work
│   └── Project detail pages
│
├── Game Design
│   └── Games (individual titles)
│
├── Worldbuilding
│   └── KRUPNI               — the site's single active fictional universe
│       ├── Characters
│       ├── Companies / Corporations / Factions
│       ├── Locations (Cities, Continents, Regions)
│       ├── Technologies / Vehicles / Weapons / Creatures
│       ├── World Timeline
│       └── Lore
│
├── Stories and Writing    — broader than Worldbuilding; KRUPNI-related and standalone alike
│   ├── KRUPNI Stories
│   ├── Standalone Fiction
│   ├── Scenario Experiments
│   └── Personal Writing
│
├── Development Journal    — devlogs, articles, tutorials
│   └── Entries
│
├── About                  — identity, bio, credentials, CV
│
├── Contact
│
├── Search                 — cross-cutting, not a content pillar
│
├── Timeline               — cross-cutting aggregation (see section 11)
│
├── Tags                   — cross-cutting index (see section 8)
│
├── Categories             — cross-cutting index (see section 9)
│
├── Collections            — cross-cutting curated groupings (see section 10)
│
├── Archive                — chronological/full-catalog view of everything
│
└── Private Admin          — existing, non-public — owner-only content management, not part of the public IA
```

This hierarchy is conceptual; a subtype listed under a section (e.g. "Standalone Fiction" under Stories and Writing) does not necessarily need its own top-level route — see the corresponding entries in section 3.

**Homepage** — Purpose: orient every visitor type within seconds and route them into the pillar they came for (see `00_PRODUCT_VISION.md`, section 6, User Journey). Relationship: links outward to every pillar; is the only page allowed to summarize all of them at once.

**Portfolio** — Purpose: present finished, presentation-quality work (environment design, hardsurface props, renders). Relationship: individual pieces link back to the Project, World, or Game they originated from wherever applicable.

**Projects** — Purpose: house work that is active or doesn't yet belong cleanly to a single pillar. Relationship: a Project may *contain* or *reference* Portfolio Pieces, Devlogs, KRUPNI, or Games where relevant — none of these are required; as it matures, its outputs may graduate into those pillars (see section 14, Content Lifecycle).

**Game Design** — Purpose: present shipped and in-progress games as design work, not just screenshots. Relationship: a Game may be set inside KRUPNI and may reference Characters and Locations where relevant; its production may be documented in the Development Journal where useful.

**Worldbuilding** — Purpose: house KRUPNI — the site's single active fictional universe — in structural depth (not as prose alone). Relationship: the richest relationship hub in the IA — other content types *may* reference KRUPNI or its children where the connection is real, but none are required to.

**Stories and Writing** — Purpose: original fiction and creative writing, in readable long-form — broader than Worldbuilding. Includes KRUPNI-set stories as well as standalone fiction, scenario experiments, and personal writing with no fictional-world relationship at all. Relationship: a KRUPNI story may reference Worldbuilding entities (Characters, Locations, Factions); a standalone piece requires none of that metadata.

**Development Journal** — Purpose: process documentation — devlogs, articles, tutorials — across every other pillar. Relationship: a Development Journal entry may link to the content it documents, or remain a standalone reflection, article, or process note — no related Project, Game, Portfolio Piece, or KRUPNI entry is required.

**About** — Purpose: identity, biography, credentials, downloadable CV. Relationship: mostly a leaf node, but should link out to representative Portfolio work and to Contact.

**Contact** — Purpose: conversion point for recruiters, studios, publishers, and collaborators. Relationship: linked from Homepage, About, and Portfolio; never buried.

**Search / Timeline / Tags / Categories / Collections / Archive** — Purpose: cross-cutting discovery systems layered on top of the pillars, not pillars themselves. They exist so that content can be found by *axis* (chronology, topic, classification, curation, or full catalog) rather than only by *pillar*. Detailed in sections 7–11. Search, Tags, and Archive must surface independent Stories and Writing exactly as they surface KRUPNI content — neither is a second-class citizen of discovery.

**Private Admin** — Purpose: owner-only content management; already implemented (authentication, dashboard, CRUD for existing content types, a working map editor). Relationship: not part of the public IA; referenced here only so its existing shape does not require restructuring the public hierarchy.

---

# 3. Content Types

Every content type below follows the same schema shape: **Purpose**, **Fields**, **Relationships**, **Future Expansion**. Fields listed are conceptual (the data this content type must be able to express), not a literal database schema.

### Project
- **Purpose:** Represents any active or completed body of work not yet — or not only — classified as a Game, Portfolio Piece, or World.
- **Fields:** title, summary, status (draft/active/completed/archived), cover media, description, start date, tags.
- **Relationships:** may relate to KRUPNI where relevant; may contain/reference Characters, Companies, Locations, Technologies, Stories, Portfolio Pieces, Devlogs, Timeline Events.
- **Future Expansion:** collaborators, external links (Steam, itch.io), funding/publisher status.

### Game
- **Purpose:** A game title, shipped or in development, presented as design work.
- **Fields:** title, status, engine (e.g. UE5), summary, pitch, cover/trailer media, platforms, release info.
- **Relationships:** may relate to KRUPNI where relevant; may reference Characters, Locations, Technologies; may be documented by Devlogs; may reference Portfolio Pieces (environments/props built for it).
- **Future Expansion:** press kit, changelog.

### Story / Writing
- **Purpose:** Original fiction and creative writing — KRUPNI-set stories, standalone fiction, scenario experiments, and personal writing alike. A classification field (e.g. KRUPNI Story / Standalone Fiction / Scenario Experiment / Personal Writing) distinguishes these without requiring separate content types, tables, or routes.
- **Fields:** title, summary/hook, body content, status, visibility; optionally reading time, publish date, cover image, chapter order (if serialized), content warning.
- **Relationships:** optional and never required for publication — a KRUPNI Story may reference KRUPNI's Characters, Locations, and Factions; a Standalone Fiction or Personal Writing entry needs none of that metadata and may have zero related content.
- **Future Expansion:** multi-chapter series support, audio narration.

### Character
- **Purpose:** An individual within a World.
- **Fields:** name, role, summary, biography, affiliations, appearance/portrait media.
- **Relationships:** relates to KRUPNI; affiliated with Companies/Factions; appears in Stories, Timeline Events, Projects/Games.
- **Future Expansion:** relationship graph between characters, voice/casting notes.

### Company / Corporation / Faction
- **Purpose:** An organizational entity within a World (a megacorporation, a faction, a guild).
- **Fields:** name, type, summary, ideology/purpose, emblem/logo media.
- **Relationships:** relates to KRUPNI; employs/affiliates Characters; controls Locations; appears in Stories and Timeline Events.
- **Future Expansion:** internal hierarchy, rivalries/alliances between factions.

### Location (City, Continent, Region)
- **Purpose:** A place within a World, at any scale from a single site to a continent.
- **Fields:** name, type (city/continent/region/site), summary, map coordinates or map reference, imagery.
- **Relationships:** relates to KRUPNI; may contain other Locations (continent → region → city); associated with Companies, Characters, Timeline Events; illustrated by Portfolio Pieces (environments).
- **Future Expansion:** interactive map pin (see section 15).

### Technology / Vehicle / Weapon / Creature
- **Purpose:** In-world objects and entities of significance (a technology, a vehicle class, a weapon, a species).
- **Fields:** name, type, summary, function/lore, imagery.
- **Relationships:** relates to KRUPNI; used by Characters/Companies; may be a Portfolio Piece (a hardsurface model of the object itself) or referenced by one.
- **Future Expansion:** technical/spec sheets for game-relevant items.

### Environment
- **Purpose:** A designed space — the environment-design equivalent of a Portfolio Piece, distinct from a narrative Location though frequently paired with one.
- **Fields:** title, summary, software/engine used, imagery/render set, breakdown notes.
- **Relationships:** may illustrate a Location; belongs to a Project or Game; is itself a Portfolio Piece.
- **Future Expansion:** real-time viewer embeds.

### Timeline Event
- **Purpose:** A dated event on any timeline (World history, project development, personal career).
- **Fields:** title, date or era, summary, timeline type (World / Project / Career).
- **Relationships:** relates to KRUPNI, a Project, or is a standalone career milestone; may reference Characters, Companies, Locations.
- **Future Expansion:** visual timeline scrubber, era grouping.

### Article
- **Purpose:** General long-form writing not tied to a specific devlog cadence (essays, design breakdowns, retrospectives).
- **Fields:** title, summary, body, publish date, reading time.
- **Relationships:** may reference any content type it discusses.
- **Future Expansion:** series grouping (see section 10).

### Devlog
- **Purpose:** Dated development-process entry documenting progress on a Project or Game.
- **Fields:** title, date, summary, body, media (WIP screenshots, video).
- **Relationships:** belongs to a Project or Game; may reference specific Portfolio Pieces or Timeline Events it produced.
- **Future Expansion:** progress/percentage indicators, linked task lists.

### Tutorial
- **Purpose:** Instructional content (workflow, technique) distinct from process documentation.
- **Fields:** title, summary, body/steps, difficulty level, software/tools covered.
- **Relationships:** may reference the Portfolio Piece or technique it teaches.
- **Future Expansion:** downloadable resources, step completion tracking.

### Portfolio Piece
- **Purpose:** A single finished, presentation-quality work (an environment, a prop, a render set).
- **Fields:** title, summary, medium, software, imagery/render set, breakdown notes, completion date.
- **Relationships:** may belong to a Project, Game, or World; may illustrate a Location, Technology, or Character.
- **Future Expansion:** turntable/interactive 3D embeds.

### Gallery
- **Purpose:** A curated set of images grouped for presentation (not a full Collection — see section 10 for the distinction).
- **Fields:** title, image set, ordering.
- **Relationships:** attached to a Portfolio Piece, Project, or Devlog.
- **Future Expansion:** lightbox comparison/slider views.

### Collection
- **Purpose:** A curated cross-content grouping for presentation (see section 10).
- **Fields:** title, summary, ordered list of referenced content.
- **Relationships:** references any content type.
- **Future Expansion:** auto-generated collections from tag combinations.

### Tag
- **Purpose:** Lightweight, multi-assign classification (see section 8).
- **Fields:** label, slug.
- **Relationships:** assignable to every content type.
- **Future Expansion:** tag synonyms, tag hierarchies (parent/child tags).

### Category
- **Purpose:** Structural, single-assign classification (see section 9).
- **Fields:** label, slug, parent category (if nested).
- **Relationships:** assignable to every content type, typically one category per item.
- **Future Expansion:** category-specific landing pages with custom layout.

### Series
- **Purpose:** An ordered sequence of content meant to be consumed in order (a devlog arc, a story arc, a tutorial series).
- **Fields:** title, summary, ordered list of entries.
- **Relationships:** groups Stories, Devlogs, Articles, or Tutorials.
- **Future Expansion:** progress tracking, "next in series" navigation.

### Media
- **Purpose:** The underlying asset record (image, video, 3D embed) referenced by other content types.
- **Fields:** file reference, alt text, caption, credit.
- **Relationships:** attached to nearly every content type.
- **Future Expansion:** CDN/optimization pipeline metadata.

### Download
- **Purpose:** A downloadable file offered to visitors (CV, press kit, game build).
- **Fields:** file reference, label, file type, version.
- **Relationships:** attached to About, a Game, or a Project.
- **Future Expansion:** download analytics, gated downloads.

### Document
- **Purpose:** Reference documentation not meant for casual browsing (design documents, technical write-ups).
- **Fields:** title, summary, body or file reference.
- **Relationships:** may be linked from a Project, Game, or Devlog for readers who want depth.
- **Future Expansion:** version history.

---

# 4. Relationships Between Content

Relationships between content must always be intentional.

Content should connect only when the relationship provides real value. Do **not** force connections between unrelated content.

Every content type may have:

- Zero related items
- One related item
- Multiple related items

Relationships should improve storytelling, discoverability, navigation, and user understanding — they are a tool in service of those outcomes, not an obligation every piece of content owes to the architecture.

Examples:

- A Story does not need to connect to a Game Project.
- A Portfolio Piece does not need to belong to a fictional universe.
- A Character may exist before any Story is written.

Independent content is completely acceptable.

Representative relationship chain (illustrative, not mandatory):

```
Project
 └── belongs to World
      └── contains Characters
      └── contains Companies
      └── contains Locations
      └── contains Technologies
 └── contains Stories
 └── contains Portfolio Assets
 └── contains Devlogs
 └── contains Timeline Events
```

This is not a rigid single hierarchy — it is a graph, and participation in it is optional per item. A Character does not only belong to a World; that same Character *can* be referenced by a Story, a Timeline Event, a Game, and a Devlog simultaneously — but is never required to be. The World is a gravitational center that Worldbuilding content *may* orbit, not a container everything must be assigned to.

---

# 5. Navigation Structure

**Top Navigation** — Persistent, global. Contains only pillar-level entries (Home, Work/Portfolio, Worldbuilding, About, etc.) — never content-instance links. Used for jumping between pillars from anywhere on the site.

**Side Navigation** — Used within a pillar that has deep internal structure (e.g. inside KRUPNI: Characters / Companies / Locations / Timeline). Not used site-wide; only appears where a pillar's internal hierarchy is too deep for top navigation alone.

**Context Navigation** — In-page navigation scoped to the current content (e.g. jumping between sections of a long Project page, or between chapters of a Story). Local to the page, never persistent across navigation.

**Footer Navigation** — Secondary/utility links: Contact, Archive, legal/credits, social links. Used for links that are useful but not part of the primary discovery path.

**Breadcrumbs** — Used on any page nested more than one level deep (e.g. `Worldbuilding → KRUPNI → Characters → [Character Name]`). Always reflects the true hierarchical path, never a fabricated shortcut.

**Back Navigation** — Used within multi-step or filtered views (search results, filtered archive) to return to the prior state, not just the prior URL.

**Related Content** — Appears at the bottom of nearly every detail page (see section 12, Cross-Link Strategy). This is the primary mechanism that fulfills the "never leave users at a dead end" principle.

**Quick Access** — Homepage-level and pillar-index-level shortcuts to featured/recent content (e.g. "Latest Devlog," "Featured Portfolio Piece"). Used to surface freshness and depth without requiring deep navigation.

---

# 6. User Navigation Flow

**Recruiter** — Entry: Homepage or a direct Portfolio/CV link. Journey: Homepage → Portfolio → a small number of best pieces → About/CV. Exit: Contact or CV download. Desired action: contact initiated or CV downloaded.

**Studio** — Entry: Homepage or Portfolio. Journey: Portfolio → breakdown of technical work → Game Design (to assess design maturity) → About. Exit: Contact. Desired action: outreach for collaboration or hiring.

**Publisher** — Entry: Game Design or a direct Game page link. Journey: Game detail → pitch/summary → Devlog history (proof of execution) → Contact. Exit: Contact or Document (design doc) download. Desired action: request for pitch material or meeting.

**Player** — Entry: a Game page (often via external link — Steam, itch.io, social). Journey: Game detail → trailer/media → World (if curious about setting) → wishlist/follow link. Exit: external store page or social follow. Desired action: wishlist, follow, or purchase.

**Developer** — Entry: Development Journal or a specific Devlog. Journey: Devlog → linked Project/Game → related Devlogs in the same Series. Exit: continues reading within the Journal. Desired action: sustained reading, return visits.

**Artist** — Entry: Portfolio. Journey: Portfolio Piece → breakdown/process notes → related Devlog (if one documents its creation). Exit: another Portfolio Piece or Devlog. Desired action: browsing multiple pieces, technical credibility formed.

**Worldbuilding Reader** — Entry: Worldbuilding or a direct World link. Journey: World overview → Characters/Locations/Factions → Stories → Timeline. Exit: rarely — this persona is meant to keep exploring; the goal is depth of session, not a fast exit. Desired action: maximum lore exploration, eventual return visits.

---

# 7. Search Architecture

**Global Search** — Searches across all content types simultaneously; the default entry point for search. Results are grouped by content type (Portfolio, Worldbuilding, Stories, Journal) rather than shown as a single flat list.

**Project Search** — Scoped search within Projects only, available from the Projects index.

**Lore Search** — Scoped search within Worldbuilding content (Characters, Companies, Locations, Technologies), available from a World's index page.

**Story Search** — Scoped search within Stories, available from the Stories index.

**Portfolio Search** — Scoped search within Portfolio Pieces, available from the Portfolio index.

**Tag Search** — Search/filter driven entirely by one or more Tags (see section 8).

**Category Search** — Search/filter driven by Category selection (see section 9).

**Filters** — Available on every scoped search and index page: by content type, tag, category, date range, and (where relevant) World.

**Sorting** — Standard options: newest first, oldest first, alphabetical, featured-first. Default sort is context-dependent (Devlogs default to newest-first; Portfolio may default to featured-first).

**Recent Searches** — Locally remembered per-session to speed up repeated lookups; never stored as tracked personal data.

**Future AI Search** — Reserved for a future natural-language search layer (e.g. "show me environments set in KRUPNI") built on top of the same underlying relationship graph described in section 4. Explicitly deferred — must not be designed around until the underlying content graph is mature enough to support it meaningfully.

---

# 8. Tagging System

**Philosophy.** Tags are lightweight, multi-assign, and descriptive rather than structural. A single piece of content can and should carry several tags spanning different axes: tool (`UE5`, `Blender`), genre/tone (`Sci-Fi`, `Narrative`), discipline (`Environment`, `Hard Surface`, `Character`), pillar (`Portfolio`, `Worldbuilding`), and status (`Prototype`, `Steam`).

Example tag set: `UE5`, `Blender`, `Cyberpunk`, `Environment`, `Hard Surface`, `Character`, `Sci-Fi`, `Narrative`, `Steam`, `Prototype`, `Portfolio`, `Worldbuilding`.

**Rule.** Every content type defined in section 3 must support tags. Tags are the connective tissue that makes cross-pillar discovery possible without requiring an explicit, hand-authored relationship for every pair of related items (e.g. all `Hard Surface` items surface together regardless of which pillar they belong to).

Tags must remain low-friction to apply — if creating/assigning a tag ever feels like a structural decision, it should have been a Category instead (see section 9).

---

# 9. Categories

**Categories** are structural and (generally) single-assign: they answer "what kind of content is this, fundamentally" (e.g. a Portfolio Piece's category might be `Environment` vs. `Prop`; a Journal entry's category might be `Devlog` vs. `Article` vs. `Tutorial`). Categories shape which template/layout a piece of content uses.

**Tags** are descriptive and multi-assign: they answer "what does this relate to or involve" and never determine layout.

**Collections** are curated, manually-assembled groupings for presentation purposes (see section 10) — they exist to tell a story about a set of items, not to classify them.

**Series** are ordered sequences meant to be consumed in a specific order (see section 10) — the defining trait is sequence, not shared subject matter.

Rule of thumb: if removing the grouping would break how the content is *rendered*, it's a Category. If it would only break how the content is *found*, it's a Tag. If it would only break a *curated presentation*, it's a Collection. If it would break a *reading order*, it's a Series.

---

# 10. Collections

Collections are hand-curated groupings that exist to present content with intent, independent of the underlying content type or category. Examples:

- **KRUPNI** — every piece of content (Portfolio, Story, Devlog, Timeline Event) tied to this specific World, presented together regardless of type.
- **Environment Collection** — a curated set of environment-focused Portfolio Pieces.
- **Hard Surface Collection** — a curated set of hardsurface prop work.
- **Game Systems** — Devlogs/Articles specifically about design systems rather than art or narrative.
- **Finished Projects** — Projects that have reached completed status.
- **Personal Favorites** — subjective curation, used sparingly, signals genuine highlights rather than algorithmic "featured" status.
- **Featured Works** — the current front-facing highlight reel, expected to rotate over time.
- **Learning Series** — curated Tutorials grouped by skill path.

Collections may reference content across every content type and pillar. They are the primary tool for hand-authored cross-pillar storytelling that automated tags and categories cannot achieve on their own.

---

# 11. Timeline Architecture

Four timeline types, sharing the same underlying `Timeline Event` content type but scoped differently:

- **World Timeline** — in-fiction chronology of a specific World (e.g. KRUPNI's history from its founding era to "present day" in-universe).
- **Project Timeline** — real-world chronology of a Project's development milestones.
- **Development Timeline** — cross-project real-world chronology, aggregating Project/Game Timelines into a single development history view.
- **Personal Career Timeline** — real-world professional milestones (education, roles, releases), used primarily on the About page.

**How they connect.** A single `Timeline Event` declares which timeline(s) it belongs to. A game's shipping date, for instance, is simultaneously a Project Timeline event and a Personal Career Timeline event — it is not duplicated as two separate records, only referenced on both views. World Timeline events remain fictional and are never mixed into real-world timelines, even when a World Timeline event corresponds to the in-fiction "release" of a game set in that World.

---

# 12. Cross-Link Strategy

Every page should recommend related content only when it makes sense. Recommendations should never feel forced.

Representative cross-link chains (used where the relationship genuinely exists — see section 4):

```
Character
 → Company
 → Story
 → Location
 → Timeline Event
```

```
Story
 → Characters
 → Locations
 → Timeline Events
```

```
Project
 → Devlogs
 → Portfolio Assets
 → Downloads
```

```
Portfolio Piece
 → Gallery
 → Breakdown
 → Related Project (optional)
```

Avoid creating artificial navigation loops. Connections should always have context and purpose — a related-content module exists to help a visitor go somewhere genuinely relevant next, not to fill a template slot.

---

# 13. URL Structure

URLs must be predictable, hierarchical where it reflects real hierarchy, and stable over time (a published URL should not need to change as the site grows).

```
/projects
/projects/project-name

/worldbuilding
/worldbuilding/characters
/worldbuilding/characters/character-name
/worldbuilding/companies
/worldbuilding/companies/company-name
/worldbuilding/locations
/worldbuilding/timeline

/portfolio
/portfolio/piece-name

/games
/games/game-name

/stories
/stories/story-name

/devlog
/devlog/entry-slug

/collections
/collections/krupni

/tags/hard-surface
/categories/environment

/about
/contact
/archive
/search
```

**Naming conventions.** All URLs are lowercase, hyphen-separated (`kebab-case`), and use singular pillar names only where the pillar itself is singular in concept (`/about`, `/contact`) and plural where it is a collection of items (`/projects`, `/games`, `/worldbuilding`). Slugs are derived from titles but are permanent once published — renaming a title does not change its slug, to avoid breaking inbound links.

**Scalability.** Nested URLs never exceed the depth needed to reflect a real containment relationship (World → sub-entity is as deep as URLs are expected to go; a sub-entity's own children, if any emerge later, should be handled by section-based navigation on the same page rather than by adding another URL segment — see section 16, Anti-Patterns, "Deep navigation trees").

---

# 14. Content Lifecycle

```
Draft → Private → Published → Featured → Archived
```

- **Draft** — In authoring, not queryable by any public system (search, navigation, related-content). Visible only to the author.
- **Private** — Complete but intentionally unpublished (e.g. finished but scheduled, or awaiting a related piece before it makes sense to release). Not publicly linked or indexed.
- **Published** — Live, indexed by search, eligible for tags/categories/collections, eligible to appear in related-content modules.
- **Featured** — A Published item promoted to homepage/pillar-index prominence (Quick Access, Collections such as "Featured Works"). Featured status is additive on top of Published, not a separate track.
- **Archived** — No longer promoted or surfaced in default views, but still reachable via direct URL, Archive (section 2), and search. Archiving must never mean deleting or breaking a URL — see section 16.

---

# 15. Future Expansion

The architecture defined above should not block the following if a real need appears and the owner explicitly approves it — none of these are scheduled or assumed:

- Interactive maps (a natural extension of the Location content type — already substantially underway, see `07_TECHNICAL_ARCHITECTURE.md`, section 11)
- A structured Wiki / Lore Database view over Worldbuilding content
- An AI Assistant (building on the Future AI Search groundwork in section 7)
- Expanded Documentation (public-facing design docs, distinct from internal `/docs`)
- A full Game Database view aggregating all Games with filterable metadata
- Multiple Languages (i18n), without requiring URL structure to change beyond a locale prefix
- Optional future email updates for content notifications — see `08_ROADMAP.md`; not scheduled, not a public-account feature

Public accounts, comments, likes, bookmarks, followers, community feeds, a marketplace, and any second Worldbuilding universe are explicitly **not** on this list — see `AI_RULES.md`, Product Scope Rules, and `08_ROADMAP.md`, section 10 (Scope Lock). If a future feature cannot attach to the existing content types and relationships (sections 3–4) without new top-level hierarchy, that is a signal to revisit this document explicitly with the owner — not to work around it.

---

# 16. Anti-Patterns

The following must never happen:

- **Duplicate navigation** — the same destination reachable via two inconsistently-labeled nav entries.
- **Broken hierarchy** — a breadcrumb or URL implying a containment relationship that isn't real.
- **Hidden content** — Published content with no path to it from navigation, tags, search, or related-content links.
- **Dead-end pages** — a detail page that has a genuinely relevant related item but withholds the link to it, leaving a visitor no way forward except browser-back (see section 12). This is distinct from a standalone page with no related content at all, which is valid (see section 17, Content Independence).
- **Deep navigation trees** — requiring more than 3–4 clicks from the homepage to reach any Published content.
- **Disconnected worldbuilding** — a genuine relationship between Worldbuilding content and Portfolio/Projects/Stories/Games that exists but is deliberately not surfaced. This does not mean every piece of Worldbuilding content must reference these pillars — only that a real connection, once it exists, should be discoverable.
- **Confusing URLs** — non-deterministic, non-hierarchical, or inconsistent slug patterns.
- **Duplicate content** — the same information maintained in two places that can drift out of sync (e.g. a Character's bio duplicated on both a Story page and a Character page instead of referenced from one canonical source).

---

# 17. Content Independence

Every content type must be capable of existing independently. Independence is not a gap to be filled later — it is a fully valid, permanent state for a piece of content.

Examples:

- A Story may exist without any Project.
- A Project may exist without Worldbuilding.
- A Portfolio Piece may exist without any Story.
- A Character may exist before their Story.
- KRUPNI may grow to a large, richly detailed archive over time, or stay modest — either is valid, and growth is not a requirement.

The architecture must support both standalone content and deeply connected ecosystems, side by side, without either one being treated as the "correct" default. Content is never incomplete for lacking relationships — see section 4.

---

# 18. Universe Architecture

**KRUPNI is the site's single active Worldbuilding universe.** No second universe is currently planned, and multi-universe support (a universe switcher, a public "all universes" index, universe selection added to every content form) is explicitly not part of the architecture for Sprints 1–10.

KRUPNI is capable of containing its own:

- Characters
- Companies
- Factions
- Continents
- Locations
- Stories
- Timeline
- Technologies
- Maps
- Gallery
- Media

Worldbuilding routes, content models, and navigation may be designed around KRUPNI as the only active universe — the architecture does not need to be generalized for hypothetical additional universes it does not yet have.

**Future clarification.** A second universe could theoretically be introduced through a future, explicit product decision by the owner. This possibility is not a current architectural requirement, must not be described as planned, required, or post-launch scope, and current implementation must not be complicated or damaged merely to keep that distant possibility open. If a second universe is ever approved, it is a new instance of the same World content type described in section 3 — not a reason to redesign what already exists.

---

# Supporting Map Entities

A **Map Marker** is a supporting navigational and presentation entity, not a primary editorial content pillar alongside the content types in section 3.

A Map Marker is **not**:

- A standalone fictional lore entry.
- A replacement for a Location.
- A duplicate source of content.
- Required to have its own public detail page.

A Map Marker exists to place and represent another entity, or a map-specific point of interest, inside an interactive fictional map (see `07_TECHNICAL_ARCHITECTURE.md`, section 11, Interactive World Map Architecture, for its full technical architecture).

A Map Marker may optionally reference: Map, Continent, Region, City, Location, Corporation, Faction, Character, Story, Technology, Timeline Event, Project, or Gallery/Media. A Map Marker may also represent a map-only point of interest that does not yet have a full content page — this is a valid, permanent state, not an incomplete one (consistent with section 17, Content Independence).

Permanent rules:

- All relationships are optional and intentional, per section 4.
- The referenced content entity remains the source of truth.
- Marker records contain only map-specific data: coordinates, zoom visibility, priority, marker type, preview information, and publication status.
- Full lore must not be duplicated inside marker records.
- A marker may exist without a public detail page.
- A Location may exist without a marker.
- Multiple markers may reference different views or representations where architecturally justified.
- Supporting map entities must remain searchable and manageable in the future Admin Map Manager.
- Map Marker is a supporting system entity, not one of the primary editorial content pillars defined in section 3.

---

# 19. Information Architecture Principles

- Relationships should always have a purpose.
- Independent content is allowed.
- Connected content should improve discovery.
- Navigation should never force users into unrelated sections.
- Content should remain modular.
- The architecture must support both standalone works and KRUPNI's interconnected worldbuilding.
- Maintainability and simplicity are more important than speculative completeness.
- Simplicity is preferred over unnecessary complexity.
- The website should evolve without requiring structural redesign.

This document is the permanent blueprint for every page, feature, and navigation decision in the project. Any implementation task that requires deviating from it must stop and explain the conflict — per `AI_RULES.md` — before proceeding.
