## ADDED Requirements

### Requirement: Hero content carries displayed copy

The hero content document SHALL define the fields the app renders — `eyebrow`, `headline`, `accentPhrase`, and `bio` — in addition to the existing `name`, `statusBadge`, `tagline`, and `description` fields retained for AI/RAG indexing. The build SHALL validate these fields and emit them under `hero` in `index.json`.

#### Scenario: Hero document is built

- **WHEN** `npm run build:content` runs
- **THEN** `dist/index.json` `hero` includes `eyebrow`, `headline`, `accentPhrase`, and `bio` matching `hero.md` frontmatter
- **AND** the existing `name`, `statusBadge`, `tagline`, `description` fields remain present

#### Scenario: Required hero copy missing

- **WHEN** `hero.md` omits a required displayed field (e.g. `headline`)
- **THEN** the build fails with a schema validation error
