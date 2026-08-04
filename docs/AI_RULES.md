# AI Rules

This document is the permanent instruction manual for every future development task on this project. It governs how work is planned, designed, and implemented from this point forward.

## PROJECT IDENTITY

This is **not** just a portfolio website.

It is a long-term personal platform combining:

- Portfolio
- Worldbuilding
- Game Design
- Storytelling
- Development Blog
- Creative Journal

The website should feel like entering a living universe — not a static collection of pages.

## SINGLE SOURCE OF TRUTH

Every document inside `/docs` is the only source of truth for this project.

Never contradict these documents.

If a future task conflicts with them, stop and explain the conflict instead of guessing.

## DEVELOPMENT PRINCIPLES

Prioritize:

- Maintainability
- Readability
- Modularity
- Accessibility
- Performance

Preserve reasonable extensibility only where it supports confirmed requirements — do not build abstractions for hypothetical future scenarios.

Avoid disposable hacks, but do not over-engineer small or well-defined tasks. A simple, stable implementation is preferable to speculative architecture.

## DESIGN PRINCIPLES

The design language must always be:

- Minimal
- Premium
- Professional
- Atmospheric
- Immersive
- Modern
- Elegant

Do **not** use:

- Generic portfolio templates
- Heavy glassmorphism
- Flashy cyberpunk UI
- Overly rounded components
- Random colors
- Inconsistent spacing

## USER EXPERIENCE PRINCIPLES

Every page must answer:

1. What is this?
2. Why should I care?
3. Where do I go next?

Navigation must always be obvious.

Animations must support usability — never distract from it.

## WORLDBUILDING PRINCIPLES

Worldbuilding is one of the core pillars of this website.

It must never feel like a separate blog. The overall platform should feel coherent, while individual content may remain independent.

Stories, characters, maps, companies, continents, projects, and game design may connect where the relationship is real and adds value — connection is never forced to complete a template.

## CODE PRINCIPLES

- Always reuse components.
- Never duplicate code.
- Keep components modular.
- Prefer composition over duplication.
- Keep files organized.
- Use semantic naming.
- Avoid unnecessary dependencies.

## BEFORE EVERY TASK

Before starting any implementation:

- Read every file inside `/docs`.
- Follow them.
- Never ignore them.

If documentation is missing, ask for clarification instead of making assumptions.

## RESPONSE FORMAT

Whenever a new task is given:

1. Explain the implementation plan.
2. Mention which files will change.
3. Implement.
4. Summarize what changed.
5. Mention possible improvements for later.

# Documentation Rules

Always treat the documentation inside /docs as the single source of truth.

Never make assumptions when documentation already exists.

If documentation conflicts with a request,
explain the conflict before implementing.

Never overwrite project decisions without explicit approval.

Always update the corresponding documentation when introducing a structural change.

# Project Awareness

Remember that this website has a clear initial completion point (approximately 2–3 weeks), after which it may remain technically unchanged for roughly a year while the owner continues publishing content. It is not a system under mandatory continuous expansion.

Do not optimize for short-term solutions.

Where a real relationship exists, preserve the connection between

- Portfolio
- Worldbuilding
- Stories
- Projects
- Game Design

Do not invent a connection where none exists — independent content in each of these areas is valid.

# Product Scope Rules

- Never introduce public accounts, comments, likes, reactions, bookmarks, followers, community systems or public-account notifications without explicit approval.
- Never treat email updates as an approved current feature.
- Never create a multi-universe system unless a second universe is explicitly approved.
- Treat KRUPNI as the only active Worldbuilding universe.
- Allow independent Stories and Writing outside KRUPNI.
- Never invent relationships between unrelated content.
- Do not block standalone content from publication.
- Do not assume constant feature development after launch.
- Do not build systems for unknown future scenarios.
- A completed and stable system may remain unchanged.
- Content growth does not automatically require architectural expansion.

# Decision Rules

When multiple solutions are possible:

- Choose the simplest maintainable solution that satisfies confirmed requirements.
- Choose the most maintainable solution.
- Prefer readability over cleverness.
- Preserve reasonable extensibility without delaying confirmed implementation work.
- Explain trade-offs before implementation.
- Never make architectural decisions without explaining the reason.

# Component Rules

Shared, repeated, or complex components should be:

- Reusable
- Modular
- Accessible
- Responsive
- Documented where their behaviour is not obvious

A page-specific component may remain local when it has only one real consumer — do not create abstraction merely because reuse might happen someday. Promote a component to the shared layer only once reuse is confirmed.

Always inspect existing components before creating a new one, and never duplicate a component that already solves the same problem.

# Content Rules

Never generate placeholder content as final content.

Every piece of content should have a purpose.

Content should always support one or more of the project's core pillars.

Avoid unnecessary text.

Prefer quality over quantity.

# Performance Rules

Always optimize for performance.

Lazy load heavy assets.

Optimize images.

Avoid unnecessary JavaScript.

Prefer server-side rendering when appropriate.

Do not introduce animations that negatively affect performance.

# UI Consistency Rules

Every new UI element must follow the Design System.

Spacing, typography, colors, radius and animations must remain consistent.

Never introduce a different visual language inside the same project.

Consistency is more important than novelty.

# Worldbuilding Integration

Worldbuilding is not an isolated section, but its relationships to other content are optional and intentional, not mandatory.

Where a real relationship exists, it may connect to:

- Projects
- Characters
- Stories
- Companies
- Continents
- Technologies
- Timeline
- Games

Do not invent a connection to satisfy this list. A Worldbuilding entry, or any of the content types above, may stand entirely on its own. Where genuine relationships exist, the website should make them easy to discover.

# SEO & Accessibility

Every page should:

- Have semantic HTML.
- Include proper headings.
- Include metadata.
- Be keyboard accessible.
- Have descriptive alt text.
- Be screen-reader friendly.