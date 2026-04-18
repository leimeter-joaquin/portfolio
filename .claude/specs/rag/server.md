# Feature: rag-server

## Goal
Build a single API endpoint that accepts a user question, uses the content index as context, and returns a grounded AI-generated answer — with a 5-question-per-IP rate limit.

## Scope
- HTTP server setup (framework TBD in `_overview.md`)
- `POST /api/ask` endpoint
- Context stuffing with `@portfolio/content/data`
- AI provider integration (provider TBD in `_overview.md`)
- In-memory IP-based rate limiting (5 requests max)
- Out of scope: authentication, persistent storage, streaming responses, vector embeddings

## Design / behaviour

### `POST /api/ask`

**Request body:**
```json
{ "question": "string" }
```

**Response (success):**
```json
{
  "answer": "string",
  "questionsRemaining": 3
}
```

**Response (rate limited):**
```json
{ "error": "limit_reached", "questionsRemaining": 0 }
```
HTTP status: `429`

**Response (bad request):**
```json
{ "error": "invalid_request" }
```
HTTP status: `400`

### Rate limiting
- Track request count per IP address in a plain in-memory `Map`
- Reject requests with a `429` once the count reaches 5
- Counter resets on server restart (acceptable for a portfolio)
- Include `questionsRemaining` in every successful response so the FE can stay in sync

### AI prompt structure
- **System prompt:** introduce Joaquin, instruct the model to answer only from the provided context, and paste the full `documents[]` plain text
- **User message:** the question as-is
- Keep answers concise — 2–4 sentences unless the question warrants more

### CORS
- Allow requests from the app origin in development (`localhost:4321`) and production domain

## Constraints
- Read content from `@portfolio/content/data` at startup — do not re-read on every request
- API key must come from an environment variable — never hardcoded
- Do not expose the raw content index in any response
- Keep the in-memory rate limit store simple — a `Map<string, number>` is sufficient

## Acceptance criteria
- [ ] `POST /api/ask` returns a valid answer for a reasonable question about Joaquin
- [ ] Returns `429` with `questionsRemaining: 0` on the 6th request from the same IP
- [ ] `questionsRemaining` in the response is accurate
- [ ] Server reads the content index once at startup
- [ ] API key is loaded from env, server fails to start if it is missing
- [ ] CORS configured for app origin
- [ ] `npm run dev:server` starts the server
