# Design System

This document defines the visual design system that every UI component on this website must follow.

It builds on `AI_RULES.md`, `00_PRODUCT_VISION.md`, `01_INFORMATION_ARCHITECTURE.md`, `02_CONTENT_ARCHITECTURE.md`, and `03_BRAND_IDENTITY.md`. Where `03_BRAND_IDENTITY.md` defines what the brand *feels* like, this document defines the principles that translate that feeling into a consistent, scalable visual system.

This document defines **principles, not values.** It does not choose specific colors, fonts, spacing scales, or pixel measurements — those are implementation details that belong to a future, more concrete design-tokens pass, and they may evolve without requiring this document to change. What must not change without deliberate revision is the *reasoning* below.

---

# 1. Design Philosophy

- **Simplicity over decoration** — every element must justify its presence; nothing is added because a page "felt empty."
- **Function before effects** — an effect (motion, blur, shadow) is only added once the underlying function is solid, never to compensate for a weak layout or unclear hierarchy.
- **Premium over flashy** — premium is communicated through restraint, precision, and consistency, not through spectacle.
- **Timeless over trendy** — a design choice adopted because it is currently fashionable is treated as a liability (see `03_BRAND_IDENTITY.md`, section 6).
- **Readability first** — atmosphere is never an excuse for text or interface elements that are hard to read or use.
- **Atmosphere without sacrificing usability** — the two are not in tension by default; when a real conflict arises, usability wins (see `03_BRAND_IDENTITY.md`, section 13).

---

# 2. Visual Language

- **Visual hierarchy** — every screen must have one clear primary focus; secondary and tertiary elements support it, never compete with it. Hierarchy is established through scale, contrast, and position before it is established through color.
- **Balance** — compositions should feel intentional and weighted, not accidental. Asymmetry is permitted and often preferable to centered, generic layouts, but it must still read as deliberate.
- **Rhythm** — repeating patterns (card sizes, section spacing, type scale steps) create a predictable cadence a visitor can settle into. Breaking rhythm is a tool used sparingly, to draw attention to something genuinely important — not a byproduct of inconsistency.
- **Alignment** — every element aligns to a shared underlying structure. Nothing floats arbitrarily; misalignment reads as carelessness in a premium product.
- **White space** — treated as an active design element, not leftover space. Generous space around important content increases its perceived value; cramped layouts read as cheap regardless of the content's actual quality.
- **Contrast** — used deliberately to establish hierarchy and mood (see `03_BRAND_IDENTITY.md`, section 7), not applied uniformly out of habit.
- **Depth** — the interface should feel like it has layers (see section 7), supporting the atmospheric, cinematic identity defined in `03_BRAND_IDENTITY.md`, section 6.
- **Focus** — at any given moment, the design should make it obvious where attention belongs. A page that asks for attention everywhere at once asks for it nowhere.

---

# 3. Layout System

- **Page width** — content width should be chosen for optimal readability and compositional impact, not stretched to fill every viewport just because the viewport is large. Full-bleed treatment is reserved for atmospheric/imagery-led moments (see `01_INFORMATION_ARCHITECTURE.md` hero treatments); text-dense content is constrained for comfortable reading.
- **Grid philosophy** — an underlying grid governs alignment across all pages, but the grid serves the composition, not the other way around. Breaking the grid is permitted where it serves a deliberate atmospheric or hierarchical purpose, never as a default.
- **Section spacing** — spacing between major sections must be generous enough to read as a clear separation, and consistent enough that a visitor learns to anticipate where one section ends and the next begins.
- **Content density** — density should match intent: browsing/discovery surfaces (a portfolio grid, an archive) can run denser; reading surfaces (a story, an article) must run sparser and prioritize comfortable line length and vertical breathing room.
- **Vertical rhythm** — a consistent relationship between type, spacing, and section height so that scrolling through a page feels like a steady cadence rather than a series of unrelated blocks.
- **Responsive thinking** — layout decisions are made as proportional and structural relationships (see section 9), not as a fixed desktop layout that gets awkwardly compressed for smaller viewports.

Avoid hardcoded pixel values in this document and in the reasoning behind future layout decisions — express relationships (this section is wider than that one, this gap is larger than that gap) rather than fixed numbers.

---

# 4. Typography System

Typography must express the qualities defined in `03_BRAND_IDENTITY.md`, section 8: readable, professional, elegant, technical where appropriate.

A clear hierarchy must exist and be used consistently across the whole site:

- **Display** — reserved for hero moments and the most important single statement on a page (a name, a world's title, a game's title). Used sparingly; if everything is a Display, nothing is.
- **H1–H6** — a strict, nested hierarchy. Every heading level has one clear purpose and is never chosen for its size alone — H2 always means "a section within this page," never "text I want to be big."
- **Body** — optimized purely for reading comfort: no other typographic goal should compromise body-text readability.
- **Caption** — for supporting, secondary information (image credits, metadata, timestamps) — smaller and quieter than body text by design, not by accident.
- **Labels** — for interface elements (buttons, tags, form fields) — distinct enough from body/caption that a visitor never confuses interface chrome with content.
- **Code (future)** — reserved for any technical/monospaced content that may appear in Devlogs or technical Documentation (`02_CONTENT_ARCHITECTURE.md`, section 3); must remain clearly distinct from narrative body text.

Every typographic choice must trace back to one of these roles. A one-off font size or weight invented for a single page is a violation of this system (see section 14, Anti-Patterns).

---

# 5. Color System

This document does not define exact colors. It defines the **roles** color must fill — a future palette (chosen elsewhere) is validated against these roles, not the other way around.

- **Primary role** — the dominant identity color; carries the brand's core mood (see `03_BRAND_IDENTITY.md`, section 7) and anchors the overall visual identity.
- **Secondary role** — supports the primary without competing with it; used to add depth and variety without diluting the primary's presence.
- **Accent role** — used sparingly and deliberately to draw the eye to the single most important interactive element or moment on a screen. If everything is accented, nothing is.
- **Surface hierarchy** — a defined progression of surface tones (e.g., base surface, raised surface, further-raised surface) used to communicate layering and depth (see section 7), applied consistently regardless of which page or pillar is being viewed.
- **Background hierarchy** — a defined relationship between the page background and the surfaces that sit on top of it, ensuring content always reads as clearly separated from its background.
- **Semantic colors** — reserved exclusively for their semantic meaning, never reused decoratively elsewhere in the interface:
  - **Success** — confirms a positive outcome (a form submitted, an action completed).
  - **Warning** — signals something that needs attention but is not yet an error.
  - **Error** — signals something has gone wrong and needs correction.
  - **Information** — neutral, non-urgent communication to the visitor.

Semantic colors must remain visually distinct from the primary/secondary/accent roles so a visitor never mistakes brand styling for a system message, or a system message for decoration.

---

# 6. Spacing System

Spacing must follow a single consistent scale applied everywhere — never arbitrary, never invented per-component.

Why it matters: inconsistent spacing is one of the fastest ways a digital product reads as unpolished, regardless of how good any individual element looks in isolation. A consistent spacing scale is what makes a growing collection of content, built by the same (or an assisting) hand during active use, feel like one coherent product rather than a patchwork.

- Every gap, margin, and padding value used anywhere on the site must be traceable to the same underlying scale.
- Relationships matter more than absolute values: a component's internal spacing should be visibly tighter than the spacing between that component and its neighbors, and section-level spacing should be the most generous tier of all.
- A new spacing value is never invented to solve a single, local layout problem — the existing scale is extended deliberately (and documented) if a genuine gap in the scale is found, per section 13, Consistency Rules.

---

# 7. Elevation & Depth

Depth must be communicated with subtlety, consistent with the atmospheric, cinematic identity in `03_BRAND_IDENTITY.md`.

- **Shadows** — used to imply real physical layering, not decoration; subtle enough to support the premium, minimal philosophy in section 1, never heavy or cartoonish.
- **Borders** — used where a hard edge communicates separation more honestly than a soft shadow, particularly on dark, atmospheric surfaces where shadow alone may not read clearly.
- **Layering** — content is understood to exist on a defined stack of depth levels (background → base content → raised surfaces → overlays/modals), and every component's elevation must be consistent with its actual role in that stack.
- **Surface separation** — achieved through the combination of the surface hierarchy (section 5), subtle shadow or border treatment, and spacing — never through a single heavy-handed effect doing all the work alone.

Prefer subtlety in all of the above. If a depth effect draws attention to itself rather than to the content it separates, it has failed its purpose.

---

# 8. Border Radius

- A single, consistent radius philosophy is applied across the whole site — not a different rounding value invented per component.
- Avoid excessive rounding. Heavily rounded corners read as soft, generic, and app-like (see `AI_RULES.md`, Design Principles: avoid "overly rounded components") — inconsistent with the premium, cinematic, editorial identity this brand is built on.
- Radius, where used, should be applied to reinforce hierarchy (e.g., distinguishing an interactive element from a static one) rather than as a purely stylistic flourish repeated everywhere by default.
- Consistency matters more than the specific value chosen: whatever radius philosophy is adopted, it must be applied identically to every component of the same kind, everywhere on the site.

---

# 9. Responsive Principles

Design is approached **desktop-first**, given the cinematic, atmospheric intent of the brand is most fully expressed at larger viewports — then deliberately adapted, not merely compressed, for smaller ones.

- **Desktop** — the fullest expression of the visual identity: generous space, full compositional layouts, maximum atmospheric impact.
- **Tablet** — layout adapts structurally (fewer columns, adjusted proportions) while preserving hierarchy and atmosphere; not simply a scaled-down desktop layout.
- **Mobile** — content and hierarchy are re-prioritized for a single-column, sequential reading/browsing experience; atmosphere is preserved through typography, imagery, and spacing choices appropriate to a smaller, closer viewing context — never sacrificed wholesale for the sake of "it still technically fits."

Adaptation is defined by principle, not by a fixed list of breakpoints: at every viewport size, hierarchy (section 2), readability (section 4), and spacing consistency (section 6) must hold. Implementation-specific breakpoint values belong to a future, more concrete pass.

---

# 10. Accessibility

Accessibility is a design requirement, not an afterthought — consistent with `AI_RULES.md`, SEO & Accessibility rules.

- **Contrast** — text and meaningful interface elements must remain clearly legible against their background at every point in the color system (section 5), in both any light and dark treatment the site supports.
- **Keyboard navigation** — every interactive element must be reachable and operable without a mouse, in a logical, predictable order.
- **Focus states** — every focusable element must have a clearly visible focus indicator, styled consistently with the rest of the visual system rather than left to an unstyled browser default.
- **Readable typography** — the typographic system (section 4) must hold at accessible minimum sizes and line lengths; atmosphere never justifies text that is genuinely hard to read.
- **Motion preferences** — visitors who prefer reduced motion must be respected; atmospheric motion (section 12, and the future Motion System document) must degrade gracefully rather than being forced on every visitor regardless of preference.

---

# 11. States

Every interactive or dynamic element must have a deliberately designed appearance for each relevant state, not just a default:

- **Default**
- **Hover**
- **Focus**
- **Active**
- **Disabled**
- **Loading**
- **Empty**
- **Error**
- **Success**
- **Skeleton**

A component is not considered complete when only its Default state has been designed. Every state must be visually consistent with the same component's other states — a hover treatment invented independently for one button and not applied to others is a violation of section 13, Consistency Rules.

---

# 12. Feedback

Every action a visitor takes must produce a clear, proportionate visual response:

- **Buttons** — a visible, immediate response to press/hover/focus (see section 11), proportionate to the action's importance.
- **Forms** — clear indication of validation state, in-progress submission, and success or failure, communicated through both the semantic color roles (section 5) and text, never through color alone.
- **Loading** — communicated honestly (a skeleton or clear loading indicator) rather than leaving a visitor uncertain whether something is happening.
- **Transitions** — used to clarify a change of state or context (see the future Motion System document), never purely decorative movement unrelated to what actually changed.
- **Notifications** — reserved for information the visitor genuinely needs, styled through the semantic color roles (section 5), never overused to the point of being ignored.

---

# 13. Consistency Rules

- **Same action = same appearance.** A primary action always looks like a primary action, everywhere on the site, regardless of which pillar or page it appears on.
- **Never invent new patterns** for a problem an existing pattern already solves.
- **Reuse before creating** — before designing a new component or pattern, confirm an existing one cannot be extended to fit (see `AI_RULES.md`, Component Rules).
- Any genuinely new pattern, once justified, must be documented so it becomes the reusable standard going forward — not a one-off exception.

---

# 14. Anti-Patterns

The following must never happen:

- Random spacing not traceable to the spacing system (section 6).
- Random shadows not traceable to the elevation system (section 7).
- Random animations with no functional purpose (see `AI_RULES.md`, Performance Rules).
- Random colors outside the defined roles (section 5).
- Inconsistent typography — a font size, weight, or style invented outside the type hierarchy (section 4).
- Component duplication — near-identical components built separately instead of one shared, reused component (see `AI_RULES.md`, Component Rules).
- Visual clutter — too many competing focal points on a single screen, violating the focus principle in section 2.

---

# 15. Final Design Principles

- Every design decision must be traceable to a principle in this document, not to individual taste in the moment.
- Consistency is more valuable than any single clever detail.
- Restraint is the default; embellishment must always be earned.
- Depth and atmosphere serve the content — they never compete with it.
- Accessibility and usability are non-negotiable, regardless of aesthetic ambition.
- The system must remain consistent and maintainable as content is published across every pillar during active use, without needing to be reinvented.
- Once the website is complete and stable, this system exists to prevent unnecessary redesign — a working visual identity is not revisited for its own sake.
- If a new component or pattern cannot be justified against this document, it does not ship as-is.
