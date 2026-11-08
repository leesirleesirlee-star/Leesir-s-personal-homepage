import { encodeBase64, synthesizeMp3 } from "../_shared/volc-tts.ts";

const MAX_TEXT_LENGTH = 3000;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 20;
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
  return {
    "Access-Control-Allow-Origin": origin && allowedOrigins().includes(origin) ? origin : "null",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(data: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json", "Cache-Control": "no-store" },
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

  const speechKey = Deno.env.get("VOLC_SPEECH_API_KEY");
  const voice = Deno.env.get("VOLC_TTS_VOICE");
  if (!speechKey || !voice) {
    return json({ error: "TTS service is not configured", code: "NOT_CONFIGURED" }, 503, origin);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json() as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid JSON", code: "BAD_REQUEST" }, 400, origin);
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text || text.length > MAX_TEXT_LENGTH) {
    return json({ error: "Text is empty or too long", code: "BAD_TEXT" }, 400, origin);
  }

  const requestId = crypto.randomUUID();
  try {
    const mp3 = await synthesizeMp3(text, speechKey, voice, requestId);
    return json({
      audioBase64: encodeBase64(mp3),
      mimeType: "audio/mpeg",
      requestId,
    }, 200, origin);
  } catch (error) {
    console.error(JSON.stringify({
      requestId,
      stage: "tts",
      error: error instanceof Error ? error.message : String(error),
    }));
    return json({ error: "Voice synthesis failed", code: "TTS_ERROR", requestId }, 502, origin);
  }
});
