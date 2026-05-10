## Why

The app was reset to a clean Astro shell by `clean-slate-app-reset`, leaving only theme bootstrap and a placeholder home panel. We now have approved Hero designs (light + dark) for the next portfolio iteration and need to rebuild the home page against them with section-based Astro components, SCSS, AnimeJS-driven motion, and a redesigned light/dark toggle. Backend wiring lands later; this iteration is design-faithful UI on mock data.

## What Changes

- Rebuild `app/src/pages/index.astro` as a single-page portfolio composing Hero, Projects, and Experience sections plus a Footer
- Add a top-level site `Header` with logo + tagline, anchor nav (Work, About, Stack), and a "Let's Talk" pill CTA
- Add `Hero` section with two-column layout: large headline ("I build the whole system, interface to infrastructure." with accent-highlighted "whole system"), bio paragraph, and a meta block (location, email, github, linkedin)
- Add `Projects` section ("Things I've shipped") with one featured card and two secondary cards laid out in the design grid; cards use gradient placeholder thumbnails plus title, summary, and tag chips
- Add `Experience` section ("Where I've worked") rendering a date-paired timeline of roles
- Add `Footer` section with socials and copyright
- Add `mock` content module under `app/src/data/` (TypeScript) exporting hero, projects, experience, and contact mocks consumed by the section components — backend integration is deferred
- **BREAKING**: Replace the View Transitions API + CSS clip-path theme expand in `Layout.astro` with an AnimeJS-driven SVG circle overlay that expands from the toggle's coordinates; works in all evergreen browsers, falls back to instant theme swap when `prefers-reduced-motion` is set
- Add scoped SCSS per-section under each component using BEM, with shared design tokens (colors, type scale, spacing) defined in `app/src/css/_tokens.scss` and surfaced as CSS custom properties in `Layout.astro`
- Wire AnimeJS for: hero headline reveal on load, project card hover lift, and theme-toggle expand
- Keep `AIChat.vue` dormant; do not mount in this change

## Capabilities

### New Capabilities

- `site-header`: Persistent top bar with brand mark, anchor nav, and CTA pill
- `hero-section`: Headline + bio + contact meta block matching approved design
- `projects-section`: Featured + secondary project cards driven by mock data
- `experience-section`: Timeline of roles driven by mock data
- `site-footer`: Footer strip with socials and copyright
- `mock-content`: Typed mock data module consumed by sections until backend lands
- `anime-theme-toggle`: AnimeJS-powered light/dark expand effect originating from the toggle, replacing prior View Transitions API implementation; preserves persisted preference and `prefers-reduced-motion` fallback
- `design-tokens`: Shared SCSS tokens + CSS custom properties for color, type, and spacing
- `home-composition`: Single-page home that composes Hero, Projects, Experience, and Footer sections with anchor nav targets, replacing the prior clean-slate placeholder panel

### Modified Capabilities

_(none — `openspec/specs/` is empty; prior capabilities from `clean-slate-app-reset` have not yet been synced to the canonical specs folder, so this change introduces fresh capability specs rather than deltas)_

## Impact

- `app/src/pages/index.astro` — rewritten to compose section components
- `app/src/layouts/Layout.astro` — header/footer slots removed in favor of dedicated components; theme transition logic swapped to AnimeJS overlay; design tokens exposed as CSS custom properties
- `app/src/components/Header.astro` (new), `app/src/components/Footer.astro` (new), `app/src/components/ThemeToggle.astro` (new, extracted from Layout)
- `app/src/components/sections/Hero.astro`, `Projects.astro`, `Experience.astro` (new)
- `app/src/components/ProjectCard.astro` (new, used by Projects section)
- `app/src/data/mock.ts` (new) — typed mock for hero copy, projects, experience, contact info
- `app/src/css/_tokens.scss` (new), `app/src/css/globals.scss` (new minimal reset + token surfacing)
- `app/package.json` — confirm `animejs` v4 dep present; no other runtime additions
- `app/src/components/AIChat.vue` — untouched
- No content/server package changes; all data is local mock
