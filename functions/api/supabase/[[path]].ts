const SUPABASE_URL = "https://hblrhrhwmnlpvpadvgmq.supabase.co";
const CANONICAL_ORIGIN = "https://leesir-s-personal-homepage.pages.dev";
const ALLOWED_PATHS = [
  "/rest/v1/",
  "/auth/v1/",
  "/functions/v1/digital-twin-chat",
  "/functions/v1/digital-twin-voice",
  "/functions/v1/digital-twin-tts",
];

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function isAllowed(path: string): boolean {
  return ALLOWED_PATHS.some((prefix) => path === prefix.replace(/\/$/, "") || path.startsWith(prefix));
}

export async function onRequest(context: any): Promise<Response> {
  const request: Request = context.request;
  const url = new URL(request.url);
  const prefix = "/api/supabase";
  if (!url.pathname.startsWith(prefix)) return json({ error: "Not found" }, 404);

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": request.headers.get("origin") || "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, prefer",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      },
    });
  }

  const path = (url.pathname.slice(prefix.length) || "/") + url.search;
  if (!isAllowed(path)) return json({ error: "Path not allowed", code: "PROXY_PATH_DENIED" }, 403);

  const headers = new Headers();
  const allowedHeaders = [
    "accept",
    "authorization",
    "content-type",
    "apikey",
    "prefer",
    "range",
    "x-client-info",
    "x-supabase-api-version",
  ];
  for (const name of allowedHeaders) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("origin", CANONICAL_ORIGIN);
  const clientIp = request.headers.get("cf-connecting-ip");
  if (clientIp) headers.set("x-forwarded-for", clientIp);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body as any;
  }

  try {
    const upstream = await fetch(SUPABASE_URL + path, init);
    const responseHeaders = new Headers();
    for (const [name, value] of upstream.headers) {
      if (["content-encoding", "content-length", "transfer-encoding", "connection"].includes(name)) continue;
      if (name.startsWith("access-control-")) continue;
      responseHeaders.set(name, value);
    }
    responseHeaders.set("Cache-Control", "no-store");
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Supabase relay failed:", error);
    return json({ error: "Relay unavailable", code: "RELAY_UNAVAILABLE" }, 502);
  }
}
