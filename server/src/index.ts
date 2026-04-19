import { Hono } from "hono";
import { cors } from "hono/cors";
import { OpenRouter } from "@openrouter/sdk";
import content from "@portfolio/content/data";

type Bindings = {
  RATE_LIMIT: KVNamespace;
  OPEN_ROUTER_API_KEY: string;
  APP_ORIGIN?: string;
};

const MAX_QUESTIONS = 5;

const MODELS = [
  "openai/gpt-oss-120b:free",
  "openai/gpt-oss-20b:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
];

const contextText = content.documents
  .map((doc) => `## ${doc.title}\n${doc.text}`)
  .join("\n\n");

const systemPrompt = `You are a helpful assistant that answers questions about Joaquin Leimeter, a full-stack developer. Answer only based on the provided context. If a question cannot be answered from the context, say so briefly. Keep answers concise — 2–4 sentences unless more detail is warranted.

Context about Joaquin:
${contextText}`;

const app = new Hono<{ Bindings: Bindings }>();

app.use("/api/*", (c, next) => {
  const allowed = [
    "http://localhost:4321",
    "http://localhost:4322",
    ...(c.env.APP_ORIGIN ? [c.env.APP_ORIGIN] : []),
  ];
  return cors({
    origin: (origin) =>
      allowed.includes(origin) || origin.endsWith(".pages.dev") ? origin : null,
    allowMethods: ["POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })(c, next);
});

app.post("/api/ask", async (c) => {
  const ip = c.req.header("cf-connecting-ip") ?? "unknown";

  const countStr = await c.env.RATE_LIMIT.get(ip);
  const count = Number(countStr ?? "0");

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
  await c.env.RATE_LIMIT.put(ip, String(newCount), { expirationTtl: 86400 });
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
            { role: "user", content: question.trim() },
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
    await c.env.RATE_LIMIT.put(ip, String(count), { expirationTtl: 86400 });
    return c.json({ error: "ai_unavailable" }, 503);
  }

  return c.json({ answer, questionsRemaining });
});

export default app;
