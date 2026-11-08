import { buildInstructions } from "../_shared/prompt.ts";
import { cleanLang, cleanSessionId, logDigitalTwinMessage } from "../_shared/chat-log.ts";

const ARK_ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_ITEMS = 8;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 12;
const requests = new Map<string, number[]>();

const defaultOrigins = [
  "https://leesir-s-personal-homepage.pages.dev",
  "https://leesirleesirlee-star.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
];

function allowedOrigins(): string[] {
  const configured = (Deno.env.get("ALLOWED_ORIGINS") || "")
    .split(",").map((item) => item.trim()).filter(Boolean);
  return [...new Set([...defaultOrigins, ...configured])];
}

function corsHeaders(origin: string | null): HeadersInit {
  const allowed = origin && allowedOrigins().includes(origin) ? origin : "null";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(data: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}

function withinRateLimit(req: Request): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const now = Date.now();
  const recent = (requests.get(ip) || []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) return false;
  recent.push(now);
  requests.set(ip, recent);
  if (requests.size > 1000) {
    for (const [key, times] of requests) {
      if (!times.some((time) => now - time < RATE_WINDOW_MS)) requests.delete(key);
    }
  }
  return true;
}

type HistoryItem = { role: "user" | "assistant"; content: string };

function cleanHistory(value: unknown): HistoryItem[] {
  if (!Array.isArray(value)) return [];
  return value.slice(-MAX_HISTORY_ITEMS).flatMap((item): HistoryItem[] => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as Record<string, unknown>;
    if (candidate.role !== "user" && candidate.role !== "assistant") return [];
    if (typeof candidate.content !== "string" || !candidate.content.trim()) return [];
    return [{ role: candidate.role, content: candidate.content.trim().slice(0, 1200) }];
  });
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);
  if (origin && !allowedOrigins().includes(origin)) {
    return json({ error: "Origin not allowed", code: "ORIGIN_DENIED" }, 403, origin);
  }
  if (!withinRateLimit(req)) {
    return json({ error: "Too many requests", code: "RATE_LIMIT" }, 429, origin);
  }

  const apiKey = Deno.env.get("ARK_API_KEY");
  const model = Deno.env.get("ARK_MODEL");
  if (!apiKey || !model) {
    return json({ error: "Text service is not configured", code: "NOT_CONFIGURED" }, 503, origin);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json() as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid JSON", code: "BAD_REQUEST" }, 400, origin);
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return json({ error: "Message is empty or too long", code: "BAD_MESSAGE" }, 400, origin);
  }

  const history = cleanHistory(body.history);
  const requestId = crypto.randomUUID();
  const sessionId = cleanSessionId(body.sessionId, requestId);
  const lang = cleanLang(body.lang);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    const upstream = await fetch(ARK_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: buildInstructions() },
          ...history,
          { role: "user", content: message },
        ],
        thinking: { type: "disabled" },
        temperature: 0.4,
        max_tokens: 500,
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error(JSON.stringify({ requestId, upstreamStatus: upstream.status, detail: detail.slice(0, 1200) }));
      return json({ error: "Model request failed", code: "UPSTREAM_ERROR", requestId }, 502, origin);
    }

    const result = await upstream.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const answer = result.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      console.error(JSON.stringify({ requestId, error: "Empty model response" }));
      return json({ error: "Empty model response", code: "EMPTY_RESPONSE", requestId }, 502, origin);
    }

    const responseAnswer = answer.slice(0, 3000);
    await logDigitalTwinMessage({
      sessionId,
      requestId,
      question: message,
      answer: responseAnswer,
      lang,
      source: "text",
    });
    return json({ answer: responseAnswer, requestId }, 200, origin);
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    console.error(JSON.stringify({ requestId, error: error instanceof Error ? error.message : String(error) }));
    return json({
      error: timedOut ? "Model request timed out" : "Service unavailable",
      code: timedOut ? "TIMEOUT" : "SERVICE_ERROR",
      requestId,
    }, timedOut ? 504 : 500, origin);
  } finally {
    clearTimeout(timeout);
  }
});
