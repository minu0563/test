"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

type ChatInputProps = {
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
  testAI: (e: React.FormEvent<HTMLFormElement>) => void;
  stopAI: () => void;
  isStreaming: boolean;
  thinkingMode: boolean;
  setThinkingMode: Dispatch<SetStateAction<boolean>>;
};

type ModeProps = {
  mode: "start" | "chat";
};

type Props = ChatInputProps & ModeProps;

const MAX_HEIGHT = 300;

export default function ChatInput({ message, setMessage, testAI, stopAI, isStreaming, thinkingMode, setThinkingMode, mode }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modeRef = useRef<HTMLDivElement>(null);
  const [showModeSelector, setShowModeSelector] = useState(false);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";

    const height = Math.min(textarea.scrollHeight, MAX_HEIGHT);

    textarea.style.height = `${height}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
    textarea.scrollTop = textarea.scrollHeight;
  };

  useEffect(() => {
    resizeTextarea();
  }, [message]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        modeRef.current &&
        !modeRef.current.contains(e.target as Node)
      ) {
        setShowModeSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (!isStreaming) {
        e.currentTarget.form?.requestSubmit();
      }
    }
  };

  useEffect(() => {
    const handleWindowKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isStreaming) {
        stopAI();
        return;
      }

      if (document.activeElement === textareaRef.current) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (e.key.length === 1) {
        e.preventDefault();
        textareaRef.current?.focus();
        setMessage((prev) => prev + e.key);
      }
    };

    window.addEventListener("keydown", handleWindowKeyDown);

    return () => {
      window.removeEventListener("keydown", handleWindowKeyDown);
    };
  }, [isStreaming, stopAI, setMessage]);

  return (
    <form onSubmit={testAI} className={mode === "start" ? "p-4 relative mx-auto w-full max-w-4xl" : "border-t border-(--input-border) p-4 shrink-0"}>
      <div className={`relative mx-auto w-full ${mode === "start" ? "max-w-4xl" : "max-w-2xl"}`}>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="메시지를 입력하세요"
          className="chat-scrollbar w-full resize-none overflow-hidden rounded-[28px] border border-(--input-border) bg-(--input-bg) px-5 py-4 pr-16 leading-6 text-(--text) focus:outline-none"
        />

        <div ref={modeRef} className="absolute bottom-3 right-3 flex items-center gap-1">
          {showModeSelector && (
            <div className="absolute bottom-12 right-0 w-80 rounded-2xl border border-(--input-border) bg-(--input-bg) p-2 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setThinkingMode(false);
                  setShowModeSelector(false);
                }}
                className={`flex w-full flex-col gap-1 rounded-xl px-3 py-2.5 text-left transition-colors cursor-pointer ${
                  !thinkingMode
                    ? "bg-(--input-button-bg) text-(--input-text)"
                    : "text-(--text) hover:bg-(--input-thinking-hover-bg)"
                }`}
              >
                <span className="text-sm font-medium">
                  빠른 모드
                </span>
                <span className="text-xs opacity-70">
                  빠른 응답, 일반적인 대화에 적합
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setThinkingMode(true);
                  setShowModeSelector(false);
                }}
                className={`mt-2 flex w-full flex-col gap-1 rounded-xl px-3 py-2.5 text-left transition-colors cursor-pointer ${
                  thinkingMode
                    ? "bg-(--input-button-bg) text-(--input-text)"
                    : "text-(--text) hover:bg-(--input-thinking-hover-bg)"
                }`}
              >
                <span className="text-sm font-medium">
                  추론 모드
                </span>
                <span className="text-xs opacity-70">
                  복잡한 문제 분석, 깊은 사고에 적합
                </span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowModeSelector((prev) => !prev)}
            className="flex h-10 w-8 items-center justify-center text-(--text) hover:text-(--input-button-hover) cursor-pointer"
          >
            <span className="flex items-center justify-center text-xl leading-none">
              {!showModeSelector ? "∧" : "∨"}
            </span>
          </button>

          <button
            type={isStreaming ? "button" : "submit"}
            onClick={isStreaming ? stopAI : undefined}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-(--input-button-bg) text-(--input-text) transition-colors hover:bg-(--input-button-hover) cursor-pointer"
          >
            {isStreaming ? "■" : "↑"}
          </button>
        </div>
      </div>
    </form>
  );
}