# Feature: AI chat — conversation history

## Goal

Replace the single-response display with a scrollable conversation thread that persists the full exchange for the session, so visitors can read back what was asked and answered.

## Scope

- Render each Q&A pair as a chat bubble thread inside `AIChat.astro`
- Persist conversation in `sessionStorage` so it survives soft navigation but not a new tab or reload
- Out of scope: sending conversation history to the server (context window), streaming responses, markdown rendering, cross-session persistence (localStorage)

## Design / behaviour

### Layout

Replace the single `ai-chat__response` div with a scrollable message list above the form. Each entry is a pair of bubbles:

```
┌─────────────────────────────────────┐
│  [User] What technologies do you…   │
│  [AI  ] I work mainly with…         │
│  [User] Tell me about your projects │
│  [AI  ] Here are some highlights…   │
└─────────────────────────────────────┘
[ Ask me anything…         ] [ Ask ]
  1 of 3 questions remaining
```

- User bubble: right-aligned, `bg-surface-alt` background, `color-white`
- AI bubble: left-aligned, no background, `color-secondary` (matches current response style)
- The list scrolls internally (max-height ~320px, `overflow-y: auto`)
- Auto-scrolls to the bottom after each new message pair is appended
- Typewriter effect applies only to the latest AI bubble; restored history renders instantly

### Loading state

While waiting for a response, show a "thinking" AI bubble with three animated dots (CSS animation, no JS timer). Replace it in-place once the answer arrives.

### Error messages

Error responses (503, network failure, 429 limit) appear as an AI bubble styled with `color-primary` (red). The 429 bubble includes the clickable email span for copying.

### Session persistence

On mount, read `sessionStorage.getItem("ai-chat-history")` and re-render any saved messages instantly (no typewriter for restored history). On each new exchange, write the updated array back to `sessionStorage`.

Storage format:

```ts
type Message = { role: "user" | "ai"; text: string; isError?: boolean };
// sessionStorage key: "ai-chat-history"
// value: JSON.stringify(Message[])
```

## Constraints

- Max questions is **3** — matches `MAX_QUESTIONS` in both client and server (set in `ai-chat-fixes`)
- Keep `AIChat.astro` as a single file — no separate JS module
- The existing `typewrite` function can remain; target the new bubble element instead of a single `responseEl`
- The question counter and rate-limit logic from `ai-chat-fixes.md` must be preserved

## Acceptance criteria

- [ ] Each submitted question appears as a user bubble immediately on submit
- [ ] An AI "thinking" indicator appears while the fetch is in flight
- [ ] The AI answer typewriters into its bubble, replacing the thinking indicator
- [ ] All previous messages remain visible when a new exchange is added (up to 3 pairs)
- [ ] The list auto-scrolls to the latest message after each update
- [ ] On page reload, conversation history is cleared (session only)
- [ ] On soft navigation away and back (Astro view transitions), conversation is restored from sessionStorage without typewriter replay
- [ ] Error bubbles render correctly and do not break the thread
- [ ] Counter and rate-limit behaviour from `ai-chat-fixes.md` still works correctly with 3-question cap
