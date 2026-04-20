<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  nextTick,
} from "vue";

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
const threadEl =
  ref<HTMLElement | null>(null);
const inputEl =
  ref<HTMLTextAreaElement | null>(null);
const clientId = ref("");
const copiedEmail = ref(false);

let typewriterTimer: ReturnType<
  typeof setInterval
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

function typewriteInto(
  index: number,
  fullText: string,
  onComplete?: () => void,
) {
  if (typewriterTimer) {
    clearInterval(typewriterTimer);
    typewriterTimer = null;
  }
  messages.value[index].text = "";
  let i = 0;
  typewriterTimer = setInterval(() => {
    messages.value[index].text +=
      fullText[i++];
    nextTick(scrollToBottom);
    if (i >= fullText.length) {
      clearInterval(typewriterTimer!);
      typewriterTimer = null;
      onComplete?.();
    }
  }, 18);
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

async function onSubmit() {
  const question =
    inputValue.value.trim();
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
  if (typewriterTimer) {
    clearInterval(typewriterTimer);
    typewriterTimer = null;
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
    <div class="ai-chat__box">
      <div
        class="ai-chat__thread"
        :class="{
          'ai-chat__thread--open':
            messages.length > 0,
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

      <div class="ai-chat__input-area">
        <form
          class="ai-chat__form"
          novalidate
          @submit.prevent="onSubmit"
        >
          <span
            class="ai-chat__prompt color-muted"
            aria-hidden="true"
            >></span
          >
          <textarea
            ref="inputEl"
            v-model="inputValue"
            class="ai-chat__input color-white"
            rows="1"
            placeholder="Ask me anything…"
            autocomplete="off"
            maxlength="500"
            :disabled="
              loading || limitReached
            "
            @keydown.enter.prevent="
              onSubmit
            "
            @input="autoResizeInput"
          />
          <button
            class="ai-chat__submit color-muted"
            type="submit"
            :disabled="
              loading || limitReached
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
          v-if="messages.length > 0"
          class="ai-chat__counter color-muted"
        >
          {{ counterText }}
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use "../css/config" as *;

.ai-chat {
  display: grid;
  gap: 0.5rem;
  width: 100%;
  max-width: 480px;
}

.ai-chat__box {
  border: 1px solid
    map-get($gorko-colors, "border");
  border-radius: 0.75rem;
  overflow: hidden;
}

.ai-chat__thread {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 2s ease;
}

.ai-chat__thread--open {
  grid-template-rows: 1fr;
}

.ai-chat__messages {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
}

.ai-chat__input-area {
  border-top: 1px solid
    map-get($gorko-colors, "border");
  padding: 0.625rem 0.875rem;
}

.ai-chat__bubble {
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  line-height: 1.6;
  max-width: 85%;
  word-break: break-word;
}

.ai-chat__bubble--user {
  align-self: flex-start;
  text-align: left;
  background: map-get(
    $gorko-colors,
    "surface-alt"
  );
  color: map-get(
    $gorko-colors,
    "white"
  );
  border-bottom-left-radius: 0.25rem;
}

.ai-chat__bubble--ai {
  align-self: flex-end;
  text-align: right;
  color: map-get(
    $gorko-colors,
    "secondary"
  );
  border-bottom-right-radius: 0.25rem;
}

.ai-chat__bubble--error {
  color: map-get(
    $gorko-colors,
    "primary"
  );
}

.ai-chat__bubble--thinking {
  display: flex;
  align-items: center;
}

.ai-chat__dots {
  display: flex;
  gap: 0.25rem;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: map-get(
      $gorko-colors,
      "secondary"
    );
    animation: ai-chat-dot 1.2s
      ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes ai-chat-dot {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }

  40% {
    opacity: 1;
    transform: scale(1);
  }
}

.ai-chat__form {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}

.ai-chat__prompt {
  font-family: monospace;
  font-size: 1rem;
  flex-shrink: 0;
  user-select: none;
  padding-bottom: 0.1rem;
}

.ai-chat__input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font: inherit;
  font-size: 0.9375rem;
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
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.ai-chat__submit {
  background: none;
  border: none;
  cursor: pointer;
  font: inherit;
  font-size: 1.1rem;
  padding: 0 0.25rem 0.1rem;
  flex-shrink: 0;
  transition: color 0.15s ease;

  &:hover:not(:disabled) {
    color: map-get(
      $gorko-colors,
      "primary"
    );
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
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
</style>
