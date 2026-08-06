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
- Task 2.4 — Shared Admin Form System: **Planned.** Make repeated Admin form fields and form feedback consistent. Scope: label, input, textarea, select, and checkbox (already consistent — preserve); help text; required/optional field indicators **(confirmed missing beyond the native HTML5 `required` attribute)**; field-level validation messages **(confirmed missing — only a single form-level error banner exists; server validation errors are not mapped to individual fields)**; Save/Saving/Success/Error states (Save/Saving already implemented via `SaveButton` — preserve); Cancel and back-navigation behaviour; form error summary (exists in its single-banner form); accessibility. Only genuinely reused parts are consolidated.
- Task 2.5 — Existing CRUD Workflow Consistency: **Planned.** Bring the listing, create, edit, and delete flows of existing content types to a common standard. Areas: Portfolio, Sketches, 3D Models, Games, Worldbuilding, Maps, About, CV, Archive, Site Settings. Scope: Create/Edit consistency (already uniform across all 7 content types with dynamic edit routes — preserve), post-save redirect (already consistent — preserve), success/error feedback, server-side validation (already consistent, shared `lib/validation.ts` boundary — preserve), invalid-ID behaviour (already consistent — every `[id]/edit` route calls `notFound()` — preserve), empty state **(confirmed missing — no list page shows a message when a content type has zero items)**, deterministic ordering (already correct — preserve), double-submit protection (mostly solid via `SaveButton`'s `useFormStatus`; the per-row `formId` variant only disables optimistically for ~400ms — minor gap), safe delete confirmation (already implemented via `window.confirm` on every delete path — preserve). Excludes adding Project, Story, or Devlog CRUD.
- Task 2.6 — Media Upload & Asset Management Hardening: **Planned.** Make the existing Vercel Blob upload flow safer and clearer. Scope: upload progress state **(confirmed weak — a static "Uploading…" label only, no percentage/progress bar)**, file type validation (already enforced server-side via `allowedContentTypes` — preserve) and file **size** validation **(confirmed missing — no `maximumSizeInBytes` set on either blob route)**, failed-upload feedback (already implemented — preserve), image preview (already implemented — preserve), alt text **(confirmed missing — no `alt` column anywhere in the schema; public rendering falls back to the item's title)**, image ordering (already implemented via `sortOrder` — preserve), cover image, orphaned-Blob risk **(confirmed real — deleting a record or replacing an image/file never deletes the underlying Blob)**, source/master-file upload risk (the general-file route's allow-list already excludes PSD/EXR/TIFF/BLEND — preserve, but has no size ceiling either), external-URL vs. Blob-URL distinction (both are freely intermixed by design — working as intended, not a defect). Excludes building a new CDN or standalone media library.
- Task 2.7 — Admin Authentication, Session & Destructive Action Safety: **Planned.** Audit owner-only Admin access and sensitive mutation operations for security and fix verified issues. Scope: Admin route protection (already solid — `proxy.ts` gates every `/admin/*` path except `/admin/login` — preserve), login and logout (already working — preserve), session invalidation (already working — JWT cookie cleared on logout — preserve), **unauthorized server action calls (confirmed gap — every mutation in `lib/actions/*.ts` performs no independent session check of its own; protection is entirely transitive through `proxy.ts`'s pathname match, which happens to work today only because actions always post back to their own `/admin/...` page URL)**, safe redirects (already fine — all redirects are hardcoded internal paths — preserve), safe error messages (already solid via `safeErrorMessage()` — preserve), delete/irreversible-action confirmation (already implemented — preserve), double-submit protection (see Task 2.5), Admin `noindex` (already correctly set site-wide on `app/admin/layout.tsx` — preserve). The two Blob upload API routes were separately verified to check the session directly and are not part of this gap. Excludes public login, multi-admin, role systems, or OAuth.
- Task 2.8 — Map Editor & Complex Admin Tools Usability: **Planned.** Improve the existing Map Editor and complex Admin tools for general usability. Scope: marker creation and editing (already working — click-to-place, drag-to-reposition via Pointer Events — preserve), normalized coordinates (already implemented, 0–100 range — preserve), optional content relationships (already implemented — lore entry or sub-map target — preserve), map image selection, form/preview relationship, **mobile/tablet usability (confirmed gap — the map viewport's pan/zoom (`useMapPanZoom`) only wires mouse events; there is no touch panning, only mouse-wheel zoom; pin repositioning itself does use Pointer Events and already works on touch)**, invalid-data feedback, Save/Cancel behaviour (already implemented — preserve). **Zoom visibility ranges and priority are not yet real fields on `map_locations` in the schema** — the task's scope wording is corrected to: usability of what already exists, not adding these fields; introducing them is a schema decision tied to semantic zoom and is left, along with semantic zoom itself, to Sprint 4. Leaves semantic zoom, public Map Explorer, new pin layers, and KRUPNI map art direction to Sprint 4.
- Task 2.9 — Admin Accessibility, Responsive & Integration QA: **Planned.** Test the Admin systems developed throughout Sprint 2 together. Scope: desktop/tablet/mobile Admin, keyboard and focus-visible, form label and error accessibility, touch targets, table/form overflow, login/logout, unauthorized access, CRUD and validation, upload behaviour, dashboard, Map Editor, Admin noindex, type-check/lint/production build, local and production smoke QA. Excludes creating or deleting test content in production data.
- Task 2.10 — Sprint 2 Roadmap Status Update / Sprint Close: **Planned.** Verify Task 2.1–2.9 status, close Sprint 2, and mark Sprint 3 as the next sprint. Acceptance criteria: Task 2.1–2.9 Complete; Admin ready for daily use; owner-only access preserved; CRUD flows consistent; media upload safe; Admin responsive and accessible; build, lint, and type-check pass; production smoke QA complete; Sprint 2 Complete; Sprint 3 Next.

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
- Task 2.1 — Admin Panel Audit & Scope Lock: Complete.
- Task 2.2 — Admin Shell, Navigation & Responsive Layout: Complete.
- Task 2.3 — Admin Dashboard & Content Overview: Complete.
- Task 2.4 — Shared Admin Form System: Next.
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
