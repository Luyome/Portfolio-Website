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

**Sprint 1 — Core Systems** — *Complete.* Inspected, preserved, aligned, and completed the shared systems the site already had — not a from-zero build. Delivered: public UI foundation, accessibility and responsive core, validation and search/filter infrastructure, SEO/sitemap/robots, media optimization, performance and Vercel/Neon usage QA, and local and production integration QA.

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
- Task 1.10 — Search, Tags, Categories & Archive Foundation: **Complete.**
- Task 1.11 — SEO Metadata Foundation: **Complete.**
- Task 1.12 — Sitemap, Robots & Indexing Rules: **Complete.**
- Task 1.13 — Media Optimization Foundation: **Complete.**
- Task 1.14 — Accessibility & Responsive Core QA: **Complete.** — fixes implemented and validated (type-check/lint/build pass); desktop, keyboard/modal, and mobile/tablet viewport QA (390×844, 768×1024, via DevTools device emulation) all performed in-browser. Mobile viewport testing found and fixed a real overflow bug: `.sk-grid` (Sketches + 3D pages) used a fixed 4-column layout with no `min-width:0` on grid items, causing images to force horizontal overflow below ~540px; fixed with `min-width:0` on `.sk-item` and a 2-column override at the existing 820px breakpoint. Also fixed: MapZoomPanel toolbar/breadcrumb overlap at ~390px, GalleryModal's mobile single-column grid collapsing `.gm-img-side`'s row to 0px (image rendering on top of the info panel), and the tablet-only (768–1023px) header row overflowing its own viewport by ~50px (last nav/social links unreachable).
- Task 1.15 — Performance & Vercel Usage QA: **Complete.** — code audit (client bundle, DB queries, rendering/cache, media transfer) plus read-only Vercel and Neon dashboard review found the site well within plan limits and free of N+1/duplicate-query patterns except one: `getSiteSettings()` was read 2-3x per request (root layout, site layout, and — on the Home Page — the page itself again). Fixed by wrapping it in React's `cache()`, per the local Next.js 16 docs' documented dedup pattern for non-`fetch` ORM reads (`node_modules/next/dist/docs/.../caching-without-cache-components.md`, "Deduplicating requests") — zero behavior change, one file (`lib/site-settings.ts`). No other verified low-risk fix met the bar; GalleryModal's `<img>` usage, the `.sk-grid` masonry thumbnails, and Archive's same-year ordering were reviewed and left alone (masonry/GalleryModal excluded by task scope and Task 1.14's recent a11y work; ordering has no perf benefit). Type-check, lint (0 new warnings), build, and diff-check all passed; 8-route smoke QA (including GalleryModal and the World Map panel) passed with no console errors.
- Task 1.16 — Sprint 1 Integration QA: **Complete.** — resumed after an unrelated system crash mid-QA; git status was clean (no half-finished edits, no roadmap corruption), so this was a clean continuation, not a rebuild. Re-ran type-check/lint (0 errors, the same pre-existing 27 warnings)/build/`git diff --check`, all clean. 8-route smoke QA (console, header/footer, single `h1`, no page-level overflow), keyboard/ARIA checks (skip-to-content, Work menu open/Escape/focus-return, `aria-current`, mobile-menu toggle wiring, Archive's `aria-pressed` filters), GalleryModal + ImageZoomOverlay + MapZoomPanel (open/close/Escape-nesting/focus-return/zoom/reset), Worldbuilding search (trim + case-insensitive + empty-search no-op), Archive year/type filters and invalid-`year`-param fallback, 404 + its Home/Archive links, admin login `noindex,nofollow`, sitemap.xml/robots.txt (dev correctly disallows all; prod allows public routes and blocks `/admin/`+`/api/`), and the Task 1.15 `getSiteSettings()` cache all passed with no regressions. Production (`portfolio-website-eight-xi-79.vercel.app`) confirmed Ready on the latest deploy, aliased correctly, and `/`, `/portfolio`, `/worldbuilding`, `/about`, `/sitemap.xml`, `/robots.txt` all return 200 with unique titles and no error markers. **390px/768px responsive regressions — now verified in a follow-up session:** the browser extension's window resize still could not shrink the real viewport below desktop width (confirmed again, same root cause as before — OS/window-manager level, not fixable from the page-automation tool), so verification instead used a scripted headless Chrome session driven directly via the Chrome DevTools Protocol (`Emulation.setDeviceMetricsOverride`, the same primitive DevTools' own device toolbar uses), launched from the local Chrome install with no new project dependency. Checked `document.documentElement.scrollWidth` vs `clientWidth` plus visual screenshots on production for Home, Worldbuilding (including MapZoomPanel opened), Portfolio (including GalleryModal opened), and Archive, at both 390×844 and 768×1024: no page-level horizontal overflow on any of the 8 combinations, mobile hamburger menu and stacked layouts render correctly, GalleryModal's image/info stacking and MapZoomPanel's zoom toolbar both fit within viewport with no regressions from Task 1.14's fixes. One benign finding, not a bug: Worldbuilding's `.ph-wm` map-preview thumbnail measures 421px `scrollWidth` inside its 390px container (31px larger than its box) but is clipped by the container's own `overflow:hidden`, so it never affects page scrollWidth or visible layout — left as-is per scope (no visible defect to fix).
- Task 1.17 — Roadmap Status Update / Sprint Close: **Complete.**

Existing systems confirmed and to be preserved (Task 1.1): root and site layouts, Header, Footer, owner-only Admin authentication, Admin dashboard, existing CRUD systems, Home Page foundation, Portfolio, Worldbuilding browser, public map foundation, Admin Map Editor, Archive, About page.

Confirmed Sprint 1 gaps to close: reduced-motion support, spacing tokens, typography tokens, shared public UI primitives, loading states, empty states, error states, error boundaries, SEO metadata, sitemap, robots configuration, content validation, media optimization, integration QA.

Comments, likes, bookmarks, notifications, and public accounts are not part of this sprint — see section 6, Explicitly Out of Scope.

**Sprint 2 — Private Admin Panel and CMS Refinement** — *Active.* Admin authentication, dashboard, CRUD, and a working Map Editor already exist. This sprint refines and extends them (media management polish, tag/category management, content relationship management, Map Manager improvements) rather than building an admin system from scratch.

- Task 2.1 — Admin Panel Audit & Scope Lock: **Next.** Audit existing Admin routes, authentication, CRUD flows, forms, server actions, media upload system, and database relationships. Acceptance criteria: existing Admin pages and features listed; working, inconsistent, partial, and missing flows separated; real Sprint 2-scope problems verified; work belonging to future content sprints separated out; no unnecessary schema or architectural expansion performed.
- Task 2.2 — Admin Shell, Navigation & Responsive Layout: **Planned.** Improve the existing Admin layout, navigation, header, and content areas under a consistent, responsive Admin shell. Scope: active-section indication, Admin navigation layout, mobile and tablet behaviour, Public/Admin navigation separation, shared page title and action area, overflowing table and form fields.
- Task 2.3 — Admin Dashboard & Content Overview: **Planned.** Turn the Admin home page into a functional hub for daily content management. Scope: quick access to existing content types, content counts, recently added/updated content, missing-required-field warnings, view-site link, frequently used actions. Excludes analytics, visitor graphs, or Vercel/Neon dashboard integration.
- Task 2.4 — Shared Admin Form System: **Planned.** Make repeated Admin form fields and form feedback consistent. Scope: label, input, textarea, select, and checkbox; help text; required/optional field indicators; field-level validation messages; Save/Saving/Success/Error states; Cancel and back-navigation behaviour; form error summary; accessibility. Only genuinely reused parts are consolidated.
- Task 2.5 — Existing CRUD Workflow Consistency: **Planned.** Bring the listing, create, edit, and delete flows of existing content types to a common standard. Areas: Portfolio, Sketches, 3D Models, Games, Worldbuilding, Maps, About, CV, Archive, Site Settings. Scope: Create/Edit consistency, post-save redirect, success/error feedback, server-side validation, invalid-ID behaviour, empty state, deterministic ordering, double-submit protection, safe delete confirmation. Excludes adding Project, Story, or Devlog CRUD.
- Task 2.6 — Media Upload & Asset Management Hardening: **Planned.** Make the existing Vercel Blob upload flow safer and clearer. Scope: upload progress state, file type/size validation, failed-upload feedback, image preview, alt text, image ordering, cover image, orphaned-Blob risk, source/master-file upload risk, external-URL vs. Blob-URL distinction. Excludes building a new CDN or standalone media library.
- Task 2.7 — Admin Authentication, Session & Destructive Action Safety: **Planned.** Audit owner-only Admin access and sensitive mutation operations for security and fix verified issues. Scope: Admin route protection, login and logout, session invalidation, unauthorized server action calls, safe redirects, safe error messages, delete/irreversible-action confirmation, double-submit protection, Admin `noindex`. Excludes public login, multi-admin, role systems, or OAuth.
- Task 2.8 — Map Editor & Complex Admin Tools Usability: **Planned.** Improve the existing Map Editor and complex Admin tools for general usability. Scope: marker creation and editing, normalized coordinates, zoom visibility ranges, priority, optional content relationships, map image selection, form/preview relationship, mobile/tablet usability, invalid-data feedback, Save/Cancel behaviour. Leaves semantic zoom, public Map Explorer, new pin layers, and KRUPNI map art direction to Sprint 4.
- Task 2.9 — Admin Accessibility, Responsive & Integration QA: **Planned.** Test the Admin systems developed throughout Sprint 2 together. Scope: desktop/tablet/mobile Admin, keyboard and focus-visible, form label and error accessibility, touch targets, table/form overflow, login/logout, unauthorized access, CRUD and validation, upload behaviour, dashboard, Map Editor, Admin noindex, type-check/lint/production build, local and production smoke QA. Excludes creating or deleting test content in production data.
- Task 2.10 — Sprint 2 Roadmap Status Update / Sprint Close: **Planned.** Verify Task 2.1–2.9 status, close Sprint 2, and mark Sprint 3 as the next sprint. Acceptance criteria: Task 2.1–2.9 Complete; Admin ready for daily use; owner-only access preserved; CRUD flows consistent; media upload safe; Admin responsive and accessible; build, lint, and type-check pass; production smoke QA complete; Sprint 2 Complete; Sprint 3 Next.

**Sprint 2 scope boundaries** — not part of this sprint: Home Page composition, public KRUPNI or Map Explorer, a new Projects system, a Stories or Devlog system, Portfolio public art direction, a multi-language system, public users, comments/likes/bookmarks/community, newsletter, multi-admin or role systems. These remain in their assigned future sprints or out of scope.

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

- Current sprint: Sprint 2 — Private Admin Panel and CMS Refinement (Active). Previous sprint: Sprint 1 — Core Systems (Complete).
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
- Task 1.10 — Search, Tags, Categories & Archive Foundation: Complete.
- Task 1.11 — SEO Metadata Foundation: Complete.
- Task 1.12 — Sitemap, Robots & Indexing Rules: Complete.
- Task 1.13 — Media Optimization Foundation: Complete.
- Task 1.14 — Accessibility & Responsive Core QA: Complete.
- Task 1.15 — Performance & Vercel Usage QA: Complete.
- Task 1.16 — Sprint 1 Integration QA: Complete.
- Task 1.17 — Roadmap Status Update / Sprint Close: Complete.
- Task 2.1 — Admin Panel Audit & Scope Lock: Next.
- Task 2.2 — Admin Shell, Navigation & Responsive Layout: Planned.
- Task 2.3 — Admin Dashboard & Content Overview: Planned.
- Task 2.4 — Shared Admin Form System: Planned.
- Task 2.5 — Existing CRUD Workflow Consistency: Planned.
- Task 2.6 — Media Upload & Asset Management Hardening: Planned.
- Task 2.7 — Admin Authentication, Session & Destructive Action Safety: Planned.
- Task 2.8 — Map Editor & Complex Admin Tools Usability: Planned.
- Task 2.9 — Admin Accessibility, Responsive & Integration QA: Planned.
- Task 2.10 — Sprint 2 Roadmap Status Update / Sprint Close: Planned.
- The Admin Panel, CRUD systems, and public map foundation already exist and are being extended, not built from zero.
- No second Worldbuilding universe is planned scope.

## 9. Roadmap Update Protocol

At the end of every completed sprint: update the sprint status, record the next active sprint, add only important scope changes, move deferred features to the correct future sprint. Do not rewrite the entire roadmap. Do not duplicate information already documented elsewhere.
