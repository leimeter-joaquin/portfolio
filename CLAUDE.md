# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code style

Always run `npm run format` from the repo root after making code changes.

## Commands

All commands run from the repo root unless noted:

```bash
npm run dev       # Start dev server at localhost:4321
npm run build     # Build production site to ./dist/
npm run preview   # Preview production build locally
npm run format    # Format code with Prettier
```

## Monorepo structure

```
portfolio/
├── app/        # Astro frontend
├── content/    # Content pipeline — markdown → typed JSON + AI index
├── server/     # AI API server (technology TBD)
└── CLAUDE.md
```

npm workspaces are configured at the root. Build order matters: `content` must build before `app` and `server`, since both consume its output.

```bash
# Root-level — builds all packages in order
npm run build
```

### How the packages relate

**`content` → `app`:** The app imports `@portfolio/content/data` (resolves to `content/dist/index.json`) to populate sections like Hero, Projects, and Expertise. It also imports Zod schemas from `@portfolio/content/schemas/*` for type safety.

**`content` → `server`:** The server consumes `content/dist/index.json` as its knowledge base. The `documents` array in that file is a flattened, AI-friendly representation of all content (title, tags, plain text body, URL) designed specifically for semantic search / RAG.

**`server` → `app`:** The frontend calls the server API so users can ask natural language questions about Joaquin. The server uses the content index to answer with grounded, accurate responses.

### `app` architecture

Pages in `src/pages/` import section components and wrap them in `src/layouts/Layout.astro`, which provides the global shell (HTML head, Header, Footer, fonts, global CSS). The index page composes sections sequentially: Hero → Expertise → Projects. A separate `/contact` page exists with a `ContactForm` section.

Styles use SCSS with [Gorko](https://github.com/andy-bell/gorko) as a utility-class generator. See `app/CLAUDE.md` for full CSS conventions.

## Working with specs

Feature specs live in `.claude/specs/`. To implement a feature, reference its spec file:

> "implement `.claude/specs/feature-name.md`"

Move completed specs to `.claude/done/` after shipping. Use Notion for backlog/ideation; convert to a spec file when ready to build.
