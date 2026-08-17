import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { evaluateReadiness, loadProfile } from "@/lib/profile-context";
import { PROMPT_TYPE_BY_INTENT, type ChatIntent } from "@/lib/intent";
import { INTENT_BY_TYPE } from "@/prompts/getSystemPrompt";

/**
 * GET /api/profile/readiness?intent=WRITE
 * 시작 화면에서 모드를 고를 때, 대화방을 만들기 전에 프로필이 충분한지 확인한다.
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const raw = new URL(req.url).searchParams.get("intent") ?? "CHAT";
  const valid: ChatIntent[] = ["CHAT", "WRITE", "REVIEW", "INTERVIEW"];
  if (!valid.includes(raw as ChatIntent)) {
    return NextResponse.json({ error: "잘못된 intent" }, { status: 400 });
  }

  const intent = raw as ChatIntent;
  const profile = await loadProfile(session.user.id);
  const readiness = evaluateReadiness(profile, INTENT_BY_TYPE[PROMPT_TYPE_BY_INTENT[intent]]);

  return NextResponse.json(readiness);
}