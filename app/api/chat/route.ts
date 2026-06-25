export async function POST(req: Request) {
  const { message } = await req.json();

  const response = await fetch(
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
        stream: false,
      }),
    }
  );

  const data = await response.json();

  return Response.json({
    reply: data.message.content,
  });
}