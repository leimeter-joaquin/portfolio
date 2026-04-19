# Feature: AI chat bug fixes

## Goal

Fix two bugs in `AIChat.astro`: the question counter always shows 5 regardless of server state, and the rate-limit message never appears when the user hits the cap.

## Scope

- Fix counter initialisation and sync
- Fix rate-limit message rendering
- Out of scope: UI redesign, chat history (separate spec)

## Known bugs

### 1. Counter always starts at 5

`questionsRemaining` is initialised client-side to `MAX_QUESTIONS = 5` and the counter `<p>` is hardcoded to "5 of 5 questions remaining" in the HTML. The server tracks usage per-IP in KV, so a returning visitor always sees a stale count.

**Fix:** On page load, call `GET /api/remaining` (new endpoint) and call `updateCounter()` with the result. Until the response arrives, show a neutral placeholder like "Loading…" or hide the counter entirely.

If adding a new endpoint is too heavy, an acceptable alternative is to read `questionsRemaining` from the first successful API response and accept that the count shown before the first question is optimistic.

### 2. Rate-limit message (429) never appears

On a 429 response the code calls:

1. `updateCounter(0)` — disables `input` and `submitBtn`
2. `typewrite(...)` — starts writing the limit message and sets `responseEl` className to `--visible`
3. `finally { setLoading(false) }` — re-enables `input` and `submitBtn`, **overwriting the disabled state set in step 1**

`setLoading(false)` also does **not** interfere with `responseEl`, so the root cause of the message not showing needs to be confirmed during implementation (may be a race between the `finally` block and the typewriter's first tick). Regardless, `setLoading` must not re-enable inputs when the limit has been reached.

**Fix:** Track a `limitReached` boolean. In `setLoading(false)`, skip re-enabling inputs if `limitReached` is true. Set `limitReached = true` inside the 429 branch before calling `typewrite`.

## Constraints

- No new dependencies
- `updateCounter` already handles the disabled-state logic — extend it, don't duplicate
- The server endpoint for remaining count can be a thin wrapper around the KV read; rate-limit key format must match what `/api/ask` writes

## Acceptance criteria

- [ ] On page load the counter reflects actual server-side remaining questions (or is hidden until known)
- [ ] Submitting the last question decrements the counter to 0
- [ ] When the limit is hit (429), the typewriter message appears correctly
- [ ] When the limit is hit, input and submit remain disabled after the response
- [ ] No regression on normal successful responses or error responses (503, network failure)
