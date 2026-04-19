# RAG feature — overview & decisions

This directory covers the full AI Q&A feature: a server endpoint that answers questions about Joaquin using the content index, and a frontend UI for users to ask those questions.

## Files

- `_overview.md` — this file. Tech decisions to agree on before building.
- `server.md` — server endpoint, RAG logic, rate limiting.
- `chat-ui.md` — frontend chat input and response display.

## Build order

1. Agree on the decisions below
2. Implement `server.md`
3. Implement `chat-ui.md`

---

## Decision 1 — RAG approach

The content index (`dist/index.json`) is small — a few thousand words of plain text across all projects and techs. This means we can skip vector embeddings and a vector database entirely and use **context stuffing**: include all content in the system prompt on every request.

**Recommended:** context stuffing. Simple, no extra infrastructure, works well at this content size. If content grows significantly later, switch to embeddings.

## Decision 2 — AI provider (free tier)

Three good options for a free, simple setup:

| Provider          | Model             | Free tier                | Notes                                 |
| ----------------- | ----------------- | ------------------------ | ------------------------------------- |
| **Google Gemini** | Gemini 1.5 Flash  | 15 req/min, 1M req/month | Generous, easy setup, good quality    |
| **Groq**          | Llama 3 / Mixtral | ~14,400 req/day          | Very fast inference, simple API       |
| **Cohere**        | Command R         | 1,000 req/month (trial)  | Lower limit but RAG-specific features |

**Recommendation:** Gemini 1.5 Flash. Most generous free tier, reliable, straightforward REST API.

Pick one before implementing `server.md` and add the API key as an env var (`GEMINI_API_KEY` / `GROQ_API_KEY`).

## Decision 3 — Rate limiting strategy

5 questions per user, enforced in both BE and FE.

- **Backend:** rate limit by IP address. Simple in-memory store is fine for a portfolio — no Redis needed. Reset on server restart.
- **Frontend:** track count in component state, disable input and show a message after 5.

Backend is the source of truth. Frontend limit is UX only (not a security control).

## Decision 4 — HTTP framework for server

Not yet decided. Simple options for a TypeScript Node server:

| Option      | Notes                                                           |
| ----------- | --------------------------------------------------------------- |
| **Hono**    | Lightweight, fast, first-class TypeScript, good for simple APIs |
| **Express** | Familiar, widely documented, more boilerplate                   |
| **Fastify** | Fast, good TypeScript support, slightly more setup              |

**Recommendation:** Hono. Minimal setup, clean TypeScript API, no overhead.
