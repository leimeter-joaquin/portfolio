## Why

The `content/` package builds a typed `dist/index.json` (real hero, six real project engagements, eight techs), but the `app/` package never consumes it — `@portfolio/content` is not even a dependency of `app`, and there is no import path or alias. Every section renders from `app/src/data/mock.ts`: fake projects (Payment / Internal training / Headless commerce), a stale experience list (Radium-Rocket / Mark Audio / ESL), and an empty LinkedIn link. This change makes content the single source of truth for all visible data.

## What Changes

- **Extend the hero content schema** to carry the copy the app actually displays — `eyebrow`, `headline`, `accentPhrase`, `bio` — alongside the existing `name/statusBadge/tagline/description` (retained for future AI/RAG). Populate `hero.md` with the current live copy so the migration is visually lossless.
- **Add a `site` content doc** (`site.md` + `SiteSchema`) holding `contact { location, email, github, linkedin }` and `cv { path, label }`, with the corrected real links.
- **Add an `experience` content collection** (`experience/*.md` + `ExperienceSchema`) holding the real career timeline (role, company, dates, summary), replacing the stale mock roles.
- **Update `content/src/build.ts`** to load `site` and `experience` and emit them in `index.json`.
- **Add `@portfolio/content` as an `app` dependency** and consume `@portfolio/content/data`, replacing `app/src/data/mock.ts` with a typed `content.ts` re-export module.
- **Map content projects to the existing `ProjectCard` view model** (content projects lack `gradient/featured/summary/thumbnailLabel`): derive `featured` (current role / most recent), `summary` (first highlight), `href` (live ?? repo), tag chips from `stack`, and assign gradients from a palette. Keep the loved featured + two-secondary layout.
- **Rewire** `Hero`, `Projects`, `ProjectCard`, `Experience`, `Header`, and `Footer` to read from content. This fixes the blank LinkedIn and the hardcoded wrong LinkedIn handle text in the hero aside.
- **Delete** `app/src/data/mock.ts`.

No visual/layout/animation changes here — pure data plumbing. The dark/light ripple toggle is untouched. The `server/` package stays dormant.

## Capabilities

### New Capabilities

- `content-hero`: Hero schema carries the displayed copy (eyebrow/headline/accentPhrase/bio) plus AI/RAG fields; `hero.md` is the source.
- `content-site-config`: `site` doc is the single source for contact identity (location/email/github/linkedin) and CV path/label.
- `content-experience`: `experience` collection holds the real career timeline, emitted in `index.json`.
- `app-content-binding`: All app sections read from `@portfolio/content/data`; `mock.ts` removed.

### Modified Capabilities

_(none — `openspec/specs/` is empty; prior changes were not synced to the canonical specs folder, so this introduces fresh capability specs.)_

## Impact

- `content/src/schemas/hero.ts` — add eyebrow/headline/accentPhrase/bio
- `content/src/schemas/site.ts` (new), `content/src/schemas/experience.ts` (new)
- `content/src/markdown/hero.md` — add displayed copy frontmatter
- `content/src/markdown/site.md` (new), `content/src/markdown/experience/*.md` (new)
- `content/src/build.ts` — load + emit `site` and `experience`
- `app/package.json` — add `@portfolio/content` dep
- `app/src/data/content.ts` (new) — typed re-export of content slices + project view-model mapping
- `app/src/data/mock.ts` — deleted
- `app/src/components/sections/{Hero,Projects,Experience}.astro`, `app/src/components/{ProjectCard,Header,Footer}.astro` — consume content
- `app/astro.config.mjs`, `app/tsconfig.json` — alias fallback if package export does not resolve
