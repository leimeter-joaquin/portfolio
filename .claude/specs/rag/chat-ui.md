# Feature: rag-chat-ui

## Goal

Add a chat input to the portfolio so visitors can ask questions about Joaquin and get AI-generated answers, with a clear 5-question limit enforced in the UI.

## Scope

- New `ChatWidget` section component in `app/src/components/sections/`
- Wired to the server's `POST /api/ask` endpoint
- 5-question limit tracked in component state
- Add the widget to the index page after the Projects section
- Out of scope: chat history persistence, markdown rendering in responses, mobile-specific layout changes

## Design / behaviour

### Layout

- A contained section with a heading (e.g. "Ask about Joaquin") and a short subtitle
- A text input and a submit button (reuse the existing `Button` component)
- Below the input: the AI response renders after each submission
- Below the response: a counter showing questions remaining (e.g. "3 of 5 questions remaining")
- After 5 questions: input and button are disabled, counter replaced with a message like "You've used all 5 questions"

### States

| State           | Input    | Button                        | Counter                      |
| --------------- | -------- | ----------------------------- | ---------------------------- |
| Idle            | Enabled  | Enabled                       | "5 of 5 remaining"           |
| Loading         | Disabled | Disabled (shows loading text) | unchanged                    |
| Answer received | Enabled  | Enabled                       | "N of 5 remaining"           |
| Limit reached   | Disabled | Disabled                      | "You've reached the limit"   |
| Error           | Enabled  | Enabled                       | Unchanged, show inline error |

### Response display

- Animate in with a simple fade (no flash of unstyled content)
- Show the answer text — no markdown parsing needed for now
- Show a generic error message if the server returns an error other than `429`

## Constraints

- Follow the CSS conventions in `app/CLAUDE.md` — Gorko utilities for color/type, scoped `<style>` for layout
- Use BEM naming: `.chat`, `.chat__input`, `.chat__response`, etc.
- Use `.section-wrapper` for max-width and padding
- Track `questionsRemaining` from the server response — do not rely solely on local count
- The server URL should come from an environment variable (`PUBLIC_API_URL`) so it works in both dev and production
- Do not inline styles or use Tailwind

## Acceptance criteria

- [ ] Chat widget renders on the index page below Projects
- [ ] Submitting a question calls `POST /api/ask` and displays the response
- [ ] Input and button are disabled while a request is in flight
- [ ] Counter reflects `questionsRemaining` from the server response
- [ ] Input and button are disabled after 5 questions, with a clear message
- [ ] A network or server error shows an inline message without breaking the UI
- [ ] Styles follow `app/CLAUDE.md` conventions — no hardcoded hex values, BEM classes, Gorko utilities
