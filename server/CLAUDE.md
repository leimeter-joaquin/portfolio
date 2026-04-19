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

## Architecture

- **HTTP framework:** Hono + `@hono/node-server`
- **AI provider / model:** Google Gemini 1.5 Flash (`@google/generative-ai`)
- **Search / RAG:** Context stuffing — all `documents[]` are included in the system prompt on every request
- **Rate limiting:** In-memory `Map<string, number>` keyed by IP, 5 requests max, resets on restart

## Environment variables

| Variable         | Required | Description                                                                      |
| ---------------- | -------- | -------------------------------------------------------------------------------- |
| `GEMINI_API_KEY` | Yes      | Google Gemini API key — server exits on startup if missing                       |
| `APP_ORIGIN`     | No       | Production app origin added to CORS allowlist (e.g. `https://yourportfolio.com`) |
| `PORT`           | No       | Port to listen on (default: `3001`)                                              |

## Content integration

Import the built content index to access the knowledge base:

```ts
import content from "@portfolio/content/data" with { type: "json" };
// content.documents — flat AI-ready entries
// content.projects  — full project documents
// content.techs     — full tech documents
// content.hero      — hero/bio document
```
