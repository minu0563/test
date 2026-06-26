// 입력 컴포넌트
import { Dispatch, SetStateAction } from "react";

type ChatInputProps = {
    message: string;
    setMessage: Dispatch<SetStateAction<string>>;
    testAI: (e: React.FormEvent<HTMLFormElement>) => void;
  };

export default function ChatInput({ message, setMessage, testAI }: ChatInputProps) {
    return (
        <form
        onSubmit={testAI}
        className="border-t border-gray-200 p-4"
      >
        <div className="relative mx-auto max-auto w-full max-w-2xl">
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

)};