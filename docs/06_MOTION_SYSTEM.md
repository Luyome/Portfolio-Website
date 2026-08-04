# Motion System

This document defines the complete motion system of the website: the principles that govern every animation, transition, and interactive movement across the site.

It builds on `AI_RULES.md`, `00_PRODUCT_VISION.md`, `01_INFORMATION_ARCHITECTURE.md`, `02_CONTENT_ARCHITECTURE.md`, `03_BRAND_IDENTITY.md`, `04_DESIGN_SYSTEM.md`, and `05_COMPONENT_LIBRARY.md`. Where `05_COMPONENT_LIBRARY.md` defines the states a component can be in, this document defines how a component *moves* between those states — and when it should move at all.

This document defines **principles, not values.** It does not specify durations, easing curves, or implementation code — those are a future, more concrete pass. What must not change without deliberate revision is the reasoning below: motion should support the experience, never dominate it.

---

# 1. Purpose

Motion exists to communicate — not to decorate, and not to entertain.

Every animation on this site must exist because it makes something clearer, faster to understand, or more confident to interact with. Motion is not decoration used to make a page feel more "alive," and it is not entertainment used to hold a visitor's attention. If a proposed animation cannot name what it communicates, it does not belong in the system, regardless of how polished it looks in isolation.

---

# 2. Motion Philosophy

Motion on this site is: **subtle, intentional, minimal, calm, professional, responsive, predictable, elegant.**

**Never:** flashy, distracting, excessive.

This philosophy is a direct extension of `03_BRAND_IDENTITY.md` (a brand that is quiet, confident, and disciplined does not move loudly) and `04_DESIGN_SYSTEM.md`, section 1 (function before effects, premium over flashy). Motion that draws attention to itself, rather than to what it's revealing or confirming, has failed this philosophy regardless of technical quality.

---

# 3. Motion Goals

Motion should help visitors by:

- **Guiding attention** — directing focus to what matters next, consistent with the focus principle in `04_DESIGN_SYSTEM.md`, section 2.
- **Explaining relationships** — showing how one state or element relates to another (an item expanding from where it was clicked, a panel that clearly belongs to the element that opened it).
- **Confirming actions** — giving a visitor confidence that their input registered (see section 9, Feedback Motion).
- **Reducing cognitive load** — making transitions between states feel continuous rather than abrupt, so a visitor doesn't have to reorient themselves after every interaction.
- **Increasing perceived quality** — restrained, well-considered motion is one of the clearest signals of a premium product, consistent with `03_BRAND_IDENTITY.md`, section 6.
- **Supporting immersion** — reinforcing the atmospheric, cinematic identity of the site (`03_BRAND_IDENTITY.md`, section 5) at moments where mood matters, without ever compromising the goals above.

---

# 4. Motion Categories

- **Page Transition** — movement between one page/route and the next (see section 5).
- **Section Reveal** — content entering view as a visitor scrolls or navigates within a page.
- **Hover** — response to a pointer resting on an interactive element (see section 6).
- **Focus** — response to keyboard focus landing on an interactive element; must be at least as clear as Hover, never weaker (see section 11).
- **Loading** — communicating that content is being fetched or processed (see section 8).
- **Navigation** — movement within navigational components (menus opening, active-state indicators moving).
- **Feedback** — confirming the result of an action (see section 9).
- **Modal** — a Modal or Drawer (`05_COMPONENT_LIBRARY.md`, section 5) entering and leaving the screen.
- **Tooltip** — a Tooltip appearing/disappearing on demand.
- **Dropdown** — a menu or option list expanding/collapsing.
- **Notification** — a Toast or Alert appearing, and, where relevant, dismissing itself (`05_COMPONENT_LIBRARY.md`, section 5).
- **Background Motion** — ambient, non-interactive movement in the environment itself (see section 10).

Each category exists to solve a distinct communication problem; a motion pattern from one category should not be borrowed into another just because it looks appealing — a Modal must not move like a Notification, because they mean different things to a visitor.

---

# 5. Page Transitions

- Navigation should feel continuous — a visitor's sense of place should carry from one page to the next, not reset abruptly.
- Never interrupt reading — a page transition must never delay a visitor from reaching content they've already decided to view.
- Never feel slow — perceived speed is more important than visual sophistication; a transition that adds meaningful delay to navigation has failed regardless of how it looks.
- Avoid cinematic transitions between ordinary pages — the atmospheric, cinematic identity (`03_BRAND_IDENTITY.md`) is earned through the *content and imagery* of a page, not through an elaborate wipe or reveal effect used every time a visitor clicks a link. Reserve any heightened transition treatment for genuinely significant moments (entering a World for the first time, for instance), never for routine navigation between ordinary pages.

---

# 6. Micro-interactions

Applies to Buttons, Inputs, Cards, Links, Icons, Search, Menus, and Forms alike:

- Hover effects should communicate interactivity — confirming that an element is interactive and previewing what will happen, nothing more.
- Nothing should move without purpose — a micro-interaction earns its place the same way any motion does (section 1); "it felt empty without something moving" is not a valid justification.
- Micro-interactions must remain consistent with the state definitions in `05_COMPONENT_LIBRARY.md`, section 8 — the same component type must animate the same way across every instance of it on the site (see section 13).
- Micro-interactions are the most frequent motion a visitor will experience; because of that frequency, they must be the most restrained, not the most elaborate — an effect that feels charming once becomes noise repeated hundreds of times across a browsing session.

---

# 7. Scroll Behaviour

- Content should reveal naturally as a visitor scrolls — supporting the sense of discovery appropriate to a worldbuilding-forward site, without becoming a gimmick.
- Avoid excessive scroll-triggered effects — a Section Reveal (section 4) is a tool used with restraint, not applied to every single element on a page independently.
- Never hijack scrolling — the visitor is always in control of their own scroll position and speed; scroll must never be intercepted, slowed, or redirected by the site.
- Scrolling must always remain responsive — no scroll-linked effect may introduce lag or jank between a visitor's input and the page's visual response.

---

# 8. Loading Experience

- Prefer Skeleton over Spinner whenever possible — a Skeleton (`05_COMPONENT_LIBRARY.md`, section 4) previews the shape of what's coming and reduces perceived wait time more effectively than an indeterminate Spinner.
- Avoid blocking the interface — a visitor should be able to continue reading, browsing, or interacting with unrelated parts of the page while unrelated content loads, wherever technically reasonable.
- Communicate progress honestly — where a wait is unavoidable and non-trivial, the visitor should understand that something is happening, not be left wondering if the page has stalled.
- Reduce perceived waiting time — through Skeletons, honest progress communication, and by prioritizing the loading of what a visitor sees first, not just technical convenience of what loads first.

---

# 9. Feedback Motion

Applies to Success, Warning, Error, Notifications, Saving, Publishing, and Deleting:

- Motion should reinforce understanding of what happened, paired with the semantic color roles and copy defined in `04_DESIGN_SYSTEM.md`, section 5 and 12 — motion is never the sole carrier of meaning (see section 11, Accessibility).
- Feedback motion is proportionate to the significance of the action: a routine save is acknowledged briefly and quietly; a destructive action (Deleting) warrants a clearer, more deliberate confirmation moment, not necessarily more visual flourish.
- Feedback must be timely — a delayed confirmation is functionally indistinguishable from no confirmation at all, and undermines the confidence motion is meant to build (section 3).

---

# 10. Background Motion

Background motion (ambient particles, very subtle gradients, light atmospheric movement) is acceptable only when it strengthens the atmospheric identity in `03_BRAND_IDENTITY.md` without competing with content.

- Never distract from content — background motion is, by definition, background; if it draws a visitor's eye away from the actual content of a page, it has overstepped its role.
- Must remain extremely subtle — closer to "you'd notice its absence" than "you actively notice its presence."
- Allow visitors to reduce or disable decorative motion — background motion is the first category that must respect reduced-motion preferences (section 11), since it carries no functional information and has zero cost to disable.

---

# 11. Accessibility

- Respect reduced-motion preferences — every visitor who has indicated a preference for reduced motion must receive a meaningfully calmer experience, not a token adjustment.
- Never require motion to understand content — anything communicated through motion (state change, relationship, confirmation) must also be understandable from the static end-state alone.
- Never hide important information behind animation — a visitor must never have to "catch" a fast-moving or transient element to get information they need.
- Keyboard users must receive the same feedback as pointer users — Focus states (section 4) must communicate at least as clearly as Hover states; motion is never a pointer-only enhancement.

---

# 12. Performance

- Motion must never reduce responsiveness — an animation that makes the interface feel slower to use has failed regardless of its visual quality (directly extends `AI_RULES.md`, Performance Rules).
- Avoid unnecessary GPU-heavy effects — every animated property must be chosen for its cost as well as its appearance.
- Prioritize smooth interaction over visual complexity — a simpler animation that runs smoothly everywhere is always preferable to a more elaborate one that stutters on lower-end hardware.
- Optimize for low-end devices — the motion system must be designed so it degrades gracefully rather than being designed only against the developer's own high-end hardware.

---

# 13. Motion Consistency

Same action, same motion, same expectation.

A given interaction (opening a Modal, revealing a Section, hovering a Card) must animate identically everywhere it occurs on the site, regardless of which page or pillar it appears on. Never invent a new animation style for an isolated page — if an existing motion pattern doesn't fit a new situation, the motion system itself is extended deliberately and documented, the same discipline `05_COMPONENT_LIBRARY.md`, section 9, applies to components.

---

# 14. Anti-Patterns

The following must never happen:

- Long intro animations that delay a visitor from reaching content.
- Heavy parallax effects.
- Random floating elements with no communicative purpose.
- Constant looping animations that never settle or resolve.
- Excessive blur used as a motion or transition effect.
- Unnecessary page transitions applied to routine navigation (see section 5).
- Attention-seeking effects that exist to impress rather than to communicate (see section 1).
- Motion without meaning — any animation that cannot answer "what does this communicate?" (section 1).

---

# 15. Final Principles

- Motion follows purpose.
- Less is more.
- Performance before effects.
- Consistency before creativity.
- Accessibility before aesthetics.
- Every animation should earn its place.
