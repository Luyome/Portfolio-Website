# Roadmap

A living status document for future Claude Code sessions: what's done, what's active, what's next. It does not repeat rules already defined in the other `/docs` files — see those for the "how."

## 1. Project Goal

The personal website of Ege Demir Ünal, combining Worldbuilding, Game Design, Portfolio, 3D/2D work, original stories, development journals, and interactive fictional-world exploration. First professional version targeted in approximately 2–3 weeks; the site continues receiving content and improvements after that, without requiring constant feature development (see `00_PRODUCT_VISION.md`, section 3).

## 2. Working Rules

- Work on one active sprint at a time.
- Do not begin future sprints unless explicitly instructed.
- Complete and validate the current sprint before moving forward.
- Do not silently expand scope.
- Record future ideas without treating them as current requirements.
- Prefer working, testable results over additional planning.
- Do not rebuild working systems without a clear reason.
- Update this roadmap whenever a sprint or major task is completed.
- Keep roadmap updates concise.
- Detailed decisions belong in their relevant documentation files, not here.

## 3. Sprint Status

**Sprint 0 — Foundation** — *Complete.* Product, content, design, component, motion, and technical documentation (`AI_RULES.md` through this file).

**Sprint 1 — Core Systems** — *Active.* Inspect, preserve, align, and complete the shared systems the site already has — this sprint is not a from-zero build.

- Task 1.1 — Existing Core Systems Audit: **Complete.**
- Task 1.2 — Final Product Scope and Documentation Alignment: **Complete.**
- Task 1.2.1 — Documentation Consistency Patch: **Complete.**
- Task 1.3 — Reduced-Motion Foundation: **Complete.**
- Task 1.4 — Spacing Tokens Alignment: **Complete.**
- Task 1.5 — Typography Tokens Alignment: **Complete.**
- Task 1.6 — Shared Public UI Primitives: **Complete.**
- Task 1.7 — Loading, Empty & Error States: **Complete.**
- Task 1.8 — Error Boundaries & Fallback Behaviour: **Complete.**
- Task 1.9 — Content Validation Foundation: **Complete.**
- Task 1.10 — Search, Tags, Categories & Archive Foundation: next.

Existing systems confirmed and to be preserved (Task 1.1): root and site layouts, Header, Footer, owner-only Admin authentication, Admin dashboard, existing CRUD systems, Home Page foundation, Portfolio, Worldbuilding browser, public map foundation, Admin Map Editor, Archive, About page.

Confirmed Sprint 1 gaps to close: reduced-motion support, spacing tokens, typography tokens, shared public UI primitives, loading states, empty states, error states, error boundaries, SEO metadata, sitemap, robots configuration, content validation, media optimization, integration QA.

Comments, likes, bookmarks, notifications, and public accounts are not part of this sprint — see section 6, Explicitly Out of Scope.

**Sprint 2 — Private Admin Panel and CMS Refinement** — Admin authentication, dashboard, CRUD, and a working Map Editor already exist. This sprint refines and extends them (media management polish, tag/category management, content relationship management, Map Manager improvements) rather than building an admin system from scratch.

**Sprint 3 — Home Page** — The Home Page already exists (hero, project stream, worldbuilding introduction, map preview, pillar previews, About/Contact entry points). This sprint aligns, improves, and completes it against the current documentation rather than building it new.

**Sprint 4 — KRUPNI Worldbuilding and Map Expansion** — The Worldbuilding page, a public map viewer, and the Admin Map Editor already exist. This sprint expands KRUPNI content (characters, companies/factions, locations, technologies, timeline, lore) and Map Explorer behaviour (touch/pinch support, priority and zoom-level visibility, richer optional relationships). No multi-universe system is required or built here.

**Sprint 5 — Game Design** — Mechanics, gameplay systems, prototypes, GDD excerpts, diagrams, design problem-solving.

**Sprint 6 — Projects** — Structured project listings and case-study pages for current and completed work.

**Sprint 7 — Portfolio** — Professional 3D, 2D, environment, hard-surface, and visual work in a recruiter-friendly format.

**Sprint 8 — Stories, Independent Writing and Devlog** — Original fiction and creative writing: KRUPNI fiction, standalone stories, scenario experiments, personal writing, alongside development journals. Independent writing must not be forced into the Worldbuilding taxonomy — see `01_INFORMATION_ARCHITECTURE.md`, section 3.

**Sprint 9 — Polish and Launch** — Responsive QA, accessibility QA, performance optimization, SEO, metadata, sitemap, error pages, browser/mobile testing, security review, final content review, deployment validation.

**Sprint 10 — Multi-Language System** — *Post-launch, optional.* Turkish, English, Japanese, Simplified Chinese. Locale-aware routes, language selector, translated UI/content, AI-assisted translation drafts with human review, translation publication status, worldbuilding terminology glossary, multi-language SEO and search. Must not block the first completed version.

## 4. Initial Launch Scope

Functional Home Page; Worldbuilding hub centered on KRUPNI; Interactive Map Explorer MVP; Projects; Portfolio; About and Contact access; basic Stories/Writing and Devlog support; responsive design; essential accessibility; SEO foundation; stable deployment; practical content-management workflow.

## 5. Not Launch-Blocking

Genuinely optional or deferrable features — not scheduled for the initial launch, but not ruled out either, only if a real future need appears: AI search, advanced map layers, complete multi-language support, complex analytics, advanced owner/admin permission capabilities.

Public accounts, social features, and a second Worldbuilding universe are **not** deferred launch features — they are excluded entirely; see section 6, Explicitly Out of Scope.

## 6. Explicitly Out of Scope

Not future expansion, not optional post-launch, not planned architecture — outside the current product direction entirely, and introduced only if the owner explicitly changes this decision later:

- Public registration, public login, public user accounts, public profiles
- Comments, likes, reactions, emotes
- Reader bookmarks, followers, reader progress tracking tied to accounts
- Community feeds, public activity feeds, user-generated content
- In-app visitor notifications
- Public role/permission systems
- A second Worldbuilding universe or any multi-universe management system

Interface feedback (toasts, alerts, save/publish confirmations, error messages, admin feedback, loading feedback — see `06_MOTION_SYSTEM.md`) is unrelated to the above and is not affected by this exclusion. Optional Future Email Updates (section 7) is also unrelated — it is a separate, unscheduled idea distinct from in-app visitor notifications, not a way of reintroducing them.

## 7. Optional Future Email Updates

- This feature may be considered only after the website is completed and actively used.
- It should only be added if the owner feels a genuine need to help visitors remember or follow new content.
- It must not be implemented merely because newsletters are common.
- It is separate from public accounts and in-app notifications.
- Visitors would subscribe using only an email address.
- A managed email provider should be preferred over custom email-delivery infrastructure.
- Consent, unsubscribe, and privacy requirements would need to be handled.
- No subscriber table, email provider, or automated campaign system should be added now.
- This feature is not scheduled and is not assigned to Sprint 10 or any other sprint.
- RSS may also be considered as a lighter alternative.
- The decision remains open and unknown until a real need appears.

## 8. Current Status

- Current sprint: Sprint 1 — Core Systems (Active).
- Task 1.1 — Existing Core Systems Audit: Complete.
- Task 1.2 — Final Product Scope and Documentation Alignment: Complete.
- Task 1.2.1 — Documentation Consistency Patch: Complete.
- Task 1.3 — Reduced-Motion Foundation: Complete.
- Task 1.4 — Spacing Tokens Alignment: Complete.
- Task 1.5 — Typography Tokens Alignment: Complete.
- Task 1.6 — Shared Public UI Primitives: Complete.
- Task 1.7 — Loading, Empty & Error States: Complete.
- Task 1.8 — Error Boundaries & Fallback Behaviour: Complete.
- Task 1.9 — Content Validation Foundation: Complete.
- Next task: Task 1.10 — Search, Tags, Categories & Archive Foundation.
- The Admin Panel, CRUD systems, and public map foundation already exist and are being extended, not built from zero.
- No second Worldbuilding universe is planned scope.

## 9. Roadmap Update Protocol

At the end of every completed sprint: update the sprint status, record the next active sprint, add only important scope changes, move deferred features to the correct future sprint. Do not rewrite the entire roadmap. Do not duplicate information already documented elsewhere.
