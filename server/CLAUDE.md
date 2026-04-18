# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in the `server/` package.

## Purpose

`@portfolio/server` is an AI-powered API that answers natural language questions about Joaquin. It loads the content index built by `@portfolio/content` and uses it as a knowledge base to generate grounded responses.

The frontend (`app`) calls this server so visitors can ask questions like "What technologies does Joaquin know?" or "Tell me about his projects."

## Commands

Run from `server/`:

```bash
npm run build   # tsc → compiles to dist/
npm run dev     # node --watch dist/index.js (requires build first)
```

## Architecture (TBD)

HTTP framework, AI provider, and RAG strategy are not yet decided. When chosen, document them here:

- **HTTP framework:** TBD
- **AI provider / model:** TBD
- **Search / RAG:** TBD (the `documents[]` array in `@portfolio/content/data` is the knowledge base)

## Content integration

Import the built content index to access the knowledge base:

```ts
import content from "@portfolio/content/data" assert { type: "json" };
// content.documents — flat AI-ready entries
// content.projects  — full project documents
// content.techs     — full tech documents
// content.hero      — hero/bio document
```
