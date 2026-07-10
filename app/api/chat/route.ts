import { SYSTEM_PROMPT } from "@/prompts/systemPrompt";

export async function POST(req: Request) {
  const { message } = await req.json();
  const model = ["qwen2.5:1.5b", "qwen3:8b", "gemma4:26b", "gemma4:e4b"]
  
  const ollamaResponse = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model[3],
      stream: true,
      options: {
        temperature: 0.2,
        repeat_penalty: 1.1,
        num_ctx: 4096,
        think: false,

      },
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: message,
        },
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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

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

            if (content) {
              controller.enqueue(encoder.encode(content));
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
}