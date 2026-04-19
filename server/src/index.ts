import { serve } from "@hono/node-server";
import { getConnInfo } from "@hono/node-server/conninfo";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { OpenRouter } from "@openrouter/sdk";
import content from "@portfolio/content/data" with { type: "json" };

const OPEN_ROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY;
if (!OPEN_ROUTER_API_KEY) {
  console.error("Missing required env var: OPEN_ROUTER_API_KEY");
  process.exit(1);
}

const MAX_QUESTIONS = 5;
const rateLimitStore = new Map<string, number>();

const contextText = content.documents
  .map((doc) => `## ${doc.title}\n${doc.text}`)
  .join("\n\n");

const systemPrompt = `You are a helpful assistant that answers questions about Joaquin Leimeter, a full-stack developer. Answer only based on the provided context. If a question cannot be answered from the context, say so briefly. Keep answers concise — 2–4 sentences unless more detail is warranted.

Context about Joaquin:
${contextText}`;

const MODELS = [
  "openai/gpt-oss-120b:free",
  "openai/gpt-oss-20b:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
];

const openRouter = new OpenRouter({
  apiKey: OPEN_ROUTER_API_KEY,
  httpReferer: "https://joaquinleimeter.com",
  appTitle: "Joaquin Leimeter Portfolio",
});

const app = new Hono();

const allowedOrigins = ["http://localhost:4321", process.env.APP_ORIGIN].filter(
  (o): o is string => Boolean(o),
);

app.use(
  "/api/*",
  cors({
    origin: (origin) => (allowedOrigins.includes(origin) ? origin : null),
    allowMethods: ["POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

app.post("/api/ask", async (c) => {
  const connInfo = getConnInfo(c);
  const ip =
    c.req.header("x-forwarded-for")?.split(",")[0].trim() ??
    connInfo.remote.address ??
    "unknown";

  const count = rateLimitStore.get(ip) ?? 0;
  if (count >= MAX_QUESTIONS) {
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

  const newCount = count + 1;
  rateLimitStore.set(ip, newCount);
  const questionsRemaining = MAX_QUESTIONS - newCount;

  let answer: string | null = null;
  for (const model of MODELS) {
    try {
      const completion = await openRouter.chat.send({
        chatRequest: {
          model,
          stream: false,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question.trim() },
          ],
        },
      });
      const { content } = (
        completion as import("@openrouter/sdk/models").ChatResult
      ).choices[0].message;
      answer = typeof content === "string" ? content : "";
      break;
    } catch (err) {
      console.warn(
        `Model ${model} failed, trying next:`,
        (err as Error).message?.slice(0, 80),
      );
    }
  }

  if (answer === null) {
    rateLimitStore.set(ip, count);
    return c.json({ error: "ai_unavailable" }, 503);
  }

  return c.json({ answer, questionsRemaining });
});

const port = Number(process.env.PORT ?? 3001);
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running on port ${info.port}`);
});
