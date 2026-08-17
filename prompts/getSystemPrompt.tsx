import { MISSING_LABEL, type Readiness } from "@/lib/profile-context";

import { SYSTEM_PROMPT as CHAT_PROMPT } from "./chatPrompt";
import { WRITE_PROMPT } from "./writePrompt";
import { REVIEW_PROMPT } from "./reviewPrompt";
import { INTERVIEW_PROMPT } from "./interviewPrompt";
import { ROLE, GUARDRAILS } from "./shared";

export type PromptType = "chat" | "write" | "review" | "interview";

export const INTENT_BY_TYPE = {
  chat: "CHAT",
  write: "WRITE",
  review: "REVIEW",
  interview: "INTERVIEW",
} as const;

export const usesProfile = (type: PromptType) => type !== "chat";

const PROMPTS: Record<PromptType, string> = {
  chat: CHAT_PROMPT,
  write: WRITE_PROMPT,
  review: REVIEW_PROMPT,
  interview: INTERVIEW_PROMPT,
};

const PROFILE_OPEN = "=== 학생 프로필 (학생이 직접 입력한 정보) ===";
const PROFILE_CLOSE = "=== 프로필 끝 ===";

function gapLines(readiness: Readiness): string[] {
  const out: string[] = [];

  if (readiness.missing.length) {
    const labels = readiness.missing.map((k) => MISSING_LABEL[k]).join(", ");
    out.push("", `프로필에 없는 항목: ${labels}`);
  }

  if (readiness.weak.length) {
    const labels = readiness.weak.map((k) => MISSING_LABEL[k]).join(", ");
    out.push(
      "",
      `프로필에 있지만 내용이 짧은 항목: ${labels}`,
      "이 항목은 값이 이미 있으므로 정보 요청 표시를 쓰지 말고 대화로 되물어라."
    );
  }

  return out;
}

export function getSystemPrompt(
  type: PromptType = "chat",
  ctx?: { profile: string; readiness: Readiness }
): string {
  const mode = PROMPTS[type] ?? CHAT_PROMPT;

  if (!usesProfile(type)) {
    return [ROLE, "", mode].join("\n");
  }

  const parts: string[] = [ROLE, "", mode];

  if (ctx?.profile) {
    parts.push("", PROFILE_OPEN, ctx.profile, PROFILE_CLOSE);
  } else {
    parts.push(
      "",
      "학생이 아직 프로필을 입력하지 않았다. 필요한 정보는 직접 물어라."
    );
  }

  if (ctx) {
    parts.push(...gapLines(ctx.readiness));
  }

  // 가드레일은 항상 마지막에, 항상 한 번만.
  parts.push("", GUARDRAILS);

  return parts.join("\n");
}