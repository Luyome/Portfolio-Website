# Component Library

This document defines the reusable UI component library for the website: its architecture, hierarchy, and design principles.

It builds on `AI_RULES.md`, `00_PRODUCT_VISION.md`, `01_INFORMATION_ARCHITECTURE.md`, `02_CONTENT_ARCHITECTURE.md`, `03_BRAND_IDENTITY.md`, and `04_DESIGN_SYSTEM.md`. Where `04_DESIGN_SYSTEM.md` defines the visual principles (hierarchy, spacing, color roles, states), this document defines the *structural* system those principles are built into — the reusable pieces every page is assembled from.

This document defines **architecture and principles, not implementation.** It contains no React code, no prop signatures, no styling values. A future implementation phase translates this document into actual components — this document is what that implementation must be judged against.

---

# 1. Purpose

**The role of a component library.** A component library is the connective layer between the abstract systems defined in `04_DESIGN_SYSTEM.md` and the concrete pages a visitor actually experiences. Without it, every page would re-solve the same problems (how a card looks, how a form behaves, how a modal opens) independently, and the site would drift into the exact inconsistency `04_DESIGN_SYSTEM.md`, section 14, names as an anti-pattern.

**Why consistency and reusability matter.** This site spans six pillars (`00_PRODUCT_VISION.md`, section 4) and dozens of content types (`01_INFORMATION_ARCHITECTURE.md`, section 3), and continues to receive new content during active use. A component built once and reused everywhere is not a convenience — it is what keeps that ongoing publishing from turning every new page into a fresh design and engineering problem. A component library is what lets "add a new Character" or "add a new Devlog" be a content task, not a design task.

---

# 2. Component Philosophy

- **Reusability** — components are created when there is a real, repeated need, not built out as a complete theoretical library in advance. A page-specific component may legitimately remain page-specific when no second consumer exists; it is promoted to shared status only once reuse is confirmed, not anticipated.
- **Composability** — small components combine into larger ones predictably (see section 3, 9). A component that cannot be composed into something larger without being rebuilt has failed this principle.
- **Modularity** — a component's internal concerns stay internal; it does not reach into or assume the structure of its surroundings.
- **Accessibility** — every component is accessible by default, not accessible as an optional enhancement (see section 11).
- **Predictability** — the same component behaves the same way everywhere it is used. A visitor (and a future developer) should never be surprised by a component behaving differently in two places.
- **Scalability** — the system must accommodate new content types and new pillars (`01_INFORMATION_ARCHITECTURE.md`, section 15, Future Expansion) by composing existing components in new ways wherever possible, not by requiring the system itself to be restructured.

---

# 3. Component Hierarchy

```
Tokens
  ↓
Primitive Components
  ↓
Composite Components
  ↓
Sections
  ↓
Page Templates
```

- **Tokens** — the smallest unit: the color roles, type scale, spacing scale, radius, and elevation values defined in principle by `04_DESIGN_SYSTEM.md`. Tokens have no visual form on their own; they are the shared vocabulary every component above them draws from.
- **Primitive Components** — the smallest independently usable UI elements (see section 4): Button, Text, Icon, Input, and similar. A primitive does exactly one job and has no knowledge of the content-specific context it will be used in.
- **Composite Components** — general-purpose combinations of primitives that solve a common interface problem (see section 5): a Card, a Modal, a Form. Composites are still content-agnostic — a Card does not know whether it will show a Project or a Character.
- **Sections** — this is where content-awareness begins (see section 6): a `Hero`, a `Related Content Panel`, a `Gallery Grid`. Sections combine composites and primitives into a purpose-built piece of interface tied to specific content types from `01_INFORMATION_ARCHITECTURE.md`.
- **Page Templates** — the top of the hierarchy: full page layouts assembled from Sections, mapped to the content types and pillars defined in `01_INFORMATION_ARCHITECTURE.md`. A Page Template defines arrangement and rhythm; it does not introduce new visual patterns of its own.

This hierarchy is a composition guide, not a mandatory implementation chain. It exists to keep the system consistent, so layers are skipped only when a simpler implementation is clearly better and does not create duplication or inconsistency — reaching past a level should be the exception, made deliberately, not a routine shortcut. A Section does not require a new Composite component when no reusable interface pattern actually exists yet; new Primitives or Composites are introduced only for a confirmed, repeated need (see section 9), not to complete the hierarchy for its own sake.

---

# 4. Primitive Components

Primitives are defined by **responsibility**, not appearance — appearance is governed entirely by `04_DESIGN_SYSTEM.md`.

- **Button** — responsible for triggering a single, clear action. Communicates its importance (primary/secondary/tertiary) through the design system's hierarchy, not through ad hoc styling.
- **Icon** — responsible for reinforcing meaning or supporting navigation (per `03_BRAND_IDENTITY.md`, section 10); never used as pure decoration.
- **Text** — responsible for rendering body-level content consistently with the type system (`04_DESIGN_SYSTEM.md`, section 4).
- **Heading** — responsible for establishing document structure and hierarchy; always maps to a real semantic heading level (see section 11).
- **Divider** — responsible for separating content where spacing alone is insufficient to communicate a boundary.
- **Badge** — responsible for a small, glanceable status or classification signal (e.g., a content Status from `02_CONTENT_ARCHITECTURE.md`, section 7).
- **Avatar** — responsible for representing a person or identity compactly. Scope is limited to the website owner's identity, author presentation, Admin contexts, and collaborator attribution where relevant — not a public reader/member identity system.
- **Input** — responsible for accepting a single line of user-entered text, with clear labeling and validation state.
- **Textarea** — responsible for accepting multi-line user-entered text, same labeling/validation responsibilities as Input.
- **Checkbox** — responsible for a binary, independent choice.
- **Radio** — responsible for a single choice among a mutually exclusive set.
- **Switch** — responsible for a binary setting that takes effect immediately, distinct from Checkbox's "part of a form to be submitted" connotation.
- **Tooltip** — responsible for supplementary, non-essential information revealed on demand; never used to hide information a visitor actually needs to complete a task.
- **Spinner** — responsible for indicating indeterminate loading (see section 8).
- **Skeleton** — responsible for indicating determinate/structural loading — previewing the shape of content about to appear.
- **Tag** — responsible for representing a single Tag or Category from `01_INFORMATION_ARCHITECTURE.md`, sections 8–9, consistently wherever tags appear across the site.
- **Link** — responsible for navigation to another destination, visually distinct from Button's "trigger an action" responsibility.

---

# 5. Composite Components

Composite components solve a general interface problem by combining primitives; they remain content-agnostic.

- **Navigation Bar** — top-level wayfinding, per `01_INFORMATION_ARCHITECTURE.md`, section 5 (Top Navigation).
- **Footer** — persistent utility navigation and closing information, per `01_INFORMATION_ARCHITECTURE.md`, section 5 (Footer Navigation).
- **Search Bar** — entry point into the search systems defined in `01_INFORMATION_ARCHITECTURE.md`, section 7.
- **Breadcrumb** — reflects real hierarchical position, per `01_INFORMATION_ARCHITECTURE.md`, section 5.
- **Card** — the general-purpose content-preview container that every content-specific card in section 6 is built from.
- **Modal** — used when a task must temporarily take over focus without a full page navigation.
- **Drawer** — used for supplementary panels that slide in from an edge (e.g., a mobile navigation panel, a filter panel), where a full Modal would be too disruptive.
- **Accordion** — used to progressively disclose content the visitor may not need all of at once (e.g., FAQ-like or long structured detail).
- **Tabs** — used to let a visitor switch between parallel views of related content without navigating away.
- **Pagination** — used to divide long lists (Archive, search results — `01_INFORMATION_ARCHITECTURE.md`, section 2) into manageable pages.
- **Timeline** — the general-purpose sequential/chronological display component underlying the Timeline Architecture in `01_INFORMATION_ARCHITECTURE.md`, section 11.
- **Gallery** — the general-purpose image-set display component underlying the Gallery content type (`02_CONTENT_ARCHITECTURE.md`, section 3).
- **Carousel** — used only where a bounded, browsable set of items benefits from a focused, one-at-a-time (or few-at-a-time) presentation; never used as the sole access path to content that also needs to be indexable/linkable on its own.
- **Alert** — inline, persistent communication of a semantic state (see `04_DESIGN_SYSTEM.md`, section 5, semantic colors).
- **Toast** — transient, non-blocking notification of an event (see `04_DESIGN_SYSTEM.md`, section 12, Feedback).
- **Form** — the general-purpose composition of Input/Textarea/Checkbox/Radio/Switch primitives with validation and submission handling.
- **Command Palette** — an unscheduled idea for a fast, keyboard-driven navigation/search entry point. Not an architectural requirement, not part of Sprints 1–10, and not something the current implementation needs to prepare for — listed here only so a future, explicitly approved decision to build it would not be blocked by anything else in this document.

---

# 6. Website-Specific Components

These are Sections in the hierarchy (section 3): content-aware components tied directly to the content types defined in `01_INFORMATION_ARCHITECTURE.md`, section 3, and `02_CONTENT_ARCHITECTURE.md`, section 3.

- **Hero** — Purpose: establish identity and atmosphere at the top of a page (homepage, a World, a Game). Required content: a title/name, a short framing statement, and an atmospheric visual — per `03_BRAND_IDENTITY.md`, section 5 (first impression).
- **Project Card** — Purpose: preview a Project in a list/grid context. Required content: title, status, summary, cover media.
- **Portfolio Card** — Purpose: preview a Portfolio Piece. Required content: hero image, title, medium.
- **Story Card** — Purpose: preview a Story. Required content: title, hook/summary, associated World.
- **Game Card** — Purpose: preview a Game. Required content: title, one-line pitch, status, cover media.
- **Character Card** — Purpose: preview a Character. Required content: name, role, portrait.
- **Company Card** — Purpose: preview a Company/Corporation. Required content: name, type, summary.
- **Faction Card** — Purpose: preview a Faction. Required content: name, summary.
- **Location Card** — Purpose: preview a Location or Continent. Required content: name, type, representative image.
- **Technology Card** — Purpose: preview a Technology/Vehicle/Weapon/Creature entry. Required content: name, type, summary.
- **Timeline Event Card** — Purpose: represent a single event within a Timeline composite. Required content: date/era, title, summary.
- **Devlog Card** — Purpose: preview a Devlog entry. Required content: title, date, parent Project/Game, summary.
- **Article Card** — Purpose: preview an Article. Required content: title, summary, publish date.
- **Gallery Grid** — Purpose: the content-aware arrangement of a Gallery composite for a specific piece of parent content (a Portfolio Piece, a Project). Required content: an ordered image set with the parent content's context.
- **Media Viewer** — Purpose: full, focused presentation of a single media item (image, video, future 3D embed) — per `02_CONTENT_ARCHITECTURE.md`, section 5, Media Standards.
- **Related Content Panel** — Purpose: the concrete implementation of the Related Content navigation pattern (`01_INFORMATION_ARCHITECTURE.md`, section 5, 12) and the Related Content Strategy (`02_CONTENT_ARCHITECTURE.md`, section 9). Required content: one or more content-type-appropriate Cards, shown only when a genuine relationship exists.
- **Quote Block** — Purpose: set apart a significant piece of writing (a line from a Story, a pull-quote from an Article) for emphasis within body content.
- **Information Box** — Purpose: present supplementary, clearly-bounded factual information alongside primary content (e.g., a quick-reference fact within a World or Technology page) without interrupting the main reading flow.
- **Stat Block** — Purpose: present structured, glanceable factual data (e.g., a Game's platform/engine/status, a Technology's key specs) in a consistent tabular or list form, distinct from free-flowing body text.

---

# 7. Component Anatomy

A reusable component, particularly at the Composite and Section levels, is understood to be composed of the following possible regions — not every component uses every region, but any component that has one of these regions must treat it consistently with this anatomy:

- **Header** — the component's title/identity and, where relevant, primary metadata (e.g., a Card's title and status Badge).
- **Body** — the component's primary content (a summary, a description).
- **Media** — the component's visual content (an image, a render, a video).
- **Metadata** — supporting factual information (date, tags, category — see `02_CONTENT_ARCHITECTURE.md`, section 6).
- **Actions** — interactive elements the component exposes (a primary Button, a Link to full detail).
- **Footer** — closing/secondary information, distinct in weight from the Header.
- **Optional Elements** — anything a specific variant needs that is not part of every instance of the component (e.g., a Badge that only appears on Featured content).

This anatomy exists so that any two components at the same hierarchy level (two different content Cards, for instance) remain structurally predictable to both visitors and future developers, even though their content differs.

---

# 8. Component States

Every interactive or dynamic component must account for the relevant subset of these states, consistent with `04_DESIGN_SYSTEM.md`, section 11:

- **Default**
- **Hover**
- **Focus**
- **Active**
- **Selected**
- **Expanded**
- **Collapsed**
- **Loading**
- **Empty**
- **Disabled**
- **Error**
- **Success**

Not every component needs every state (a static Badge has no Loading state), but every state that *is* relevant to a given component must be deliberately accounted for — an unhandled state is not "not applicable," it is a gap (see section 14, Anti-Patterns).

---

# 9. Component Composition

Larger interfaces are always built by composing smaller, already-defined pieces from lower levels of the hierarchy (section 3) — never by writing new, one-off interface code that duplicates what an existing primitive or composite already does.

The practical rule: before any new piece of interface is built, the hierarchy is checked from the bottom up — can this be a Token application? A Primitive? An existing Composite? Only once every lower level has been genuinely ruled out does a new Section-level component get created, and even then, it must be built from the Primitives and Composites below it, not from raw markup.

Never duplicate UI. If a near-identical need arises in two places, the answer is to generalize the existing component (introduce a variant, a prop, an optional element per section 7) rather than to create a second, subtly different version of it (see section 14).

This library is not built out to its full theoretical extent in advance. Sections 4–6 describe the shape a component takes *when it becomes necessary* — they are not a build checklist to complete before real pages need them.

---

# 10. Responsive Behaviour

Every component must adapt according to the responsive principles defined in `04_DESIGN_SYSTEM.md`, section 9 (desktop-first, structural adaptation rather than simple scaling):

- A component's Required content (sections 4–6) must remain fully present at every viewport size — responsiveness changes arrangement and density, never removes required information.
- Composite and Section-level components are responsible for their own internal adaptation (e.g., a Card's Media/Header/Body relationship may restack on narrow viewports) without requiring the page that hosts them to intervene.
- Components that only make sense at certain viewport sizes (e.g., a Carousel that becomes a simple stacked list on mobile) must degrade to an equivalent, equally complete experience — never to a broken or partial one.

---

# 11. Accessibility

Every component must meet these expectations by default, per `04_DESIGN_SYSTEM.md`, section 10, and `AI_RULES.md`:

- **Keyboard support** — every interactive component (section 5 composites especially: Modal, Drawer, Tabs, Accordion, Form) must be fully operable via keyboard alone, including a sensible way to exit/close (e.g., a Modal closable via a standard dismiss key).
- **Screen readers** — components must expose their purpose and state (expanded/collapsed, selected, loading) to assistive technology, not only visually.
- **Focus order** — focus must move through a component's interactive elements in a logical, predictable sequence, and must be managed correctly when a component (like a Modal) opens or closes.
- **Labels** — every interactive primitive (Input, Button, Checkbox, etc.) must have a clear, programmatically associated label; an icon-only Button still requires an accessible label.
- **Semantic HTML** — components are built on top of the correct underlying semantic elements (headings, lists, buttons vs. links, form elements) so that meaning is not conveyed by appearance alone.

---

# 12. Naming Convention

- Names are specific and content-aware where the component is content-aware, and generic where it is not: `ProjectCard`, `HeroSection`, `TimelineItem`, `RelatedContentPanel`.
- A component's name should make its hierarchy level and purpose inferable without needing to open it: a `*Card` previews content, a `*Panel` groups related content, a `*Section` is a page-level building block.
- Avoid ambiguous names — a name like `Box`, `Wrapper`, or `Item` communicates nothing about purpose and is not acceptable at the Composite level or above (it may be acceptable only as an internal, non-reusable implementation detail, never as the name of a library component).
- Naming must stay consistent with the content type names already established in `01_INFORMATION_ARCHITECTURE.md`, section 3 — a component previewing a Story is named around "Story," never around a different or invented term for the same concept.

---

# 13. Component Documentation

Every future component must be documented with:

- **Purpose** — what problem it solves and at which hierarchy level (section 3) it lives.
- **Props** — what data and configuration it accepts, described conceptually (not as code signatures at this stage).
- **States** — which of the states in section 8 apply to it, and how each should behave.
- **Accessibility** — how it satisfies section 11 specifically (not just a reference back to this document).
- **Usage** — where and when it should (and should not) be used.
- **Variants** — what meaningful variations of it exist, and when each is appropriate.
- **Future considerations** — known gaps, deferred functionality, or anticipated future needs (e.g., the Command Palette placeholder in section 5).

A component without this documentation is not considered complete, regardless of whether it functions correctly.

---

# 14. Anti-Patterns

The following must never happen:

- **Duplicated components** — two components solving the same problem because an existing one wasn't reused (see section 9).
- **Large monolithic components** — a single component doing the job of several Section- or Page-Template-level responsibilities at once, resisting reuse and composition.
- **Hidden functionality** — behavior a visitor or future developer cannot discover or predict from the component's visible interface and documentation.
- **Multiple components solving the same problem** — a symptom of section 9 being skipped; the fix is consolidation, not tolerating both.
- **Inconsistent behaviour** — the same component type behaving differently in different places (violates section 2, Predictability).
- **Over-customization** — a component with so many one-off overrides per instance that it no longer guarantees consistency; if a component needs that much per-instance customization, it is a sign a new, properly named variant or component is needed instead.

---

# 15. Final Principles

- Every piece of interface must be traceable to a component defined by this system — nothing is built ad hoc for a single page.
- Reuse is checked before creation, every time, at every hierarchy level.
- A component's responsibility, states, and accessibility are part of its definition, not optional extras added later.
- Consistency across the whole site outranks convenience on any single page.
- The system must be able to absorb new content types and new pillars (`01_INFORMATION_ARCHITECTURE.md`, section 17) by composing existing components in new ways before it is allowed to grow a new one.
- If a proposed component cannot be justified against this document, it does not ship as-is.
