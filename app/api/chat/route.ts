export async function POST(req: Request) {
  const { message } = await req.json();

  const ollamaResponse = await fetch(
    "http://localhost:11434/api/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen3:8b",
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
        stream: true,
      }),
    }
  );

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

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const json = JSON.parse(line);

            const content = json.message?.content;

            if (content) {
              controller.enqueue(
                encoder.encode(content)
              );
            }
          } catch {}
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}