import { buildInstructions } from "../_shared/prompt.ts";

const ASR_ENDPOINT = "https://openspeech.bytedance.com/api/v3/auc/bigmodel/recognize/flash";
const ARK_ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
const TTS_ENDPOINT = "https://openspeech.bytedance.com/api/v3/tts/unidirectional";
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 6;
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
  return true;
}

function cleanHistory(value: unknown): Array<{ role: "user" | "assistant"; content: string }> {
  if (!Array.isArray(value)) return [];
  return value.slice(-6).flatMap((item): Array<{ role: "user" | "assistant"; content: string }> => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as Record<string, unknown>;
    if (candidate.role !== "user" && candidate.role !== "assistant") return [];
    if (typeof candidate.content !== "string" || !candidate.content.trim()) return [];
    return [{ role: candidate.role, content: candidate.content.trim().slice(0, 1200) }];
  });
}

function encodeBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function readChunkedMp3(response: Response): Promise<Uint8Array> {
  if (!response.body) throw new Error("TTS response has no body");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const chunks: Uint8Array[] = [];
  let pending = "";
  let total = 0;

  function consume(line: string): void {
    const trimmed = line.trim();
    if (!trimmed) return;
    const event = JSON.parse(trimmed) as { code?: number; data?: string; message?: string };
    // 火山 TTS V3 使用 20000000 表示成功；同时兼容部分网关返回的 0。
    if (event.code !== undefined && event.code !== 0 && event.code !== 20000000) {
      throw new Error(`TTS event ${event.code}: ${event.message || "failed"}`);
    }
    if (event.data) {
      const bytes = decodeBase64(event.data);
      chunks.push(bytes);
      total += bytes.length;
    }
  }

  while (true) {
    const { done, value } = await reader.read();
    pending += decoder.decode(value || new Uint8Array(), { stream: !done });
    let newline = pending.indexOf("\n");
    while (newline >= 0) {
      consume(pending.slice(0, newline));
      pending = pending.slice(newline + 1);
      newline = pending.indexOf("\n");
    }
    if (done) break;
  }
  consume(pending);
  if (!total) throw new Error("TTS returned no audio");
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
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

  const arkKey = Deno.env.get("ARK_API_KEY");
  const model = Deno.env.get("ARK_MODEL");
  const speechKey = Deno.env.get("VOLC_SPEECH_API_KEY");
  const asrResourceId = Deno.env.get("VOLC_ASR_RESOURCE_ID") || "volc.seedasr.auc";
  const voice = Deno.env.get("VOLC_TTS_VOICE");
  if (!arkKey || !model || !speechKey || !voice) {
    return json({ error: "Voice service is not configured", code: "NOT_CONFIGURED" }, 503, origin);
  }

  const requestId = crypto.randomUUID();
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "Expected multipart form data", code: "BAD_REQUEST" }, 400, origin);
  }

  try {
    const audio = form.get("audio");
    if (!(audio instanceof File) || audio.size === 0 || audio.size > 8 * 1024 * 1024) {
      return json({ error: "Audio is empty or too large", code: "BAD_AUDIO" }, 400, origin);
    }
    const isOgg = audio.type.includes("ogg");
    const isWav = audio.type.includes("wav") || audio.type.includes("wave");
    if (!isOgg && !isWav) {
      return json({ error: "Only Ogg/Opus or WAV is accepted", code: "BAD_AUDIO_FORMAT" }, 415, origin);
    }
    let history: unknown = [];
    try { history = JSON.parse(String(form.get("history") || "[]")); } catch { history = []; }

    // 1) 短音频 ASR：录音文件识别 2.0 的极速接口，一次请求同步返回文本。
    const audioBytes = new Uint8Array(await audio.arrayBuffer());
    const asrResponse = await fetchWithTimeout(ASR_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": speechKey,
        "X-Api-Resource-Id": asrResourceId,
        "X-Api-Request-Id": requestId,
        "X-Api-Sequence": "-1",
      },
      body: JSON.stringify({
        audio: { data: encodeBase64(audioBytes), format: isOgg ? "ogg" : "wav" },
        request: { model_name: "bigmodel", enable_itn: true, enable_punc: true },
      }),
    }, 35_000);
    const asrStatus = asrResponse.headers.get("X-Api-Status-Code");
    const asrBody = await asrResponse.text();
    if (!asrResponse.ok || (asrStatus && asrStatus !== "20000000")) {
      console.error(JSON.stringify({ requestId, stage: "asr", status: asrResponse.status, asrStatus, detail: asrBody.slice(0, 1000) }));
      return json({ error: "Speech recognition failed", code: "ASR_ERROR", requestId }, 502, origin);
    }
    const asrResult = JSON.parse(asrBody) as { result?: { text?: string } };
    const transcript = asrResult.result?.text?.trim();
    if (!transcript) {
      return json({ error: "No speech recognized", code: "ASR_EMPTY", requestId }, 422, origin);
    }

    // 2) 复用数字分身的知识库、提示词和文本模型主逻辑。
    const arkResponse = await fetchWithTimeout(ARK_ENDPOINT, {
      method: "POST",
      headers: { "Authorization": `Bearer ${arkKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: buildInstructions() },
          ...cleanHistory(history),
          { role: "user", content: transcript },
        ],
        thinking: { type: "disabled" },
        temperature: 0.4,
        max_tokens: 500,
        stream: false,
      }),
    }, 45_000);
    if (!arkResponse.ok) {
      console.error(JSON.stringify({ requestId, stage: "ark", status: arkResponse.status, detail: (await arkResponse.text()).slice(0, 1000) }));
      return json({ error: "Model request failed", code: "UPSTREAM_ERROR", requestId }, 502, origin);
    }
    const arkResult = await arkResponse.json() as { choices?: Array<{ message?: { content?: string } }> };
    const answer = arkResult.choices?.[0]?.message?.content?.trim().slice(0, 2000);
    if (!answer) return json({ error: "Empty model response", code: "EMPTY_RESPONSE", requestId }, 502, origin);

    // 3) TTS V3：逐条读取 chunked JSON，分别解码音频块后拼接 MP3。
    // TTS 失败仍返回文本结果，前端据此降级为纯文字回答。
    try {
      const ttsResponse = await fetchWithTimeout(TTS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": speechKey,
          "X-Api-Resource-Id": "seed-tts-2.0",
          "X-Api-Request-Id": requestId,
        },
        body: JSON.stringify({
          req_params: {
            text: answer,
            speaker: voice,
            audio_params: { format: "mp3" },
          },
        }),
      }, 45_000);
      if (!ttsResponse.ok) {
        throw new Error(`HTTP ${ttsResponse.status}: ${(await ttsResponse.text()).slice(0, 1000)}`);
      }
      const mp3 = await readChunkedMp3(ttsResponse);
      return json({
        transcript,
        answer,
        audioBase64: encodeBase64(mp3),
        mimeType: "audio/mpeg",
        requestId,
      }, 200, origin);
    } catch (ttsError) {
      console.error(JSON.stringify({
        requestId,
        stage: "tts",
        error: ttsError instanceof Error ? ttsError.message : String(ttsError),
      }));
      return json({ transcript, answer, audioBase64: null, ttsError: true, requestId }, 200, origin);
    }
  } catch (error) {
    console.error(JSON.stringify({ requestId, error: error instanceof Error ? error.message : String(error) }));
    return json({ error: "Voice service unavailable", code: "VOICE_SERVICE_ERROR", requestId }, 500, origin);
  }
});
