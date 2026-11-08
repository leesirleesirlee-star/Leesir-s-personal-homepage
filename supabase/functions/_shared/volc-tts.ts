const TTS_ENDPOINT = "https://openspeech.bytedance.com/api/v3/tts/unidirectional";
const MAX_TTS_CHARS = 3000;
const MAX_CHUNK_CHARS = 800;

export function encodeBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

export function decodeBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
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

function splitText(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ").trim().slice(0, MAX_TTS_CHARS);
  if (!normalized) return [];
  const sentences = normalized.match(/[^。！？!?；;\n]+[。！？!?；;\n]?/g) || [normalized];
  const chunks: string[] = [];
  let current = "";

  function pushLong(value: string): void {
    for (let offset = 0; offset < value.length; offset += MAX_CHUNK_CHARS) {
      const part = value.slice(offset, offset + MAX_CHUNK_CHARS).trim();
      if (part) chunks.push(part);
    }
  }

  for (const sentence of sentences) {
    const clean = sentence.trim();
    if (!clean) continue;
    if (clean.length > MAX_CHUNK_CHARS) {
      if (current) {
        chunks.push(current);
        current = "";
      }
      pushLong(clean);
      continue;
    }
    if (current && current.length + clean.length > MAX_CHUNK_CHARS) {
      chunks.push(current);
      current = "";
    }
    current += clean;
  }
  if (current) chunks.push(current);
  return chunks;
}

export async function synthesizeMp3(
  text: string,
  speechKey: string,
  voice: string,
  requestId: string
): Promise<Uint8Array> {
  const chunks = splitText(text);
  if (!chunks.length) throw new Error("TTS text is empty");

  const audioChunks: Uint8Array[] = [];
  let total = 0;
  for (const chunk of chunks) {
    const response = await fetchWithTimeout(TTS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": speechKey,
        "X-Api-Resource-Id": "seed-tts-2.0",
        "X-Api-Request-Id": crypto.randomUUID(),
      },
      body: JSON.stringify({
        req_params: {
          text: chunk,
          speaker: voice,
          audio_params: { format: "mp3" },
        },
      }),
    }, 45_000);

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 1000);
      throw new Error(`TTS HTTP ${response.status} (${requestId}): ${detail}`);
    }
    const bytes = await readChunkedMp3(response);
    audioChunks.push(bytes);
    total += bytes.length;
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of audioChunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}
