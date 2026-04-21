<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  nextTick,
} from "vue";
import { animate } from "animejs";

const API_URL =
  (import.meta.env.PUBLIC_API_URL as
    | string
    | undefined) ??
  "http://localhost:3001";
const MAX_QUESTIONS = 3;
const STORAGE_KEY = "ai-chat-history";
const IS_DEV = import.meta.env.DEV;
const EMAIL =
  "leimeter.joaquin@gmail.com";

const SUGGESTIONS = [
  "What stack do you use?",
  "Available for hire?",
  "Tell me about your projects.",
  "Cloud & DevOps experience?",
];

interface ChatMessage {
  role: "user" | "ai";
  text: string;
  isError?: boolean;
  thinking?: boolean;
  email?: string;
}

const messages = ref<ChatMessage[]>([]);
const inputValue = ref("");
const questionsRemaining = ref(
  MAX_QUESTIONS,
);
const limitReached = ref(false);
const loading = ref(false);
const focused = ref(false);
const threadEl =
  ref<HTMLElement | null>(null);
const inputEl =
  ref<HTMLTextAreaElement | null>(null);
const clientId = ref("");
const copiedEmail = ref(false);

// Holds the current running anime animation so we can cancel it on new message
let typewriterAnim: ReturnType<
  typeof animate
> | null = null;

function autoResizeInput() {
  const el = inputEl.value;
  if (!el) return;
  el.style.height = "auto";
  const lineHeight = parseFloat(
    getComputedStyle(el).lineHeight,
  );
  el.style.height =
    Math.min(
      el.scrollHeight,
      lineHeight * 3,
    ) + "px";
}

function getClientId(): string {
  let id = localStorage.getItem(
    "ai-chat-client-id",
  );
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(
      "ai-chat-client-id",
      id,
    );
  }
  return id;
}

function scrollToBottom() {
  if (threadEl.value)
    threadEl.value.scrollTop =
      threadEl.value.scrollHeight;
}

function saveHistory() {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages.value),
    );
  } catch {}
}

function loadHistory(): ChatMessage[] {
  try {
    return JSON.parse(
      sessionStorage.getItem(
        STORAGE_KEY,
      ) ?? "[]",
    ) as ChatMessage[];
  } catch {
    return [];
  }
}

function updateCounter(
  remaining: number,
) {
  questionsRemaining.value = Math.max(
    0,
    remaining,
  );
  if (remaining <= 0)
    limitReached.value = true;
}

const counterText = computed(() =>
  limitReached.value ||
  questionsRemaining.value <= 0
    ? `You've used all ${MAX_QUESTIONS} questions`
    : `${MAX_QUESTIONS - questionsRemaining.value} of ${MAX_QUESTIONS} questions`,
);

const hasMessages = computed(
  () => messages.value.length > 0,
);

// AnimeJS typewriter — animates charIndex from 0 → fullText.length,
// slicing the string in onUpdate for a smooth streaming effect.
function typewriteInto(
  index: number,
  fullText: string,
  onComplete?: () => void,
) {
  if (typewriterAnim) {
    typewriterAnim.pause();
    typewriterAnim = null;
  }
  messages.value[index].text = "";
  const obj = { charIndex: 0 };
  typewriterAnim = animate(obj, {
    charIndex: fullText.length,
    duration: Math.max(
      600,
      fullText.length * 22,
    ),
    ease: "linear",
    onUpdate: () => {
      messages.value[index].text =
        fullText.slice(
          0,
          Math.floor(obj.charIndex),
        );
      nextTick(scrollToBottom);
    },
    onComplete: () => {
      messages.value[index].text =
        fullText;
      typewriterAnim = null;
      onComplete?.();
    },
  });
}

async function fetchRemaining() {
  try {
    const res = await fetch(
      `${API_URL}/api/remaining`,
      {
        headers: {
          "X-Client-ID": clientId.value,
        },
      },
    );
    const data = (await res.json()) as {
      questionsRemaining?: number;
    };
    updateCounter(
      data.questionsRemaining ??
        MAX_QUESTIONS,
    );
  } catch {
    updateCounter(MAX_QUESTIONS);
  }
}

async function onSubmit(
  questionOverride?: string,
) {
  const question = (
    questionOverride ?? inputValue.value
  ).trim();
  if (
    !question ||
    questionsRemaining.value <= 0 ||
    loading.value
  )
    return;

  messages.value.push({
    role: "user",
    text: question,
  });
  saveHistory();
  inputValue.value = "";
  await nextTick(autoResizeInput);
  loading.value = true;

  messages.value.push({
    role: "ai",
    text: "",
    thinking: true,
  });
  const aiIndex =
    messages.value.length - 1;

  await nextTick(scrollToBottom);

  try {
    const res = await fetch(
      `${API_URL}/api/ask`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          "X-Client-ID": clientId.value,
        },
        body: JSON.stringify({
          question,
        }),
      },
    );

    const data = (await res.json()) as {
      answer?: string;
      questionsRemaining?: number;
      error?: string;
    };

    if (res.status === 429) {
      limitReached.value = true;
      updateCounter(0);
      const limitText =
        "Hey! You've reached the limit. If you have more questions you can send me an email on: ";
      messages.value[aiIndex] = {
        role: "ai",
        text: "",
        isError: true,
        thinking: false,
      };
      saveHistory();
      typewriteInto(
        aiIndex,
        limitText,
        () => {
          messages.value[
            aiIndex
          ].email = EMAIL;
          saveHistory();
        },
      );
    } else if (res.status === 503) {
      messages.value[aiIndex] = {
        role: "ai",
        text: "",
        isError: true,
        thinking: false,
      };
      saveHistory();
      typewriteInto(
        aiIndex,
        "AI is temporarily unavailable. Please try again in a moment.",
      );
    } else if (!res.ok) {
      messages.value[aiIndex] = {
        role: "ai",
        text: "",
        isError: true,
        thinking: false,
      };
      saveHistory();
      typewriteInto(
        aiIndex,
        "Something went wrong. Please try again.",
      );
    } else {
      const answer = data.answer ?? "";
      updateCounter(
        data.questionsRemaining ?? 0,
      );
      messages.value[aiIndex] = {
        role: "ai",
        text: "",
        thinking: false,
      };
      typewriteInto(
        aiIndex,
        answer,
        () => {
          saveHistory();
        },
      );
    }
  } catch {
    messages.value[aiIndex] = {
      role: "ai",
      text: "",
      isError: true,
      thinking: false,
    };
    saveHistory();
    typewriteInto(
      aiIndex,
      "Unable to reach the server. Please try again later.",
    );
  } finally {
    loading.value = false;
  }
}

async function copyEmail() {
  await navigator.clipboard.writeText(
    EMAIL,
  );
  copiedEmail.value = true;
  setTimeout(() => {
    copiedEmail.value = false;
  }, 2000);
}

async function clearConversation() {
  if (typewriterAnim) {
    typewriterAnim.pause();
    typewriterAnim = null;
  }
  sessionStorage.removeItem(
    STORAGE_KEY,
  );
  messages.value = [];
  limitReached.value = false;
  questionsRemaining.value =
    MAX_QUESTIONS;
  await fetch(
    `${API_URL}/api/session`,
    {
      method: "DELETE",
      headers: {
        "X-Client-ID": clientId.value,
      },
    },
  ).catch(() => {});
}

onMounted(() => {
  clientId.value = getClientId();
  messages.value = loadHistory();
  fetchRemaining();
  nextTick(scrollToBottom);
});
</script>

<template>
  <div class="ai-chat">
    <div
      class="ai-chat__box"
      :class="{
        'ai-chat__box--focused':
          focused,
      }"
    >
      <!-- Header row -->
      <div class="ai-chat__header">
        <div
          class="ai-chat__pulse-wrap"
        >
          <span
            class="ai-chat__pulse-dot"
          ></span>
          <span
            class="ai-chat__pulse-ring"
          ></span>
        </div>
        <span
          class="ai-chat__header-label"
          >Talk to Joaquin's AI</span
        >
        <div
          class="ai-chat__counter-badge"
          :class="{
            'ai-chat__counter-badge--done':
              limitReached,
          }"
        >
          {{
            limitReached
              ? "Limit reached"
              : `${questionsRemaining} of ${MAX_QUESTIONS} left`
          }}
        </div>
      </div>

      <!-- Thread -->
      <div
        v-if="hasMessages"
        class="ai-chat__thread"
        :class="{
          'ai-chat__thread--open':
            hasMessages,
        }"
      >
        <div
          ref="threadEl"
          class="ai-chat__messages"
        >
          <div
            v-for="(msg, i) in messages"
            :key="i"
            class="ai-chat__bubble"
            :class="{
              'ai-chat__bubble--user':
                msg.role === 'user',
              'ai-chat__bubble--ai':
                msg.role === 'ai',
              'ai-chat__bubble--error':
                msg.isError,
              'ai-chat__bubble--thinking':
                msg.thinking,
            }"
          >
            <template
              v-if="msg.thinking"
            >
              <span
                class="ai-chat__dots"
              >
                <span /><span /><span />
              </span>
            </template>
            <template v-else>
              {{ msg.text
              }}<span
                v-if="msg.email"
                class="ai-chat__limit-email"
                :data-tooltip="
                  copiedEmail
                    ? 'Copied!'
                    : 'Copy to clipboard'
                "
                @click="copyEmail"
                >{{ msg.email }}</span
              >
            </template>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div
        class="ai-chat__input-area"
        :class="{
          'ai-chat__input-area--bordered':
            hasMessages,
        }"
      >
        <form
          class="ai-chat__form"
          novalidate
          @submit.prevent="
            () => onSubmit()
          "
        >
          <span
            class="ai-chat__prompt color-muted"
            aria-hidden="true"
            >›</span
          >
          <textarea
            ref="inputEl"
            v-model="inputValue"
            class="ai-chat__input color-white"
            rows="1"
            :placeholder="
              limitReached
                ? 'Email leimeter.joaquin@gmail.com for more…'
                : 'Ask me anything…'
            "
            autocomplete="off"
            maxlength="500"
            :disabled="
              loading || limitReached
            "
            @keydown.enter.prevent="
              () => onSubmit()
            "
            @input="autoResizeInput"
            @focus="focused = true"
            @blur="focused = false"
          />
          <button
            class="ai-chat__submit"
            type="submit"
            :class="{
              'ai-chat__submit--active':
                inputValue.trim() &&
                !loading &&
                !limitReached,
            }"
            :disabled="
              loading ||
              limitReached ||
              !inputValue.trim()
            "
          >
            {{ loading ? "…" : "↵" }}
          </button>
          <button
            v-if="IS_DEV"
            class="ai-chat__clear color-muted"
            type="button"
            title="Clear conversation (dev only)"
            @click="clearConversation"
          >
            ×
          </button>
        </form>
        <p
          v-if="hasMessages"
          class="ai-chat__counter color-muted"
        >
          {{ counterText }}
        </p>
      </div>
    </div>

    <!-- Suggestion chips — shown before first message -->
    <div
      v-if="!hasMessages"
      class="ai-chat__chips"
    >
      <button
        v-for="s in SUGGESTIONS"
        :key="s"
        class="ai-chat__chip"
        @click="() => onSubmit(s)"
      >
        {{ s }}
      </button>
    </div>
  </div>
</template>

<style lang="scss">
@use "../css/config" as *;

.ai-chat {
  display: grid;
  gap: 0.75rem;
  width: 100%;
}

.ai-chat__box {
  border: 1px solid
    rgba(255, 255, 255, 0.08);
  border-radius: 1.25rem;
  overflow: hidden;
  background: rgba(
    255,
    255,
    255,
    0.025
  );
  backdrop-filter: blur(20px)
    saturate(1.4);
  -webkit-backdrop-filter: blur(20px)
    saturate(1.4);
  box-shadow: 0 16px 48px
    rgba(0, 0, 0, 0.4);
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    background 0.3s ease;
}

.ai-chat__box--focused {
  border-color: rgba(
    map-get($gorko-colors, "primary"),
    0.4
  );
  background: rgba(255, 255, 255, 0.04);
  box-shadow:
    0 0 0 3px
      rgba(
        map-get(
          $gorko-colors,
          "primary"
        ),
        0.08
      ),
    0 24px 60px rgba(0, 0, 0, 0.5),
    0 0 100px
      rgba(
        map-get(
          $gorko-colors,
          "primary"
        ),
        0.05
      );
}

// ── Header ──────────────────────────────────────────────
.ai-chat__header {
  padding: 0.8125rem 1.125rem;
  border-bottom: 1px solid
    rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  gap: 0.625rem;
  background: rgba(255, 255, 255, 0.01);
}

.ai-chat__pulse-wrap {
  position: relative;
  width: 10px;
  height: 10px;
  flex-shrink: 0;
}

.ai-chat__pulse-dot {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: map-get(
    $gorko-colors,
    "primary"
  );
  animation: pulse-dot 2.5s ease-in-out
    infinite;
}

.ai-chat__pulse-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: map-get(
    $gorko-colors,
    "primary"
  );
  opacity: 0.4;
  animation: ring-out 2.5s ease-out
    infinite;
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 0 0
      rgba(
        map-get(
          $gorko-colors,
          "primary"
        ),
        0.5
      );
  }
  50% {
    opacity: 0.6;
    box-shadow: 0 0 0 6px
      rgba(
        map-get(
          $gorko-colors,
          "primary"
        ),
        0
      );
  }
}

@keyframes ring-out {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(2.4);
    opacity: 0;
  }
}

.ai-chat__header-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.ai-chat__counter-badge {
  margin-left: auto;
  font-size: 0.6875rem;
  font-weight: 700;
  color: map-get(
    $gorko-colors,
    "primary"
  );
  background: rgba(
    map-get($gorko-colors, "primary"),
    0.1
  );
  border: 1px solid
    rgba(
      map-get($gorko-colors, "primary"),
      0.2
    );
  padding: 0.125rem 0.625rem;
  border-radius: 999px;
}

.ai-chat__counter-badge--done {
  color: map-get(
    $gorko-colors,
    "muted"
  );
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(
    255,
    255,
    255,
    0.07
  );
}

// ── Thread ───────────────────────────────────────────────
.ai-chat__thread {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.5s
    ease;
}

.ai-chat__thread--open {
  grid-template-rows: 1fr;
}

.ai-chat__messages {
  overflow: hidden auto;
  max-height: 260px;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 1rem 1.125rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(
      255,
      255,
      255,
      0.08
    )
    transparent;
}

.ai-chat__bubble {
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  line-height: 1.65;
  max-width: 84%;
  word-break: break-word;
}

.ai-chat__bubble--user {
  align-self: flex-start;
  border-radius: 1rem 1rem 1rem
    0.3125rem;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid
    rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.88);
}

.ai-chat__bubble--ai {
  align-self: flex-end;
  border-radius: 1rem 1rem 0.3125rem
    1rem;
  background: rgba(
    map-get($gorko-colors, "primary"),
    0.1
  );
  border: 1px solid
    rgba(
      map-get($gorko-colors, "primary"),
      0.2
    );
  color: map-get(
    $gorko-colors,
    "primary"
  );
}

.ai-chat__bubble--error {
  color: map-get(
    $gorko-colors,
    "muted"
  );
}

.ai-chat__bubble--thinking {
  display: flex;
  align-items: center;
}

.ai-chat__dots {
  display: flex;
  gap: 0.25rem;
  padding-block: 0.125rem;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: map-get(
      $gorko-colors,
      "primary"
    );
    display: inline-block;
    animation: dot-bounce 1.2s
      ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes dot-bounce {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.3;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

// ── Input area ───────────────────────────────────────────
.ai-chat__input-area {
  padding: 0.6875rem 0.9375rem 0.8125rem;
}

.ai-chat__input-area--bordered {
  border-top: 1px solid
    rgba(255, 255, 255, 0.05);
}

.ai-chat__form {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}

.ai-chat__prompt {
  font-family: monospace;
  font-size: 1.125rem;
  flex-shrink: 0;
  user-select: none;
  padding-bottom: 0.1rem;
  opacity: 0.45;
  color: map-get(
    $gorko-colors,
    "primary"
  );
  line-height: 1;
}

.ai-chat__input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font: inherit;
  font-size: 0.875rem;
  line-height: 1.5;
  min-width: 0;
  resize: none;
  overflow: hidden;
  padding: 0;
  transition: height 0.2s ease;

  &::placeholder {
    color: map-get(
      $gorko-colors,
      "muted"
    );
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.ai-chat__submit {
  width: 2.125rem;
  height: 2.125rem;
  border-radius: 0.625rem;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.06);
  border: none;
  cursor: not-allowed;
  color: white;
  font-size: 0.9375rem;
  display: grid;
  place-items: center;
  transition: all 0.2s ease;
  font-family: inherit;
  opacity: 0.4;
}

.ai-chat__submit--active {
  background: map-get(
    $gorko-colors,
    "primary"
  );
  cursor: pointer;
  opacity: 1;
  box-shadow: 0 4px 16px
    rgba(
      map-get($gorko-colors, "primary"),
      0.45
    );
}

.ai-chat__clear {
  background: none;
  border: none;
  border-left: 1px solid
    map-get($gorko-colors, "border");
  cursor: pointer;
  font: inherit;
  font-size: 1rem;
  padding: 0 0 0.1rem 0.5rem;
  flex-shrink: 0;
  opacity: 0.4;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 1;
  }
}

.ai-chat__counter {
  font-size: 0.8125rem;
  margin-top: 0.375rem;
}

.ai-chat__limit-email {
  font-weight: 700;
  cursor: pointer;
  position: relative;

  &::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    background: map-get(
      $gorko-colors,
      "surface-alt"
    );
    color: map-get(
      $gorko-colors,
      "secondary"
    );
    font-size: 0.75rem;
    font-weight: 400;
    white-space: nowrap;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    border: 1px solid
      map-get($gorko-colors, "border");
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  &:hover::after {
    opacity: 1;
  }
}

// ── Suggestion chips ─────────────────────────────────────
.ai-chat__chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.ai-chat__chip {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid
    rgba(255, 255, 255, 0.07);
  border-radius: 999px;
  padding: 0.375rem 0.875rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: map-get(
    $gorko-colors,
    "muted"
  );
  cursor: pointer;
  font-family: inherit;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background: rgba(
      map-get($gorko-colors, "primary"),
      0.1
    );
    border-color: rgba(
      map-get($gorko-colors, "primary"),
      0.3
    );
    color: map-get(
      $gorko-colors,
      "primary"
    );
  }
}
</style>
