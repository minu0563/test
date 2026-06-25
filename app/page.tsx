"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const testAI = async () => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
      }),
    });

    const data = await res.json();

    console.log(data.reply);
    setReply((prev) => prev + data.reply)
  };

  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="메시지를 입력하세요"
      />


    
      <button onClick={testAI}>
        전송
      </button>
      <div>
        <h1>답변</h1>
        <p>{reply}</p>
      </div>
    </div>
  );
}