"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const testAI = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setReply("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
      }),
    });

    const reader = res.body?.getReader();

    if (!reader) return;

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value);

      setReply((prev) => prev + chunk);
    }

    setMessage("");
  };

  return (
    <div>
      <form
        onSubmit={testAI}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-1/2 max-w-2xl px-4 ml-30"
      >
        <div className="relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요"
            className="w-full rounded-full bg-gray-100 py-4 pl-5 pr-16 focus:outline-none"
          />

          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            ↑
          </button>
        </div>
      </form>

      <div className="absolute top-20 w-1/2 left-20">
        <p style={{ whiteSpace: "pre-wrap" }}>
          {reply}
        </p>
      </div>
    </div>
  );
}