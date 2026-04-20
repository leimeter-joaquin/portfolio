# Feature: AI chat — Vue island

> **For Claude:** invoke the `vue` skill (`/vue`) before starting implementation to fetch current Vue 3 and `@astrojs/vue` documentation.

## Goal

Replace the imperative inline `<script>` in `AIChat.astro` with a reactive Vue 3 SFC used as an Astro island. The motivation is threefold:

1. **Scoped styles work on dynamic elements** — Vue SFC `<style scoped>` adds `data-v-xxx` to elements rendered via `v-for` in the template, eliminating the need for `:global()` workarounds
2. **Reactive state replaces manual DOM manipulation** — `ref`/`computed` replace `document.getElementById`, `textContent`, `classList`, etc.
3. **Cleaner separation** — logic, template, and styles live in a single `.vue` file with proper typing and component conventions

## Scope

- Add `@astrojs/vue` integration and `vue` package
- Create `app/src/components/AIChat.vue` — full Vue 3 `<script setup>` SFC
- Replace `AIChat.astro` template content with `<AIChat client:load />`; delete the old `<script>` and `<style>` blocks
- All existing behaviour preserved: typewriter, thinking dots, session storage, UUID/`X-Client-ID`, dev clear button, counter, rate-limit message with email tooltip
- Out of scope: Pinia, Vue Router, any other Vue packages beyond the core integration

## Setup

### 1. Install packages

```bash
npx astro add vue
# or manually:
npm install vue @astrojs/vue --workspace=@portfolio/app
```

### 2. Update `astro.config.mjs`

```js
import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";

export default defineConfig({
  integrations: [vue()],
  vite: {
    /* existing scss config */
  },
});
```

## Component: `AIChat.vue`

### State (`<script setup lang="ts">`)

```ts
// Constants
const API_URL = import.meta.env.PUBLIC_API_URL ?? "http://localhost:3001";
const MAX_QUESTIONS = 3;
const STORAGE_KEY = "ai-chat-history";
const IS_DEV = import.meta.env.DEV;

// Types
type MessageRole = "user" | "ai";
interface ChatMessage {
  role: MessageRole;
  text: string;
  isError?: boolean;
  thinking?: boolean; // true while waiting for response
}

// Refs
const messages = ref<ChatMessage[]>([]);
const input = ref("");
const questionsRemaining = ref(MAX_QUESTIONS);
const limitReached = ref(false);
const loading = ref(false);
const threadEl = ref<HTMLElement | null>(null); // template ref
```

### UUID / client ID

Same logic as current JS, but called once in `setup`:

```ts
function getClientId(): string {
  let id = localStorage.getItem("ai-chat-client-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("ai-chat-client-id", id);
  }
  return id;
}
const clientId = getClientId();
```

### Session storage

```ts
function saveHistory(msgs: ChatMessage[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  } catch {}
}

function loadHistory(): ChatMessage[] {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

// On mount: restore history
onMounted(() => {
  messages.value = loadHistory();
  fetchRemaining();
  nextTick(scrollToBottom);
});
```

### Auto-scroll

```ts
function scrollToBottom() {
  if (threadEl.value) threadEl.value.scrollTop = threadEl.value.scrollHeight;
}

// watch messages length to auto-scroll on every new entry
watch(
  () => messages.value.length,
  () => nextTick(scrollToBottom),
);
```

### Typewriter

The typewriter runs against the **last message** in the array. Rather than a DOM reference, it mutates `messages.value[lastIndex].text` character by character, which Vue renders reactively.

```ts
let typewriterTimer: ReturnType<typeof setInterval> | null = null;

function typewriteInto(
  targetIndex: number,
  fullText: string,
  onComplete?: () => void,
) {
  if (typewriterTimer) clearInterval(typewriterTimer);
  messages.value[targetIndex].text = "";
  let i = 0;
  typewriterTimer = setInterval(() => {
    messages.value[targetIndex].text += fullText[i++];
    nextTick(scrollToBottom);
    if (i >= fullText.length) {
      clearInterval(typewriterTimer!);
      typewriterTimer = null;
      onComplete?.();
    }
  }, 18);
}
```

### Submit handler

```ts
async function onSubmit() {
  const question = input.value.trim();
  if (!question || questionsRemaining.value <= 0 || loading.value) return;

  // 1. Append user bubble + save
  messages.value.push({ role: "user", text: question });
  saveHistory(messages.value);
  input.value = "";
  loading.value = true;

  // 2. Append thinking bubble
  messages.value.push({ role: "ai", text: "", thinking: true });
  const aiIndex = messages.value.length - 1;

  try {
    const res = await fetch(`${API_URL}/api/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Client-ID": clientId },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();

    if (res.status === 429) {
      limitReached.value = true;
      updateCounter(0);
      const limitText = `Hey! You've reached the limit. If you have more questions you can send me an email on: ${EMAIL}`;
      messages.value[aiIndex] = {
        role: "ai",
        text: "",
        isError: true,
        thinking: false,
      };
      saveHistory(messages.value);
      typewriteInto(aiIndex, limitText, () => {
        // mark email span — see template section below
        messages.value[aiIndex].showEmailSpan = true;
      });
    } else if (res.status === 503) {
      setError(
        aiIndex,
        "AI is temporarily unavailable. Please try again in a moment.",
      );
    } else if (!res.ok) {
      setError(aiIndex, "Something went wrong. Please try again.");
    } else {
      messages.value[aiIndex].thinking = false;
      saveHistory(messages.value);
      typewriteInto(aiIndex, data.answer ?? "", () => {
        updateCounter(data.questionsRemaining ?? 0);
        saveHistory(messages.value);
      });
      updateCounter(data.questionsRemaining ?? MAX_QUESTIONS);
    }
  } catch {
    setError(aiIndex, "Unable to reach the server. Please try again later.");
  } finally {
    loading.value = false;
  }
}
```

### Rate-limit email span

Rather than inserting a DOM span imperatively after the typewriter, extend `ChatMessage`:

```ts
interface ChatMessage {
  // ...existing fields
  showEmailSpan?: boolean; // set true by 429 onComplete callback
}
```

In the template, render the email span conditionally inside the AI bubble:

```html
<span
  v-if="msg.showEmailSpan"
  class="ai-chat__limit-email"
  data-tooltip="Copy to clipboard"
  @click="copyEmail"
>
  {{ EMAIL }}
</span>
```

The `copyEmail` function updates a `copiedEmail` ref (boolean) used to toggle the tooltip text.

## Template structure

```html
<template>
  <div class="ai-chat">
    <div class="ai-chat__box">
      <div ref="threadEl" class="ai-chat__thread">
        <div
          v-for="(msg, i) in messages"
          :key="i"
          class="ai-chat__bubble"
          :class="{
            'ai-chat__bubble--user': msg.role === 'user',
            'ai-chat__bubble--ai':   msg.role === 'ai',
            'ai-chat__bubble--error': msg.isError,
            'ai-chat__bubble--thinking': msg.thinking,
          }"
        >
          <template v-if="msg.thinking">
            <span class="ai-chat__dots"> <span /><span /><span /> </span>
          </template>
          <template v-else>
            {{ msg.text.slice(0, emailStartIndex(msg)) }}
            <span
              v-if="msg.showEmailSpan"
              class="ai-chat__limit-email"
              :data-tooltip="copiedEmail ? 'Copied!' : 'Copy to clipboard'"
              @click="copyEmail"
              >{{ EMAIL }}</span
            >
          </template>
        </div>
      </div>

      <div class="ai-chat__input-area">
        <form class="ai-chat__form" @submit.prevent="onSubmit" novalidate>
          <span class="ai-chat__prompt" aria-hidden="true">></span>
          <input
            v-model="input"
            class="ai-chat__input"
            type="text"
            placeholder="Ask me anything…"
            autocomplete="off"
            maxlength="500"
            :disabled="loading || limitReached"
          />
          <button
            class="ai-chat__submit"
            type="submit"
            :disabled="loading || limitReached"
          >
            {{ loading ? "…" : "↵" }}
          </button>
          <button
            v-if="IS_DEV"
            class="ai-chat__clear"
            type="button"
            title="Clear conversation (dev only)"
            @click="clearConversation"
          >
            ×
          </button>
        </form>
      </div>
    </div>

    <p class="ai-chat__counter">{{ counterText }}</p>
  </div>
</template>
```

`counterText` is a `computed`:

```ts
const counterText = computed(() =>
  questionsRemaining.value <= 0
    ? `You've used all ${MAX_QUESTIONS} questions`
    : `${questionsRemaining.value} of ${MAX_QUESTIONS} questions remaining`,
);
```

## Styles (`<style lang="scss">`)

Use `<style lang="scss">` without `scoped` — because the bubble elements are now rendered in the Vue template (not injected via `innerHTML`), scoped styles would work. However, `.ai-chat__dots span` uses child selectors that Astro's scoped SCSS handles awkwardly. Use unscoped styles (same as today's `:global()` approach) to keep it simple.

All existing style rules transfer directly — remove all `:global()` wrappers since they are no longer needed.

## `AIChat.astro` after migration

The file becomes a thin wrapper:

```astro
---
import AIChat from "./AIChat.vue";
---

<AIChat client:load />
```

## Constraints

- `client:load` hydrates immediately on page load — appropriate since the chat is above the fold in the Hero section
- Do not introduce Pinia or any state management beyond component-local refs
- Keep `prettier-plugin-vue` out of scope — Prettier already formats `.vue` files via its built-in Vue support (Prettier ≥ 3)
- The `@astrojs/vue` integration automatically handles SSR-safe imports; do not add `ssr: false` guards unless a specific API (e.g. `localStorage`) is called outside `onMounted`
- `localStorage` and `crypto.randomUUID()` must only be called inside `onMounted` or in event handlers — not at module top-level — to avoid SSR errors

## Acceptance criteria

- [ ] `npm run build` succeeds with Vue integration installed
- [ ] Chat renders and hydrates on page load with no console errors
- [ ] All conversation behaviour works identically to current implementation (typewriter, thinking dots, counter, 429 email span, error bubbles)
- [ ] Bubble styles apply correctly via Vue-rendered template (no `:global()` needed)
- [ ] Session storage restore on soft navigation works via `onMounted`
- [ ] UUID is generated on first mount and reused on subsequent mounts
- [ ] Dev `×` button visible in dev, absent in production build
- [ ] `client:load` hydration directive used in the wrapper `.astro` file
