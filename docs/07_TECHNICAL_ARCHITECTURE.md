# Technical Architecture

This document defines the complete technical architecture of the website: the structural and engineering principles that every future implementation task must follow.

It builds on `AI_RULES.md`, `00_PRODUCT_VISION.md`, `01_INFORMATION_ARCHITECTURE.md`, `02_CONTENT_ARCHITECTURE.md`, `03_BRAND_IDENTITY.md`, `04_DESIGN_SYSTEM.md`, `05_COMPONENT_LIBRARY.md`, and `06_MOTION_SYSTEM.md`. Where those documents define what the site is, how it's organized, and how it looks and moves, this document defines how it is *built* — the engineering discipline that keeps a maintainable, practically-scoped platform from collapsing under its own accumulated complexity during active use.

This document defines **architectural principles, not implementation details.** It contains no code. It does not choose new libraries or lock the project into tools beyond what is already part of it — where the existing stack (Next.js, Drizzle ORM, Neon Postgres, Vercel Blob, Framer Motion, TypeScript) is referenced below, it is referenced because it is already a real, current decision, not a new one being introduced by this document.

---

# 1. Architecture Philosophy

The architecture is: **scalable, modular, maintainable, reusable, predictable, feature-oriented.**

**Why architecture matters.** `00_PRODUCT_VISION.md` describes a platform spanning six pillars and dozens of content types, built to stay stable through active use and ongoing publishing (see `00_PRODUCT_VISION.md`, section 3). Software with a weak architecture can look identical to well-architected software on day one — the difference only becomes visible once real content, real editors, and real maintenance start accumulating. Architecture is the discipline that determines whether the site can absorb that without a rewrite, avoiding unnecessary restructuring while staying scoped to confirmed requirements rather than hypothetical ones. Every principle in this document exists to keep that door open.

---

# 2. Project Structure

The folder structure separates concerns by **responsibility**, not by convenience. The following responsibilities must remain clearly separated, regardless of the exact folder names or nesting used to express them:

- **Application** — routing, layout composition, and the entry points that assemble everything else into pages (in the current stack, this is the Next.js App Router's routing layer).
- **Components** — the reusable UI library defined in `05_COMPONENT_LIBRARY.md` — presentational, not aware of business logic.
- **Features** — self-contained units of product functionality (see section 3) — the primary organizing unit above the component level.
- **Content** — the schema and structural definitions of the content types in `01_INFORMATION_ARCHITECTURE.md`, distinct from the components that render them.
- **Utilities** — small, pure, dependency-free helper logic with no awareness of any specific feature.
- **Services** — integration points with external systems (database access, storage, third-party APIs) — the boundary between this codebase and everything outside it.
- **Hooks** — reusable stateful logic, shared across components/features where genuinely reusable, not a dumping ground for one-off logic.
- **Types** — shared type definitions that more than one part of the codebase depends on.
- **Assets** — static, non-code resources.
- **Documentation** — this `/docs` folder itself, plus any inline documentation the codebase requires per section 18.

This document does not define an exact folder tree. The tree may evolve; the separation of responsibility above may not, without a deliberate, documented decision.

---

# 3. Feature-Based Architecture

Product functionality is organized around **features**, not around technical layers. A feature (e.g., "Worldbuilding," "Portfolio," "Devlog") owns everything specific to it:

- Components specific to that feature (not shared ones — those belong in the Shared Layer, section 4).
- Types specific to that feature's data shape.
- Utilities specific to that feature's logic.
- Hooks specific to that feature's stateful behavior.
- Services specific to that feature's data access.
- Constants specific to that feature.
- Tests specific to that feature.
- Documentation specific to that feature.

**Why features own their logic.** A feature-oriented structure means a future task — "add a new content type," "extend Worldbuilding" — touches one clearly bounded area of the codebase instead of scattering changes across globally-organized folders (`all-components/`, `all-hooks/`, `all-types/`). This directly supports the scalability goals in `01_INFORMATION_ARCHITECTURE.md`, section 1.

**Feature isolation.** A feature must not reach into another feature's internals. If two features need the same logic, that logic is promoted to the Shared Layer (section 4) — it is never copy-pasted between features, and a feature is never allowed to import another feature's private internals directly.

---

# 4. Shared Layer

The Shared Layer holds resources genuinely needed by more than one feature:

- Reusable UI (the component library defined in `05_COMPONENT_LIBRARY.md`).
- Utilities with no feature-specific knowledge.
- Types shared across multiple features' data shapes.
- Hooks with genuinely feature-agnostic behavior.
- Constants used across the codebase (design tokens, route names, shared configuration).
- Icons (per `03_BRAND_IDENTITY.md`, section 10 and `05_COMPONENT_LIBRARY.md`, section 4).
- Providers (cross-cutting context — theming, global settings) that legitimately span the whole application.

**Nothing feature-specific belongs here.** The Shared Layer is a promotion destination, not a default location — code starts inside the feature that needs it (section 3) and only moves to Shared once a second, genuine consumer exists. Placing something in Shared prematurely, "just in case," is treated as a violation of this principle (see section 19, Anti-Patterns, Over-engineering).

---

# 5. Routing Philosophy

- **Predictable URLs** — routing must reflect the URL structure already defined in `01_INFORMATION_ARCHITECTURE.md`, section 13; routing is not designed independently of that document.
- **Scalable hierarchy** — the routing approach must accommodate new content types without restructuring existing routes. Routes support KRUPNI as the only active Worldbuilding universe (`01_INFORMATION_ARCHITECTURE.md`, section 18) — there is no universe switching and no generic universe route abstraction. A second universe would require its own explicit product and architecture decision, not routing built in advance for it.
- **SEO-friendly** — every publicly visible route must be a real, crawlable, directly linkable URL (supporting section 13, SEO Strategy).
- **Readable** — a URL should be understandable on sight, consistent with `01_INFORMATION_ARCHITECTURE.md`, section 13's naming conventions.
- **Avoid deeply nested routes unless meaningful** — nesting exists to reflect genuine containment (a Character inside a World), never nesting for its own sake — consistent with `01_INFORMATION_ARCHITECTURE.md`, section 16 (Deep navigation trees).

The current stack's file-based routing (Next.js App Router) is the existing mechanism this philosophy is expressed through; this document does not introduce a new routing approach, only governs how the existing one is used.

---

# 6. Data Management

Different kinds of data have different responsibilities and must not be handled identically:

- **Static Content** — content with no meaningful runtime change (structural copy, fixed reference data). Rendered as directly and simply as possible; not routed through unnecessary data-fetching machinery.
- **Dynamic Content** — the content types defined in `01_INFORMATION_ARCHITECTURE.md`, stored and queried from the project's database layer (Drizzle ORM over Neon Postgres, already in use). Fetched server-side wherever the rendering model allows it, minimizing what must round-trip to the client.
- **API Data** — data crossing a genuine service boundary (see section 9); treated as untrusted and validated on receipt, never assumed to match the shape the caller expects.
- **Cached Data** — data whose freshness requirements are looser than "always current"; caching strategy is chosen deliberately per data type, not applied or skipped by default.
- **Local State** — state relevant to a single component instance only (see section 7).
- **Global State** — state genuinely needed across unrelated parts of the application; kept as small as possible (section 7).
- **Server State** — data owned by the server/database, treated as the source of truth; the client holds a view of it, never a competing copy of record.

This section describes responsibilities, not a specific data-fetching library beyond what already exists in the stack — no new state/data library is introduced by this document.

---

# 7. State Management

State is scoped to the smallest level that can correctly own it:

- **Local** — state used by exactly one component; the default starting point for all state.
- **Shared** — state used by a small, related group of components (e.g., a feature's own internal state); lifted only as far as the nearest common owner, never further.
- **Global** — state genuinely needed application-wide (authenticated admin session, active theme). Reserved for cases with no reasonable narrower owner.
- **Persistent** — state that must survive a reload or session (stored server-side as Server State wherever possible, per section 6, rather than duplicated into client-side persistence by default).
- **Temporary** — state that is expected and safe to lose (an open/closed UI state, an in-progress form draft not yet submitted).

**Avoid unnecessary global state.** Every promotion of state to a broader scope must be justified the same way promotion to the Shared Layer is justified (section 4) — by a genuine, current need, not by convenience or anticipation of a future one.

---

# 8. Content Architecture

Every content type defined in `01_INFORMATION_ARCHITECTURE.md`, section 3 and elaborated in `02_CONTENT_ARCHITECTURE.md` — Projects, Stories, Characters, Companies, Locations/Maps, Articles, Development Logs, Games, Portfolio Pieces, and the rest — must have clear technical ownership:

- A defined schema (already expressed in the project's Drizzle schema layer for existing types), matching the fields and relationships described in `01_INFORMATION_ARCHITECTURE.md`, section 3.
- A defined feature (section 3) responsible for that content type's components, logic, and routes.
- A defined data-access boundary (section 6/9) — one clear path by which that content type is read and written, not several competing ones.

No content type should have its data shape, access logic, or presentation logic split ambiguously across multiple features with no clear owner. Where a content type spans multiple pillars conceptually (e.g., a Portfolio Piece that also belongs to a World), technical ownership still resolves to one primary feature, with relationships to others expressed through the Shared Layer or explicit cross-feature references — never through duplicated logic.

**Conceptual types are not a migration checklist.** A content type being named in `01_INFORMATION_ARCHITECTURE.md`, section 3 does not imply it needs its own database table immediately, or that the site's existing per-content-type tables (`portfolioItems`, `sketches`, `models3d`, `worldbuildingEntries`, `games`, and similar) need to be replaced by a single universal content table — that structure is acceptable and should not be migrated away from speculatively. Schema changes are driven by a confirmed, real feature, not by a desire to match the IA document's conceptual model exactly. Sprint 1 in particular does not include a large schema migration.

**KRUPNI-only scope.** The schema and its relationships are built around KRUPNI as the only currently active Worldbuilding universe. Do not introduce a universe/World abstraction table, a universe foreign key on every content type, or any other generalization whose only purpose is to support a hypothetical second universe — per `01_INFORMATION_ARCHITECTURE.md`, section 18, that would require its own future, explicitly approved architectural decision, not groundwork laid now.

**Independent Stories and Writing.** A future Story/Writing schema must support content with no fictional-world relationship at all — a KRUPNI-specific foreign key must be nullable and optional, never required for a row to exist. KRUPNI-specific content (Characters, Locations, Factions, Timeline Events) may carry its own relationships to a Story without those same fields being forced onto a Standalone Fiction, Scenario Experiment, or Personal Writing row that has nothing to do with KRUPNI.

---

# 9. API Philosophy

- **Separation of concerns** — the boundary that reads/writes data is kept distinct from the UI that displays it; a component never reaches around this boundary directly into storage.
- **Versioning readiness** — API surfaces are structured so a future breaking change can be introduced without silently breaking existing callers, even before a formal versioning scheme is needed.
- **Error handling** — every API surface returns a predictable, well-formed error rather than an unhandled failure (see section 14).
- **Validation** — all input is validated at the boundary before it reaches business logic or storage, regardless of whether the caller is public or internal (the site's own admin interface).
- **Consistent responses** — the same kind of operation (a create, an update, a delete) returns a consistent shape across every content type, so calling code does not need type-specific handling for structurally identical operations.
- **Never expose unnecessary data** — a response contains only what the caller needs, never a raw dump of an internal data shape "because it was convenient."

This governs both the site's public-facing data needs and its existing internal admin API surface (server actions and route handlers, in the current stack) — the same discipline applies regardless of which one is being extended.

---

# 10. Admin Architecture

Principles for the content-management system that already exists and will keep growing:

- **Content management** — every content type in `01_INFORMATION_ARCHITECTURE.md` must be manageable through a consistent create/edit/delete pattern, matching the pattern already established for existing content types rather than reinventing it per type.
- **Media management** — uploads and media references follow the Media Standards in `02_CONTENT_ARCHITECTURE.md`, section 5, through the project's existing storage integration (Vercel Blob) rather than a parallel mechanism.
- **Drafts** — authoring supports the pre-publication states defined in `02_CONTENT_ARCHITECTURE.md`, section 7 (Idea, Draft, Review) without those states being publicly reachable.
- **Publishing** — the transition from Draft/Review to Published (and to Featured/Archived) is a deliberate, explicit action, never an accidental side effect of saving.
- **Permissions** — the admin surface is authenticated and owner-only, distinct from public access (the project's existing session-based admin authentication). This is the only authentication the site requires — public registration, public login, and public account permission systems are out of scope (see `AI_RULES.md`, Product Scope Rules); complex role-and-permission systems are not planned.
- **Future extensibility** — a new content type should be addable to the admin system by following the same established pattern (schema → data-access → admin form/list), not by inventing a new admin architecture per content type.

The existing Admin Panel and CRUD system already work and must be preserved; this section governs how it is refined and extended, not rebuilt from scratch. This document does not design the admin UI — that belongs to `05_COMPONENT_LIBRARY.md` and future implementation work. It defines only the structural expectations the admin system must satisfy.

---

# 11. Interactive World Map Architecture

The interactive world map is a core product feature, not an optional visual enhancement — it is the primary discovery interface for the Worldbuilding pillar defined in `00_PRODUCT_VISION.md` and `01_INFORMATION_ARCHITECTURE.md`. This section defines its architecture at the same principle level as the rest of this document: no map library is chosen, no implementation code is written, no exact coordinate format or Admin Panel UI is designed. It governs custom illustrated fictional maps created by the author — the system must not depend on real-world geography or geographic coordinate systems.

## 1. Core Experience

The map must support panning, zooming (mouse-wheel and pinch-to-zoom on supported devices), click-and-drag navigation, touch dragging, smooth but restrained camera movement, a reset-to-world-view control, and optional focus-on-location behavior.

The experience goal is qualitative, not just functional: a visitor must feel they are exploring a fictional world, not viewing a static image with buttons on it. This is a direct extension of the immersive, atmospheric identity in `03_BRAND_IDENTITY.md` and the motion philosophy in `06_MOTION_SYSTEM.md` — camera movement must be smooth and restrained, never flashy, never fighting the visitor's own input (echoing `06_MOTION_SYSTEM.md`, section 7, "never hijack scrolling," which applies equally to hijacking pan/zoom).

No specific map library is selected at this stage — this section defines the behavior the eventual implementation must satisfy, not the tool that satisfies it.

## 2. Semantic Zoom and Level of Detail

The map displays different information at different zoom levels — this is semantic zoom, not merely visual scaling. An example hierarchy:

- **World level** — continents and globally important locations.
- **Continent level** — cities, regions, and major facilities.
- **Regional level** — districts, landmarks, corporate facilities, and important environments.
- **Local level** — buildings, structures, and highly specific points of interest, where applicable.

At distant zoom levels, only a small number of high-priority markers are visible. As a visitor zooms closer, higher-level markers fade out where appropriate and more detailed markers fade in — the system must never show every marker simultaneously (this is the map's specific expression of the decluttering principle in section 5 below, and of `04_DESIGN_SYSTEM.md`, section 2, Focus). Transitions between marker levels must feel continuous and understandable, following `06_MOTION_SYSTEM.md`'s Section Reveal category (section 4) — a fade, not a jarring swap.

**Marker visibility thresholds must be data-driven, not hardcoded inside UI components.** A marker's minimum/maximum visible zoom level (section 4) is data owned by the marker record, read by the rendering layer — never a rule embedded in a component's logic. This keeps the marker hierarchy editable (eventually through the Admin Map Manager, section 10) without a code change.

## 3. Coordinate System

Map markers use normalized, resolution-independent coordinates — conceptually, an X and Y value expressed relative to the map's own bounds, not to any specific screen's pixel grid. No exact numeric format is defined at this stage; the requirement is the model, not the encoding.

This ensures:

- Marker positions remain accurate across different screen sizes and across desktop, tablet, and mobile layouts, all reading from the same underlying coordinates (directly supporting section 14, Responsive Behaviour).
- Marker positions remain accurate when the map image itself is resized or replaced with a higher-resolution asset later, without manually rebuilding every marker.
- KRUPNI may contain one or more independent maps (see section 15), each with its own coordinate space — a marker's coordinates are only meaningful relative to the specific map they belong to.

This principle is what keeps the Data Ownership separation in section 11 possible: coordinate data is presentation data belonging to the marker, entirely independent of the content entity the marker may reference.

## 4. Marker Data Model

A marker entity is responsible for storing, at minimum:

- Unique identifier, title, slug, short description.
- Marker type.
- Map identifier (which specific KRUPNI map it belongs to — see section 15).
- Normalized position (section 3).
- Minimum and maximum visible zoom level (section 2).
- Priority (section 5).
- Visibility status and publication status (aligned with the content status model in `02_CONTENT_ARCHITECTURE.md`, section 7).
- Optional preview image.
- Optional icon or category.
- Optional parent location (section 5).
- Optional related content.

Where meaningful, related content may include: Continent, Region, City, Location, Corporation, Faction, Character, Story, Technology, Timeline Event, Project, or Gallery/Media — the same content types defined in `01_INFORMATION_ARCHITECTURE.md`, section 3.

**Relationships must remain optional.** A marker is never forced to connect to every content type, or to any content type at all — this follows the same relationship philosophy already established in `01_INFORMATION_ARCHITECTURE.md`, section 4 ("relationships between content must always be intentional... never force connections between unrelated content") and section 17 (Content Independence). A marker with no related content yet is a valid, permanent state, not an incomplete one.

## 5. Marker Hierarchy and Decluttering

The map prioritizes clarity over the number of visible markers, consistent with `04_DESIGN_SYSTEM.md`, section 1 (simplicity over decoration) and section 2 (focus). Principles:

- **Zoom-level visibility** — governed by each marker's minimum/maximum visible zoom level (section 2).
- **Marker priority** — a marker's priority field (section 4) determines which markers survive when space or attention is limited at a given zoom level.
- **Parent-child location relationships** — a marker may have a parent location (e.g., a city marker inside a continent), and this hierarchy informs both visibility (a child can be hidden until its parent context is zoomed into) and navigation (section 6).
- **Marker grouping and optional clustering** — nearby markers at a given zoom level may be represented as a single group/cluster rather than individually, only where it improves clarity.
- **Collision avoidance** — markers and their labels must not be allowed to render on top of one another illegibly.
- **Label visibility** — labels follow the same priority-driven visibility as the markers themselves; not every visible marker requires a permanently visible label.
- **Hiding low-priority markers when space is limited**, and avoiding overlapping labels and interaction targets, are treated as required behavior, not a visual nicety.

## 6. Marker Interaction

Selecting a marker opens a lightweight preview — never a complete content page rendered inside the map. The preview may contain a title, type, short description, preview image, relevant metadata, and a clear action to open the full content page (the actual Location, Character, or other content-type page defined in `01_INFORMATION_ARCHITECTURE.md`).

The architecture must support:

- Pointer, keyboard, and touch selection (see section 13, Accessibility).
- Closing the preview.
- Moving between nearby or related markers where useful (leveraging the parent-child and related-content relationships in sections 4–5).
- Deep links to a selected marker or map location, and restoring a shared map state from a URL where technically appropriate — consistent with the routing philosophy in section 5 (Routing Philosophy) and the SEO strategy in section 13 (SEO Strategy).

## 7. Map Layers and Filters

The architecture supports optional layers without requiring them in the first implementation. Possible future layers include continents, cities, corporate territories, energy production and distribution, transportation routes, space infrastructure, natural environments, political or corporate influence, and timeline-specific historical states (the last of which connects directly to the World Timeline defined in `01_INFORMATION_ARCHITECTURE.md`, section 11).

Possible filters include marker type, continent, corporation, location category, era or timeline period, and publication/discovery status where applicable.

**Layers and filters must not duplicate the main content taxonomy unnecessarily** — they are presentation-level lenses over the same underlying marker and content data (sections 4, 11), not a second, parallel classification system competing with the Tags and Categories already defined in `01_INFORMATION_ARCHITECTURE.md`, sections 8–9.

## 8. Home Page Map Preview

The Home Page uses a smaller, more controlled version of the map experience — introducing the fictional world, showing only a limited selection of important (highest-priority) markers, and avoiding loading the full-resolution map system unnecessarily (see section 12, Map Performance Strategy).

It must include a clear "Explore the World" action directing visitors to the full Worldbuilding Map Explorer (section 9), and must preserve the same visual and data language as the full map — the same marker model, the same coordinate system, the same visual identity (`03_BRAND_IDENTITY.md`, `04_DESIGN_SYSTEM.md`).

The Home Page preview and the full Map Explorer share data models and reusable logic (per the Shared Layer principle in section 4, Shared Layer), but they are not treated as identical interfaces — the preview is a deliberately reduced, purpose-built entry point, not a resized copy of the full experience.

## 9. Full Worldbuilding Map Explorer

The Worldbuilding section contains the complete map exploration experience: full pan and zoom, semantic zoom (section 2), marker previews (section 6), filters and layers once implemented (section 7), contextual related content, clear navigation back to the Worldbuilding hub, links to full location and lore pages, and eventual support for multiple maps within KRUPNI (section 15).

The map must enhance world discovery, but no important content or navigation path may be accessible only through the map — elaborated further in section 13 (Accessibility and Alternative Navigation) below.

## 10. Admin Map Manager

A working Map Editor already exists; this section defines its refinement and expansion, not a from-zero design. Any further UI work follows the principles in `05_COMPONENT_LIBRARY.md` and section 10 (Admin Architecture) above — the existing editor is extended, not rebuilt.

The owner must continue to manage markers without editing source code. Existing Map Editor / Map Manager responsibilities and planned refinements include:

- Selecting which KRUPNI map to edit, and opening it in an editor.
- Placing a marker by clicking/tapping on the map, and repositioning markers.
- Editing normalized coordinates (section 3) directly where precision is needed.
- Selecting marker type, setting minimum/maximum zoom visibility (section 2) and priority (section 5).
- Adding title, description, and preview media (following `02_CONTENT_ARCHITECTURE.md`'s Media Standards).
- Linking optional related content (section 4).
- Saving drafts and previewing unpublished changes, and publishing/unpublishing/archiving markers — following the same content-status model as every other content type (`02_CONTENT_ARCHITECTURE.md`, section 7; section 10 above, Admin Architecture).
- Filtering and searching existing markers.
- Detecting potentially overlapping markers, and preventing invalid or out-of-bounds marker positions.

This module is a natural extension of the Admin Architecture defined in section 10 above — it follows the same schema → data-access → admin form/list pattern already established for every other content type, rather than inventing a separate admin paradigm specific to the map.

A working map data model and admin marker editor already exist. This section describes the direction they extend toward (priority, zoom-level visibility, richer optional relationships) — it is not a mandate to rebuild them from zero. Existing map data and the existing editor should be extended in place.

## 11. Data Ownership and Content Integration

A clear separation is maintained between: map configuration, map assets, marker data, location/lore content, UI state, user interaction state, and admin editing state.

- **UI state and user interaction state** (current zoom level, open preview, active filters) are Local/Temporary state per section 7 (State Management) above — they are not persisted as part of the content model.
- **Admin editing state** (an in-progress, unsaved marker edit) follows the same Draft principles as any other content type (`02_CONTENT_ARCHITECTURE.md`, section 7).
- **Map configuration and map assets** (the illustrated map image, its bounds, its parent/target map relationships) are distinct from marker data — a map can exist and be configured before any markers are placed on it.

**The map references existing content entities rather than duplicating their full content.** A marker referencing a Location stores only map-specific presentation and coordinate data (section 3, 4); the Location entity remains the sole source of truth for the full description, imagery, and lore, per `01_INFORMATION_ARCHITECTURE.md`, section 16's prohibition on duplicate content. Duplicated lore and duplicated metadata between a marker and the content it references must never occur.

## 12. Map Performance Strategy

The map must account for large illustrated map assets and potentially hundreds or thousands of markers, extending the general Performance Strategy in section 12 above with map-specific principles:

- Progressive and responsive loading of map imagery, with image tiling or segmented loading considered if scale eventually requires it.
- Lazy loading of detailed marker data, loading only the marker levels relevant to the current viewport and zoom (section 2) rather than the entire marker set at once.
- Avoiding unnecessary rerenders during pan and zoom, and keeping marker-visibility calculations efficient at interaction speed.
- Deliberate attention to mobile and low-end device performance, including disabling or reducing decorative effects when needed (consistent with `06_MOTION_SYSTEM.md`, section 12).
- Caching map configuration and published marker data appropriately (section 6, Data Management).

The first implementation should remain appropriately scoped to real, current needs (echoing section 19's prohibition on premature optimization) — but the architecture above must not block these optimizations from being added later without restructuring.

## 13. Accessibility and Alternative Navigation

**The map must not be the only way to access worldbuilding content.** This is the map's specific expression of `01_INFORMATION_ARCHITECTURE.md`'s prohibition on orphaned or map-locked content, and of the general Accessibility expectations already defined in `04_DESIGN_SYSTEM.md`, section 10, and `05_COMPONENT_LIBRARY.md`, section 11.

Required support includes:

- Keyboard-operable map controls, with visible focus states.
- Accessible labels for controls and markers, and screen-reader-compatible marker summaries where reasonable.
- Respect for reduced-motion preferences (`06_MOTION_SYSTEM.md`, section 11) in all camera movement and marker transitions.
- Sufficiently large touch targets for marker selection.
- A non-map list or directory view of locations, and search/filtering available outside the visual map entirely.
- Direct links to every important location page, reachable without ever opening the map.

No important lore or navigation path may exist exclusively inside the interactive map.

## 14. Responsive Behaviour

The map adapts across large desktop screens, laptops, tablets, and mobile devices, following the desktop-first, structurally-adaptive approach defined in `04_DESIGN_SYSTEM.md`, section 9. The mobile experience is not merely a shrunken desktop map; it is deliberately adapted:

- Simplified controls and reduced marker density appropriate to a smaller viewport and closer viewing context.
- Touch-first interaction patterns as the primary input model, not a secondary accommodation.
- Bottom sheets or compact previews in place of desktop-style side panels for marker selection (section 6).
- Clear exit and reset controls at every size.
- Preserving the visitor's map context (position, zoom, active filters) across interactions and, where appropriate, across navigation, rather than resetting unexpectedly.

## 15. Multi-Map Scalability

The map system is built for KRUPNI, the site's single active fictional universe (`01_INFORMATION_ARCHITECTURE.md`, section 18, Universe Architecture) — it does not need a universe-abstraction layer for universes that do not yet exist. Within KRUPNI, it supports multiple maps: world maps, continent maps, city maps, and interior/facility maps where appropriate, each with independent marker sets and map configurations (section 3, 11).

**Adding a new map within KRUPNI must not require rebuilding the map engine** — a new map is a new instance of the same underlying map/marker model, not a new architecture. A second universe is explicitly out of current scope (see section 8 above); if one is ever approved, it is evaluated as its own future architectural decision at that time, not designed for now.

## 16. Map-Specific Anti-Patterns

In addition to the general anti-patterns in section 19 above, the following must never happen:

- Hardcoded marker positions inside components, or pixel-only marker coordinates (violates section 3).
- Loading every marker at every zoom level, or displaying all labels simultaneously (violates sections 2 and 5).
- Forced links between unrelated content (violates section 4 and `01_INFORMATION_ARCHITECTURE.md`, section 4).
- Map-only access to important content (violates section 13).
- Heavy motion that interferes with navigation, or scroll/pan hijacking (violates `06_MOTION_SYSTEM.md`, section 7).
- Desktop-only controls (violates section 14).
- Duplicate lore stored inside marker records (violates section 11).
- Choosing a map library before the architectural requirements defined in this section are understood.
- Treating the map as a decorative background instead of an exploration system (violates the opening premise of this section).

## 17. Permanent Map Principles

- The map is a discovery interface, not a decoration.
- Semantic zoom controls information density.
- Detail appears progressively.
- Marker relationships are optional and intentional.
- Coordinates remain resolution-independent.
- Content entities remain the source of truth.
- The map never replaces accessible navigation.
- Performance and clarity take priority over marker quantity.
- Home Page preview and full Map Explorer share a system but serve different purposes.
- New maps within KRUPNI must be addable without rebuilding the engine; a second universe is a future decision, not current scope.

---

# 12. Performance Strategy

Performance is designed in from the start, not addressed after the fact:

- **Code splitting** — code is loaded in proportion to what a given page actually needs, not bundled monolithically.
- **Lazy loading** — content and components not needed immediately (below-the-fold media, rarely-used interactive components) load on demand.
- **Image optimization** — every image respects the Media Standards in `02_CONTENT_ARCHITECTURE.md`, section 5, and is served at a size and format appropriate to where it's displayed.
- **Caching** — applied deliberately per data type (section 6), balancing freshness needs against load cost.
- **Bundle awareness** — every new dependency is evaluated for its cost to the overall bundle before being added, consistent with `AI_RULES.md` ("avoid unnecessary dependencies").
- **Progressive loading** — a page should become usable and readable as early as possible, even while secondary content is still arriving.

Performance is a design constraint on every feature, not a separate optimization pass scheduled for later — consistent with `06_MOTION_SYSTEM.md`, section 12, and `04_DESIGN_SYSTEM.md`.

---

# 13. SEO Strategy

- **Metadata ownership** — every content type owns its own title, description, and social-sharing metadata as part of its schema (section 8), not as an afterthought bolted onto the page template.
- **Structured data readiness** — the content schema is shaped so structured data (rich snippets, schema.org-style markup) can be derived from it later without a data-model change.
- **Readable URLs** — enforced by the routing philosophy in section 5 and `01_INFORMATION_ARCHITECTURE.md`, section 13.
- **Open Graph readiness** — every shareable page (Portfolio Piece, Story, Game, Project) must be able to produce correct social preview metadata from its own content.
- **Sitemap support** — the routing and content structure must make it straightforward to generate a complete, accurate sitemap programmatically from the content itself, not maintained by hand.
- **Accessibility support** — SEO and accessibility reinforce each other (semantic structure, meaningful text, proper headings); this section does not duplicate `04_DESIGN_SYSTEM.md`, section 10, or `05_COMPONENT_LIBRARY.md`, section 11 — it depends on them.

---

# 14. Error Handling

- **Graceful failures** — a failure in one part of the page (a slow or broken data source) must not take down an entire page a visitor is otherwise able to use.
- **Meaningful messages** — an error a visitor sees must explain, in plain language, what happened and — where possible — what they can do next; never a raw technical error surfaced directly.
- **Logging** — failures are recorded in a way that lets an unhealthy pattern be noticed and diagnosed, without exposing sensitive detail to the visitor.
- **Recovery** — where reasonable, a failed operation offers a way to retry rather than a dead end.
- **Fallback UI** — every place content can fail to load has a designed fallback state, consistent with the Error/Empty states defined in `05_COMPONENT_LIBRARY.md`, section 8.
- **Never leave users stuck** — every error state includes a way forward (retry, go back, go home) — a visitor is never left at a blank screen with no next action.

---

# 15. Security Principles

At a high level only — this section does not design specific mechanisms:

- **Validation** — every input, from a visitor-facing form to an internal admin form, is validated before it is trusted (echoing section 9).
- **Public authentication is not required.** The existing owner-only admin authentication is the only authentication this site needs. Public registration, public login, and social login are out of scope (see `AI_RULES.md`, Product Scope Rules) and are not something this architecture needs to stay "ready" for.
- **Authorization** — access to any action is checked against what the acting party is actually permitted to do, not inferred from what the UI happens to show them.
- **Input sanitization** — any content rendered back to visitors (including admin-authored content) is sanitized against injection before it is stored or displayed, regardless of whether public-facing user-generated content is ever introduced.
- **Secrets management** — credentials and keys are never present in client-reachable code or committed to the codebase; they are held in environment-level configuration, as the project already does.
- **Rate limiting readiness** — public-facing write operations (existing forms such as Contact) are designed so rate limiting can be added without restructuring the endpoint, independent of whether any future public-account feature is ever built.
- **Least privilege** — every part of the system (a service credential, an admin permission, a public API surface) is granted only the access it actually needs, never broad access "to be safe for later."
- **Email subscription infrastructure is not currently required.** If Optional Future Email Updates (see `08_ROADMAP.md`) is ever approved, it should rely on a managed email provider rather than custom delivery infrastructure — but no subscriber table, provider integration, or campaign system is built now.

---

# 16. Testing Philosophy

- **Unit** — verifies isolated logic (utilities, pure functions) behaves correctly on its own.
- **Integration** — verifies that features and their data-access boundaries (section 9) work correctly together.
- **End-to-end** — verifies that a real visitor-facing flow (browsing a World, publishing a piece of content) works as a whole.
- **Visual regression readiness** — the architecture should not preclude adding visual regression tooling later, particularly given the weight `04_DESIGN_SYSTEM.md` places on consistency.
- **Accessibility testing** — verifies the expectations in `05_COMPONENT_LIBRARY.md`, section 11, are actually met, not just designed for.
- **Manual QA** — deliberate human review remains part of the process, especially for the qualitative standards in `03_BRAND_IDENTITY.md` and `04_DESIGN_SYSTEM.md` that automated testing cannot fully evaluate (voice, atmosphere, visual judgment).

**Focus on confidence, not coverage percentages.** Testing exists to make future changes safe to make, not to satisfy a numeric target. A well-chosen handful of tests around genuinely fragile or critical logic is worth more than exhaustive coverage of trivial code.

---

# 17. Scalability

The architecture must support the following without requiring a major rewrite:

- **Adding new pages** — a natural consequence of the routing (section 5) and feature (section 3) structure, not a special case.
- **Adding new content types** — following the same schema → feature → admin pattern described in sections 8 and 10.
- **Adding new features** — a new self-contained feature folder (section 3), consuming the Shared Layer (section 4) rather than duplicating it.
- **Adding new languages** — content and metadata are shaped so a translation/localization layer can be introduced without changing the underlying content schema (echoing `02_CONTENT_ARCHITECTURE.md`, section 11).
- **Adding new admin modules** — following the established admin pattern (section 10) rather than a bespoke one per module.

**Nothing should require major rewrites.** If a specific, concrete future need (from `01_INFORMATION_ARCHITECTURE.md`, section 17, or elsewhere) cannot be satisfied by extending the existing structure, that is a signal to revisit this document explicitly — the same standard `01_INFORMATION_ARCHITECTURE.md` holds itself to.

---

# 18. Documentation

- Architecture documentation is updated whenever a new system is introduced — a new feature category, a new data-access pattern, a new cross-cutting concern.
- Architecture documentation is updated whenever an existing system changes in a way that contradicts what is currently written here.
- **Never allow documentation to drift away from implementation.** Documentation that no longer reflects reality is worse than no documentation — it actively misleads. Per `AI_RULES.md`, any implementation task that introduces a structural change must update the corresponding documentation as part of that same task, not as a follow-up that may never happen.

---

# 19. Anti-Patterns

The following must never happen:

- **God components** — a single component or module doing far more than one coherent responsibility.
- **Huge utility files** — an ever-growing catch-all file instead of properly scoped, discoverable utilities (section 2).
- **Business logic inside UI** — presentation components (per `05_COMPONENT_LIBRARY.md`) that contain data-access or business rules instead of receiving them from a proper boundary (section 9).
- **Duplicate features** — two features solving the same problem because an existing one wasn't reused or extended (echoing section 3 and `05_COMPONENT_LIBRARY.md`, section 9).
- **Circular dependencies** — features or modules that depend on each other in a loop, making them impossible to reason about or change independently.
- **Deep prop drilling** — data threaded manually through many layers of components that don't use it, instead of being sourced at the appropriate level (section 7).
- **Over-engineering** — building for a hypothetical future need instead of the current, real one (echoing section 4's promotion-not-prediction rule).
- **Premature optimization** — optimizing a part of the system before it is known to need it, at the cost of clarity, without evidence it is actually a bottleneck.

---

# 20. Final Principles

- Architecture over shortcuts.
- Reuse before duplication.
- Features own themselves.
- Shared stays shared.
- Performance is a feature, not an afterthought.
- Documentation evolves with the code.
- Build for tomorrow, not only today.
