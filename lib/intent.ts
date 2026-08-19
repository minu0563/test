import type { PromptType } from "@/prompts/getSystemPrompt";

/** Prisma enum과 동일 */
export type ChatIntent = "CHAT" | "WRITE" | "REVIEW" | "INTERVIEW";

export const PROMPT_TYPE_BY_INTENT: Record<ChatIntent, PromptType> = {
  CHAT: "chat",
  WRITE: "write",
  REVIEW: "review",
  INTERVIEW: "interview",
};

/** 세션 상세 페이지 경로 */
export const PATH_BY_INTENT: Record<ChatIntent, string> = {
  CHAT: "/c",
  WRITE: "/w",
  REVIEW: "/r",
  INTERVIEW: "/i",
};

export const LABEL_BY_INTENT: Record<ChatIntent, string> = {
  CHAT: "자유 질문",
  WRITE: "자소서 작성",
  REVIEW: "자소서 첨삭",
  INTERVIEW: "면접 준비",
};

export const sessionHref = (intent: ChatIntent, id: string) =>
  `${PATH_BY_INTENT[intent]}/${id}`;