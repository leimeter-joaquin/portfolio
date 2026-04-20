import { Hono } from "hono";
import { cors } from "hono/cors";
import { OpenRouter } from "@openrouter/sdk";
import content from "@portfolio/content/data";

type Bindings = {
  SESSIONS: KVNamespace;
  OPEN_ROUTER_API_KEY: string;
  APP_ORIGIN?: string;
  ENVIRONMENT?: string;
};

type Message = {
  role: "user" | "ai";
  text: string;
  ts: number;
};

type Session = {
  count: number;
  messages: Message[];
  createdAt: number;
};

const MAX_QUESTIONS = 3;
const SESSION_TTL = 14400; // 4 hours in seconds

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(value: string | undefined): value is string {
  return !!value && UUID_RE.test(value);
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, 50 * (i + 1)));
    }
  }
  throw new Error("unreachable");
}

async function getSession(kv: KVNamespace, id: string): Promise<Session> {
  const raw = await withRetry(() => kv.get(id));
  if (!raw) return { count: 0, messages: [], createdAt: Date.now() };
  return JSON.parse(raw) as Session;
}

async function putSession(
  kv: KVNamespace,
  id: string,
  session: Session,
): Promise<void> {
  await withRetry(() =>
    kv.put(id, JSON.stringify(session), { expirationTtl: SESSION_TTL }),
  );
}

const MODELS = [
  "openai/gpt-oss-120b:free",
  "openai/gpt-oss-20b:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
];

const contextText = content.documents
  .map((doc) => `## ${doc.title}\n${doc.text}`)
  .join("\n\n");

const systemPrompt = `You are a helpful assistant that answers questions about Joaquin Leimeter, a full-stack developer. Answer based on the provided context but you can make assumptions only if you tell the user that you are making an assuption. If a question cannot be answered from the context, say so briefly. Keep answers concise — 2 sentences unless more detail is warranted by the user.

Context about Joaquin:
${contextText}`;

const app = new Hono<{ Bindings: Bindings }>();

function corsHeaders(c: {
  req: { header: (k: string) => string | undefined };
  header: (k: string, v: string) => void;
  env: Bindings;
}) {
  const origin = c.req.header("origin") ?? "";
  const allowed = [
    "http://localhost:4321",
    "http://localhost:4322",
    ...(c.env.APP_ORIGIN ? [c.env.APP_ORIGIN] : []),
  ];
  if (allowed.includes(origin) || origin.endsWith(".pages.dev")) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Access-Control-Allow-Headers", "Content-Type, X-Client-ID");
    c.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  }
}

app.onError((err, c) => {
  console.error(err.message);
  corsHeaders(c);
  return c.json({ error: "internal_error" }, 500);
});

app.use("/api/*", (c, next) => {
  const allowed = [
    "http://localhost:4321",
    "http://localhost:4322",
    ...(c.env.APP_ORIGIN ? [c.env.APP_ORIGIN] : []),
  ];
  return cors({
    origin: (origin) =>
      allowed.includes(origin) || origin.endsWith(".pages.dev") ? origin : null,
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "X-Client-ID"],
  })(c, next);
});

app.get("/api/remaining", async (c) => {
  if (!c.env.SESSIONS) return c.json({ questionsRemaining: MAX_QUESTIONS });
  const clientId = c.req.header("X-Client-ID");
  if (!isValidUUID(clientId)) {
    return c.json({ questionsRemaining: MAX_QUESTIONS });
  }
  const session = await getSession(c.env.SESSIONS, clientId);
  return c.json({
    questionsRemaining: Math.max(0, MAX_QUESTIONS - session.count),
  });
});

app.post("/api/ask", async (c) => {
  if (!c.env.SESSIONS) return c.json({ error: "service_unavailable" }, 503);
  const clientId = c.req.header("X-Client-ID");
  if (!isValidUUID(clientId)) {
    return c.json({ error: "invalid_request" }, 400);
  }

  const session = await getSession(c.env.SESSIONS, clientId);

  if (session.count >= MAX_QUESTIONS) {
    return c.json({ error: "limit_reached", questionsRemaining: 0 }, 429);
  }

  let body: { question?: unknown };
  try {
    body = await c.req.json<{ question?: unknown }>();
  } catch {
    return c.json({ error: "invalid_request" }, 400);
  }

  const { question } = body;
  if (!question || typeof question !== "string" || !question.trim()) {
    return c.json({ error: "invalid_request" }, 400);
  }

  const trimmed = question.trim();
  const newCount = session.count + 1;
  const questionsRemaining = MAX_QUESTIONS - newCount;

  const openRouter = new OpenRouter({
    apiKey: c.env.OPEN_ROUTER_API_KEY,
    httpReferer: "https://joaquinleimeter.com",
    appTitle: "Joaquin Leimeter Portfolio",
  });

  let answer: string | null = null;
  for (const model of MODELS) {
    try {
      const completion = await openRouter.chat.send({
        chatRequest: {
          model,
          stream: false,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: trimmed },
          ],
        },
      });
      const { content: msg } = (
        completion as import("@openrouter/sdk/models").ChatResult
      ).choices[0].message;
      answer = typeof msg === "string" ? msg : "";
      break;
    } catch (err) {
      console.warn(
        `Model ${model} failed, trying next:`,
        (err as Error).message?.slice(0, 80),
      );
    }
  }

  if (answer === null) {
    return c.json({ error: "ai_unavailable" }, 503);
  }

  const now = Date.now();
  session.messages.push({ role: "user", text: trimmed, ts: now });
  session.messages.push({ role: "ai", text: answer, ts: now });
  session.count = newCount;
  await putSession(c.env.SESSIONS, clientId, session);

  return c.json({ answer, questionsRemaining });
});

app.delete("/api/session", async (c) => {
  if (c.env.ENVIRONMENT === "production") {
    return c.json({ error: "not_found" }, 404);
  }
  const clientId = c.req.header("X-Client-ID");
  if (!isValidUUID(clientId)) {
    return c.json({ error: "invalid_request" }, 400);
  }
  await c.env.SESSIONS.delete(clientId);
  return new Response(null, { status: 204 });
});

export default app;
