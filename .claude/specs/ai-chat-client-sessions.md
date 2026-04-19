# Feature: AI chat — client sessions via UUID token

## Goal

Replace IP-based rate limiting with a persistent UUID token so that:

- Each browser gets a stable identity across tabs and reloads
- Full conversations are stored server-side in KV (no database needed)
- Sessions expire automatically after 4 hours, resetting the question count

## Scope

- Generate a UUID on first visit, persist it in `localStorage`
- Send it as `X-Client-ID` header on every API request
- Server stores a session object (count + messages) in KV, keyed by UUID
- KV TTL of 4 hours handles expiry — no cron job required
- Out of scope: hard auth, cross-device identity, admin UI for conversations

## Data model

KV key: the UUID string (e.g. `"550e8400-e29b-41d4-a716-446655440000"`)

KV value (JSON-serialised `Session`):

```ts
type Message = {
  role: "user" | "ai";
  text: string;
  ts: number; // Unix ms
};

type Session = {
  count: number;        // questions asked so far
  messages: Message[];  // full conversation
  createdAt: number;    // Unix ms — when the session was first created
};
```

Every KV write refreshes the TTL to 4 hours from the time of that write (Cloudflare KV behaviour with `expirationTtl`). A session therefore expires 4 hours after the **last** question, not after the first.

> If you want the window to start from the first question and be non-renewable, store `createdAt` and compute remaining TTL on each write as `14400 - Math.floor((Date.now() - session.createdAt) / 1000)`. Both approaches are acceptable; pick the simpler one first.

## Client changes (`AIChat.astro`)

### UUID management

```ts
function getClientId(): string {
  let id = localStorage.getItem("ai-chat-client-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("ai-chat-client-id", id);
  }
  return id;
}
```

- Call once on script init, store in a `const clientId`
- Add `"X-Client-ID": clientId` to the headers of every `fetch` call (`/api/ask` and `/api/remaining`)
- No other client changes needed — session history display still uses `sessionStorage` as before

## Server changes (`server/src/index.ts`)

### KV namespace

Rename/repurpose the existing `RATE_LIMIT` KV binding to `SESSIONS` (or keep the binding name and just change usage). Update `wrangler.toml` if the binding name changes.

The `Bindings` type becomes:

```ts
type Bindings = {
  SESSIONS: KVNamespace;
  OPEN_ROUTER_API_KEY: string;
  APP_ORIGIN?: string;
};
```

### Session helpers

```ts
const SESSION_TTL = 14400; // 4 hours in seconds

async function getSession(kv: KVNamespace, id: string): Promise<Session> {
  const raw = await kv.get(id);
  if (!raw) return { count: 0, messages: [], createdAt: Date.now() };
  return JSON.parse(raw) as Session;
}

async function putSession(kv: KVNamespace, id: string, session: Session) {
  await kv.put(id, JSON.stringify(session), { expirationTtl: SESSION_TTL });
}
```

### `GET /api/remaining`

- Read `X-Client-ID` header; if missing or invalid, return `{ questionsRemaining: MAX_QUESTIONS }`
- Look up session in KV
- Return `{ questionsRemaining: Math.max(0, MAX_QUESTIONS - session.count) }`

### `POST /api/ask`

- Read `X-Client-ID` header; treat missing/invalid UUID as a new anonymous session (return 400 if header is absent, to force client update)
- Load session from KV
- Check `session.count >= MAX_QUESTIONS` → 429
- After a successful AI response, push both the user message and AI message into `session.messages`, increment `session.count`, and write back with `putSession`
- On AI failure (503), do **not** increment count or save (existing behaviour)

### UUID validation

Validate the header value is a valid v4 UUID before using it as a KV key to prevent key injection:

```ts
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(value: string | undefined): value is string {
  return !!value && UUID_RE.test(value);
}
```

If the header fails validation, treat it as a new session (generate a fresh one server-side, or return 400).

## Expiry and reset behaviour

- KV TTL is set to `SESSION_TTL` (14400 s) on every successful write
- When the KV entry expires, `kv.get(id)` returns `null` → session is treated as fresh → user gets `MAX_QUESTIONS` again
- No scheduled worker or cron needed

## Constraints

- Keep `MAX_QUESTIONS = 3` in sync between client and server
- Remove the IP-based key (`cf-connecting-ip`) entirely — UUID is the sole identity
- The existing `RATE_LIMIT` KV namespace in Cloudflare can be reused; only the binding name in code needs updating if renamed
- No new Cloudflare resources required

## Acceptance criteria

- [ ] On first visit a UUID is generated and stored in `localStorage`; subsequent visits reuse it
- [ ] `X-Client-ID` header is sent on both `/api/remaining` and `/api/ask`
- [ ] The server rejects requests with a missing or malformed `X-Client-ID` (400)
- [ ] Asking 3 questions returns 429 on the 4th, regardless of sessionStorage state
- [ ] Clearing `sessionStorage` does not reset the server-side count
- [ ] Each question and answer is appended to `session.messages` in KV
- [ ] After 4 hours of inactivity the KV entry expires and the user can ask again
- [ ] No regression on normal error paths (503, network failure, invalid body)
