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

- Task 2.1 — Admin Panel Audit & Scope Lock: **Complete.** Audited existing Admin routes, authentication, CRUD flows, forms, server actions, media upload system, and database relationships (code review + logged-in browser walkthrough). See **Verified Audit Findings** below.
- Task 2.2 — Admin Shell, Navigation & Responsive Layout: **Complete.** Added an accessible mobile/tablet Admin navigation replacement (`components/admin/AdminSidebar.tsx`): a fixed top bar (hamburger + active-section label) plus a slide-in drawer, shown only below the existing 820px sidebar-hide breakpoint — the desktop `.adm-sb` sidebar and its active-state logic are unchanged and still render as-is above 820px. Drawer behavior verified via real headless-Chrome CDP interaction (`Emulation.setDeviceMetricsOverride`, same technique as Task 2.1's follow-up pass, session authenticated with a locally-minted JWT — `ADMIN_PASSWORD` never read): `aria-expanded`/`aria-controls`/dynamic `aria-label`, Escape closes and returns focus to the burger button, backdrop click closes and returns focus, link click closes and navigates, body scroll locked while open and restored on close, all 14 nav links (13 sections + Back to Site) reachable and correctly reflect the active route including nested ones (`/admin/worldbuilding/map` → "Worldbuilding" active). No new dependency and no added animation beyond the existing `hn-burger`-style icon-morph transition already used by the public Header. Fixed the three confirmed overflow bugs: added a reusable `.adm-table-wrap` (scrollable, `overflow-x:auto`) around every `.adm-table` instance site-wide (16 admin list/panel tables, not just the two required ones, since the underlying `.adm-table` bug was identical everywhere) plus a ≤820px rule switching `.adm-table` from fixed to auto column layout so Title/name columns size to content instead of a fixed 130px budget; added `flex-wrap:wrap` to `.adm-field-label-row` so `FieldStyleControls` pills drop to their own line instead of overflowing. Verified via the same CDP session at 390×844, 768×1024, and 1440×900 on Dashboard, Portfolio list, Portfolio create form, and Map Editor: zero page-level horizontal overflow at any width/page (`scrollWidth`/`clientWidth` measured, not assumed), Map Editor's 6-column Pins table fully readable with no scrollbar at 768px, style pills wrap cleanly at 390px, and the 1440px desktop views are visually unchanged from before (sidebar intact, no mobile top bar). Type-check, lint (0 errors, the same pre-existing 27 warnings, no new ones), production build, and `git diff --check` all passed; only the 18 intended files changed.
- Task 2.3 — Admin Dashboard & Content Overview: **Complete.** Turned the Admin home page into a functional hub for daily content management, preserving the existing stat cards, Content Activity chart, and dark-mode toggle. Added: a header "View Public Site" link (new tab) plus a single primary create action chosen from the content type with the most existing items; a full "Content Overview" grid (Portfolio, Sketches, 3D Models, Worldbuilding, Games, Maps, Services — Maps was the confirmed gap, added to `getDashboardData()`'s `sections`) with real counts linking to each list page; a "Quick Actions" grid of the 6 working create/editor routes; a "Recent Content" list sourced from a new `getRecentContent()` helper (bounded, deterministic `ORDER BY created_at DESC LIMIT 8` per table, merged) — the confirmed missing per-item recent list; and an "Attention Needed" list (only rendered when non-empty) flagging rows whose mutation-boundary-required title/label field (`lib/actions/*.ts`'s `requiredText`) is empty — the confirmed missing warning system, deliberately excluding the `img` field since every action treats it as optional today. Fixed the Dashboard's `<div className="adm-title">` and `DashboardChart`'s `<div className="adm-chart-title">` to real `<h1>`/`<h2>` elements (visually unchanged) so the page has exactly one `h1` and a real heading hierarchy. No new dependency, schema, migration, or analytics tracking.
- Task 2.4 — Shared Admin Form System: **Complete.** Consolidated three genuinely repeated Admin form structures into new, small, focused components — no new form framework. `components/admin/Field.tsx`: wraps a single native `<input>`/`<textarea>`/`<select>` with a `<label htmlFor>`, a textual **Required**/**Optional** indicator (never a bare asterisk), optional help text and error text with unique, correctly-wired `id`/`aria-describedby`/`aria-invalid`, and an optional `labelExtra` slot (replaces the old bespoke `.adm-field-label-row` + `FieldStyleControls` pairing). Deliberately has no client-only APIs (pure `cloneElement`), so it renders identically from Client Component forms (Portfolio/Sketches/3D/Games/Worldbuilding/Maps/About, which need live-preview state) and Server Component pages (Site Settings, Archive) — the render-prop version tried first broke the Settings page build (functions aren't serializable across the Server/Client boundary) and was replaced with this approach. `components/admin/FormError.tsx`: the single form-level error banner every `useActionState` form repeated inline, now with `role="alert"` (previously missing everywhere). `components/admin/FormActions.tsx`: wraps `SaveButton` (unchanged — already handled pending/double-submit correctly) with a new Cancel/back-to-list link, the confirmed missing piece. Custom picker widgets (YearPicker, DatePicker, OrderPicker, ColorPicker, NumberPicker) and upload fields (ImageUploadField, FileUploadField) always carry a valid default/are upload-mechanics — left on their existing bare `.adm-field` markup, untouched, per scope. Migrated: PortfolioForm, GameForm, SketchForm, Model3DForm, WorldbuildingForm, WorldMapForm, ServiceForm, AboutForm, the Site Settings page, and the Archive "Add Category" form (whose Add button was a raw `<button>` with no pending state — now `SaveButton`). PageAppearanceForm (color-grid, no text fields) and MapPinEditPanel (a controlled non-`<form>` panel, Task 2.8 territory) were reviewed and deliberately left alone — no genuine Field-shaped consumer there. No field `name`, hidden input, default-value, server action, redirect, or CRUD behavior changed anywhere. Verified via a real headless-Chrome session (Puppeteer against the local Chrome install, no new project dependency — installed `--no-save` for the QA run and pruned back out afterward) authenticated with a locally-minted session JWT (`lib/auth.ts`'s `createSessionToken()`, via a temporary `/api/devauth-qa-temp` route deleted before this task closed — `ADMIN_PASSWORD` never read or used): Portfolio/Worldbuilding/Games/Maps create forms and the Site Settings page all measured **zero** `scrollWidth`-vs-`clientWidth` overflow at 390×844, 768×1024, and 1440×900, with screenshots confirming clean Required/Optional badges, wrapped hint text, and a non-overlapping Save+Cancel row at every width; the existing 820px mobile nav (Task 2.2) and 1440px desktop sidebar were unaffected. Also confirmed, non-destructively: submitting Portfolio's create form with an empty required Title field renders the new `role="alert"` `FormError` banner ("Title is required.") and — per code review of `lib/actions/portfolio.ts`'s `readFields()`, which throws before any `db.insert` — writes nothing; the Portfolio list's 5 existing rows were unchanged afterward. Type-check, lint (0 errors, the same pre-existing 27 warnings, no new ones), production build, and `git diff --check` all passed; only the 14 intended files changed.
- Task 2.5 — Permanent Browser QA Harness: **Next.** Dependency-free, reusable headless Chrome/CDP responsive QA system. Scope: 390, 768, and 1440 viewports; overflow and console-error checks; route and basic interaction checks; only ever closes the browser PID it launched itself; no temporary Puppeteer/Playwright install; no command that targets all Chrome processes.
- Task 2.6 — Controlled Taxonomy Data Model: **Planned.** Controlled taxonomy data model for Medium, Subject Matter, Software, and Tags. Scope: name, slug, sort order, and active/inactive; Software logo/icon and optional website URL; content-type-specific junction tables; a safe migration and rollback approach; Content Section determined systemically by content type/route; avoid a single ambiguous polymorphic relationship table.
- Task 2.7 — Metadata Manager Admin UI: **Planned.** Admin management of Medium, Subject Matter, Software, and Tags. Scope: add/edit; active/inactive; sort; usage count; Software logo upload; prevent accidental deletion of an option still in use.
- Task 2.8 — Portfolio Metadata Selectors & Legacy Migration: **Planned.** Convert the Portfolio form's free-text Medium, Software, and Tags fields into controlled selectors. Scope: add Subject Matter; searchable multi-select; selected chips; safe migration/backfill of existing comma-separated data; keep the old string columns until the migrated data is verified.
- Task 2.9 — Admin Content Editor Shell: **Planned.** Shared Admin content editor shell adapted from ArtStation's information architecture. Scope: main content column; sticky publishing panel; title, summary, thumbnail, media, taxonomy, relations, and external links; save, preview, visibility, featured, and Home placement. Does not build a full block editor at this stage.
- Task 2.10 — Creator Profile & Skills/Stats Foundation: **Planned.** Prepare the existing About management for a Creator Profile data foundation. Scope: identity; biography; focus areas; social links; CV; Currently Working On; skill name, logo/icon, percentage, order, and visibility; Home/About visibility; automatic Creator Stats visibility settings. Rules: at most 5–6 skills shown on Home, the rest on `/about`; skill percentages are manual self-assessment; Production Stats are computed automatically from the database; no public user system is added.
- Task 2.11 — Media Upload & Asset Management Hardening: **Planned.** Scope: file type and size limits; upload status and error feedback; preview; thumbnail/cover; alt-text infrastructure; image ordering; source/master-file risk; orphaned-Blob risk; external-URL vs. Blob-URL distinction.
- Task 2.12 — Existing CRUD Workflow Consistency: **Planned.** Standardize create, edit, delete, redirect, invalid-ID, empty-state, deterministic-ordering, double-submit, and feedback behaviour across existing content types.
- Task 2.13 — Authentication, Session & Destructive Action Safety: **Planned.** Scope: server-action session checks; defense-in-depth; session invalidation; login/logout; redirect safety; safe error messages; delete and irreversible-action protection; Admin `noindex`.
- Task 2.14 — Map Editor & Complex Admin Tools Usability: **Planned.** Scope: pointer/touch; marker editing; coordinate feedback; table usability; form/preview relationship; Save/Cancel; mobile/tablet. Semantic zoom, the public Map Explorer, and KRUPNI map art direction remain Sprint 4 scope.
- Task 2.15 — Admin Accessibility, Responsive & Integration QA: **Planned.** Test Sprint 2's Admin, taxonomy, metadata, Creator Profile, upload, CRUD, authentication, and Map Editor systems together.
- Task 2.16 — Sprint 2 Roadmap Status Update / Sprint Close: **Planned.** Once Task 2.1–2.15 are complete, close Sprint 2 and mark Sprint 3 as the next sprint.

**Verified Audit Findings (Task 2.1)** — Code review of the Admin route tree, `proxy.ts`, `lib/auth.ts`, `lib/actions/*.ts`, `lib/validation.ts`, the two Blob upload API routes, every Admin form/list/CRUD component, `MapEditor`/`MapPinEditPanel`/`useMapPanZoom`, and the `db/schema.ts` map tables, plus a logged-in browser walkthrough of the Dashboard, Portfolio list/create form, and admin CSS breakpoints.

- **Strong systems to preserve as-is:** route protection (`proxy.ts` gates all of `/admin/*` except `/admin/login`); the Blob upload API routes independently verify the session before issuing an upload token; every dynamic edit route (`portfolio`, `sketches`, `3d`, `games`, `worldbuilding`, `worldbuilding/maps`, `services`) calls `notFound()` on an invalid ID; every delete action is behind a `window.confirm`; the shared `lib/validation.ts` boundary and `safeErrorMessage()` give every mutation consistent, non-leaking server-side validation; the Dashboard's stats and per-section counts are real, database-derived numbers, not decorative; deterministic list ordering is already correct; Admin `noindex,nofollow,nosnippet,noarchive` is set once at `app/admin/layout.tsx` and covers every route including login.
- **Critical findings:** none found.
- **High findings:** (1) Below 820px width, `.adm-sb{display:none}` hides the entire Admin sidebar with no replacement navigation of any kind (no hamburger, no drawer) — an admin on a phone or tablet who lands on any single Admin page cannot navigate to another section without editing the URL by hand. This covers both of the task's required test widths (390px and 768px). Verified directly in `app/globals.css`'s `@media(max-width:820px)` block and confirmed by real headless-Chrome screenshots at both widths in a follow-up pass (see below). (2) Server actions in `lib/actions/*.ts` perform no session check of their own — every mutation (including every `delete...`) is protected only transitively, because Next.js posts a Server Action back to the same `/admin/...` URL that `proxy.ts` already gates. This works today but leaves mutation authorization fully dependent on routing behavior rather than an explicit check at the mutation boundary itself.
- **Medium findings distributed to Task 2.2–2.8:** no empty-state message on any Admin list page when a content type has zero rows (2.5); no field-level validation messages, only one form-level error banner, and no required/optional field indicators beyond native HTML5 `required` (2.4); no "recently added/updated" item list or missing-required-field warnings on the Dashboard, only aggregate counts (2.3); no alt-text field anywhere in the schema for uploaded images (2.6); no upload progress percentage, only a static "Uploading…" label (2.6); no file-size ceiling on either Blob upload route (`maximumSizeInBytes` unset) (2.6); deleting or replacing a record's image/file never deletes the underlying Blob, so orphaned Blobs accumulate over time (2.6); the Map Editor's viewport pan only wires mouse events (`useMapPanZoom`), so touch-dragging the map itself isn't supported on mobile/tablet (pin repositioning already works on touch via Pointer Events) (2.8).
- **Low findings:** the per-row `SaveButton` (`formId` mode, used in table-row forms) disables optimistically for ~400ms instead of tracking real submission status, a narrower double-submit window than the standard nested-form case (2.5).
- **Left to later sprints:** semantic zoom, marker priority/zoom-visibility as real schema fields, the public Map Explorer, new pin layers, and KRUPNI map art direction all remain Sprint 4 scope, not Sprint 2 — confirmed by checking `map_locations` in `db/schema.ts`, which has no priority or zoom-range columns today; adding them is a schema decision that belongs with the Sprint 4 semantic-zoom work, not a Sprint 2 usability pass.
- **Task 2.2's locked starting scope:** ship a mobile/tablet Admin navigation replacement for the sidebar (the confirmed High finding above) alongside the already-planned active-section indication, shared page title/action area, and overflowing table/form field fixes.
- **390px/768px visually confirmed in a follow-up pass this session:** the interactive browser tool still can't shrink its real viewport below desktop width (same Task 1.16 limitation), so this was done instead via a scripted headless Chrome session driven over the DevTools Protocol (`Emulation.setDeviceMetricsOverride`), authenticated by minting a session JWT the same way `lib/auth.ts`'s `createSessionToken()` does — `ADMIN_PASSWORD` was never read or used. Real screenshots plus `scrollWidth`/`clientWidth` measurements were taken for the Dashboard, Portfolio list, Portfolio create form, and Map Editor at both widths. Results: (1) the sidebar-hidden-with-no-replacement finding above is confirmed visually, not just from CSS, on every one of those pages at both widths. (2) The Dashboard itself (stat cards, activity chart) has zero horizontal overflow at either width — a Preserve item. (3) At **390px**, three real, screenshot-visible horizontal overflows were found: the Portfolio list table (390px viewport, 460px content — the fixed-width `.adm-table` column budget, 130px per middle column plus 160px for Actions, leaves the Title column almost no room, so item titles stop being visible at all and Delete is clipped at the edge); the Portfolio create/edit form (390px viewport, 475px content — the `.adm-field-label-row` that pairs a label with its `FieldStyleControls` style pills doesn't wrap, pushing a pill off-screen); and the Map Editor (390px viewport, 716px content — its 6-column Pins table hits the same fixed-column budget problem, more severely). (4) At **768px**, none of the four pages measured any horizontal overflow — but the Map Editor's Pins table, specifically, squeezes its Title/name column to a near-unreadable ~88px there too (five fixed-width columns — Pin Type/Target/Icon/Coordinates/Actions — consume most of the 768px budget even without triggering a scrollbar), a real usability gap distinct from outright overflow. These are now confirmed findings for Task 2.2 (table and form-field overflow is already explicit in its scope) rather than open questions.

**Sprint 2 scope boundaries** — not part of this sprint: Home Page composition, public KRUPNI or Map Explorer, a new Projects system, a Stories or Devlog system, Portfolio public art direction, a multi-language system, public users, comments/likes/bookmarks/community, newsletter, multi-admin or role systems. These remain in their assigned future sprints or out of scope.

**Sprint 3 — Home Page + Home Admin** — Public Home: Identity Hero; Selected Work Coverflow; Capabilities/Focus Areas; Skills & Production Stats; Interactive KRUPNI Map; Worldbuilding Highlights; Latest Dispatches; Contact & Social. Home Admin: hero management; selection and ordering of at most 5–6 Featured Works; Capabilities; at most 5–6 skills shown on Home; automatic Production Stats visibility; map preview; Worldbuilding Highlights; Latest Dispatches; contact/social. Production Stats stay at general categories — 3D Works, 2D Works, Worldbuilding Entries, Game Projects, Stories & Devlogs, Published Entries — without adding overly specific subcategories to Home.

**Sprint 4 — Worldbuilding + Map Admin** — Visual listing/grid; taxonomy filters; a shared Content Detail Shell; Character, Location, Corporation, Technology, and Lore variations; Interactive Map Explorer; Worldbuilding relations and Admin tooling. No multi-universe system is required or built here.

**Sprint 5 — Game Design + Games Admin** — Game listing and detail; mechanics, systems, GDD, and development progress; taxonomy/software; Games Admin-specific fields.

**Sprint 6 — Projects + Projects Admin** — Project data model; listing and detail shell; media/process structure; Projects Admin.

**Sprint 7 — Portfolio + Portfolio Admin** — ArtStation-referenced masonry grid; search and taxonomy filters; media-heavy detail shell; image/video/3D presentation; expansion of the Portfolio editor.

**Sprint 8 — Stories, Lore & Devlog + Admin** — Text-heavy detail shell; blog/article structure; text and media blocks; Story/Lore relations; Devlog; expansion of Creator Stats counts. Independent writing must not be forced into the Worldbuilding taxonomy — see `01_INFORMATION_ARCHITECTURE.md`, section 3.

**Sprint 9 — Explore, About, Polish & Launch** — Global `/explore`; Featured/Latest/All; shared search and filters; `/about` = About + CV + Creator Profile; detailed Skills; automatic Production Stats; final public and Admin UI/UX polish; launch QA. The single public Creator Profile (Ege Demir Ünal / TETSUNARU) lives on `/about`.

**Sprint 10 — Multi-Language Translation** — *Post-launch, optional.* Turkish, English, Japanese, Simplified Chinese. Translation Manager; taxonomy translations; Creator Profile translations; multilingual search; locale URLs and hreflang. Must not block the first completed version.

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
- Task 2.1 — Admin Panel Audit & Scope Lock: Complete.
- Task 2.2 — Admin Shell, Navigation & Responsive Layout: Complete.
- Task 2.3 — Admin Dashboard & Content Overview: Complete.
- Task 2.4 — Shared Admin Form System: Complete.
- Task 2.5 — Permanent Browser QA Harness: Next.
- Task 2.6 — Controlled Taxonomy Data Model: Planned.
- Task 2.7 — Metadata Manager Admin UI: Planned.
- Task 2.8 — Portfolio Metadata Selectors & Legacy Migration: Planned.
- Task 2.9 — Admin Content Editor Shell: Planned.
- Task 2.10 — Creator Profile & Skills/Stats Foundation: Planned.
- Task 2.11 — Media Upload & Asset Management Hardening: Planned.
- Task 2.12 — Existing CRUD Workflow Consistency: Planned.
- Task 2.13 — Authentication, Session & Destructive Action Safety: Planned.
- Task 2.14 — Map Editor & Complex Admin Tools Usability: Planned.
- Task 2.15 — Admin Accessibility, Responsive & Integration QA: Planned.
- Task 2.16 — Sprint 2 Roadmap Status Update / Sprint Close: Planned.
- The Admin Panel, CRUD systems, and public map foundation already exist and are being extended, not built from zero.
- No second Worldbuilding universe is planned scope.

## 9. Roadmap Update Protocol

At the end of every completed sprint: update the sprint status, record the next active sprint, add only important scope changes, move deferred features to the correct future sprint. Do not rewrite the entire roadmap. Do not duplicate information already documented elsewhere.
