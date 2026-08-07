import { getSystemPrompt } from "@/lib/getSystemPrompt";

export async function POST(req: Request) {
  const { messages, promptType, thinkingMode } = await req.json();
  const model = ["qwen2.5:1.5b", "qwen3.5:9b", "gemma4:26b", "gemma4:e4b"]
  const SYSTEM_PROMPT = getSystemPrompt(promptType);

  try {
    const ollamaResponse = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      signal: req.signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model[1],
        stream: true,
        think: thinkingMode,

        options: {
          temperature: 0.2,
          repeat_penalty: 1.1,
          num_ctx: 32768,
          num_predict: -1,

        },
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          ...messages,
        ],
      }),
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = ollamaResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        let buffer = "";
        req.signal.addEventListener("abort", async () => {
          console.log("ai 추론 종료");

          try {
            await reader.cancel();
          } catch (e) {
            console.log("reader cancel error", e);
          }
        });
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (req.signal.aborted) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split("\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            const line = part.trim();
            if (!line) continue;

            try {
              const json = JSON.parse(line);

              if (json.done) {
                controller.close();
                return;
              }

              const content = json.message?.content;
              const thinking = json.message?.thinking;

              if (thinking) {
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({
                      type: "thinking",
                      value: thinking,
                    }) + "\n"
                  )
                );
              }

              if (content) {
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({
                      type: "content",
                      value: content,
                    }) + "\n"
                  )
                );
              }
            } catch {

            }
          }
        }

        controller.close();
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