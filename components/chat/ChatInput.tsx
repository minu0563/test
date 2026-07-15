// 입력 컴포넌트
import { Dispatch, SetStateAction, useEffect, useRef } from "react";

type ChatInputProps = {
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
  testAI: (e: React.FormEvent<HTMLFormElement>) => void;
  stopAI: () => void;
  isStreaming: boolean;
};

type modePorps = {
  mode: "start" | "chat";
};

type Props = ChatInputProps & modePorps;

export default function ChatInput({ message, setMessage, testAI, stopAI, isStreaming, mode }: Props) {

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isStreaming) {
        stopAI();
      }

      if (document.activeElement === inputRef.current) {
        return;
      }

      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      if (e.key.length === 1) {
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isStreaming, stopAI]);

  return (
    <>
      {mode === "start" ? (
        <form
          onSubmit={testAI}
          className="p-4 relative mx-auto w-full max-w-4xl"
        >
          <div className="relative mx-auto max-auto w-full max-w-4xl">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="메시지를 입력하세요"
              className="w-full rounded-full bg-input-bg py-4 pl-5 pr-16 focus:outline-none"
            />

            <button
              type={isStreaming ? "button" : "submit"}
              onClick={isStreaming ? stopAI : undefined}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-input-button-bg px-4 py-2 text-input-text hover:bg-input-button-hover"
            >
              {isStreaming ? "■" : "↑"}
            </button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={testAI}
          className="border-t border-input-border p-4"
        >
          <div className="relative mx-auto max-auto w-full max-w-2xl">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="메시지를 입력하세요"
              className="w-full rounded-full bg-input-bg py-4 pl-5 pr-16 focus:outline-none"
            />

            <button
              type={isStreaming ? "button" : "submit"}
              onClick={isStreaming ? stopAI : undefined}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-input-button-bg px-4 py-2 text-input-text hover:bg-input-button-hover cursor-pointer"
            >
              {isStreaming ? "■" : "↑"}
            </button>
          </div>
        </form>
      )}

    </>

  )
};