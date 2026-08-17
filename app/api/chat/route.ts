import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSystemPrompt, usesProfile } from "@/prompts/getSystemPrompt";
import { PROMPT_TYPE_BY_INTENT, type ChatIntent } from "@/lib/intent";
import { getProfileContext, type Readiness } from "@/lib/profile-context";

const MODELS = ["qwen2.5:1.5b", "qwen3.5:9b", "qwen3.6:27b", "gemma4:e4b"];

const MARKERS = ["[[NEED:", "[[SUGGEST:"] as const;
const MARKER_RE = /\[\[(NEED|SUGGEST):([a-zA-Z,\s]*)\]\]/;

const GROWING_RES = MARKERS.map(
  (m) => new RegExp(`^${m.replace(/[[\]]/g, "\\$&")}[a-zA-Z,\\s]*$`)
);

const MAX_MARKER_LEN = Math.max(...MARKERS.map((m) => m.length)) + 60;

const PARTIAL_MARKER_RE =
  /\[+\s*(?:N(?:E(?:E(?:D)?)?)?|S(?:U(?:G(?:G(?:E(?:S(?:T)?)?)?)?)?)?)?:?[a-zA-Z,\s]*\]*$/;

const SUGGESTABLE: ChatIntent[] = ["WRITE", "REVIEW", "INTERVIEW"];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const userId = session.user.id;
  const { messages, chatSessionId, thinkingMode } = await req.json();

  let intent: ChatIntent = "CHAT";

  if (chatSessionId) {
    const chat = await prisma.chatSession.findUnique({
      where: { id: chatSessionId },
      select: { userId: true, intent: true },
    });
    if (!chat || chat.userId !== userId) {
      return new Response("Forbidden", { status: 403 });
    }
    intent = chat.intent;
  }

  const type = PROMPT_TYPE_BY_INTENT[intent];

  let profile = "";
  let readiness: Readiness = { status: "READY", missing: [], weak: [] };

  if (usesProfile(type)) {
    const ctx = await getProfileContext(userId, intent);
    profile = ctx.text;
    readiness = ctx.readiness;
  }

  const gapKeys = new Set<string>([...readiness.missing, ...readiness.weak]);

  const SYSTEM_PROMPT = getSystemPrompt(type, { profile, readiness });

  try {
    const ollamaResponse = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      signal: req.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODELS[3],
        stream: true,
        think: thinkingMode,
        options: {
          temperature: 0.6,
          top_p: 0.95,
          top_k: 20,
          repeat_penalty: 1.1,
          repeat_last_n: 128,
          num_ctx: 32768,
          num_predict: -1,
        },
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        let closed = false;

        const send = (obj: unknown) => {
          if (closed || req.signal.aborted) return;
          controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
        };

        const closeStream = () => {
          if (closed) return;
          closed = true;
          controller.close();
        };

        if (usesProfile(type) && readiness.status !== "READY") {
          send({ type: "readiness", value: readiness });
        }

        const reader = ollamaResponse.body?.getReader();
        if (!reader) {
          closeStream();
          return;
        }

        req.signal.addEventListener("abort", async () => {
          try {
            await reader.cancel();
          } catch (e) {
            console.log("reader cancel error", e);
          }
        });

        let buffer = "";
        let hold = "";
        let needSent = false;
        let suggestSent = false;

        const findSafeEnd = (s: string): number => {
          const from = Math.max(0, s.length - MAX_MARKER_LEN);

          for (let i = from; i < s.length; i++) {
            if (s[i] !== "[") continue;

            const tail = s.slice(i);
            const growing =
              MARKERS.some((m) => m.startsWith(tail)) ||
              GROWING_RES.some((re) => re.test(tail));
              
            if (growing) return i;
          }
          return s.length;
        };

        const flush = (final = false) => {
          let found: RegExpMatchArray | null;

          while ((found = hold.match(MARKER_RE))) {
            const [full, kind, raw] = found;

            hold = hold.replace(full, "");

            if (kind === "NEED") {
              if (needSent) continue;

              const keys = raw
                .split(",")
                .map((k) => k.trim())
                .filter((k) => gapKeys.has(k));

              if (keys.length) {
                send({ type: "need", value: keys.slice(0, 2) });
                needSent = true;
              }
              continue;
            }

            if (kind === "SUGGEST") {
              if (suggestSent) continue;

              const target = raw.trim().toUpperCase() as ChatIntent;

              if (SUGGESTABLE.includes(target) && target !== intent) {
                send({ type: "suggest", value: target });
                suggestSent = true;
              }
            }
          }

          if (final) {
            const cleaned = hold.replace(PARTIAL_MARKER_RE, "").trimEnd();
            if (cleaned) send({ type: "content", value: cleaned });
            hold = "";
            return;
          }

          const safeEnd = findSafeEnd(hold);

          if (safeEnd > 0) {
            send({ type: "content", value: hold.slice(0, safeEnd) });
            hold = hold.slice(safeEnd);
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (req.signal.aborted) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            const line = part.trim();
            if (!line) continue;

            try {
              const json = JSON.parse(line);

              if (json.done) {
                flush(true);
                closeStream();
                return;
              }
              if (json.message?.thinking) {
                send({ type: "thinking", value: json.message.thinking });
              }
              if (json.message?.content) {
                hold += json.message.content;
                flush();
              }
            } catch {
              /* 잘린 JSON 무시 */
            }
          }
        }

        flush(true);
        closeStream();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error in POST /api/chat:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}