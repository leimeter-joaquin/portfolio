# Feature: app-content integration

## Goal
Wire `app` to consume `@portfolio/content` so all page data comes from markdown files instead of being hardcoded in components.

## Scope
- Replace hardcoded data in `Hero.astro`, `Projects.astro`, and `Expertise.astro` with data imported from `@portfolio/content/data`
- Out of scope: adding new content fields, changing the UI, or modifying the content schema

## Constraints
- `content` must be built before `app` — the root `npm run build` already handles this order
- `app` imports JSON, not TypeScript — use `@portfolio/content/data` (resolves to `dist/index.json`)
- The `Expertise` section currently uses hardcoded `cards` (Frontend, Backend, Cloud). The `techs` collection in content is the source of truth for this going forward — the schema may need a field added if the card icon isn't there yet
- Project images are currently local assets in `app/src/assets/projects/`. Decide whether to keep them there or move image references into content frontmatter before implementing

## Acceptance criteria
- [ ] `Hero.astro` reads `statusBadge`, `name`, `tagline`, and `description` from `content.hero`
- [ ] `Projects.astro` renders from `content.projects` — no hardcoded project data remains
- [ ] `Expertise.astro` renders from `content.techs` — no hardcoded cards remain
- [ ] `npm run build` (from root) succeeds end-to-end
