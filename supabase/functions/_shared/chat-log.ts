/* 数字分身问答记录：只写当前问题与回答，失败不影响主流程。 */

export type ChatSource = "text" | "voice";
export type ChatLang = "zh" | "en";

export function cleanSessionId(value: unknown, fallback: string): string {
  const candidate = typeof value === "string" ? value.trim() : "";
  if (/^[A-Za-z0-9_-]{8,64}$/.test(candidate)) return candidate;
  return fallback;
}

export function cleanLang(value: unknown): ChatLang {
  return value === "en" ? "en" : "zh";
}

export async function logDigitalTwinMessage(input: {
  sessionId: string;
  requestId: string;
  question: string;
  answer: string;
  lang: ChatLang;
  source: ChatSource;
}): Promise<void> {
  const base = Deno.env.get("SUPABASE_URL")?.replace(/\/+$/, "");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!base || !serviceKey) {
    console.error(JSON.stringify({
      stage: "chat_log",
      requestId: input.requestId,
      error: "Missing Supabase service configuration",
    }));
    return;
  }

  const question = input.question.trim().slice(0, 2000);
  const answer = input.answer.trim().slice(0, 4000);
  if (!question || !answer) return;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(`${base}/rest/v1/digital_twin_messages`, {
      method: "POST",
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        session_id: input.sessionId,
        request_id: input.requestId,
        question,
        answer,
        lang: input.lang,
        source: input.source,
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      console.error(JSON.stringify({
        stage: "chat_log",
        requestId: input.requestId,
        status: response.status,
        detail: (await response.text()).slice(0, 500),
      }));
    }
  } catch (error) {
    console.error(JSON.stringify({
      stage: "chat_log",
      requestId: input.requestId,
      error: error instanceof Error ? error.message : String(error),
    }));
  } finally {
    clearTimeout(timer);
  }
}
