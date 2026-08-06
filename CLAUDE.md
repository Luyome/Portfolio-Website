@AGENTS.md

# Project Instructions

This repository contains the development and maintenance of my personal website.

## Context Loading

Before implementing a task:

1. Read `AGENTS.md`.
2. Read `docs/08_ROADMAP.md`.
3. Read only the documentation directly relevant to the current task.
4. Consult additional documents only when a conflict, structural decision, or missing requirement appears.
5. Read every document inside `/docs` only for project-wide planning, architecture, scope-alignment, or documentation-consistency tasks.

Treat applicable documentation as the single source of truth.

## Documentation Priority

When multiple documents apply, use this priority order:

1. AGENTS.md
2. docs/AI_RULES.md
3. docs/00_PRODUCT_VISION.md
4. docs/01_INFORMATION_ARCHITECTURE.md
5. docs/02_CONTENT_ARCHITECTURE.md
6. docs/03_BRAND_IDENTITY.md
7. docs/04_DESIGN_SYSTEM.md
8. docs/05_COMPONENT_LIBRARY.md
9. docs/06_MOTION_SYSTEM.md
10. docs/07_TECHNICAL_ARCHITECTURE.md
11. docs/08_ROADMAP.md

Never violate an applicable documented rule.

If documentation conflicts with a request, explain the conflict before writing code.

## Implementation Workflow

Before editing, silently inspect:

- Git status
- Existing implementation
- Relevant files
- Available scripts
- Version-sensitive local documentation when required by AGENTS.md

Stop before implementation only when:

- Unrelated uncommitted changes may be endangered
- Documentation conflicts
- A dependency, schema, or migration change requires approval
- An owner decision is genuinely required

Otherwise proceed directly with implementation.

During implementation:

- Preserve working systems.
- Keep components reusable where reuse is confirmed.
- Preserve the design system.
- Prefer the simplest maintainable solution.
- Avoid speculative over-engineering.
- Never redesign or refactor unrelated sections.

## Validation

Run the relevant available checks:

- Type-check
- Lint
- Production build

Inspect the final diff and confirm that no unrelated files changed.

Update `docs/08_ROADMAP.md` only after successful validation.

## Responsive QA

For responsive smoke QA, first use `npm run qa:responsive` (`scripts/responsive-qa.mjs`).

- Do not install a temporary Puppeteer/Playwright dependency for this.
- Never run a command that closes all Chrome processes — the script only closes the Chrome process it launched itself.
- This script does not replace manual visual QA.

## Final Response

Keep the final response concise and include only:

1. Modified files
2. Implemented result
3. Validation results
4. Remaining limitations, if any
5. Roadmap status

Do not repeat the task, project summary, documentation summaries, preflight process, or unchanged behaviour.

Wait for the next task after reporting the result.