# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in the `content/` package.

## Purpose

`@portfolio/content` is a build-time content pipeline. It reads markdown files, validates their frontmatter with Zod schemas, and emits a single `dist/index.json` consumed by both `app` and `server`.

## Commands

Run from `content/`:

```bash
npm run build   # tsc + node dist/build.js → writes dist/index.json
```

## How it works

`src/build.ts` walks `src/markdown/`, routes files by directory name (`hero`, `projects`, `techs`), parses frontmatter with `gray-matter`, validates against the matching Zod schema, and writes `dist/index.json`.

Each document gets three extra fields appended beyond its frontmatter:
- `bodyMarkdown` — raw markdown body
- `bodyText` — plain text version (markdown stripped) for AI/RAG use
- `sourcePath` — relative path to the source file

## Output shape (`dist/index.json`)

```
{
  hero,        // single HeroDocument
  projects[],  // ProjectDocument[]
  techs[],     // TechDocument[]
  documents[]  // flat AI index — one entry per project (more types TODO)
}
```

`documents` is the RAG-friendly view: each entry has `{ id, type, title, slug, tags[], text, url }` where `text` is a single concatenated string of all searchable content. This is what the server uses for semantic search.

## Adding content

- **New entry:** add a `.md` file in the matching `src/markdown/<type>/` directory with the required frontmatter fields.
- **New content type:** create a Zod schema in `src/schemas/`, add a collection array in `build.ts`, and add a routing branch in the `for` loop. Also add an entry to `documents` if it should be AI-searchable.

## Exports (consumed by other packages)

```json
"@portfolio/content/schemas/*"  →  dist/schemas/*.js   (Zod schemas + types)
"@portfolio/content/data"       →  dist/index.json     (built content)
```
